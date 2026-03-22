const VALID_QUEUE_TYPES = ["normal", "ayurveda", "panchakarma"];

const bookAppointmentValidator = (req, res, next) => {
    const {
        conversationId,
        doctorId,
        date,
        timeSlot,
        queueType = "normal",
        treatmentCode,
        therapistId,
        roomId,
    } = req.body;

    if (!conversationId || !doctorId || !date || !timeSlot) {
        return res.status(400).json({
            isSuccess: false,
            message:
                "All fields are required: conversationId, doctorId, date, timeSlot",
        });
    }

    if (!VALID_QUEUE_TYPES.includes(queueType)) {
        return res.status(400).json({
            isSuccess: false,
            message: `queueType must be one of: ${VALID_QUEUE_TYPES.join(", ")}`,
        });
    }

    // Ayurveda and Panchakarma bookings must specify a treatmentCode
    if (queueType !== "normal" && !treatmentCode) {
        return res.status(400).json({
            isSuccess: false,
            message: `treatmentCode is required for queueType "${queueType}"`,
        });
    }

    // Panchakarma bookings must specify therapist and room
    if (queueType === "panchakarma" && (!therapistId || !roomId)) {
        return res.status(400).json({
            isSuccess: false,
            message:
                "therapistId and roomId are required for panchakarma appointments",
        });
    }

    // Validate date is not in the past
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
        return res
            .status(400)
            .json({ isSuccess: false, message: "Invalid date" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
        return res.status(400).json({
            isSuccess: false,
            message: "Appointment date cannot be in the past",
        });
    }

    next();
};

const getAvailableSlotsValidator = (req, res, next) => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        return res.status(400).json({
            isSuccess: false,
            message: "DoctorID and date are required",
        });
    }

    next();
};

const applyDoctorRoleValidator = (req, res, next) => {
    const { qualification, specialization, experience, licenseNumber } =
        req.body;

    if (!qualification || !specialization || !experience || !licenseNumber) {
        return res.status(400).json({
            isSuccess: false,
            message:
                "All fields are required: qualification, specialization, experience, licenseNumber",
        });
    }

    next();
};

module.exports = {
    bookAppointmentValidator,
    getAvailableSlotsValidator,
    applyDoctorRoleValidator,
};
