const express = require("express");
const { sendOtpController } = require("./controllers");
const { sendOtpValidator } = require("./dto");

const otpRouter = express.Router();

otpRouter.post("/", sendOtpValidator, sendOtpController);

module.exports = { otpRouter };
