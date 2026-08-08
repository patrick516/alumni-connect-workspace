const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const Event = require("../models/Event");
const Connection = require("../models/Connection");
const ProfileView = require("../models/ProfileView");
const formatUser = require("../utils/formatUser");
const { canExchangeMessages } = require("../services/connection.service");

exports.getPublicPeer = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  const allowed = await canExchangeMessages(req.user.userId, id);
  if (!allowed) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to message this user yet.",
    });
  }
  const peer = await User.findById(id).select("name profilePhoto role").lean();
  if (!peer)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({
    _id: String(peer._id),
    name: peer.name,
    profilePhoto: peer.profilePhoto || "",
    role: peer.role,
  });
};

exports.listUsers = async (req, res) => {
  const users = await User.find().lean();
  res.json({ success: true, users: users.map((u) => formatUser(u)) });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user: formatUser(user) });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.userId).select("+password");
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  if (user.mustChangePassword) {
    user.password = newPassword;
    user.mustChangePassword = false;
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await user.save();
    return res.json({
      success: true,
      message: "Password updated.",
      user: formatUser(user),
    });
  }
  if (!currentPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Current password is required." });
  }
  if (!(await user.matchPassword(currentPassword))) {
    return res
      .status(401)
      .json({ success: false, message: "Current password is incorrect." });
  }
  user.password = newPassword;
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  await user.save();
  res.json({
    success: true,
    message: "Password updated.",
    user: formatUser(user),
  });
};

exports.updateProfile = async (req, res) => {
  const allowed = [
    "name",
    "phone",
    "graduationYear",
    "university",
    "company",
    "position",
    "profilePhoto",
    "skills",
    "interests",
    "department",
    "location",
    "bio",
    "cvUrl",
    "employmentStatus",
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user.userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user: formatUser(user) });
};

exports.uploadPhoto = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });
  const profilePhoto = req.file.path;
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { profilePhoto },
    { new: true },
  );
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, profilePhoto, user: formatUser(user) });
};

// GET /profile/stats
exports.getProfileStats = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  const jobsApplied =
    role === "student" ? await Job.countDocuments({ applicants: userId }) : 0;

  const appliedJobs =
    role === "student"
      ? await Job.find({ applicants: userId })
          .select("title company location type status createdAt")
          .lean()
      : [];

  let connectionsCount = 0;
  let connectionsList = [];
  if (role === "student") {
    const rows = await Connection.find({
      studentId: userId,
      status: "accepted",
    })
      .populate(
        "alumniId",
        "name email profilePhoto company position graduationYear",
      )
      .lean();
    connectionsCount = rows.length;
    connectionsList = rows.map((r) => ({
      _id: String(r._id),
      name: r.alumniId?.name || "",
      email: r.alumniId?.email || "",
      photo: r.alumniId?.profilePhoto || "",
      company: r.alumniId?.company || "",
      position: r.alumniId?.position || "",
      graduationYear: r.alumniId?.graduationYear || "",
    }));
  } else if (role === "alumni") {
    const rows = await Connection.find({ alumniId: userId, status: "accepted" })
      .populate(
        "studentId",
        "name email profilePhoto graduationYear university",
      )
      .lean();
    connectionsCount = rows.length;
    connectionsList = rows.map((r) => ({
      _id: String(r._id),
      name: r.studentId?.name || "",
      email: r.studentId?.email || "",
      photo: r.studentId?.profilePhoto || "",
      graduationYear: r.studentId?.graduationYear || "",
      university: r.studentId?.university || "",
    }));
  }

  const eventsJoined = await Event.countDocuments({ participants: userId });
  const eventsList = await Event.find({ participants: userId })
    .select("title description eventDate location organizer")
    .populate("organizer", "name")
    .lean();

  const profileViews = await ProfileView.countDocuments({
    viewedUser: userId,
  });

  res.json({
    success: true,
    profileViews,
    jobsApplied,
    appliedJobs: appliedJobs.map((j) => ({
      _id: String(j._id),
      title: j.title,
      company: j.company,
      location: j.location || "",
      type: j.type || "",
      status: j.status,
      createdAt: j.createdAt,
    })),
    connectionsCount,
    connectionsList,
    eventsJoined,
    eventsList: eventsList.map((e) => ({
      _id: String(e._id),
      title: e.title,
      description: e.description || "",
      eventDate: e.eventDate,
      location: e.location || "",
      organizer: e.organizer?.name || "",
    })),
  });
};
