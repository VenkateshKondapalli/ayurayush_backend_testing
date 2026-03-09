const {
  getPatientDashboard,
  applyForDoctorRole,
  getAvailableSlots,
  bookAppointment,
  getPatientAppointments,
  getAppointmentDetails,
  cancelAppointment,
  getVerifiedDoctors,
} = require("./services");

const patientDashboardController = async (req, res) => {
  try {
    const data = await getPatientDashboard(req.currentUser.userId);
    res.status(200).json({
      isSuccess: true,
      message: "Patient dashboard loaded successfully",
      data,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({
        isSuccess: false,
        message: "Patient profile already exists",
      });
    }
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const applyForDoctorRoleController = async (req, res) => {
  try {
    const data = await applyForDoctorRole(req.currentPatient.userId, req.body);
    res.status(201).json({
      isSuccess: true,
      message: "Doctor role application submitted successfully",
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      isSuccess: false,
      message: err.statusCode ? err.message : "Internal Server Error",
    });
  }
};

const getAvailableSlotsController = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const data = await getAvailableSlots(doctorId, date);
    res.status(200).json({
      isSuccess: true,
      message: "Available slots retrieved",
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      isSuccess: false,
      message: err.statusCode ? err.message : "Internal Server Error",
    });
  }
};

const bookAppointmentController = async (req, res) => {
  try {
    const data = await bookAppointment(req.currentPatient.userId, req.body);
    const message =
      data.urgencyLevel === "emergency"
        ? "Emergency appointment created! Waiting for admin approval."
        : "Appointment booked successfully! Waiting for admin approval.";
    res.status(201).json({ isSuccess: true, message, data });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({
        isSuccess: false,
        message: "You already have an appointment at this time",
      });
    }
    res.status(err.statusCode || 500).json({
      isSuccess: false,
      message: err.statusCode ? err.message : "Internal Server Error",
    });
  }
};

const getPatientAppointmentsController = async (req, res) => {
  try {
    const data = await getPatientAppointments(
      req.currentPatient.userId,
      req.query.status,
    );
    res.status(200).json({
      isSuccess: true,
      message: "Appointments retrieved successfully",
      data,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const getAppointmentDetailsController = async (req, res) => {
  try {
    const data = await getAppointmentDetails(
      req.currentPatient.userId,
      req.params.appointmentId,
    );
    res.status(200).json({
      isSuccess: true,
      message: "Appointment details retrieved",
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      isSuccess: false,
      message: err.statusCode ? err.message : "Internal Server Error",
    });
  }
};

const cancelAppointmentController = async (req, res) => {
  try {
    await cancelAppointment(
      req.currentPatient.userId,
      req.params.appointmentId,
    );
    res.status(200).json({
      isSuccess: true,
      message: "Appointment cancelled successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      isSuccess: false,
      message: err.statusCode ? err.message : "Internal Server Error",
    });
  }
};

const getVerifiedDoctorsController = async (req, res) => {
  try {
    const doctors = await getVerifiedDoctors(req.query.specialization);
    res.status(200).json({
      isSuccess: true,
      message: "Verified doctors retrieved",
      data: { count: doctors.length, doctors },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

module.exports = {
  patientDashboardController,
  applyForDoctorRoleController,
  getAvailableSlotsController,
  bookAppointmentController,
  getPatientAppointmentsController,
  getAppointmentDetailsController,
  cancelAppointmentController,
  getVerifiedDoctorsController,
};
