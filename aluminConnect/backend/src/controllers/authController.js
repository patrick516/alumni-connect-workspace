const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const formatUser = require("../utils/formatUser");
const { generatePlainToken, hashToken } = require("../utils/tokenCrypto");
const {
  sendTransactionalEmail,
  frontendBaseUrl,
} = require("../services/email.service");

exports.bootstrap = async (req, res) => {
  const userCount = await User.countDocuments();
  res.json({ allowFirstAdminRegister: userCount === 0 });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }

  const {
    name,
    email,
    password,
    role,
    phone,
    graduationYear,
    university,
    company,
    position,
    department,
    registrationNumber,
    gender,
  } = req.body;

  if (!["student", "alumni", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role." });
  }

  const userCount = await User.countDocuments();

  if (role === "admin") {
    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message:
          "Admin self-registration is only allowed when no users exist. Ask an administrator to invite you.",
      });
    }
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "admin",
      phone: phone || "",
      graduationYear: "",
      university: university || "",
      company: "",
      position: "",
      isApproved: true,
      mustChangePassword: false,
    });
    const token = generateToken(user._id);
    return res
      .status(201)
      .json({ success: true, user: formatUser(user), token });
  }

  if (role === "student" && !graduationYear) {
    return res.status(400).json({
      success: false,
      message: "Graduation year is required for students.",
    });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });
  }

  const isApproved = role === "student";
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
    phone: phone || "", // ← NEW
    graduationYear: graduationYear || "",
    university: university || "",
    company: company || "",
    position: position || "",
    department: department || "",
    registrationNumber: registrationNumber || "",
    gender: gender || undefined,
    isApproved,
  });

  if (role === "alumni") {
    return res.status(201).json({
      success: true,
      message:
        "Registration successful. An administrator must approve your account before you can sign in.",
      user: formatUser(user),
      token: null,
      pendingApproval: true,
    });
  }

  const token = generateToken(user._id);
  return res.status(201).json({ success: true, user: formatUser(user), token });
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  if (user.role === "alumni" && !user.isApproved) {
    return res.status(403).json({
      success: false,
      message:
        "Your alumni account is pending approval. Please try again once an administrator approves it.",
    });
  }

  const token = generateToken(user._id);
  res.json({
    success: true,
    user: formatUser(user),
    token,
    mustChangePassword: !!user.mustChangePassword,
  });
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }

  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  const generic =
    "If an account exists for that email, you will receive reset instructions shortly.";

  if (!user) return res.json({ success: true, message: generic });

  const plainToken = generatePlainToken();
  user.passwordResetTokenHash = hashToken(plainToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const base = frontendBaseUrl();
  const link = `${base}/reset-password?token=${plainToken}`;
  const html = `<p>Hello ${user.name},</p><p>We received a request to reset your Alumni Connect password.</p><p><a href="${link}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`;

  try {
    await sendTransactionalEmail({
      to: user.email,
      subject: "Reset your Alumni Connect password",
      html,
    });
  } catch (err) {
    console.error("[forgotPassword] email error:", err);
  }

  res.json({ success: true, message: generic });
};

exports.resetPasswordWithToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }

  const { token, newPassword } = req.body;
  const hashed = hashToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select("+password +passwordResetTokenHash");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset link. Request a new one from login.",
    });
  }

  user.password = newPassword;
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  user.mustChangePassword = false;
  await user.save();

  res.json({
    success: true,
    message: "Password updated. You can sign in with your new password.",
  });
};
