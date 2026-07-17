const Connection = require("../models/Connection");
const User = require("../models/User");
const matchingService = require("../services/matching.service");
const notificationService = require("../services/notification.service");

const formatUserMini = (u) => ({
  _id: String(u._id),
  name: u.name,
  email: u.email,
  profilePhoto: u.profilePhoto || "",
  role: u.role,
  graduationYear: u.graduationYear,
  company: u.company,
  position: u.position,
  department: u.department,
  skills: u.skills || [],
  interests: u.interests || [],
});

// ========== BASIC CONNECTION FUNCTIONS ==========

exports.requestConnection = async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Only students can send connection requests",
    });
  }
  const { alumniId } = req.body;
  if (!alumniId) {
    return res
      .status(400)
      .json({ success: false, message: "alumniId is required" });
  }

  const alumni = await User.findById(alumniId);
  if (!alumni || alumni.role !== "alumni" || !alumni.isApproved) {
    return res.status(404).json({
      success: false,
      message: "Alumni not found or not approved",
    });
  }

  if (String(alumni._id) === req.user.userId) {
    return res.status(400).json({ success: false, message: "Invalid target" });
  }

  let conn = await Connection.findOne({
    studentId: req.user.userId,
    alumniId,
  });

  if (conn) {
    if (conn.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Already connected",
      });
    }
    if (conn.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already pending",
      });
    }
    conn.status = "pending";
    await conn.save();
  } else {
    conn = await Connection.create({
      studentId: req.user.userId,
      alumniId,
      status: "pending",
    });
  }

  const populated = await Connection.findById(conn._id)
    .populate(
      "alumniId",
      "name email profilePhoto graduationYear company position role department skills interests",
    )
    .lean();

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${alumniId}`).emit("connection:incoming", {
      connectionId: String(populated._id),
      studentId: req.user.userId,
    });
  }

  res.status(201).json({
    _id: String(populated._id),
    status: populated.status,
    alumni: formatUserMini(populated.alumniId),
  });
};

exports.listForStudent = async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ success: false, message: "Students only" });
  }
  const rows = await Connection.find({ studentId: req.user.userId })
    .populate(
      "alumniId",
      "name email profilePhoto graduationYear company position role department skills interests",
    )
    .sort({ updatedAt: -1 })
    .lean();

  res.json(
    rows.map((r) => ({
      _id: String(r._id),
      status: r.status,
      alumni: formatUserMini(r.alumniId),
      updatedAt: r.updatedAt,
      matchScore: r.matchScore,
      mentorshipRequest: r.mentorshipRequest,
    })),
  );
};

exports.listForAlumni = async (req, res) => {
  if (req.user.role !== "alumni") {
    return res.status(403).json({ success: false, message: "Alumni only" });
  }
  const pending = await Connection.find({
    alumniId: req.user.userId,
    status: "pending",
  })
    .populate(
      "studentId",
      "name email profilePhoto graduationYear company position role department skills interests",
    )
    .sort({ createdAt: -1 })
    .lean();

  const accepted = await Connection.find({
    alumniId: req.user.userId,
    status: "accepted",
  })
    .populate(
      "studentId",
      "name email profilePhoto graduationYear company position role department skills interests",
    )
    .sort({ updatedAt: -1 })
    .lean();

  res.json({
    pending: pending.map((r) => ({
      _id: String(r._id),
      status: r.status,
      student: formatUserMini(r.studentId),
      createdAt: r.createdAt,
      matchScore: r.matchScore,
      mentorshipRequest: r.mentorshipRequest,
    })),
    accepted: accepted.map((r) => ({
      _id: String(r._id),
      status: r.status,
      student: formatUserMini(r.studentId),
      updatedAt: r.updatedAt,
      matchScore: r.matchScore,
    })),
  });
};

exports.cancel = async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ success: false, message: "Students only" });
  }
  const conn = await Connection.findOne({
    _id: req.params.id,
    studentId: req.user.userId,
    status: "pending",
  });
  if (!conn) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  await Connection.deleteOne({ _id: conn._id });
  res.json({ success: true, message: "Request cancelled" });
};

// ========== MATCHING ALGORITHM FUNCTIONS ==========

exports.getMatchingSuggestions = async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Only students can get matching suggestions",
    });
  }

  const student = await User.findById(req.user.userId);

  const alumniList = await User.find({
    role: "alumni",
    isApproved: true,
  }).select("-password");

  const existingConnections = await Connection.find({
    studentId: req.user.userId,
  }).select("alumniId");

  const existingAlumniIds = existingConnections.map((c) => String(c.alumniId));

  const availableAlumni = alumniList.filter(
    (alumni) => !existingAlumniIds.includes(String(alumni._id)),
  );

  const mentorshipRequest = {
    skills: student.skills || [],
    interests: student.interests || [],
    careerGoals: "",
    preferredIndustry: "",
    message: "",
  };

  const matches = matchingService.findBestMatches(
    availableAlumni,
    student,
    mentorshipRequest,
  );
  const recommendedMatches = matchingService.filterMatchesByThreshold(matches);

  res.json({
    success: true,
    matches: recommendedMatches.slice(0, 10),
    totalMatches: matches.length,
    recommendedCount: recommendedMatches.length,
  });
};

exports.getMentorshipRequests = async (req, res) => {
  if (req.user.role !== "alumni") {
    return res.status(403).json({
      success: false,
      message: "Only alumni can view mentorship requests",
    });
  }

  const requests = await Connection.find({
    alumniId: req.user.userId,
    status: "pending",
  })
    .populate(
      "studentId",
      "name email department registrationNumber skills interests profilePhoto",
    )
    .sort({ matchScore: -1, createdAt: -1 });

  res.json({
    success: true,
    requests: requests.map((r) => ({
      _id: r._id,
      status: r.status,
      student: formatUserMini(r.studentId),
      matchScore: r.matchScore,
      matchDetails: r.matchDetails,
      mentorshipRequest: r.mentorshipRequest,
      createdAt: r.createdAt,
    })),
  });
};

// ========== MENTORSHIP RESPONSE FUNCTIONS WITH NOTIFICATIONS ==========

exports.accept = async (req, res) => {
  if (req.user.role !== "alumni") {
    return res.status(403).json({ success: false, message: "Alumni only" });
  }
  const conn = await Connection.findOne({
    _id: req.params.id,
    alumniId: req.user.userId,
    status: "pending",
  });
  if (!conn) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  conn.status = "accepted";
  conn.startedAt = new Date();
  await conn.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${String(conn.studentId)}`).emit("connection:accepted", {
      connectionId: String(conn._id),
      alumniId: req.user.userId,
    });
  }

  const student = await User.findById(conn.studentId);
  const alumni = await User.findById(req.user.userId);

  await notificationService.notifyMentorshipResponse(
    student,
    alumni,
    "accepted",
    null,
  );

  const populated = await Connection.findById(conn._id)
    .populate(
      "studentId",
      "name email profilePhoto graduationYear company position role department skills interests",
    )
    .lean();
  res.json({
    _id: String(populated._id),
    status: populated.status,
    student: formatUserMini(populated.studentId),
    startedAt: populated.startedAt,
  });
};

exports.reject = async (req, res) => {
  if (req.user.role !== "alumni") {
    return res.status(403).json({ success: false, message: "Alumni only" });
  }
  const conn = await Connection.findOne({
    _id: req.params.id,
    alumniId: req.user.userId,
    status: "pending",
  });
  if (!conn) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  const studentId = String(conn.studentId);
  conn.status = "rejected";
  await conn.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${studentId}`).emit("connection:rejected", {
      connectionId: String(conn._id),
    });
  }

  const student = await User.findById(conn.studentId);
  const alumni = await User.findById(req.user.userId);

  await notificationService.notifyMentorshipResponse(
    student,
    alumni,
    "rejected",
    null,
  );

  res.json({ success: true, message: "Request declined" });
};

exports.createMentorshipRequest = async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Only students can request mentorship",
    });
  }

  const { skills, interests, careerGoals, preferredIndustry, message } =
    req.body;

  const existingRequest = await Connection.findOne({
    studentId: req.user.userId,
    status: { $in: ["pending", "accepted"] },
  });

  if (existingRequest) {
    return res.status(400).json({
      success: false,
      message: "You already have a pending or active mentorship request",
    });
  }

  const alumniList = await User.find({
    role: "alumni",
    isApproved: true,
  }).select("-password");

  if (alumniList.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No alumni available for mentorship",
    });
  }

  const student = await User.findById(req.user.userId);

  const mentorshipRequest = {
    skills: skills || student.skills || [],
    interests: interests || student.interests || [],
    careerGoals: careerGoals || "",
    preferredIndustry: preferredIndustry || "",
    message: message || "",
  };

  const matches = matchingService.findBestMatches(
    alumniList,
    student,
    mentorshipRequest,
  );
  const recommendedMatches = matchingService.filterMatchesByThreshold(matches);

  if (recommendedMatches.length === 0) {
    return res.status(404).json({
      success: false,
      message:
        "No suitable mentors found. Please update your skills and interests.",
      topMatches: matches.slice(0, 5),
    });
  }

  const createdConnections = [];

  for (const match of recommendedMatches.slice(0, 5)) {
    const connection = await Connection.create({
      studentId: req.user.userId,
      alumniId: match.alumniId,
      status: "pending",
      mentorshipRequest,
      matchScore: match.matchScore,
      matchDetails: match.matchDetails,
    });

    createdConnections.push({
      _id: String(connection._id),
      status: connection.status,
      matchScore: connection.matchScore,
      matchDetails: connection.matchDetails,
      alumni: match.alumni,
    });

    await notificationService.notifyMentorshipRequest(
      student,
      match.alumni,
      match.matchScore,
      message,
    );
  }

  const io = req.app.get("io");
  if (io) {
    for (const conn of createdConnections) {
      io.to(`user:${conn.alumni._id}`).emit("connection:incoming", {
        connectionId: conn._id,
        studentId: req.user.userId,
        matchScore: conn.matchScore,
      });
    }
  }

  res.status(201).json({
    success: true,
    message: `Mentorship requests sent to ${createdConnections.length} potential mentors`,
    connections: createdConnections,
  });
};

exports.respondToMentorshipRequest = async (req, res) => {
  if (req.user.role !== "alumni") {
    return res.status(403).json({
      success: false,
      message: "Only alumni can respond to requests",
    });
  }

  const { id } = req.params;
  const { status, message } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be accepted or rejected",
    });
  }

  const connection = await Connection.findById(id).populate(
    "studentId",
    "name email",
  );

  if (!connection) {
    return res.status(404).json({
      success: false,
      message: "Connection not found",
    });
  }

  if (String(connection.alumniId) !== req.user.userId) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (connection.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Request already processed",
    });
  }

  connection.status = status;
  if (status === "accepted") {
    connection.startedAt = new Date();
  }
  await connection.save();

  const student = await User.findById(connection.studentId);
  const alumni = await User.findById(req.user.userId);

  await notificationService.notifyMentorshipResponse(
    student,
    alumni,
    status,
    message,
  );

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${String(connection.studentId._id)}`).emit(
      `connection:${status}`,
      {
        connectionId: String(connection._id),
        alumniId: req.user.userId,
        status,
      },
    );
  }

  res.json({
    success: true,
    message: `Mentorship request ${status}`,
    connection: {
      _id: connection._id,
      status: connection.status,
      matchScore: connection.matchScore,
      startedAt: connection.startedAt,
    },
  });
};

exports.getActiveMentorships = async (req, res) => {
  let query = { status: "accepted" };

  if (req.user.role === "student") {
    query.studentId = req.user.userId;
  } else if (req.user.role === "alumni") {
    query.alumniId = req.user.userId;
  }

  const mentorships = await Connection.find(query)
    .populate(
      "studentId",
      "name email department registrationNumber skills profilePhoto",
    )
    .populate(
      "alumniId",
      "name email department position company skills profilePhoto",
    )
    .sort({ startedAt: -1 });

  res.json({
    success: true,
    mentorships: mentorships.map((m) => ({
      _id: m._id,
      status: m.status,
      student: formatUserMini(m.studentId),
      alumni: formatUserMini(m.alumniId),
      matchScore: m.matchScore,
      startedAt: m.startedAt,
      feedback: m.feedback,
    })),
  });
};

exports.completeMentorship = async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  const connection = await Connection.findById(id);

  if (!connection) {
    return res.status(404).json({
      success: false,
      message: "Connection not found",
    });
  }

  if (connection.status !== "accepted") {
    return res.status(400).json({
      success: false,
      message: "Only active mentorships can be completed",
    });
  }

  if (
    req.user.role === "student" &&
    String(connection.studentId) === req.user.userId
  ) {
    connection.feedback = {
      ...connection.feedback,
      studentRating: rating,
      studentReview: review,
    };
  } else if (
    req.user.role === "alumni" &&
    String(connection.alumniId) === req.user.userId
  ) {
    connection.feedback = {
      ...connection.feedback,
      alumniRating: rating,
      alumniReview: review,
    };
  } else {
    return res.status(403).json({
      success: false,
      message: "Not authorized to complete this mentorship",
    });
  }

  if (connection.feedback.studentRating && connection.feedback.alumniRating) {
    connection.status = "completed";
    connection.completedAt = new Date();
  }

  await connection.save();

  res.json({
    success: true,
    message: "Feedback submitted successfully",
    connection: {
      _id: connection._id,
      status: connection.status,
      feedback: connection.feedback,
      completedAt: connection.completedAt,
    },
  });
};
