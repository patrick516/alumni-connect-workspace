const express = require("express");
const eventController = require("../controllers/eventController");
const {
  authenticate,
  authorize,
  requireApprovedAlumni,
} = require("../middleware/authMiddleware");
const { createEventValidation, validate } = require("../middleware/validation");

const router = express.Router();

router.use(authenticate, requireApprovedAlumni);

// Public routes (students & alumni can view approved events; admin sees all)
router.get("/", eventController.listEvents);
router.get("/filters", eventController.getEventFilters);
router.get("/stats", eventController.getEventStats);

// Create event — alumni, students, and admin can propose
router.post(
  "/",
  authorize("alumni", "student", "admin"),
  createEventValidation,
  validate,
  eventController.createEvent,
);

// Join event — any authenticated user
router.post("/:id/join", eventController.joinEvent);

// Update event (owner or admin)
router.put(
  "/:id",
  authorize("alumni", "student", "admin"),
  createEventValidation,
  validate,
  eventController.updateEvent,
);

// Delete event (owner or admin)
router.delete("/:id", eventController.deleteEvent);

// Admin only
router.put("/:id/approve", authorize("admin"), eventController.approveEvent);

// Participants list (admin or organizer)
router.get("/:id/participants", eventController.getParticipants);

// Send event reminders (admin only, can be called by cron)
router.post(
  "/reminders",
  authorize("admin"),
  eventController.sendEventReminders,
);

module.exports = router;
