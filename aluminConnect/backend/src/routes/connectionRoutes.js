const express = require("express");
const router = express.Router();
const { authenticate: protect } = require("../middleware/authMiddleware");
const {
  // Existing
  requestConnection,
  listForStudent,
  listForAlumni,
  accept,
  reject,
  cancel,
  // New matching algorithm functions
  createMentorshipRequest,
  getMatchingSuggestions,
  getMentorshipRequests,
  respondToMentorshipRequest,
  getActiveMentorships,
  completeMentorship,
} = require("../controllers/connectionController");

// All routes require authentication - this is correct
router.use(protect);

// ========== EXISTING ROUTES ==========
router.post("/request", requestConnection);
router.get("/student", listForStudent);
router.get("/alumni", listForAlumni);
router.put("/:id/accept", accept);
router.put("/:id/reject", reject);
router.delete("/:id/cancel", cancel);

// ========== NEW ROUTES FOR MATCHING ALGORITHM ==========
// Student routes
router.post("/mentorship/request", createMentorshipRequest);
router.get("/mentorship/suggestions", getMatchingSuggestions);

// Alumni routes
router.get("/mentorship/requests", getMentorshipRequests);
router.put("/mentorship/:id/respond", respondToMentorshipRequest);

// Common routes
router.get("/mentorship/active", getActiveMentorships);
router.put("/mentorship/:id/complete", completeMentorship);

module.exports = router;
