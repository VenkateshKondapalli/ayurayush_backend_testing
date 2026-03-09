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
        message: "patientEmail, doctorId, date, and timeSlot are required",
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

module.exports = { rejectAppointmentValidator, offlineBookValidator };
