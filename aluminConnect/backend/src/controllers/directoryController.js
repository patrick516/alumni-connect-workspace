const User = require("../models/User");

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

// Get filter options (departments, skills for dropdowns)
exports.getFilterOptions = async (req, res) => {
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
