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

const adminDashboardController = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({
      isSuccess: true,
      message: "Admin dashboard loaded successfully",
      data: { stats },
    });
  } catch (err) {
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const reviewDoctorApplicationsController = async (req, res) => {
  try {
    const applications = await getPendingDoctorApplications();
    res.status(200).json({
      isSuccess: true,
      message: "Pending doctor applications fetched",
      data: { applications },
    });
  } catch (err) {
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const approveDoctorApplicationController = async (req, res) => {
  try {
    const { applicationId } = req.params;
    await approveDoctorApplication(applicationId, req.currentAdmin.userId);
    res.status(200).json({
      isSuccess: true,
      message: "Doctor application approved successfully",
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

const rejectDoctorApplicationController = async (req, res) => {
  try {
    const { applicationId } = req.params;
    await rejectDoctorApplication(applicationId, req.currentAdmin.userId);
    res.status(200).json({
      isSuccess: true,
      message: "Doctor application rejected",
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

const getpendingDoctorApplicationsController = async (req, res) => {
  try {
    const appointments = await getPendingNormalAppointments();
    res.status(200).json({
      isSuccess: true,
      message: "Pending appointments retrieved",
      data: {
        queueType: "normal",
        count: appointments.length,
        appointments,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const getEmergencyAppointmentsController = async (req, res) => {
  try {
    const appointments = await getEmergencyAppointments();
    res.status(200).json({
      isSuccess: true,
      message: "Emergency appointments retrieved",
      data: {
        queueType: "emergency",
        count: appointments.length,
        appointments,
        alert:
          appointments.length > 0
            ? "⚠️ Emergency appointments require immediate review!"
            : null,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const approveAppointmentController = async (req, res) => {
  try {
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

const rejectAppointmentController = async (req, res) => {
  try {
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

const setDoctorAvailabilityController = async (req, res) => {
  try {
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

const offlineBookAppointmentController = async (req, res) => {
  try {
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
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ isSuccess: false, message: err.message });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        isSuccess: false,
        message: "This appointment slot conflicts with an existing booking",
      });
    }
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

module.exports = {
  adminDashboardController,
  reviewDoctorApplicationsController,
  approveDoctorApplicationController,
  rejectDoctorApplicationController,
  getpendingDoctorApplicationsController,
  getEmergencyAppointmentsController,
  approveAppointmentController,
  rejectAppointmentController,
  setDoctorAvailabilityController,
  offlineBookAppointmentController,
};
