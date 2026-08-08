const User = require("../models/User");
const ProfileView = require("../models/ProfileView");

const publicFields =
  "name email profilePhoto graduationYear company position role bio skills isApproved department location";

exports.listAlumni = async (req, res) => {
  const { department, skills, location, search } = req.query;

  // Build filter
  let filter = {
    role: "alumni",
    isApproved: true,
    _id: { $ne: req.user.userId }, // Exclude current user
  };

  // Filter by department
  if (department && department !== "all") {
    filter.department = { $regex: department, $options: "i" };
  }

  // Filter by skills (case-insensitive, partial match)
  if (skills && skills !== "all") {
    const skillsArray = skills.split(",").map((s) => s.trim());
    filter.skills = { $in: skillsArray.map((s) => new RegExp(s, "i")) };
  }

  // Filter by location (company location or bio)
  if (location && location !== "all") {
    filter.$or = [
      { location: { $regex: location, $options: "i" } },
      { company: { $regex: location, $options: "i" } },
      { bio: { $regex: location, $options: "i" } },
    ];
  }

  // Search by name or company
  if (search && search.trim()) {
    const searchTerm = search.trim();
    filter.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { company: { $regex: searchTerm, $options: "i" } },
      { position: { $regex: searchTerm, $options: "i" } },
      { skills: { $in: [new RegExp(searchTerm, "i")] } },
    ];
  }

  const alumni = await User.find(filter)
    .select(publicFields)
    .sort({ name: 1 })
    .lean();

  const list = alumni.map((u) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    profilePhoto: u.profilePhoto || "",
    graduationYear: u.graduationYear,
    company: u.company,
    position: u.position,
    department: u.department,
    location: u.location,
    role: u.role,
    bio: u.bio || "",
    skills: u.skills || [],
  }));

  res.json({
    success: true,
    count: list.length,
    alumni: list,
  });
};

exports.listStudents = async (req, res) => {
  const { department, skills, search } = req.query;

  // Build filter
  let filter = {
    role: "student",
    _id: { $ne: req.user.userId }, // Exclude current user
  };

  // Filter by department
  if (department && department !== "all") {
    filter.department = { $regex: department, $options: "i" };
  }

  // Filter by skills
  if (skills && skills !== "all") {
    const skillsArray = skills.split(",").map((s) => s.trim());
    filter.skills = { $in: skillsArray.map((s) => new RegExp(s, "i")) };
  }

  // Search by name
  if (search && search.trim()) {
    const searchTerm = search.trim();
    filter.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { skills: { $in: [new RegExp(searchTerm, "i")] } },
    ];
  }

  const students = await User.find(filter)
    .select(publicFields)
    .sort({ name: 1 })
    .lean();

  const list = students.map((u) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    profilePhoto: u.profilePhoto || "",
    graduationYear: u.graduationYear,
    department: u.department,
    role: u.role,
    bio: u.bio || "",
    skills: u.skills || [],
  }));

  res.json({
    success: true,
    count: list.length,
    students: list,
  });
};

// Get a single user's full profile — counts a view unless viewing your own
// Get a single user's full profile — logs a distinct view unless viewing your own
exports.getProfileById = async (req, res) => {
  const { id } = req.params;
  const isOwnProfile = id === req.user.userId;

  const user = await User.findById(id)
    .select(publicFields + " employmentStatus")
    .lean();

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!isOwnProfile) {
    // Upsert: same viewer visiting again just refreshes the timestamp,
    // it doesn't inflate the distinct-viewer count.
    await ProfileView.findOneAndUpdate(
      { viewer: req.user.userId, viewedUser: id },
      { viewer: req.user.userId, viewedUser: id },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  const profileViews = await ProfileView.countDocuments({ viewedUser: id });

  res.json({
    success: true,
    user: {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      graduationYear: user.graduationYear,
      company: user.company,
      position: user.position,
      department: user.department,
      location: user.location,
      role: user.role,
      bio: user.bio || "",
      skills: user.skills || [],
      employmentStatus: user.employmentStatus || "",
      profileViews,
    },
  });
};

// Get filter options (departments, skills for dropdowns)
exports.getFilterOptions = async (req, res) => {
  s;
  const alumni = await User.find({ role: "alumni", isApproved: true }).lean();

  // Extract unique departments
  const departments = [
    ...new Set(alumni.map((a) => a.department).filter(Boolean)),
  ];

  // Extract unique skills (flatten and deduplicate)
  const allSkills = alumni.flatMap((a) => a.skills || []);
  const skills = [...new Set(allSkills)].sort();

  // Extract unique locations
  const locations = [
    ...new Set(alumni.map((a) => a.location || a.company).filter(Boolean)),
  ];

  res.json({
    success: true,
    filters: {
      departments,
      skills,
      locations,
    },
  });
};
