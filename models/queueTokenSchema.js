const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Atomic counter for token sequence per (queueDate, doctorId, queueType).
// Incremented inside a MongoDB transaction during booking to prevent duplicate tokens.
const queueTokenSchema = new Schema(
    {
        queueDate: {
            type: String, // stored as "YYYY-MM-DD" string for easy key matching
            required: true,
        },
        doctorId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        queueType: {
            type: String,
            enum: ["normal", "ayurveda", "panchakarma"],
            required: true,
        },
        lastSequence: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Unique counter per (date, doctor, queueType) — used as the atomic increment key
queueTokenSchema.index(
    { queueDate: 1, doctorId: 1, queueType: 1 },
    { unique: true },
);

const QueueTokenModel = model("queueToken", queueTokenSchema);

module.exports = { QueueTokenModel };
