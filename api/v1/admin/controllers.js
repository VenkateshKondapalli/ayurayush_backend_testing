const {
    getDashboardStats,
    getPendingDoctorApplications,
    approveDoctorApplication,
    rejectDoctorApplication,
    getPendingNormalAppointments,
    getEmergencyAppointments,
    approveAppointment,
    rejectAppointment,
    setDoctorAvailability,
    offlineBookAppointment,
} = require("./services");

const adminDashboardController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside adminDashboardController-------");
        const stats = await getDashboardStats();
        res.status(200).json({
            isSuccess: true,
            message: "Admin dashboard loaded successfully",
            data: { stats },
        });
    } catch (err) {
        console.log("-----🔴 Error in adminDashboardController--------");
        console.log(err.message);
        next(err);
    }
};

const reviewDoctorApplicationsController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside reviewDoctorApplicationsController-------");
        const applications = await getPendingDoctorApplications();
        res.status(200).json({
            isSuccess: true,
            message: "Pending doctor applications fetched",
            data: { applications },
        });
    } catch (err) {
        console.log(
            "-----🔴 Error in reviewDoctorApplicationsController--------",
        );
        console.log(err.message);
        next(err);
    }
};

const approveDoctorApplicationController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside approveDoctorApplicationController-------");
        const { applicationId } = req.params;
        await approveDoctorApplication(applicationId, req.currentAdmin.userId);
        res.status(200).json({
            isSuccess: true,
            message: "Doctor application approved successfully",
        });
    } catch (err) {
        console.log(
            "-----🔴 Error in approveDoctorApplicationController--------",
        );
        console.log(err.message);
        next(err);
    }
};

const rejectDoctorApplicationController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside rejectDoctorApplicationController-------");
        const { applicationId } = req.params;
        await rejectDoctorApplication(applicationId, req.currentAdmin.userId);
        res.status(200).json({
            isSuccess: true,
            message: "Doctor application rejected",
        });
    } catch (err) {
        console.log(
            "-----🔴 Error in rejectDoctorApplicationController--------",
        );
        console.log(err.message);
        next(err);
    }
};

const getPendingNormalAppointmentsController = async (req, res, next) => {
    try {
        console.log(
            "-----🟢 inside getPendingNormalAppointmentsController-------",
        );
        const data = await getPendingNormalAppointments(req.query);
        res.status(200).json({
            isSuccess: true,
            message: "Pending appointments retrieved",
            data: {
                queueType: "normal",
                ...data,
            },
        });
    } catch (err) {
        console.log(
            "-----🔴 Error in getPendingNormalAppointmentsController--------",
        );
        console.log(err.message);
        next(err);
    }
};

const getEmergencyAppointmentsController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside getEmergencyAppointmentsController-------");
        const data = await getEmergencyAppointments(req.query);
        res.status(200).json({
            isSuccess: true,
            message: "Emergency appointments retrieved",
            data: {
                queueType: "emergency",
                ...data,
                alert:
                    data.count > 0
                        ? "Emergency appointments require immediate review!"
                        : null,
            },
        });
    } catch (err) {
        console.log(
            "-----🔴 Error in getEmergencyAppointmentsController--------",
        );
        console.log(err.message);
        next(err);
    }
};

const approveAppointmentController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside approveAppointmentController-------");

        const { appointmentId } = req.params;
        const { edits, adminNotes } = req.body;
        const data = await approveAppointment(
            appointmentId,
            req.currentAdmin.userId,
            edits,
            adminNotes,
        );
        res.status(200).json({
            isSuccess: true,
            message: "Appointment approved successfully",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in approveAppointmentController--------");
        console.log(err.message);
        next(err);
    }
};

const rejectAppointmentController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside rejectAppointmentController-------");
        const { appointmentId } = req.params;
        const { reason } = req.body;
        const data = await rejectAppointment(
            appointmentId,
            req.currentAdmin.userId,
            reason,
        );
        res.status(200).json({
            isSuccess: true,
            message: "Appointment rejected",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in rejectAppointmentController--------");
        console.log(err.message);
        next(err);
    }
};

const setDoctorAvailabilityController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside setDoctorAvailabilityController-------");
        const { doctorId } = req.params;
        const { availableDays, timeSlots, unavailableDates } = req.body;
        const data = await setDoctorAvailability(
            doctorId,
            req.currentAdmin.userId,
            { availableDays, timeSlots, unavailableDates },
        );
        res.status(200).json({
            isSuccess: true,
            message: "Doctor availability updated successfully",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in setDoctorAvailabilityController--------");
        console.log(err.message);
        next(err);
    }
};

const offlineBookAppointmentController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside offlineBookAppointmentController-------");
        const data = await offlineBookAppointment(
            req.currentAdmin.userId,
            req.body,
        );
        res.status(201).json({
            isSuccess: true,
            message: "Offline appointment booked successfully",
            data,
        });
    } catch (err) {
        console.log(
            "-----🔴 Error in offlineBookAppointmentController--------",
        );
        console.log(err.message);
        next(err);
    }
};

module.exports = {
    adminDashboardController,
    reviewDoctorApplicationsController,
    approveDoctorApplicationController,
    rejectDoctorApplicationController,
    getPendingNormalAppointmentsController,
    getEmergencyAppointmentsController,
    approveAppointmentController,
    rejectAppointmentController,
    setDoctorAvailabilityController,
    offlineBookAppointmentController,
};
