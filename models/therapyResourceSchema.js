const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Tracks therapist and room availability for Panchakarma sessions.
// Each document represents one (therapist OR room) + date + slot combination.
const therapyResourceSchema = new Schema(
    {
        therapistId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            default: null,
        },
        roomId: {
            type: String,
            trim: true,
            default: null,
        },
        date: {
            type: Date,
            required: true,
        },
        slot: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["available", "reserved", "booked"],
            default: "available",
        },
        appointmentId: {
            type: Schema.Types.ObjectId,
            ref: "appointment",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Unique index: one therapist can only have one booking per date+slot
therapyResourceSchema.index(
    { date: 1, therapistId: 1, slot: 1 },
    {
        unique: true,
        partialFilterExpression: { therapistId: { $ne: null } },
    },
);

// Unique index: one room can only be used once per date+slot
therapyResourceSchema.index(
    { date: 1, roomId: 1, slot: 1 },
    {
        unique: true,
        partialFilterExpression: { roomId: { $ne: null } },
    },
);

therapyResourceSchema.index({ date: 1, status: 1 });

const TherapyResourceModel = model("therapyResource", therapyResourceSchema);

module.exports = { TherapyResourceModel };
