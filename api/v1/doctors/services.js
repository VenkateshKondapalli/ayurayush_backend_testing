const { AppointmentModel } = require("../../../models/appointmentSchema");
const { ChatHistoryModel } = require("../../../models/chatHistorySchema");
const { DoctorModel } = require("../../../models/doctorSchema");
const { PatientModel } = require("../../../models/patientSchema");
const { calculateAge } = require("../../../utils/helpers");

const getDoctorDashboard = async (userId) => {
  let doctor = await DoctorModel.findOne({ userId });

  if (!doctor) {
    doctor = await DoctorModel.create({
      userId,
      specialization: null,
      experience: null,
      isVerified: false,
    });
  }

  return {
    doctorId: doctor._id,
    userId: doctor.userId,
    specialization: doctor.specialization,
    experience: doctor.experience,
    isVerified: doctor.isVerified,
    createdAt: doctor.createdAt,
  };
};

const getDoctorAppointments = async (userId, { status, date }) => {
  const query = {
    doctorId: userId,
    status: { $nin: ["rejected"] },
  };

  if (status) query.status = status;
  if (date) {
    query.date = {
      $gte: new Date(date).setHours(0, 0, 0, 0),
      $lte: new Date(date).setHours(23, 59, 59, 999),
    };
  }

  const appointments = await AppointmentModel.find(query)
    .populate("patientId", "name email phone gender dob profilePhoto")
    .sort({ date: 1, timeSlot: 1 });

  const appointmentsWithDetails = await Promise.all(
    appointments.map(async (apt) => {
      const patientProfile = await PatientModel.findOne({
        userId: apt.patientId._id,
      }).select("bloodGroup allergies medicalHistory");

      return {
        appointmentId: apt._id,
        status: apt.status,
        urgencyLevel: apt.urgencyLevel,
        patient: {
          id: apt.patientId._id,
          name: apt.patientId.name,
          email: apt.patientId.email,
          phone: apt.patientId.phone,
          gender: apt.patientId.gender,
          age: calculateAge(apt.patientId.dob),
          profilePhoto: apt.patientId.profilePhoto,
          bloodGroup: patientProfile?.bloodGroup,
          allergies: patientProfile?.allergies || [],
        },
        appointmentDetails: {
          date: apt.date,
          timeSlot: apt.timeSlot,
          symptoms: apt.symptoms,
          aiSummary: apt.aiSummary,
        },
        isEmergency: apt.urgencyLevel === "emergency",
        createdAt: apt.createdAt,
      };
    }),
  );

  const emergencyAppointments = appointmentsWithDetails.filter(
    (a) => a.urgencyLevel === "emergency",
  );
  const normalAppointments = appointmentsWithDetails.filter(
    (a) => a.urgencyLevel === "normal",
  );

  return {
    totalCount: appointmentsWithDetails.length,
    emergencyCount: emergencyAppointments.length,
    normalCount: normalAppointments.length,
    emergencyAppointments,
    normalAppointments,
  };
};

const getTodayAppointments = async (userId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const appointments = await AppointmentModel.find({
    doctorId: userId,
    status: "confirmed",
    date: { $gte: todayStart, $lte: todayEnd },
  })
    .populate("patientId", "name email phone gender dob profilePhoto")
    .sort({ timeSlot: 1 });

  const appointmentsWithDetails = await Promise.all(
    appointments.map(async (apt) => {
      const patientProfile = await PatientModel.findOne({
        userId: apt.patientId._id,
      }).select("bloodGroup allergies emergencyContact");

      return {
        appointmentId: apt._id,
        urgencyLevel: apt.urgencyLevel,
        timeSlot: apt.timeSlot,
        patient: {
          id: apt.patientId._id,
          name: apt.patientId.name,
          phone: apt.patientId.phone,
          gender: apt.patientId.gender,
          age: calculateAge(apt.patientId.dob),
          bloodGroup: patientProfile?.bloodGroup,
          allergies: patientProfile?.allergies || [],
          emergencyContact: patientProfile?.emergencyContact,
        },
        symptoms: apt.symptoms,
        aiSummary: apt.aiSummary,
        isEmergency: apt.urgencyLevel === "emergency",
      };
    }),
  );

  return {
    date: new Date().toISOString().split("T")[0],
    totalCount: appointmentsWithDetails.length,
    appointments: appointmentsWithDetails,
  };
};

const getAppointmentDetail = async (userId, appointmentId) => {
  const appointment = await AppointmentModel.findOne({
    _id: appointmentId,
    doctorId: userId,
  }).populate("patientId", "name email phone gender dob profilePhoto");

  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  const patientProfile = await PatientModel.findOne({
    userId: appointment.patientId._id,
  });

  const chatHistory = await ChatHistoryModel.findOne({
    conversationId: appointment.chatConversationId,
  });

  return {
    appointment: {
      id: appointment._id,
      status: appointment.status,
      urgencyLevel: appointment.urgencyLevel,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      symptoms: appointment.symptoms,
      aiSummary: appointment.aiSummary,
      doctorNotes: appointment.doctorNotes,
      prescription: appointment.prescription,
    },
    patient: {
      id: appointment.patientId._id,
      name: appointment.patientId.name,
      email: appointment.patientId.email,
      phone: appointment.patientId.phone,
      gender: appointment.patientId.gender,
      age: calculateAge(appointment.patientId.dob),
      profilePhoto: appointment.patientId.profilePhoto,
      bloodGroup: patientProfile?.bloodGroup,
      allergies: patientProfile?.allergies || [],
      medicalHistory: patientProfile?.medicalHistory || [],
      emergencyContact: patientProfile?.emergencyContact,
    },
    chatDetails: {
      conversationId: chatHistory?.conversationId,
      fullConversation: chatHistory?.messages,
      summary: chatHistory?.summary,
    },
  };
};

const completeAppointment = async (
  userId,
  appointmentId,
  { doctorNotes, prescription },
) => {
  const appointment = await AppointmentModel.findOne({
    _id: appointmentId,
    doctorId: userId,
  });

  if (!appointment) {
    const err = new Error("Appointment not found");
    err.statusCode = 404;
    throw err;
  }

  if (appointment.status !== "confirmed") {
    const err = new Error("Only confirmed appointments can be completed");
    err.statusCode = 400;
    throw err;
  }

  await appointment.markCompleted(prescription, doctorNotes);

  return {
    appointmentId: appointment._id,
    status: appointment.status,
  };
};

module.exports = {
  getDoctorDashboard,
  getDoctorAppointments,
  getTodayAppointments,
  getAppointmentDetail,
  completeAppointment,
};
