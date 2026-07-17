const formatUser = (doc) => {
  if (!doc) return null;
  const u = doc.toObject ? doc.toObject() : { ...doc };
  u._id = String(u._id);
  delete u.password;
  delete u.passwordResetTokenHash;
  if (u.createdAt) u.createdAt = u.createdAt.toISOString?.() || u.createdAt;
  if (u.updatedAt) u.updatedAt = u.updatedAt.toISOString?.() || u.updatedAt;
  return u;
};

module.exports = formatUser;
