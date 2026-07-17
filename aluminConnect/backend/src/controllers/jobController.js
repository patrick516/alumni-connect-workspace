const mongoose = require("mongoose");
const Job = require("../models/Job");
const User = require("../models/User");
const notificationService = require("../services/notification.service");

const formatJob = (job) => {
  if (!job) return null;
  const j = job.toObject ? job.toObject() : { ...job };
  j._id = String(j._id);
  if (j.postedBy && typeof j.postedBy === "object") {
    j.postedBy = {
      _id: String(j.postedBy._id),
      name: j.postedBy.name,
      profilePhoto: j.postedBy.profilePhoto || "",
    };
  }
  j.applicants = (j.applicants || []).map((id) => String(id));
  if (j.createdAt) j.createdAt = j.createdAt.toISOString?.() || j.createdAt;
  if (j.updatedAt) j.updatedAt = j.updatedAt.toISOString?.() || j.updatedAt;
  return j;
};

const buildListQuery = (role, userId) => {
  if (role === "admin") return {};
  if (role === "student" || role === "alumni") {
    return {
      $or: [
        { status: "approved" },
        { postedBy: new mongoose.Types.ObjectId(userId) },
      ],
    };
  }
  return { status: "approved" };
};

exports.listJobs = async (req, res) => {
  const { search, type, location } = req.query;
  const query = buildListQuery(req.user.role, req.user.userId);

  // Add search filters
  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (type && type !== "all") {
    query.type = type;
  }
  if (location && location !== "all") {
    query.location = { $regex: location, $options: "i" };
  }

  const jobs = await Job.find(query)
    .populate("postedBy", "name profilePhoto")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, jobs: jobs.map(formatJob) });
};

exports.createJob = async (req, res) => {
  const { title, company, location, description, requirements, type } =
    req.body;

  const status = req.user.role === "admin" ? "approved" : "pending";

  const job = await Job.create({
    title: title.trim(),
    company: company.trim(),
    location: location?.trim() || "",
    description: description.trim(),
    requirements: Array.isArray(requirements) ? requirements : [],
    type: type || "full-time",
    postedBy: req.user.userId,
    status,
  });
  const populated = await Job.findById(job._id)
    .populate("postedBy", "name profilePhoto")
    .lean();
  res.status(201).json({ success: true, job: formatJob(populated) });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  const owner = String(job.postedBy) === req.user.userId;
  if (!owner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }

  const { title, company, location, description, requirements, type } =
    req.body;

  if (title !== undefined) job.title = title.trim();
  if (company !== undefined) job.company = company.trim();
  if (location !== undefined) job.location = location.trim();
  if (description !== undefined) job.description = description.trim();
  if (Array.isArray(requirements)) job.requirements = requirements;
  if (type !== undefined) job.type = type;

  // Non-admin edits go back to pending re-approval; admin edits stay approved
  if (req.user.role !== "admin") {
    job.status = "pending";
  }

  await job.save();

  const populated = await Job.findById(job._id)
    .populate("postedBy", "name profilePhoto")
    .lean();
  res.json({ success: true, job: formatJob(populated) });
};

exports.deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  const owner = String(job.postedBy) === req.user.userId;
  if (!owner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }
  await Job.deleteOne({ _id: job._id });
  res.json({ success: true, message: "Job deleted" });
};

exports.applyJob = async (req, res) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ success: false, message: "Only students can apply" });
  }
  const job = await Job.findById(req.params.id);
  if (!job || job.status !== "approved") {
    return res
      .status(404)
      .json({ success: false, message: "Job not found or not open" });
  }
  const uid = new mongoose.Types.ObjectId(req.user.userId);
  if (job.applicants.some((a) => String(a) === req.user.userId)) {
    return res.json({ success: true, message: "Already applied" });
  }
  job.applicants.push(uid);
  await job.save();

  // Send notification to job poster (alumni)
  const student = await User.findById(req.user.userId);
  const jobPoster = await User.findById(job.postedBy);

  if (jobPoster && jobPoster.role === "alumni") {
    await notificationService.notifyJobApplication(job, student, jobPoster);

    const io = req.app.get("io");
    if (io) {
      const unreadCount = await notificationService.getUnreadCount(
        jobPoster._id,
      );
      io.to(`user:${String(jobPoster._id)}`).emit("notification:new", {
        type: "job_application",
        title: `New Application for ${job.title}`,
        message: `${student.name} applied for ${job.title}`,
        unreadCount,
      });
    }
  }

  res.json({ success: true, message: "Application submitted" });
};

exports.approveJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true },
  )
    .populate("postedBy", "name profilePhoto")
    .lean();
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  // Send notification to job poster
  const jobPoster = await User.findById(job.postedBy._id);
  if (jobPoster) {
    await notificationService.createNotification({
      userId: jobPoster._id,
      type: "job_approved",
      title: "Your Job Posting is Approved!",
      message: `Your job "${job.title}" has been approved and is now visible to students.`,
      data: {
        jobId: job._id,
        jobTitle: job.title,
      },
      actionUrl: `/jobs/${job._id}`,
      sendEmail: true,
      emailRecipient: jobPoster.email,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${String(jobPoster._id)}`).emit("notification:new", {
        type: "job_approved",
        title: "Job Approved!",
        message: `Your job "${job.title}" is now live.`,
      });
    }
  }

  res.json({ success: true, job: formatJob(job) });
};

exports.getJobStats = async (req, res) => {
  const totalAvailable = await Job.countDocuments({ status: "approved" });
  const appliedCount = await Job.countDocuments({
    status: "approved",
    applicants: new mongoose.Types.ObjectId(req.user.userId),
  });
  const remaining = totalAvailable - appliedCount;

  res.json({
    success: true,
    stats: {
      totalAvailable,
      applied: appliedCount,
      remaining: remaining < 0 ? 0 : remaining,
    },
  });
};

// Get job filters (types, locations for dropdown)
exports.getJobFilters = async (req, res) => {
  const jobs = await Job.find({ status: "approved" }).lean();

  const types = [...new Set(jobs.map((j) => j.type).filter(Boolean))];
  const locations = [...new Set(jobs.map((j) => j.location).filter(Boolean))];

  res.json({
    success: true,
    filters: { types, locations },
  });
};
