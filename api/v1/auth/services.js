const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../../../models/userSchema");

const signupUser = async ({ name, email, phone, gender, dob, password }) => {
  const newUser = await UserModel.create({
    name,
    email,
    phone,
    gender,
    dob,
    password,
  });
  return { email: newUser.email, _id: newUser._id };
};

const loginUser = async ({ email, password }) => {
  const userDoc = await UserModel.findOne({ email }).lean();

  if (!userDoc) {
    const err = new Error(
      "User account doesn't exists! Please signup first...",
    );
    err.statusCode = 400;
    throw err;
  }

  const isCorrect = await bcrypt.compare(password.toString(), userDoc.password);

  if (!isCorrect) {
    const err = new Error("Incorrect password! Please try again...");
    err.statusCode = 400;
    throw err;
  }

  const token = jwt.sign(
    {
      userId: userDoc._id,
      email: userDoc.email,
      roles: userDoc.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return { token, roles: userDoc.roles };
};

const checkEmailExists = async (email) => {
  const user = await UserModel.findOne({ email });
  return !!user;
};

const forgotPassword = async (email) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    const err = new Error("No account found with this email");
    err.statusCode = 404;
    throw err;
  }
  // OTP sending is handled by the OTP service (reused from signup flow)
  // The controller will call sendOtp after this check
  return { email: user.email };
};

const resetPassword = async (email, newPassword) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    const err = new Error("No account found with this email");
    err.statusCode = 404;
    throw err;
  }

  user.password = newPassword;
  await user.save(); // pre-save hook will hash the password

  return { email: user.email };
};

module.exports = {
  signupUser,
  loginUser,
  checkEmailExists,
  forgotPassword,
  resetPassword,
};
