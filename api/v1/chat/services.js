const { v4: uuidv4 } = require("uuid");
const { ChatHistoryModel } = require("../../../models/chatHistorySchema");
const {
  checkForEmergency,
  getAIChatResponse,
  generateConversationSummary,
} = require("../../../utils/aiService");

const startConversation = async (userId) => {
  const conversationId = uuidv4();

  const chatHistory = await ChatHistoryModel.create({
    conversationId,
    patientId: userId,
    messages: [],
    status: "active",
  });

  return {
    conversationId: chatHistory.conversationId,
    greeting:
      "Hello! I'm your medical assistant. Please describe what symptoms or health concerns you're experiencing, and I'll help you prepare for your doctor appointment.",
  };
};

const sendMessage = async (userId, { conversationId, message }) => {
  const chatHistory = await ChatHistoryModel.findOne({
    conversationId,
    patientId: userId,
  });

  if (!chatHistory) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  if (chatHistory.status === "completed") {
    const error = new Error(
      "This conversation is already completed. Please start a new conversation.",
    );
    error.statusCode = 400;
    throw error;
  }

  const isEmergency = checkForEmergency(message);

  await chatHistory.addMessage("user", message, isEmergency);

  if (isEmergency && chatHistory.status !== "emergency") {
    chatHistory.markAsEmergency();
    await chatHistory.save();
  }

  const messagesForAI = chatHistory.messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const aiResponse = await getAIChatResponse(messagesForAI, isEmergency);

  await chatHistory.addMessage("assistant", aiResponse, isEmergency);

  return {
    conversationId,
    userMessage: message,
    aiResponse,
    isEmergency,
    status: chatHistory.status,
    messageCount: chatHistory.messages.length,
  };
};

const endConversation = async (userId, conversationId) => {
  const chatHistory = await ChatHistoryModel.findOne({
    conversationId,
    patientId: userId,
  });

  if (!chatHistory) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  if (chatHistory.status === "completed") {
    const error = new Error("Conversation already completed");
    error.statusCode = 400;
    error.data = { summary: chatHistory.summary };
    throw error;
  }

  if (chatHistory.messages.length < 2) {
    const error = new Error(
      "Please have at least one exchange with the assistant before ending the conversation.",
    );
    error.statusCode = 400;
    throw error;
  }

  const messagesForSummary = chatHistory.messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const summary = await generateConversationSummary(messagesForSummary);

  if (chatHistory.status === "emergency") {
    summary.urgencyLevel = "emergency";
  }

  await chatHistory.completeSummary(summary);

  return { conversationId, summary, status: "completed" };
};

const getConversation = async (userId, conversationId) => {
  const chatHistory = await ChatHistoryModel.findOne({
    conversationId,
    patientId: userId,
  });

  if (!chatHistory) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    conversationId: chatHistory.conversationId,
    status: chatHistory.status,
    messages: chatHistory.messages,
    summary: chatHistory.summary,
    createdAt: chatHistory.createdAt,
  };
};

const getPatientConversations = async (userId) => {
  const conversations = await ChatHistoryModel.find({
    patientId: userId,
  })
    .select(
      "conversationId status summary.symptoms summary.urgencyLevel createdAt appointmentId",
    )
    .sort({ createdAt: -1 });

  return { count: conversations.length, conversations };
};

module.exports = {
  startConversation,
  sendMessage,
  endConversation,
  getConversation,
  getPatientConversations,
};
