import { useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import { useAuth } from "../../context/AuthContext";
import { getJobsApi, getJobStatsApi, type JobStats } from "../../api/jobApi";
import { getEventsApi } from "../../api/eventApi";
import type { Job, Event } from "../../types";
import { Link } from "react-router-dom";

const StatCard = ({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJobsApi(), getEventsApi(), getJobStatsApi()])
      .then(([j, e, stats]) => {
        setJobs(j.filter((job) => job.status === "approved").slice(0, 4));
        setEvents(e.slice(0, 3));
        setJobStats(stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcomingEvents = events.filter(
    (e) => new Date(e.eventDate) >= new Date(),
  );

  return (
    <PageContainer title="Student Dashboard">
      {/* Welcome banner */}
      <div className="bg-[#1e3a6e] rounded-xl p-6 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold mb-1">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-blue-200 text-sm">
            Graduation Year: {user?.graduationYear || "Not set"} &nbsp;·&nbsp;
            Start exploring opportunities below.
          </p>
        </div>
        <div className="hidden md:flex w-14 h-14 rounded-full bg-[#d2621a] items-center justify-center text-white font-bold text-2xl">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Jobs Available"
          value={jobStats?.totalAvailable ?? jobs.length}
          color="bg-[#1e3a6e]"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          }
        />
        <StatCard
          label="Upcoming Events"
          value={upcomingEvents.length}
          color="bg-[#d2621a]"
          icon={
            <svg
              className="w-5 h-5"
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
          }
        />

        <StatCard
          label="Jobs Applied"
          value={jobStats?.applied ?? 0}
          color="bg-emerald-600"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          }
        />
        <StatCard
          label="Jobs Remaining"
          value={jobStats?.remaining ?? 0}
          color="bg-violet-600"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
        />
        <StatCard
          label="Messages"
          value={0}
          color="bg-emerald-600"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Saved Jobs"
          value={0}
          color="bg-violet-600"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Recent Job Opportunities
            </h3>
            <Link
              to="/jobs"
              className="text-[#1e3a6e] text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No jobs available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link
                  key={job._id}
                  to="/jobs"
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#1e3a6e]/30 hover:bg-blue-50/30 transition-all"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {job.company} &nbsp;·&nbsp; {job.location}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      job.type === "internship"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-[#1e3a6e]"
                    }`}
                  >
                    {job.type || "Full-time"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
            <Link
              to="/events"
              className="text-[#1e3a6e] text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No upcoming events.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event._id}
                  to="/events"
                  className="p-3 rounded-lg border border-gray-100 hover:border-[#d2621a]/30 hover:bg-orange-50/20 transition-all block"
                >
                  <p className="font-medium text-gray-900 text-sm mb-1">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {event.location && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {event.location}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentDashboard;
