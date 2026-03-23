const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

const userSignupValidator = (req, res, next) => {
    try {
        console.log("-----🟢 inside userSignupValidator-------");

        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({
                isSuccess: false,
                message: "Email, otp and password are required!",
            });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid email format!",
            });
        }

        if (password.length < PASSWORD_MIN_LENGTH) {
            return res.status(400).json({
                isSuccess: false,
                message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters!`,
            });
        }

        next();
    } catch (err) {
        console.log("-----🔴 Error in userSignupValidator--------");
        next(err);
    }
};

const userLoginValidator = (req, res, next) => {
    try {
        console.log("-----🟢 inside userLoginValidator-------");

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                isSuccess: false,
                message: "Email and password are required!",
            });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid email format!",
            });
        }

        next();
    } catch (err) {
        next(err);
    }
};

const forgotPasswordValidator = (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                isSuccess: false,
                message: "Email is required!",
            });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid email format!",
            });
        }
        next();
    } catch (err) {
        next(err);
    }
};

const resetPasswordValidator = (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                isSuccess: false,
                message: "Email, OTP and new password are required!",
            });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid email format!",
            });
        }
        if (newPassword.length < PASSWORD_MIN_LENGTH) {
            return res.status(400).json({
                isSuccess: false,
                message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters!`,
            });
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    userSignupValidator,
    userLoginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
};
