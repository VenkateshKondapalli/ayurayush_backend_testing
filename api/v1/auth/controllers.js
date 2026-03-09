const { signupUser, loginUser, checkEmailExists } = require("./services");

const userSignupController = async (req, res) => {
  try {
    const { name, email, phone, gender, dob, password } = req.body;

    const user = await signupUser({
      name,
      email,
      phone,
      gender,
      dob,
      password,
    });

    res.status(201).json({
      isSuccess: true,
      message: "User Created!",
      data: { user },
    });
  } catch (err) {
    if (err.code == 11000) {
      return res.status(409).json({
        isSuccess: false,
        message: "User account already exists!",
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
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

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { token, roles } = await loginUser({ email, password });

    res.cookie("authorization", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      isSuccess: true,
      message: "User logged in!",
      data: { roles },
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

const userLogoutController = async (req, res) => {
  try {
    res.cookie("authorization", "", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 0,
    });

    res.status(200).json({
      isSuccess: true,
      message: "User logged out!",
    });
  } catch (err) {
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};

const getCurrentUserController = (req, res) => {
  try {
    const { userId, roles } = req.currentUser;

    res.status(200).json({
      isSuccess: true,
      data: { userId, roles },
    });
  } catch (err) {
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
    });
  }
};

const checkEmailExistsController = async (req, res) => {
  try {
    const { email } = req.query;
    const exists = await checkEmailExists(email);
    res.status(200).json({ exists });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  userSignupController,
  userLoginController,
  userLogoutController,
  getCurrentUserController,
  checkEmailExistsController,
};
