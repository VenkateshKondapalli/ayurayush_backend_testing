const { TreatmentModel } = require("../../../models/treatmentSchema");
const { ChatHistoryModel } = require("../../../models/chatHistorySchema");

const getTreatments = async (category) => {
    const filter = { active: true };
    if (category) {
        const validCategories = ["normal", "ayurveda", "panchakarma"];
        if (!validCategories.includes(category)) {
            const err = new Error(
                "Invalid category. Must be: normal, ayurveda, or panchakarma",
            );
            err.statusCode = 400;
            throw err;
        }
        filter.category = category;
    }

    const treatments = await TreatmentModel.find(filter).sort({
        category: 1,
        name: 1,
    });

    return { count: treatments.length, treatments };
};

const getTreatmentByCode = async (code) => {
    const treatment = await TreatmentModel.findOne({
        treatmentCode: code.toUpperCase(),
        active: true,
    });

    if (!treatment) {
        const err = new Error("Treatment not found");
        err.statusCode = 404;
        throw err;
    }

    return { treatment };
};

// Returns treatment suggestions based on a completed conversation's recommendation
const getTreatmentSuggestions = async (conversationId, userId) => {
    const chatHistory = await ChatHistoryModel.findOne({
        conversationId,
        patientId: userId,
    });

    if (!chatHistory) {
        const err = new Error("Conversation not found");
        err.statusCode = 404;
        throw err;
    }

    if (
        chatHistory.status !== "completed" &&
        chatHistory.status !== "emergency"
    ) {
        const err = new Error(
            "Conversation not yet completed. Please end the chat first.",
        );
        err.statusCode = 400;
        throw err;
    }

    const {
        suggestedCarePath = "normal",
        recommendedTreatmentCodes = [],
        prakritiType = null,
        preConsultNote = null,
    } = chatHistory.summary || {};

    // Fetch treatment details for each recommended code
    let recommendedTreatments = [];
    if (recommendedTreatmentCodes.length > 0) {
        recommendedTreatments = await TreatmentModel.find({
            treatmentCode: { $in: recommendedTreatmentCodes },
            active: true,
        });
    }

    // Also fetch all treatments grouped by category for the options page
    const [normalTreatments, ayurvedaTreatments, panchakarmaPackages] =
        await Promise.all([
            TreatmentModel.find({ category: "normal", active: true }).sort({
                name: 1,
            }),
            TreatmentModel.find({ category: "ayurveda", active: true }).sort({
                name: 1,
            }),
            TreatmentModel.find({ category: "panchakarma", active: true }).sort(
                {
                    name: 1,
                },
            ),
        ]);

    return {
        conversationId,
        suggestedCarePath,
        prakritiType,
        preConsultNote,
        recommendedTreatments,
        allOptions: {
            normal: normalTreatments,
            ayurveda: ayurvedaTreatments,
            panchakarma: panchakarmaPackages,
        },
    };
};

module.exports = {
    getTreatments,
    getTreatmentByCode,
    getTreatmentSuggestions,
};
