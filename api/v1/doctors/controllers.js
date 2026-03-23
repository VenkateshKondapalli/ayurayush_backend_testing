const {
    getDoctorDashboard,
    getDoctorAppointments,
    getTodayAppointments,
    getAppointmentDetail,
    completeAppointment,
    getDoctorProfile,
    updateDoctorProfile,
} = require("./services");

const doctorDashboardController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside doctorDashboardController-------");
        const data = await getDoctorDashboard(req.currentDoctor.userId);
        res.status(200).json({
            isSuccess: true,
            message: "Doctor dashboard loaded successfully",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in doctorDashboardController--------");
        console.log(err.message);
        next(err);
    }
};

const getDoctorAppointmentsController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside getDoctorAppointmentsController-------");
        const { status, date, page, limit } = req.query;
        const data = await getDoctorAppointments(req.currentDoctor.userId, {
            status,
            date,
            page,
            limit,
        });
        res.status(200).json({
            isSuccess: true,
            message: "Appointments retrieved successfully",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in getDoctorAppointmentsController--------");
        console.log(err.message);
        next(err);
    }
};

const getTodayAppointmentsController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside getTodayAppointmentsController-------");
        const data = await getTodayAppointments(req.currentDoctor.userId);
        res.status(200).json({
            isSuccess: true,
            message: "Today's appointments retrieved",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in getTodayAppointmentsController--------");
        console.log(err.message);
        next(err);
    }
};

const getAppointmentDetailController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside getAppointmentDetailController-------");
        const { appointmentId } = req.params;
        const data = await getAppointmentDetail(
            req.currentDoctor.userId,
            appointmentId,
        );
        res.status(200).json({
            isSuccess: true,
            message: "Appointment details retrieved",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in getAppointmentDetailController--------");
        console.log(err.message);
        next(err);
    }
};

const completeAppointmentController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside completeAppointmentController-------");
        const { appointmentId } = req.params;
        const { doctorNotes, prescription } = req.body;
        const data = await completeAppointment(
            req.currentDoctor.userId,
            appointmentId,
            {
                doctorNotes,
                prescription,
            },
        );
        res.status(200).json({
            isSuccess: true,
            message: "Appointment marked as completed",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in completeAppointmentController--------");
        console.log(err.message);
        next(err);
    }
};

const getDoctorProfileController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside getDoctorProfileController-------");
        const data = await getDoctorProfile(req.currentDoctor.userId);
        res.status(200).json({
            isSuccess: true,
            message: "Doctor profile retrieved",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in getDoctorProfileController--------");
        console.log(err.message);
        next(err);
    }
};

const updateDoctorProfileController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside updateDoctorProfileController-------");
        const data = await updateDoctorProfile(
            req.currentDoctor.userId,
            req.body,
        );
        res.status(200).json({
            isSuccess: true,
            message: "Doctor profile updated successfully",
            data,
        });
    } catch (err) {
        console.log("-----🔴 Error in updateDoctorProfileController--------");
        console.log(err.message);
        next(err);
    }
};

module.exports = {
    doctorDashboardController,
    getDoctorAppointmentsController,
    getTodayAppointmentsController,
    getAppointmentDetailController,
    completeAppointmentController,
    getDoctorProfileController,
    updateDoctorProfileController,
};
