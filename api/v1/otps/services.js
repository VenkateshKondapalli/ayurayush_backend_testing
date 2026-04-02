const { customAlphabet } = require("nanoid");
const { OtpModel, OTP_EXPIRY_MINUTES } = require("../../../models/otpSchema");
const { sendOtpEmail } = require("../../../utils/emailHelper");
const logger = require("../../../utils/logger");

const nanoid = customAlphabet("123456789", 6);

const OTP_COOLDOWN_SECONDS = 60;

const sendOtp = async (email) => {
    // Check cooldown
    const recentOtp = await OtpModel.findOne({ email })
        .sort("-createdAt")
        .lean();

    if (recentOtp) {
        const secondsSinceSent =
            (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;

        if (secondsSinceSent < OTP_COOLDOWN_SECONDS) {
            const waitSeconds = Math.ceil(
                OTP_COOLDOWN_SECONDS - secondsSinceSent,
            );
            const err = new Error(
                `OTP was already sent! Please wait ${waitSeconds}s before requesting again.`,
            );
            err.statusCode = 429;
            logger.warn("OTP resend blocked by cooldown", { waitSeconds });
            throw err;
        }
    }

    // Delete old OTPs for this email
    await OtpModel.deleteMany({ email });

    const otp = nanoid();
    await sendOtpEmail(email, otp);
    await OtpModel.create({ email, otp });

    return OTP_EXPIRY_MINUTES;
};

module.exports = { sendOtp };
