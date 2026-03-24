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

authRouter.post(
    "/signup",
    userSignupValidator,
    validateOtpMiddleware,
    userSignupController,
);
authRouter.post("/login", userLoginValidator, userLoginController);
authRouter.get("/me", validateLoggedInUserMiddleware, getCurrentUserController);
authRouter.get("/logout", userLogoutController);
authRouter.get("/check-email", checkEmailExistsController);
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
