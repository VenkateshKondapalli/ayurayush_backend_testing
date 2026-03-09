const {
  startConversation,
  sendMessage,
  endConversation,
  getConversation,
  getPatientConversations,
} = require("./services");

const startConversationController = async (req, res) => {
  try {
    const data = await startConversation(req.currentPatient.userId);
    res
      .status(201)
      .json({ isSuccess: true, message: "Conversation started", data });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const sendMessageController = async (req, res) => {
  try {
    const data = await sendMessage(req.currentPatient.userId, req.body);
    res.status(200).json({ isSuccess: true, message: "Message sent", data });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      isSuccess: false,
      message: err.statusCode ? err.message : "Internal Server Error",
    });
  }
};

const endConversationController = async (req, res) => {
  try {
    const data = await endConversation(
      req.currentPatient.userId,
      req.body.conversationId,
    );
    res.status(200).json({
      isSuccess: true,
      message: "Conversation completed and summary generated",
      data,
    });
  } catch (err) {
    console.error(err);
    const status = err.statusCode || 500;
    const response = {
      isSuccess: false,
      message: err.statusCode ? err.message : "Internal Server Error",
    };
    if (err.data) response.data = err.data;
    res.status(status).json(response);
  }
};

const getConversationController = async (req, res) => {
  try {
    const data = await getConversation(
      req.currentPatient.userId,
      req.params.conversationId,
    );
    res
      .status(200)
      .json({ isSuccess: true, message: "Conversation retrieved", data });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      isSuccess: false,
      message: err.statusCode ? err.message : "Internal Server Error",
    });
  }
};

const getPatientConversationsController = async (req, res) => {
  try {
    const data = await getPatientConversations(req.currentPatient.userId);
    res.status(200).json({
      isSuccess: true,
      message: "Conversations retrieved",
      data,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

module.exports = {
  startConversationController,
  sendMessageController,
  endConversationController,
  getConversationController,
  getPatientConversationsController,
};
