const User = require("../models/User");

// @desc    Public analytics overview — employment rate, gender & department
//          distribution, and cohort trends. No auth required (public dashboard).
// @route   GET /analytics/overview?cohorts=2023,2024&gender=male
exports.getPublicAnalytics = async (req, res) => {
  try {
    const { cohorts, gender } = req.query;

    // Base match: only student/alumni count toward alumni-outcome analytics
    const baseMatch = { role: { $in: ["student", "alumni"] } };

    if (cohorts) {
      const cohortList = String(cohorts)
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cohortList.length > 0) baseMatch.graduationYear = { $in: cohortList };
    }

    if (gender && ["male", "female", "other"].includes(gender)) {
      baseMatch.gender = gender;
    }

    // ---------- Employment rate ----------
    // Only counts users who have actually declared an employment status —
    // unset employmentStatus is treated as "not yet reported", not unemployed.
    const employmentMatch = {
      ...baseMatch,
      employmentStatus: { $exists: true, $ne: null },
    };

    const totalReported = await User.countDocuments(employmentMatch);
    const employedCount = await User.countDocuments({
      ...employmentMatch,
      employmentStatus: { $in: ["employed", "self-employed", "freelance"] },
    });

    const employmentRate =
      totalReported > 0
        ? Number(((employedCount / totalReported) * 100).toFixed(1))
        : 0;

    // ---------- Gender distribution (with per-gender employment rate) ----------
    const genderAgg = await User.aggregate([
      { $match: { ...baseMatch, gender: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$gender",
          total: { $sum: 1 },
          reported: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$employmentStatus", null] },
                    { $ne: ["$employmentStatus", undefined] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          employed: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$employmentStatus",
                    ["employed", "self-employed", "freelance"],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const genderTotalAll = genderAgg.reduce((sum, g) => sum + g.total, 0);
    const genderDistribution = genderAgg.map((g) => ({
      label: g._id,
      value:
        genderTotalAll > 0
          ? Number(((g.total / genderTotalAll) * 100).toFixed(1))
          : 0,
      employmentRate:
        g.reported > 0
          ? Number(((g.employed / g.reported) * 100).toFixed(1))
          : 0,
    }));

    // ---------- Department / sector distribution ----------
    const deptAgg = await User.aggregate([
      { $match: { ...baseMatch, department: { $nin: [null, ""] } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const deptTotal = deptAgg.reduce((sum, d) => sum + d.count, 0);
    const departmentDistribution = deptAgg.map((d) => ({
      sector: d._id,
      value:
        deptTotal > 0 ? Number(((d.count / deptTotal) * 100).toFixed(1)) : 0,
    }));

    // ---------- Cohort trends (employment rate per graduation year) ----------
    const cohortAgg = await User.aggregate([
      {
        $match: {
          ...baseMatch,
          employmentStatus: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$graduationYear",
          reported: { $sum: 1 },
          employed: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$employmentStatus",
                    ["employed", "self-employed", "freelance"],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const cohortTrends = cohortAgg.map((c) => ({
      cohort: c._id,
      employment:
        c.reported > 0
          ? Number(((c.employed / c.reported) * 100).toFixed(1))
          : 0,
    }));

    res.json({
      success: true,
      analytics: {
        employmentRate,
        totalReported,
        genderDistribution,
        departmentDistribution,
        cohortTrends,
      },
    });
  } catch (error) {
    console.error("Get public analytics error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
