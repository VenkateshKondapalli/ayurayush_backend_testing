const sendMessageValidator = (req, res, next) => {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
        return res.status(400).json({
            isSuccess: false,
            message: "conversationId and message are required",
        });
    }

    next();
};

const endConversationValidator = (req, res, next) => {
    const { conversationId } = req.body;

    if (!conversationId) {
        return res.status(400).json({
            isSuccess: false,
            message: "conversationId is required",
        });
    }

    next();
};

module.exports = { sendMessageValidator, endConversationValidator };
