const {
  getDoctorDashboard,
  getDoctorAppointments,
  getTodayAppointments,
  getAppointmentDetail,
  completeAppointment,
} = require("./services");

const doctorDashboardController = async (req, res) => {
  try {
    const data = await getDoctorDashboard(req.currentDoctor.userId);
    res.status(200).json({
      isSuccess: true,
      message: "Doctor dashboard loaded successfully",
      data,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ isSuccess: false, message: "Doctor profile already exists" });
    }
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const getDoctorAppointmentsController = async (req, res) => {
  try {
    const { status, date } = req.query;
    const data = await getDoctorAppointments(req.currentDoctor.userId, {
      status,
      date,
    });
    res.status(200).json({
      isSuccess: true,
      message: "Appointments retrieved successfully",
      data,
    });
  } catch (err) {
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const getTodayAppointmentsController = async (req, res) => {
  try {
    const data = await getTodayAppointments(req.currentDoctor.userId);
    res.status(200).json({
      isSuccess: true,
      message: "Today's appointments retrieved",
      data,
    });
  } catch (err) {
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const getAppointmentDetailController = async (req, res) => {
  try {
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
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ isSuccess: false, message: err.message });
    }
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const completeAppointmentController = async (req, res) => {
  try {
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
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ isSuccess: false, message: err.message });
    }
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

module.exports = {
  doctorDashboardController,
  getDoctorAppointmentsController,
  getTodayAppointmentsController,
  getAppointmentDetailController,
  completeAppointmentController,
};
