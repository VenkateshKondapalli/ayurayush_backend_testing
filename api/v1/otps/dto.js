const sendOtpValidator = (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        isSuccess: false,
        message: "Email is required!",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid email format!",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { sendOtpValidator };
