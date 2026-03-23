const {
    startConversation,
    sendMessage,
    endConversation,
    getConversation,
    getPatientConversations,
} = require("./services");

const startConversationController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside startConversationController-------");

        const data = await startConversation(req.currentPatient.userId);
        res.status(201).json({
            isSuccess: true,
            message: "Conversation started",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in startConversationController--------");
        console.log(err.message);
        next(err);
    }
};

const sendMessageController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside sendMessageController-------");

        const data = await sendMessage(req.currentPatient.userId, req.body);
        res.status(200).json({
            isSuccess: true,
            message: "Message sent",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in sendMessageController--------");
        console.log(err.message);
        next(err);
    }
};

const endConversationController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside endConversationController-------");

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
        console.log("-----🔴 Error in endConversationController--------");
        console.log(err.message);
        next(err);
    }
};

const getConversationController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside getConversationController-------");

        const data = await getConversation(
            req.currentPatient.userId,
            req.params.conversationId,
        );
        res.status(200).json({
            isSuccess: true,
            message: "Conversation retrieved",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in getConversationController--------");
        console.log(err.message);
        next(err);
    }
};

const getPatientConversationsController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside getPatientConversationsController-------");

        const data = await getPatientConversations(
            req.currentPatient.userId,
            req.query,
        );
        res.status(200).json({
            isSuccess: true,
            message: "Conversations retrieved",
            data,
        });
    } catch (err) {
        console.log(
            "-----🔴 Error in getPatientConversationsController--------",
        );
        console.log(err.message);
        next(err);
    }
};

module.exports = {
    startConversationController,
    sendMessageController,
    endConversationController,
    getConversationController,
    getPatientConversationsController,
};
