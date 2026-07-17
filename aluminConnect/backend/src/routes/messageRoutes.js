const express = require("express");
const messageController = require("../controllers/messageController");
const {
  authenticate,
  requireApprovedAlumni,
} = require("../middleware/authMiddleware");
const { sendMessageValidation, validate } = require("../middleware/validation");

const router = express.Router();

router.use(authenticate, requireApprovedAlumni);

router.get("/conversations", messageController.getConversations);
router.get("/thread/:userId", messageController.getThread);
router.post(
  "/send",
  sendMessageValidation,
  validate,
  messageController.sendMessage,
);

module.exports = router;
