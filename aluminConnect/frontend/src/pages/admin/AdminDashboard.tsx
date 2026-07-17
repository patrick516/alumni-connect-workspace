import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import PageContainer from "../../components/layout/PageContainer";
import { getAllUsersApi } from "../../api/userApi";
import { getJobsApi } from "../../api/jobApi";
import { getEventsApi } from "../../api/eventApi";
import { getDepartmentStatsApi, type DepartmentStats } from "../../api/userApi";

const COLORS = [
  "#1e3a6e",
  "#d2621a",
  "#2e7d32",
  "#c2185b",
  "#7b1fa2",
  "#0288d1",
  "#fbc02d",
  "#8e24aa",
];

// Helper function to safely parse date
const safeParseDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    alumni: 0,
    pendingJobs: 0,
    events: 0,
    pendingAlumni: 0,
  });
  const [loading, setLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; students: number; alumni: number; total: number }[]
  >([]);
  const [showCharts, setShowCharts] = useState(false);

  // Fetch existing stats
  useEffect(() => {
    Promise.all([
      getAllUsersApi(),
      getJobsApi(),
      getEventsApi(),
      getDepartmentStatsApi(),
    ])
      .then(([rawUsers, jobs, events, deptStats]) => {
        const users = Array.isArray(rawUsers) ? rawUsers : [];
        setStats({
          students: users.filter((u) => u.role === "student").length,
          alumni: users.filter((u) => u.role === "alumni").length,
          pendingJobs: jobs.filter((j) => j.status === "pending").length,
          events: events.length,
          pendingAlumni: users.filter(
            (u) => u.role === "alumni" && !u.isApproved,
          ).length,
        });

        setDepartmentStats(deptStats);

        // Generate monthly registration data from users
        const monthlyRegistrations: {
          [key: string]: { students: number; alumni: number };
        } = {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthlyRegistrations[monthKey] = { students: 0, alumni: 0 };
        }

        // Count registrations by month - with safe date parsing
        users.forEach((user) => {
          const createdAt = safeParseDate(user.createdAt);
          if (createdAt) {
            const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
            if (monthlyRegistrations[monthKey]) {
              if (user.role === "student") {
                monthlyRegistrations[monthKey].students++;
              } else if (user.role === "alumni") {
                monthlyRegistrations[monthKey].alumni++;
              }
            }
          }
        });

        const monthlyArray = Object.entries(monthlyRegistrations)
          .map(([month, data]) => ({
            month,
            students: data.students,
            alumni: data.alumni,
            total: data.students + data.alumni,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setMonthlyData(monthlyArray);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Total Students",
      value: stats.students,
      color: "bg-[#1e3a6e]",
      path: "/admin/users",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Total Alumni",
      value: stats.alumni,
      color: "bg-[#d2621a]",
      path: "/admin/users",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Pending Jobs",
      value: stats.pendingJobs,
      color: "bg-amber-600",
      path: "/admin/jobs",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      ),
    },
    {
      label: "Total Events",
      value: stats.events,
      color: "bg-emerald-600",
      path: "/admin/events",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  // Prepare department chart data with safe values
  const departmentChartData = departmentStats
    .filter((dept) => dept.department !== "Not Specified") // Filter out unspecified
    .map((dept) => ({
      name: dept.department,
      students: dept.students || 0,
      alumni: dept.alumni || 0,
      total: dept.total || 0,
    }))
    .slice(0, 8); // Show top 8 departments

  return (
    <PageContainer title="Admin Dashboard">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1e3a6e] to-[#27155f] rounded-xl p-6 mb-6">
        <h2 className="text-white text-xl font-bold mb-1">
          Admin Control Panel
        </h2>
        <p className="text-blue-200 text-sm">
          Manage users, approve content, and monitor platform activity.
        </p>
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="mt-3 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
        >
          {showCharts ? "Hide Analytics" : "Show Analytics"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${card.color}`}
            >
              {card.icon}
            </div>
            <div>
              {loading ? (
                <div className="h-7 w-10 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              )}
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending alerts */}
      {!loading && (stats.pendingJobs > 0 || stats.pendingAlumni > 0) && (
        <div className="space-y-3">
          {stats.pendingAlumni > 0 && (
            <Link
              to="/admin/users"
              className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#d2621a] flex items-center justify-center text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-orange-800 text-sm">
                    {stats.pendingAlumni} Alumni Pending Approval
                  </p>
                  <p className="text-xs text-orange-600">
                    Review and approve alumni accounts
                  </p>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-orange-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
          {stats.pendingJobs > 0 && (
            <Link
              to="/admin/jobs"
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">
                    {stats.pendingJobs} Jobs Awaiting Approval
                  </p>
                  <p className="text-xs text-amber-600">
                    Review and approve job postings
                  </p>
                </div>
              </div>
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* NEW: Analytics Charts Section with Recharts */}
      {showCharts && !loading && (
        <div className="mt-6 space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#1e3a6e]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 16v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2M7 10l5-5 5 5M12 5v12" />
              </svg>
              Analytics Dashboard
            </h3>

            {/* Department Distribution - Pie Chart */}
            {departmentChartData.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  User Distribution by Department
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentChartData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => {
                        // Safe check for percent
                        const percentage =
                          percent !== undefined ? percent * 100 : 0;
                        return `${name}: ${percentage.toFixed(0)}%`;
                      }}
                    >
                      {departmentChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Department Bar Chart - Students vs Alumni */}
            {departmentChartData.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Students vs Alumni by Department
                </h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={departmentChartData} margin={{ bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#1e3a6e" name="Students" />
                    <Bar dataKey="alumni" fill="#d2621a" name="Alumni" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Monthly Registration Trend - Line Chart */}
            {monthlyData.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Registration Trend (Last 6 Months)
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="#1e3a6e"
                      name="Students"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="alumni"
                      stroke="#d2621a"
                      name="Alumni"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#2e7d32"
                      name="Total"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Show message if no chart data */}
            {departmentChartData.length === 0 && monthlyData.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No data available for charts yet.</p>
                <p className="text-sm mt-2">
                  As users register and interact, analytics will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Manage Users",
            desc: "View, approve, or remove users",
            path: "/admin/users",
          },
          {
            label: "Manage Departments",
            desc: "Add, edit, or remove departments",
            path: "/admin/departments",
          },
          {
            label: "Moderate Jobs",
            desc: "Approve or reject job postings",
            path: "/admin/jobs",
          },
          {
            label: "Manage Events",
            desc: "Create and delete events",
            path: "/admin/events",
          },
        ].map((q) => (
          <Link
            key={q.path}
            to={q.path}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:border-[#1e3a6e]/30 hover:shadow-md transition-all block"
          >
            <p className="font-semibold text-gray-900 text-sm mb-1">
              {q.label}
            </p>
            <p className="text-xs text-gray-500">{q.desc}</p>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;
