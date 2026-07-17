import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import { useAuth } from "../../context/AuthContext";
import { getJobsApi } from "../../api/jobApi";
import { getEventsApi } from "../../api/eventApi";
import type { Job, Event } from "../../types";

const StatCard = ({
  label,
  value,
  color,
  icon,
  linkTo,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
  linkTo?: string;
}) => {
  const CardContent = (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
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

  return linkTo ? <Link to={linkTo}>{CardContent}</Link> : CardContent;
};

const AlumniDashboardPage = () => {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJobsApi(), getEventsApi()])
      .then(([j, e]) => {
        setMyJobs(
          j.filter((job) => job.postedBy?._id === user?._id).slice(0, 4),
        );
        setEvents(e.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <PageContainer title="Alumni Dashboard">
      {/* Welcome banner */}
      <div className="bg-[#1e3a6e] rounded-xl p-6 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold mb-1">
            Welcome, {user?.name?.split(" ")[0]}! 🎓
          </h2>
          <p className="text-blue-200 text-sm">
            {user?.position && user?.company
              ? `${user.position} at ${user.company}`
              : "Complete your profile to help students find you."}{" "}
            &nbsp;·&nbsp; Class of {user?.graduationYear || "—"}
          </p>
        </div>
        <Link
          to="/profile"
          className="hidden md:flex w-14 h-14 rounded-full bg-[#d2621a] items-center justify-center text-white font-bold text-2xl hover:bg-[#b55112] transition-colors cursor-pointer"
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Jobs Posted"
          value={myJobs.length}
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
          linkTo="/jobs"
        />
        <StatCard
          label="Events"
          value={events.length}
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
          linkTo="/events"
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
          linkTo="/messages"
        />
        <StatCard
          label="Profile Views"
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
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
          linkTo="/analytics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Jobs */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">My Job Postings</h3>
            <Link
              to="/jobs/new"
              className="text-[#1e3a6e] text-sm font-medium hover:underline"
            >
              Post new job
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : myJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">
                You haven't posted any jobs yet.
              </p>
              <Link
                to="/jobs/new"
                className="inline-block bg-[#1e3a6e] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#162d57] transition-colors"
              >
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myJobs.map((job) => (
                <Link key={job._id} to={`/jobs/${job._id}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#1e3a6e]/30 hover:bg-blue-50/30 transition-all">
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
                        job.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : job.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Events</h3>
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
          ) : events.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No events yet.
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="block"
                >
                  <div className="p-3 rounded-lg border border-gray-100 hover:border-[#d2621a]/30 hover:bg-orange-50/20 transition-all">
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AlumniDashboardPage;
