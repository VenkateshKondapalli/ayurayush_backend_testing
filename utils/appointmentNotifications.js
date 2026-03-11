const { sendEmail } = require("./emailHelper");

const buildEmailHtml = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; padding: 1rem; }
    .card { max-width: 32rem; margin: 0 auto; background: #fff; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: #059669; color: #fff; padding: 1.25rem; text-align: center; }
    .header h1 { font-size: 1.5rem; margin: 0; }
    .content { padding: 1.5rem; color: #374151; line-height: 1.6; }
    .content h2 { color: #059669; margin-top: 0; }
    .detail { background: #ecfdf5; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
    .detail p { margin: 0.25rem 0; }
    .footer { background: #f9fafb; padding: 0.75rem; text-align: center; font-size: 0.8rem; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h1>AyurAyush</h1></div>
    <div class="content">
      <h2>${title}</h2>
      ${body}
    </div>
    <div class="footer"><p>AyurAyush Healthcare, LPU</p></div>
  </div>
</body>
</html>`;

// Fire-and-forget wrapper — logs errors but never throws
const sendNotification = async (toEmail, subject, title, body) => {
  try {
    await sendEmail(toEmail, subject, buildEmailHtml(title, body));
  } catch (err) {
    console.error(`Notification email failed (${subject}):`, err.message);
  }
};

const notifyAppointmentBooked = (
  patientEmail,
  { doctorName, date, timeSlot, urgencyLevel },
) => {
  const body = `
    <p>Your appointment has been submitted and is awaiting admin approval.</p>
    <div class="detail">
      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${timeSlot}</p>
      <p><strong>Urgency:</strong> ${urgencyLevel}</p>
    </div>
    <p>You will receive another email once the admin reviews your appointment.</p>`;
  sendNotification(
    patientEmail,
    "Appointment Booked - AyurAyush",
    "Appointment Submitted",
    body,
  );
};

const notifyAppointmentApproved = (
  patientEmail,
  { doctorName, date, timeSlot },
) => {
  const body = `
    <p>Your appointment has been <strong>approved</strong> by the admin.</p>
    <div class="detail">
      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${timeSlot}</p>
    </div>
    <p>Please arrive on time for your consultation.</p>`;
  sendNotification(
    patientEmail,
    "Appointment Approved - AyurAyush",
    "Appointment Confirmed",
    body,
  );
};

const notifyAppointmentRejected = (
  patientEmail,
  { doctorName, date, reason },
) => {
  const body = `
    <p>Unfortunately, your appointment has been <strong>rejected</strong>.</p>
    <div class="detail">
      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p><strong>Reason:</strong> ${reason || "No reason provided"}</p>
    </div>
    <p>You can book a new appointment with a different doctor or time slot.</p>`;
  sendNotification(
    patientEmail,
    "Appointment Rejected - AyurAyush",
    "Appointment Rejected",
    body,
  );
};

const notifyAppointmentCompleted = (
  patientEmail,
  { doctorName, date, hasPrescription },
) => {
  const body = `
    <p>Your appointment has been marked as <strong>completed</strong>.</p>
    <div class="detail">
      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      ${hasPrescription ? "<p><strong>Prescription:</strong> Available in your dashboard</p>" : ""}
    </div>
    <p>Thank you for visiting AyurAyush. We wish you a speedy recovery!</p>`;
  sendNotification(
    patientEmail,
    "Appointment Completed - AyurAyush",
    "Appointment Completed",
    body,
  );
};

const notifyAppointmentCancelled = (
  patientEmail,
  { doctorName, date, timeSlot },
) => {
  const body = `
    <p>Your appointment has been <strong>cancelled</strong> as requested.</p>
    <div class="detail">
      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${timeSlot}</p>
    </div>
    <p>You can book a new appointment anytime from your dashboard.</p>`;
  sendNotification(
    patientEmail,
    "Appointment Cancelled - AyurAyush",
    "Appointment Cancelled",
    body,
  );
};

module.exports = {
  notifyAppointmentBooked,
  notifyAppointmentApproved,
  notifyAppointmentRejected,
  notifyAppointmentCompleted,
  notifyAppointmentCancelled,
};
