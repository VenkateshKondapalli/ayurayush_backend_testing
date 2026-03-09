const { OtpModel } = require("../../../models/otpSchema");
const bcrypt = require("bcrypt");

const validateOtpMiddleware = async (req, res, next) => {
  try {
    console.log("-----🟢 inside validateOtpMiddleware-------");

    const { email, otp } = req.body;
    console.log("🟡 : email:", email);

    // Fetch the latest OTP for this email
    const otpDoc = await OtpModel.findOne({ email }).sort("-createdAt").lean();

    if (otpDoc == null) {
      return res.status(400).json({
        isSuccess: false,
        message: "OTP not found! Please resend the OTP.",
      });
    }

    // Check if OTP has expired
    if (new Date() > new Date(otpDoc.expiresAt)) {
      // Clean up the expired doc (TTL may not have kicked in yet)
      await OtpModel.deleteMany({ email });
      return res.status(400).json({
        isSuccess: false,
        message: "OTP has expired! Please request a new one.",
      });
    }

    const { otp: hashedOtp } = otpDoc;
    const isCorrect = await bcrypt.compare(otp.toString(), hashedOtp);

    if (!isCorrect) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid — delete all OTPs for this email so it can't be reused
    await OtpModel.deleteMany({ email });

    next();
  } catch (err) {
    console.log("-----🔴 Error in validateOtpMiddleware--------");

    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { validateOtpMiddleware };
