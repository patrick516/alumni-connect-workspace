const Department = require("../models/Department");
const User = require("../models/User");

// @desc    Create department (Admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    const existingDepartment = await Department.findOne({
      $or: [{ name }, { code: code.toUpperCase() }],
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department name or code already exists",
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({
      name: 1,
    });
    res.json({ success: true, departments });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all departments (admin - including inactive)
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json({ success: true, departments });
  } catch (error) {
    console.error("Get all departments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    await department.deleteOne();

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get department statistics for admin dashboard
exports.getDepartmentStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { role: { $in: ["student", "alumni"] } },
      },
      {
        $group: {
          _id: {
            department: "$department",
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.department",
          students: {
            $sum: {
              $cond: [{ $eq: ["$_id.role", "student"] }, "$count", 0],
            },
          },
          alumni: {
            $sum: {
              $cond: [{ $eq: ["$_id.role", "alumni"] }, "$count", 0],
            },
          },
          total: { $sum: "$count" },
        },
      },
      {
        $project: {
          department: { $ifNull: ["$_id", "Not Specified"] },
          students: 1,
          alumni: 1,
          total: 1,
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Get department stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
