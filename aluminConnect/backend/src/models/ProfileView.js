const mongoose = require("mongoose");

// One document per (viewer, viewedUser) pair. Re-viewing updates the
// timestamp instead of creating duplicates, so counts reflect distinct
// viewers, not raw click counts.
const profileViewSchema = new mongoose.Schema(
  {
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

profileViewSchema.index({ viewer: 1, viewedUser: 1 }, { unique: true });

module.exports = mongoose.model("ProfileView", profileViewSchema);
