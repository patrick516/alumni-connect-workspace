const express = require("express");
const router = express.Router();
const { authenticate: protect } = require("../middleware/authMiddleware");
const {
  createDepartment,
  getDepartments,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
} = require("../controllers/departmentController");

// Public routes
router.get("/", getDepartments);

// Admin only routes (all require authentication and admin role)
router.post(
  "/",
  protect,
  async (req, res, next) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }
    next();
  },
  createDepartment,
);

router.get(
  "/all",
  protect,
  async (req, res, next) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }
    next();
  },
  getAllDepartments,
);

router.get(
  "/stats",
  protect,
  async (req, res, next) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }
    next();
  },
  getDepartmentStats,
);

router.put(
  "/:id",
  protect,
  async (req, res, next) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }
    next();
  },
  updateDepartment,
);

router.delete(
  "/:id",
  protect,
  async (req, res, next) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }
    next();
  },
  deleteDepartment,
);

module.exports = router;
