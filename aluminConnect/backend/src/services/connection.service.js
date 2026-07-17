const User = require("../models/User");
const Connection = require("../models/Connection");

/**
 * Whether two users may message each other (used by REST + conversation list).
 * - Admin can message anyone.
 * - Alumni ↔ alumni: allowed without a connection request.
 * - Student ↔ student: not allowed.
 * - Student ↔ alumni: only if there is an accepted Connection between them.
 */
async function canExchangeMessages(userIdA, userIdB) {
  if (!userIdA || !userIdB || String(userIdA) === String(userIdB)) {
    return false;
  }
  const [a, b] = await Promise.all([
    User.findById(userIdA).lean(),
    User.findById(userIdB).lean(),
  ]);
  if (!a || !b) return false;
  if (a.role === "admin" || b.role === "admin") return true;
  if (a.role === "student" && b.role === "student") return false;
  if (a.role === "alumni" && b.role === "alumni") return true;

  const student = a.role === "student" ? a : b.role === "student" ? b : null;
  const alumni = a.role === "alumni" ? a : b.role === "alumni" ? b : null;
  if (!student || !alumni) return false;

  const conn = await Connection.findOne({
    studentId: student._id,
    alumniId: alumni._id,
    status: "accepted",
  }).lean();
  return !!conn;
}

module.exports = { canExchangeMessages };
