const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");
const { AppointmentModel } = require("../../../models/appointmentSchema");
const { ChatHistoryModel } = require("../../../models/chatHistorySchema");
const {
    DoctorApplicationsModel,
} = require("../../../models/doctorApplicationSchema");
const { DoctorModel } = require("../../../models/doctorSchema");
const {
    DoctorAvailabiltyModel,
} = require("../../../models/doctorAvailabilitySchema");
const { UserModel, ROLE_OPTIONS } = require("../../../models/userSchema");
const { PatientModel } = require("../../../models/patientSchema");
const {
    calculateAge,
    calculateWaitingTime,
    parsePagination,
} = require("../../../utils/helpers");
const {
    notifyAppointmentApproved,
    notifyAppointmentRejected,
    notifyDoctorOnboarded,
} = require("../../../utils/appointmentNotifications");

const generateTemporaryPassword = customAlphabet(
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",
    12,
);

const getDashboardStats = async () => {
    const [totalUsers, totalDoctors, totalPatients] = await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ roles: "doctor" }),
        UserModel.countDocuments({ roles: "patient" }),
    ]);
    return { totalUsers, totalDoctors, totalPatients };
};

const createDoctorAccountByAdmin = async (adminUserId, payload) => {
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
        consultationFee,
        availableModes,
    } = payload;

    const existingUser = await UserModel.findOne({
        $or: [{ email }, { phone }],
    }).select("_id email phone");

    if (existingUser) {
        const err = new Error(
            existingUser.email === email
                ? "Email already exists"
                : "Phone already exists",
        );
        err.statusCode = 409;
        throw err;
    }

    const temporaryPassword = generateTemporaryPassword();

    const session = await mongoose.startSession();
    let createdUser;
    let createdDoctor;

    try {
        await session.withTransaction(async () => {
            const users = await UserModel.create(
                [
                    {
                        name,
                        email,
                        phone,
                        gender,
                        dob,
                        password: temporaryPassword,
                        roles: [ROLE_OPTIONS.DOCTOR],
                        mustChangePassword: true,
                    },
                ],
                { session },
            );
            createdUser = users[0];

            const doctors = await DoctorModel.create(
                [
                    {
                        userId: createdUser._id,
                        qualification,
                        specialization,
                        experience,
                        licenseNumber,
                        consultationFee,
                        availableModes: availableModes || [],
                        isVerified: true,
                        verifiedAt: new Date(),
                    },
                ],
                { session },
            );
            createdDoctor = doctors[0];
        });
    } finally {
        await session.endSession();
    }

    const loginUrl = `${process.env.FRONTEND_URL_LOCAL || "http://localhost:5173"}/login`;

    notifyDoctorOnboarded(email, {
        doctorName: name,
        temporaryPassword,
        loginUrl,
    });

    return {
        userId: createdUser._id,
        doctorId: createdDoctor._id,
        email: createdUser.email,
        name: createdUser.name,
        specialization: createdDoctor.specialization,
        qualification: createdDoctor.qualification,
        isVerified: createdDoctor.isVerified,
        mustChangePassword: createdUser.mustChangePassword,
        createdByAdmin: adminUserId,
    };
};

const getPendingDoctorApplications = async () => {
    return DoctorApplicationsModel.find({ status: "pending" }).populate(
        "userId",
        "email",
    );
};

const approveDoctorApplication = async (applicationId, adminUserId) => {
    const application = await DoctorApplicationsModel.findById(applicationId);

    if (!application) {
        const err = new Error("Doctor application not found");
        err.statusCode = 404;
        throw err;
    }

    if (application.status !== "pending") {
        const err = new Error("Application already processed");
        err.statusCode = 400;
        throw err;
    }

    // Use a transaction to ensure all 3 writes succeed or none do
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            application.status = "approved";
            application.reviewedBy = adminUserId;
            application.reviewedAt = new Date();
            await application.save({ session });

            await UserModel.findByIdAndUpdate(
                application.userId,
                { $addToSet: { roles: ROLE_OPTIONS.DOCTOR } },
                { session },
            );

            await DoctorModel.create(
                [
                    {
                        userId: application.userId,
                        specialization: application.specialization,
                        experience: application.experience,
                        qualification: application.qualification,
                        licenseNumber: application.licenseNumber,
                        isVerified: true,
                        verifiedAt: new Date(),
                    },
                ],
                { session },
            );
        });
    } finally {
        await session.endSession();
    }
};

const rejectDoctorApplication = async (applicationId, adminUserId) => {
    const application = await DoctorApplicationsModel.findById(applicationId);

    if (!application) {
        const err = new Error("Doctor application not found");
        err.statusCode = 404;
        throw err;
    }

    application.status = "rejected";
    application.reviewedBy = adminUserId;
    application.reviewedAt = new Date();
    await application.save();
};

const getPendingNormalAppointments = async (query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
        status: "pending_admin_approval",
        urgencyLevel: "normal",
    };

    const [appointments, totalCount] = await Promise.all([
        AppointmentModel.find(filter)
            .populate("patientId", "name email phone gender dob")
            .populate("doctorId", "name email phone")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit),
        AppointmentModel.countDocuments(filter),
    ]);

    // Batch fetch all doctor profiles in one query
    const doctorUserIds = appointments.map((apt) => apt.doctorId._id);
    const doctorProfiles = await DoctorModel.find({
        userId: { $in: doctorUserIds },
    }).select("userId specialization qualification experience");
    const doctorMap = new Map(
        doctorProfiles.map((d) => [d.userId.toString(), d]),
    );

    const result = appointments.map((apt) => {
        const doctor = doctorMap.get(apt.doctorId._id.toString());

        return {
            appointmentId: apt._id,
            patient: {
                id: apt.patientId._id,
                name: apt.patientId.name,
                email: apt.patientId.email,
                phone: apt.patientId.phone,
                gender: apt.patientId.gender,
                age: calculateAge(apt.patientId.dob),
            },
            doctor: {
                id: apt.doctorId._id,
                name: apt.doctorId.name,
                specialization: doctor?.specialization,
            },
            appointmentDetails: {
                date: apt.date,
                timeSlot: apt.timeSlot,
                symptoms: apt.symptoms,
                aiSummary: apt.aiSummary,
                urgencyLevel: apt.urgencyLevel,
            },
            createdAt: apt.createdAt,
            waitingTime: calculateWaitingTime(apt.createdAt),
        };
    });

    return {
        count: result.length,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        appointments: result,
    };
};

const getEmergencyAppointments = async (query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
        status: "pending_admin_approval",
        urgencyLevel: "emergency",
    };

    const [appointments, totalCount] = await Promise.all([
        AppointmentModel.find(filter)
            .populate("patientId", "name email phone gender dob")
            .populate("doctorId", "name email phone")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit),
        AppointmentModel.countDocuments(filter),
    ]);

    // Batch fetch doctor profiles and chat histories in parallel
    const doctorUserIds = appointments.map((apt) => apt.doctorId._id);
    const conversationIds = appointments
        .map((apt) => apt.chatConversationId)
        .filter(Boolean);

    const [doctorProfiles, chatHistories] = await Promise.all([
        DoctorModel.find({ userId: { $in: doctorUserIds } }).select(
            "userId specialization qualification experience",
        ),
        ChatHistoryModel.find({
            conversationId: { $in: conversationIds },
        }).select("conversationId messages"),
    ]);

    const doctorMap = new Map(
        doctorProfiles.map((d) => [d.userId.toString(), d]),
    );
    const chatMap = new Map(chatHistories.map((c) => [c.conversationId, c]));

    const result = appointments.map((apt) => {
        const doctor = doctorMap.get(apt.doctorId._id.toString());
        const chatHistory = chatMap.get(apt.chatConversationId);

        return {
            appointmentId: apt._id,
            patient: {
                id: apt.patientId._id,
                name: apt.patientId.name,
                email: apt.patientId.email,
                phone: apt.patientId.phone,
                gender: apt.patientId.gender,
                age: calculateAge(apt.patientId.dob),
            },
            doctor: {
                id: apt.doctorId._id,
                name: apt.doctorId.name,
                specialization: doctor?.specialization,
            },
            appointmentDetails: {
                date: apt.date,
                timeSlot: apt.timeSlot,
                symptoms: apt.symptoms,
                aiSummary: apt.aiSummary,
                urgencyLevel: apt.urgencyLevel,
                fullChatHistory: chatHistory?.messages,
            },
            createdAt: apt.createdAt,
            waitingTime: calculateWaitingTime(apt.createdAt),
            priority: "URGENT - EMERGENCY",
        };
    });

    return {
        count: result.length,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        appointments: result,
    };
};

const approveAppointment = async (
    appointmentId,
    adminUserId,
    edits,
    adminNotes,
) => {
    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
        const err = new Error("Appointment not found");
        err.statusCode = 404;
        throw err;
    }

    if (appointment.status !== "pending_admin_approval") {
        const err = new Error(`Appointment already ${appointment.status}`);
        err.statusCode = 400;
        throw err;
    }

    if (edits) {
        if (edits.doctorId) {
            const doctor = await DoctorModel.findOne({
                userId: edits.doctorId,
                isVerified: true,
            });
            if (!doctor) {
                const err = new Error(
                    "Selected doctor not found or not verified",
                );
                err.statusCode = 400;
                throw err;
            }
        }

        if (edits.date || edits.timeSlot || edits.doctorId) {
            const checkDoctorId = edits.doctorId || appointment.doctorId;
            const checkDate = edits.date || appointment.date;
            const checkTimeSlot = edits.timeSlot || appointment.timeSlot;

            const isAvailable = await AppointmentModel.isSlotAvailable(
                checkDoctorId,
                checkDate,
                checkTimeSlot,
            );

            if (!isAvailable) {
                const err = new Error(
                    "The edited time slot is not available. Please choose another slot.",
                );
                err.statusCode = 409;
                throw err;
            }
        }
    }

    if (adminNotes) {
        appointment.adminNotes = adminNotes;
    }

    await appointment.approveByAdmin(adminUserId, edits);

    const updatedAppointment = await AppointmentModel.findById(appointmentId)
        .populate("patientId", "name email")
        .populate("doctorId", "name");

    // Fire-and-forget email notification
    notifyAppointmentApproved(updatedAppointment.patientId.email, {
        doctorName: updatedAppointment.doctorId.name,
        date: updatedAppointment.date,
        timeSlot: updatedAppointment.timeSlot,
    });

    return {
        appointmentId: updatedAppointment._id,
        status: updatedAppointment.status,
        patient: updatedAppointment.patientId.name,
        doctor: updatedAppointment.doctorId.name,
        date: updatedAppointment.date,
        timeSlot: updatedAppointment.timeSlot,
        wasEdited: !!edits,
        editedFields: updatedAppointment.adminEditedFields,
    };
};

const rejectAppointment = async (appointmentId, adminUserId, reason) => {
    const appointment = await AppointmentModel.findById(appointmentId);

    if (!appointment) {
        const err = new Error("Appointment not found");
        err.statusCode = 404;
        throw err;
    }

    if (appointment.status !== "pending_admin_approval") {
        const err = new Error(`Appointment already ${appointment.status}`);
        err.statusCode = 400;
        throw err;
    }

    await appointment.rejectByAdmin(adminUserId, reason);

    // Fetch patient and doctor info for notification
    const [patientUser, doctorUser] = await Promise.all([
        UserModel.findById(appointment.patientId).select("email"),
        UserModel.findById(appointment.doctorId).select("name"),
    ]);

    // Fire-and-forget email notification
    notifyAppointmentRejected(patientUser.email, {
        doctorName: doctorUser?.name || "N/A",
        date: appointment.date,
        reason,
    });

    return {
        appointmentId: appointment._id,
        status: appointment.status,
        reason,
    };
};

const setDoctorAvailability = async (
    doctorId,
    adminUserId,
    { availableDays, timeSlots, unavailableDates },
) => {
    const doctor = await DoctorModel.findOne({
        userId: doctorId,
        isVerified: true,
    });

    if (!doctor) {
        const err = new Error("Doctor not found or not verified");
        err.statusCode = 404;
        throw err;
    }

    let availability = await DoctorAvailabiltyModel.findOne({ doctorId });

    if (availability) {
        availability.availableDays =
            availableDays || availability.availableDays;
        availability.timeSlots = timeSlots || availability.timeSlots;
        availability.unavailableDates =
            unavailableDates || availability.unavailableDates;
        availability.lastUpdatedBy = adminUserId;
        await availability.save();
    } else {
        availability = await DoctorAvailabiltyModel.create({
            doctorId,
            availableDays,
            timeSlots,
            unavailableDates: unavailableDates || [],
            setByAdmin: adminUserId,
            lastUpdatedBy: adminUserId,
        });
    }

    return {
        doctorId,
        availableDays: availability.availableDays,
        timeSlots: availability.timeSlots,
    };
};

const getVerifiedDoctorsForAdmin = async (query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const doctorQuery = { isVerified: true };

    if (query.specialization) {
        const escaped = query.specialization.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );
        doctorQuery.specialization = {
            $regex: new RegExp(`^${escaped}$`, "i"),
        };
    }

    const [doctors, totalCount] = await Promise.all([
        DoctorModel.find(doctorQuery).skip(skip).limit(limit),
        DoctorModel.countDocuments(doctorQuery),
    ]);

    const doctorUserIds = doctors.map((d) => d.userId);
    const users = await UserModel.find({
        _id: { $in: doctorUserIds },
        isActive: true,
    }).select("name email phone gender profilePhoto");

    const doctorList = doctors
        .map((doc) => {
            const user = users.find(
                (u) => u._id.toString() === doc.userId.toString(),
            );
            if (!user) return null;

            return {
                doctorId: doc.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                profilePhoto: user.profilePhoto,
                specialization: doc.specialization,
                qualification: doc.qualification,
                experience: doc.experience,
                consultationFee: doc.consultationFee,
            };
        })
        .filter(Boolean);

    return {
        count: doctorList.length,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        doctors: doctorList,
    };
};

const getDoctorAvailableSlotsForAdmin = async (doctorId, date) => {
    if (!date) {
        const err = new Error("date query parameter is required");
        err.statusCode = 400;
        throw err;
    }

    const doctor = await DoctorModel.findOne({
        userId: doctorId,
        isVerified: true,
    });
    if (!doctor) {
        const err = new Error("Doctor not found or not verified");
        err.statusCode = 404;
        throw err;
    }

    const availableSlots = await DoctorAvailabiltyModel.getBookableSlots(
        doctorId,
        date,
        AppointmentModel,
    );

    return {
        doctorId,
        date,
        availableSlots,
        totalSlots: availableSlots.length,
    };
};

const offlineBookAppointment = async (adminId, bookingData) => {
    const {
        patientEmail,
        doctorId,
        date,
        timeSlot,
        symptoms,
        urgencyLevel,
        adminNotes,
    } = bookingData;

    const patientUser = await UserModel.findOne({ email: patientEmail });
    if (!patientUser) {
        const err = new Error("Patient not found with this email");
        err.statusCode = 404;
        throw err;
    }

    let patient = await PatientModel.findOne({ userId: patientUser._id });
    if (!patient) {
        patient = await PatientModel.create({
            userId: patientUser._id,
            bloodGroup: null,
            medicalHistory: [],
            allergies: [],
            emergencyContact: {},
        });
    }

    const doctor = await DoctorModel.findOne({
        userId: doctorId,
        isVerified: true,
    });

    if (!doctor) {
        const err = new Error("Doctor not found or not verified");
        err.statusCode = 404;
        throw err;
    }

    const isAvailable = await AppointmentModel.isSlotAvailable(
        doctorId,
        date,
        timeSlot,
    );

    if (!isAvailable) {
        const err = new Error("This time slot is already booked");
        err.statusCode = 409;
        throw err;
    }

    const appointment = await AppointmentModel.create({
        patientId: patientUser._id,
        doctorId,
        date: new Date(date),
        timeSlot,
        status: "confirmed",
        urgencyLevel: urgencyLevel || "normal",
        symptoms: symptoms || [],
        aiSummary: symptoms
            ? `**Walk-in Patient**\n\nSymptoms: ${symptoms.join(", ")}\n\nBooked by admin (offline).`
            : "Walk-in patient. Booked by admin (offline).",
        adminApprovedBy: adminId,
        adminApprovedAt: new Date(),
        adminNotes: adminNotes || "Offline booking by admin",
        originalBooking: { doctorId, date: new Date(date), timeSlot },
    });

    const doctorUser = await UserModel.findById(doctorId).select("name");

    return {
        appointmentId: appointment._id,
        status: appointment.status,
        patient: patientUser.name,
        doctor: doctorUser.name,
        specialization: doctor.specialization,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
    };
};

module.exports = {
    getDashboardStats,
    createDoctorAccountByAdmin,
    getPendingDoctorApplications,
    approveDoctorApplication,
    rejectDoctorApplication,
    getPendingNormalAppointments,
    getEmergencyAppointments,
    approveAppointment,
    rejectAppointment,
    setDoctorAvailability,
    offlineBookAppointment,
    getVerifiedDoctorsForAdmin,
    getDoctorAvailableSlotsForAdmin,
};
