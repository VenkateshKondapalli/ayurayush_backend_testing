const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);

// Emergency keywords configuration
const EMERGENCY_KEYWORDS = [
    "chest pain",
    "heart attack",
    "cardiac arrest",
    "can't breathe",
    "difficulty breathing",
    "breathing problem",
    "shortness of breath",
    "severe bleeding",
    "heavy bleeding",
    "blood loss",
    "unconscious",
    "fainted",
    "passed out",
    "blacked out",
    "seizure",
    "convulsion",
    "fits",
    "stroke",
    "paralysis",
    "can't move",
    "severe head injury",
    "head trauma",
    "suicide",
    "kill myself",
    "end my life",
    "want to die",
    "allergic reaction",
    "anaphylaxis",
    "throat closing",
    "choking",
    "can't swallow",
    "severe burn",
    "burned badly",
    "poisoning",
    "poisoned",
    "overdose",
    "broken bone",
    "severe pain",
    "vomiting blood",
    "coughing blood",
];

const SYSTEM_PROMPTS = {
    normal: `You are a compassionate and professional medical assistant helping patients describe their symptoms before booking a doctor appointment.

Your responsibilities:
- Ask relevant follow-up questions to understand symptoms better
- Be empathetic, reassuring, and professional
- Extract key information: specific symptoms, duration, severity, and any other relevant details
- Guide the conversation naturally without overwhelming the patient
- Keep responses concise (2-4 sentences maximum)
- DO NOT diagnose or prescribe - only gather information
- If symptoms seem serious, acknowledge concern and recommend seeing a doctor soon

Important guidelines:
- Ask one question at a time
- Use simple, non-medical language
- Show empathy and understanding
- Never dismiss patient concerns
- If patient mentions multiple symptoms, prioritize the most concerning one first`,

    emergency: `EMERGENCY PROTOCOL ACTIVATED

The patient has described symptoms that may indicate a medical emergency.

Your immediate response should:
1. Acknowledge the seriousness calmly but urgently
2. Provide immediate safety advice (if applicable)
3. Inform them that an emergency appointment is being arranged immediately
4. If life-threatening, advise calling emergency services (112 in India)
5. Keep tone urgent but not panicking

Be brief and direct. Patient safety is the priority.`,

    summary: `You are a medical data extraction system. Analyze the conversation between a patient and medical assistant.

Extract and return ONLY a valid JSON object with this exact structure (no additional text):

{
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "duration": "how long symptoms have been present",
  "severity": 5,
  "urgencyLevel": "normal",
  "recommendedSpecialist": "General Physician",
  "detailedSummary": "A brief 2-3 sentence summary of the patient's condition",
  "carePreference": null,
  "prakritiType": null
}

Rules:
- symptoms: array of specific symptoms mentioned
- duration: string like "3 days", "1 week", "since morning"
- severity: number 1-10 (1=mild, 10=severe)
- urgencyLevel: must be exactly "normal", "urgent", or "emergency"
- recommendedSpecialist: one of these: "General Physician", "Cardiologist", "Neurologist", "Orthopedic", "Dermatologist", "ENT Specialist", "Pediatrician", "Gynecologist", "Psychiatrist", "Dentist", "Ophthalmologist", "Gastroenterologist"
- detailedSummary: clear, concise summary in simple language
- carePreference: if patient explicitly mentioned a preference use exactly "ayurveda", "panchakarma", "normal", or "none". Otherwise null.
- prakritiType: if Vata/Pitta/Kapha body type was mentioned or implied, use exactly "vata", "pitta", "kapha", "vata-pitta", "pitta-kapha", or "vata-kapha". Otherwise null.

Return ONLY the JSON object, nothing else.`,
};

// Check if user message contains emergency keywords using word boundaries
// to avoid false positives like "breakfast" matching "break".
const checkForEmergency = (message) => {
    return EMERGENCY_KEYWORDS.some((keyword) => {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${escaped}\\b`, "i").test(message);
    });
};

// Get AI chat response from Gemini
const getAIChatResponse = async (messages, isEmergency = false) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = isEmergency
        ? SYSTEM_PROMPTS.emergency
        : SYSTEM_PROMPTS.normal;

    // Build chat history for Gemini format
    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
        history,
        systemInstruction: { parts: [{ text: systemPrompt }] },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response.text();

    return response;
};

// Generate conversation summary using Gemini
const generateConversationSummary = async (messages) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const conversationText = messages
        .map(
            (msg) =>
                `${msg.role === "user" ? "Patient" : "Assistant"}: ${msg.content}`,
        )
        .join("\n");

    const result = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `${SYSTEM_PROMPTS.summary}\n\nConversation:\n${conversationText}`,
                    },
                ],
            },
        ],
    });

    const responseText = result.response.text().trim();

    // Extract JSON from the response (handle markdown code blocks)
    let jsonString = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
    }

    // Safe JSON parse — Gemini occasionally returns prose instead of structured JSON
    let summary;
    try {
        summary = JSON.parse(jsonString);
    } catch {
        summary = {
            symptoms: [],
            duration: "Not specified",
            severity: 5,
            urgencyLevel: "normal",
            recommendedSpecialist: "General Physician",
            detailedSummary:
                "Summary could not be generated. Please review the conversation manually.",
            carePreference: null,
            prakritiType: null,
        };
    }

    return summary;
};

module.exports = {
    EMERGENCY_KEYWORDS,
    SYSTEM_PROMPTS,
    checkForEmergency,
    getAIChatResponse,
    generateConversationSummary,
};
