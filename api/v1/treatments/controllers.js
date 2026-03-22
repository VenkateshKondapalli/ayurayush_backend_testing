const {
    getTreatments,
    getTreatmentByCode,
    getTreatmentSuggestions,
} = require("./services");

const getTreatmentsController = async (req, res, next) => {
    try {
        const data = await getTreatments(req.query.category);
        res.status(200).json({
            isSuccess: true,
            message: "Treatments retrieved",
            data,
        });
    } catch (err) {
        next(err);
    }
};

const getTreatmentByCodeController = async (req, res, next) => {
    try {
        const data = await getTreatmentByCode(req.params.code);
        res.status(200).json({
            isSuccess: true,
            message: "Treatment retrieved",
            data,
        });
    } catch (err) {
        next(err);
    }
};

const getTreatmentSuggestionsController = async (req, res, next) => {
    try {
        const { conversationId } = req.query;
        if (!conversationId) {
            return res.status(400).json({
                isSuccess: false,
                message: "conversationId query parameter is required",
            });
        }
        const data = await getTreatmentSuggestions(
            conversationId,
            req.currentPatient.userId,
        );
        res.status(200).json({
            isSuccess: true,
            message: "Treatment suggestions retrieved",
            data,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getTreatmentsController,
    getTreatmentByCodeController,
    getTreatmentSuggestionsController,
};
