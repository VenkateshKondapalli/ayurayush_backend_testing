const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const treatmentSchema = new Schema(
    {
        treatmentCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["normal", "ayurveda", "panchakarma"],
            required: true,
        },
        indications: [{ type: String }],
        contraindications: [{ type: String }],
        defaultSessionCount: {
            type: Number,
            default: 1,
            min: 1,
        },
        estimatedFeeMin: {
            type: Number,
            default: 0,
            min: 0,
        },
        estimatedFeeMax: {
            type: Number,
            default: 0,
            min: 0,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

treatmentSchema.index({ category: 1, active: 1 });

const TreatmentModel = model("treatment", treatmentSchema);

module.exports = { TreatmentModel };
