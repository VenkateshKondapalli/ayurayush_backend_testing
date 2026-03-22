const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }
    return age;
};

const calculateWaitingTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
        return `${diffMins} minutes`;
    } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)} hours`;
    } else {
        return `${Math.floor(diffMins / 1440)} days`;
    }
};

const formatAISummary = (summary) => {
    return `
**Patient Symptoms Summary**

Main Symptoms:
${summary.symptoms.map((s) => `• ${s}`).join("\n")}

Duration: ${summary.duration || "Not specified"}
Severity: ${summary.severity || "N/A"}/10
Urgency Level: ${summary.urgencyLevel || "Normal"}

Recommended Specialist: ${summary.recommendedSpecialist || "General Physician"}

Detailed Summary:
${summary.detailedSummary || "No additional details available"}
    `.trim();
};

const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

// Generates a deterministic, human-readable token number.
// Format: AYU-YYYYMMDD-DR{XX}-{SSS}
//   XX  = 2-digit number derived from the last 4 hex chars of doctorId (0-99)
//   SSS = zero-padded token sequence from QueueTokenModel
// Example: AYU-20260314-DR07-014
const generateTokenNumber = (queueDateStr, doctorId, tokenSequence) => {
    const dateStr = queueDateStr.replace(/-/g, ""); // "20260314"
    const drNum = String(
        parseInt(doctorId.toString().slice(-4), 16) % 100,
    ).padStart(2, "0");
    const seqStr = String(tokenSequence).padStart(3, "0");
    return `AYU-${dateStr}-DR${drNum}-${seqStr}`;
};

module.exports = {
    calculateAge,
    calculateWaitingTime,
    formatAISummary,
    parsePagination,
    generateTokenNumber,
};
