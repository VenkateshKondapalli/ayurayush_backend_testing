const { sendOtp } = require("./services");

const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    const expiryMinutes = await sendOtp(email);

    res.status(201).json({
      isSuccess: true,
      message: `OTP sent! It expires in ${expiryMinutes} minutes.`,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        isSuccess: false,
        message: err.message,
      });
    }
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { sendOtpController };
