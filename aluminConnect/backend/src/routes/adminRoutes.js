const express = require("express");
const adminController = require("../controllers/adminController");
const jobController = require("../controllers/jobController");
const eventController = require("../controllers/eventController");
const departmentController = require("../controllers/departmentController"); // NEW
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate, authorize("admin"));

// ========== USER MANAGEMENT ==========
router.delete("/users/:id", adminController.deleteUser);
router.post("/invite-admin", adminController.inviteAdmin);
router.put("/approve-alumni/:id", adminController.approveAlumni);
router.get("/users", adminController.getAllUsers); // NEW
router.get("/users/pending-alumni", adminController.getPendingAlumni); // NEW

// ========== DASHBOARD STATISTICS (for Recharts) ==========
router.get("/dashboard/stats", adminController.getDashboardStats); // NEW
router.get(
  "/dashboard/mentorship-analytics",
  adminController.getMentorshipAnalytics,
); // NEW

// ========== JOB MODERATION ==========
router.put("/approve-job/:id", jobController.approveJob);

// ========== EVENT MANAGEMENT ==========
router.delete("/events/:id", eventController.deleteEvent);

// ========== DEPARTMENT MANAGEMENT ==========
router.post("/departments", departmentController.createDepartment); // NEW
router.get("/departments/all", departmentController.getAllDepartments); // NEW
router.get("/departments/stats", departmentController.getDepartmentStats); // NEW
router.put("/departments/:id", departmentController.updateDepartment); // NEW
router.delete("/departments/:id", departmentController.deleteDepartment); // NEW

module.exports = router;
