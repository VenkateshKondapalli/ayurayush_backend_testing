const express = require("express");
const {
    validateLoggedInUserMiddleware,
    validatePatientRole,
} = require("../middlewares");
const {
    getTreatmentsController,
    getTreatmentByCodeController,
    getTreatmentSuggestionsController,
} = require("./controllers");

const treatmentsRouter = express.Router();

// GET /api/v1/treatments?category=ayurveda|panchakarma|normal
treatmentsRouter.get(
    "/",
    validateLoggedInUserMiddleware,
    validatePatientRole,
    getTreatmentsController,
);

// GET /api/v1/treatments/suggestions?conversationId=...
// NOTE: must be before /:code to avoid "suggestions" being captured as a code param
treatmentsRouter.get(
    "/suggestions",
    validateLoggedInUserMiddleware,
    validatePatientRole,
    getTreatmentSuggestionsController,
);

// GET /api/v1/treatments/:code
treatmentsRouter.get(
    "/:code",
    validateLoggedInUserMiddleware,
    validatePatientRole,
    getTreatmentByCodeController,
);

module.exports = { treatmentsRouter };
