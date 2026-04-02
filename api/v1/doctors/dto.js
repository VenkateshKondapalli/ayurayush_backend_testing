const VALID_GENDERS = ["male", "female", "other"];
const VALID_MODES = ["offline", "online"];

const updateDoctorProfileValidator = (req, res, next) => {
    try {
        const { name, phone, gender, dob, consultationFee, availableModes } =
            req.body;

        if (
            name === undefined &&
            phone === undefined &&
            gender === undefined &&
            dob === undefined &&
            consultationFee === undefined &&
            availableModes === undefined
        ) {
            return res.status(400).json({
                isSuccess: false,
                message: "At least one field must be provided to update",
            });
        }

        if (phone !== undefined && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                isSuccess: false,
                message: "Phone must be a 10-digit number",
            });
        }

        if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
            return res.status(400).json({
                isSuccess: false,
                message: `gender must be one of: ${VALID_GENDERS.join(", ")}`,
            });
        }

        if (dob !== undefined) {
            const dobDate = new Date(dob);
            if (isNaN(dobDate.getTime())) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Invalid date of birth",
                });
            }
            if (dobDate >= new Date()) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Date of birth cannot be in the future",
                });
            }
        }

        if (
            consultationFee !== undefined &&
            (typeof consultationFee !== "number" || consultationFee < 0)
        ) {
            return res.status(400).json({
                isSuccess: false,
                message: "consultationFee must be a non-negative number",
            });
        }

        if (availableModes !== undefined) {
            if (!Array.isArray(availableModes)) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "availableModes must be an array",
                });
            }

            const invalidModes = availableModes.filter(
                (mode) => !VALID_MODES.includes(mode),
            );
            if (invalidModes.length > 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: `availableModes contains invalid values. Must be: ${VALID_MODES.join(", ")}`,
                });
            }
        }

        next();
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            message: "Internal Server Error",
        });
    }
};

const completeAppointmentValidator = (req, res, next) => {
    try {
        const { doctorNotes, prescription } = req.body;

        const hasDoctorNotes =
            typeof doctorNotes === "string" && doctorNotes.trim() !== "";

        const hasPrescriptionObject =
            prescription !== undefined &&
            prescription !== null &&
            typeof prescription === "object" &&
            !Array.isArray(prescription);

        if (!hasDoctorNotes && !hasPrescriptionObject) {
            return res.status(400).json({
                isSuccess: false,
                message:
                    "At least doctorNotes or prescription must be provided",
            });
        }

        if (doctorNotes !== undefined) {
            if (typeof doctorNotes !== "string") {
                return res.status(400).json({
                    isSuccess: false,
                    message: "doctorNotes must be a string",
                });
            }
            if (doctorNotes.length > 5000) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "doctorNotes cannot exceed 5000 characters",
                });
            }
        }

        if (prescription !== undefined) {
            if (
                typeof prescription !== "object" ||
                Array.isArray(prescription)
            ) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "prescription must be an object",
                });
            }

            const { medications, tests, diagnosis } = prescription;

            if (medications !== undefined) {
                if (!Array.isArray(medications)) {
                    return res.status(400).json({
                        isSuccess: false,
                        message: "prescription.medications must be an array",
                    });
                }

                for (const med of medications) {
                    if (!med?.name || !med?.dosage || !med?.frequency) {
                        return res.status(400).json({
                            isSuccess: false,
                            message:
                                "Each medication must have name, dosage, and frequency",
                        });
                    }
                }
            }

            if (tests !== undefined) {
                if (!Array.isArray(tests)) {
                    return res.status(400).json({
                        isSuccess: false,
                        message: "prescription.tests must be an array",
                    });
                }

                for (const test of tests) {
                    if (!test?.testName) {
                        return res.status(400).json({
                            isSuccess: false,
                            message: "Each test must have a testName",
                        });
                    }
                }
            }

            if (
                diagnosis !== undefined &&
                diagnosis !== null &&
                diagnosis !== "" &&
                (typeof diagnosis !== "string" || diagnosis.trim() === "")
            ) {
                return res.status(400).json({
                    isSuccess: false,
                    message:
                        "prescription.diagnosis must be a non-empty string",
                });
            }
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
    updateDoctorProfileValidator,
    completeAppointmentValidator,
};
