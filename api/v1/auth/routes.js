const express = require("express");
const {
    userSignupController,
    userLoginController,
    userLogoutController,
    getCurrentUserController,
    checkEmailExistsController,
    forgotPasswordController,
    resetPasswordController,
    changePasswordController,
} = require("./controllers");

const {
    userSignupValidator,
    userLoginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    changePasswordValidator,
} = require("./dto");
const { validateOtpMiddleware } = require("../otps/middlewares");
const { validateLoggedInUserMiddleware } = require("../middlewares");

const authRouter = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const checkEmailQueryValidator = (req, res, next) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({
            isSuccess: false,
            message: "Email query parameter is required",
        });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({
            isSuccess: false,
            message: "Invalid email format",
        });
    }

    return next();
};

authRouter.post(
    "/signup",
    userSignupValidator,
    validateOtpMiddleware,
    userSignupController,
);
authRouter.post("/login", userLoginValidator, userLoginController);
authRouter.get("/me", validateLoggedInUserMiddleware, getCurrentUserController);
authRouter.get("/logout", userLogoutController);
authRouter.get(
    "/check-email",
    checkEmailQueryValidator,
    checkEmailExistsController,
);
authRouter.post(
    "/forgot-password",
    forgotPasswordValidator,
    forgotPasswordController,
);
authRouter.post(
    "/reset-password",
    resetPasswordValidator,
    validateOtpMiddleware,
    resetPasswordController,
);
authRouter.post(
    "/change-password",
    validateLoggedInUserMiddleware,
    changePasswordValidator,
    changePasswordController,
);

module.exports = { authRouter };
