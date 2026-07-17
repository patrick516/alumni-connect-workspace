const User = require("../models/User");
const Connection = require("../models/Connection"); // ADDED
const Job = require("../models/Job"); // ADDED
const Event = require("../models/Event"); // ADDED
const Department = require("../models/Department"); // ADDED
const formatUser = require("../utils/formatUser");
const { generatePlainToken, hashToken } = require("../utils/tokenCrypto");
const {
  sendTransactionalEmail,
  frontendBaseUrl,
} = require("../services/email.service");

// ========== EXISTING FUNCTIONS (keep as is) ==========
exports.deleteUser = async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (String(target._id) === req.user.userId) {
    return res.status(403).json({
      success: false,
      message: "You cannot delete your own account.",
    });
  }

  if (target.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete the last administrator.",
      });
    }
  }

  await User.deleteOne({ _id: target._id });
  res.json({ success: true, message: "User deleted" });
};

exports.approveAlumni = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true },
  );
  if (!user || user.role !== "alumni") {
    return res
      .status(404)
      .json({ success: false, message: "Alumni user not found" });
  }
  res.json(formatUser(user));
};

exports.inviteAdmin = async (req, res) => {
  const { name, email, tempPassword } = req.body;

  if (!name?.trim() || !email?.trim() || !tempPassword) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and temporary password are required.",
    });
  }

  if (tempPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Temporary password must be at least 8 characters.",
    });
  }

  const normalized = email.toLowerCase().trim();
  const exists = await User.findOne({ email: normalized });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: "That email is already registered.",
    });
  }

  const plainToken = generatePlainToken();
  const tokenHash = hashToken(plainToken);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const user = await User.create({
    name: name.trim(),
    email: normalized,
    password: tempPassword,
    role: "admin",
    isApproved: true,
    mustChangePassword: true,
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: expires,
    graduationYear: "",
    university: "",
    company: "",
    position: "",
  });

  const base = frontendBaseUrl();
  const link = `${base}/reset-password?token=${plainToken}`;
  const html = `
    <p>Hello ${name.trim()},</p>
    <p>You have been added as an <strong>administrator</strong> on Alumni Connect.</p>
    <p><strong>Temporary password:</strong> ${tempPassword}</p>
    <p>You can sign in with this password; you will be prompted to choose a new password after login.</p>
    <p><strong>Recommended:</strong> set your own password now using this secure link (valid 7 days):</p>
    <p><a href="${link}">Set your password</a></p>
    <p>If the button does not work, copy this URL:<br/>${link}</p>
  `;

  try {
    await sendTransactionalEmail({
      to: user.email,
      subject: "Your Alumni Connect admin account",
      html,
    });
  } catch (err) {
    console.error("[inviteAdmin] email error:", err);
    return res.status(500).json({
      success: false,
      message:
        "Admin user was created but the invitation email could not be sent. Configure Brevo in .env or share credentials manually.",
      user: formatUser(user),
    });
  }

  res.status(201).json({
    success: true,
    message: "Invitation email sent with temporary password and setup link.",
    user: formatUser(user),
  });
};

// ========== NEW FUNCTIONS FOR ADMIN DASHBOARD ==========

// @desc    Get dashboard statistics for admin (with Recharts data)
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAlumni = await User.countDocuments({
      role: "alumni",
      isApproved: true,
    });
    const pendingAlumni = await User.countDocuments({
      role: "alumni",
      isApproved: false,
    });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Mentorship stats
    const totalMentorships = await Connection.countDocuments({
      status: "accepted",
    });
    const pendingMentorships = await Connection.countDocuments({
      status: "pending",
    });
    const completedMentorships = await Connection.countDocuments({
      status: "completed",
    });

    // Job stats
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: "active" });
    const pendingJobs = await Job.countDocuments({ status: "pending" });

    // Event stats
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      eventDate: { $gte: new Date() },
    });

    // Department distribution for pie chart
    const departmentDistribution = await User.aggregate([
      {
        $match: {
          role: { $in: ["student", "alumni"] },
          department: { $ne: null, $ne: "" },
        },
      },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Monthly registration trend for line chart
    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    const monthlyData = monthlyRegistrations.map((m) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
      registrations: m.count,
    }));

    // Mentorship matches by department (bar chart data)
    const mentorshipByDept = await Connection.aggregate([
      { $match: { status: "accepted" } },
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      { $group: { _id: "$student.department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // User growth data
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": -1 } },
      { $limit: 30 },
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalStudents + totalAlumni + totalAdmins,
          students: totalStudents,
          alumni: totalAlumni,
          pendingAlumni,
          admins: totalAdmins,
        },
        mentorship: {
          total: totalMentorships,
          pending: pendingMentorships,
          completed: completedMentorships,
          active: totalMentorships - completedMentorships,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          pending: pendingJobs,
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
        },
        charts: {
          departmentDistribution,
          monthlyRegistrations: monthlyData,
          mentorshipByDepartment: mentorshipByDept,
          userGrowth,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all users with filters for admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, department, isApproved, search } = req.query;
    let filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(100);

    res.json({
      success: true,
      users: users.map(formatUser),
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get alumni registration requests
exports.getPendingAlumni = async (req, res) => {
  try {
    const pendingAlumni = await User.find({
      role: "alumni",
      isApproved: false,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      alumni: pendingAlumni.map(formatUser),
    });
  } catch (error) {
    console.error("Get pending alumni error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get mentorship analytics
exports.getMentorshipAnalytics = async (req, res) => {
  try {
    const analytics = await Connection.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgMatchScore: { $avg: "$matchScore" },
        },
      },
    ]);

    const topMentors = await Connection.aggregate([
      { $match: { status: "accepted" } },
      { $group: { _id: "$alumniId", menteeCount: { $sum: 1 } } },
      { $sort: { menteeCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "mentor",
        },
      },
      { $unwind: "$mentor" },
      {
        $project: {
          name: "$mentor.name",
          department: "$mentor.department",
          menteeCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      analytics,
      topMentors,
    });
  } catch (error) {
    console.error("Get mentorship analytics error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
