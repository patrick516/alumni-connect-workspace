import { useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import { getJobsApi, approveJobApi, deleteJobApi } from "../../api/jobApi";
import type { Job } from "../../types";
import { Briefcase, MapPin, User, CheckCircle, Trash2 } from "lucide-react";

const ManageJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchJobs = () => {
    setLoading(true);
    getJobsApi()
      .then((result) => setJobs(Array.isArray(result) ? result : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveJobApi(id);
      setSuccess("Job approved and published.");
      fetchJobs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting?")) return;
    try {
      await deleteJobApi(id);
      setSuccess("Job deleted.");
      fetchJobs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const filtered = filterStatus
    ? jobs.filter((j) => j.status === filterStatus)
    : jobs;

  const statusBadge = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const typeBadge = (type?: string) => {
    if (!type) return "bg-gray-100 text-gray-500";
    if (type === "full-time") return "bg-blue-50 text-blue-700";
    if (type === "part-time") return "bg-purple-50 text-purple-700";
    if (type === "internship") return "bg-orange-50 text-orange-700";
    if (type === "remote") return "bg-teal-50 text-teal-700";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <PageContainer title="Manage Jobs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Job Moderation</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {jobs.filter((j) => j.status === "pending").length} pending approval
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] bg-white w-full sm:w-auto"
        >
          <option value="">All Jobs</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess("")}>✕</button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {/* ── Mobile: cards (< md) ────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-gray-100 rounded-xl animate-pulse"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No jobs found.
          </div>
        ) : (
          filtered.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              {/* Title + status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-snug truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {job.company}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize shrink-0 ${statusBadge(job.status)}`}
                >
                  {job.status}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} />
                    {job.location}
                  </span>
                )}
                {job.type && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${typeBadge(job.type)}`}
                  >
                    {job.type}
                  </span>
                )}
                {job.postedBy?.name && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <User size={11} />
                    {job.postedBy.name}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                {job.status === "pending" && (
                  <button
                    onClick={() => handleApprove(job._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(job._id)}
                  className={`flex items-center justify-center gap-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 rounded-lg transition-colors ${job.status === "pending" ? "px-4" : "flex-1"}`}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop: table (md+) ─────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Job", "Type", "Posted By", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-400 text-sm py-10"
                  >
                    No jobs found.
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#1e3a6e]/8 flex items-center justify-center shrink-0 mt-0.5">
                          <Briefcase size={14} className="text-[#1e3a6e]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            {job.company}
                            {job.location && (
                              <>
                                <span>·</span>
                                <MapPin size={10} />
                                {job.location}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${typeBadge(job.type)}`}
                      >
                        {job.type || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                          {job.postedBy?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-sm text-gray-600">
                          {job.postedBy?.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {job.status === "pending" && (
                          <button
                            onClick={() => handleApprove(job._id)}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};

export default ManageJobs;
