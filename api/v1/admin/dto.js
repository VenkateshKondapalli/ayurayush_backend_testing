const rejectAppointmentValidator = (req, res, next) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                isSuccess: false,
                message: "Rejection reason is required",
            });
        }

        next();
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
        });
    }
};

const offlineBookValidator = (req, res, next) => {
    try {
        const { patientEmail, doctorId, date, timeSlot } = req.body;

        if (!patientEmail || !doctorId || !date || !timeSlot) {
            return res.status(400).json({
                isSuccess: false,
                message:
                    "patientEmail, doctorId, date, and timeSlot are required",
            });
        }

        next();
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
        });
    }
};

const createDoctorAccountValidator = (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            gender,
            dob,
            qualification,
            specialization,
            experience,
            licenseNumber,
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !gender ||
            !dob ||
            !qualification ||
            !specialization ||
            experience === undefined ||
            !licenseNumber
        ) {
            return res.status(400).json({
                isSuccess: false,
                message:
                    "name, email, phone, gender, dob, qualification, specialization, experience, and licenseNumber are required",
            });
        }

        next();
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    rejectAppointmentValidator,
    offlineBookValidator,
    createDoctorAccountValidator,
};
