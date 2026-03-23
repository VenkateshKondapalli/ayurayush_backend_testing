const { sendOtp } = require("./services");

const sendOtpController = async (req, res, next) => {
    try {
        console.log("-----🟢 inside sendOtpController-------");
        const { email } = req.body;
        const expiryMinutes = await sendOtp(email);

        res.status(201).json({
            isSuccess: true,
            message: `OTP sent! It expires in ${expiryMinutes} minutes.`,
        });
    } catch (err) {
        console.log("-----🔴 Error in sendOtpController--------");
        console.log(err.message);
        next(err);
    }
};

module.exports = { sendOtpController };
