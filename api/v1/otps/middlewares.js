const { OtpModel } = require("../../../models/otpSchema");
const bcrypt = require("bcrypt");
const logger = require("../../../utils/logger");

const MAX_OTP_ATTEMPTS = 5;

const validateOtpMiddleware = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        logger.debug("Validating OTP request");

        // Fetch the latest OTP for this email
        const otpDoc = await OtpModel.findOne({ email }).sort("-createdAt");

        if (otpDoc == null) {
            return res.status(400).json({
                isSuccess: false,
                message: "OTP not found! Please resend the OTP.",
            });
        }

        // Check if OTP has expired
        if (new Date() > new Date(otpDoc.expiresAt)) {
            await OtpModel.deleteMany({ email });
            return res.status(400).json({
                isSuccess: false,
                message: "OTP has expired! Please request a new one.",
            });
        }

        // Check if max attempts exceeded
        if (otpDoc.attempts >= MAX_OTP_ATTEMPTS) {
            await OtpModel.deleteMany({ email });
            return res.status(429).json({
                isSuccess: false,
                message:
                    "Too many failed attempts. OTP invalidated. Please request a new one.",
            });
        }

        const isCorrect = await bcrypt.compare(otp.toString(), otpDoc.otp);

        if (!isCorrect) {
            // Increment attempt counter
            await OtpModel.updateOne(
                { _id: otpDoc._id },
                { $inc: { attempts: 1 } },
            );
            const remaining = MAX_OTP_ATTEMPTS - otpDoc.attempts - 1;
            return res.status(400).json({
                isSuccess: false,
                message: `Invalid OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "No attempts remaining. Please request a new OTP."}`,
            });
        }

        // OTP is valid — delete all OTPs for this email so it can't be reused
        await OtpModel.deleteMany({ email });

        next();
    } catch (err) {
        logger.error("Error in validateOtpMiddleware", {
            error: err.message,
        });
        next(err);
    }
};

module.exports = { validateOtpMiddleware };
