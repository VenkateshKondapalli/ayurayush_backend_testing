const bookAppointmentValidator = (req, res, next) => {
  const { conversationId, doctorId, date, timeSlot } = req.body;

  if (!conversationId || !doctorId || !date || !timeSlot) {
    return res.status(400).json({
      isSuccess: false,
      message:
        "All fields are required: conversationId, doctorId, date, timeSlot",
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
  const { qualification, specialization, experience, licenseNumber } = req.body;

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
