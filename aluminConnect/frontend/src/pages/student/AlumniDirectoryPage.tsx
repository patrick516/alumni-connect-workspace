import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import { useAuth } from "../../context/AuthContext";
import { AC_SOCKET_EVENT } from "../../context/SocketContext";
import {
  getAlumniDirectoryApi,
  getDirectoryFilterOptionsApi,
} from "../../api/directoryApi";
import {
  getStudentConnectionsApi,
  requestConnectionApi,
} from "../../api/connectionApi";
import type {
  ConnectionStatus,
  DirectoryUser,
  StudentConnectionRow,
  DirectoryFilters,
  FilterOptions,
} from "../../types";

const AlumniDirectoryPage = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<DirectoryUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [connections, setConnections] = useState<StudentConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState<DirectoryFilters>({
    department: "all",
    skills: "all",
    location: "all",
    search: "",
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    departments: [],
    skills: [],
    locations: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [applyingFilters, setApplyingFilters] = useState(false);

  const loadFilterOptions = useCallback(async () => {
    try {
      const options = await getDirectoryFilterOptionsApi();
      setFilterOptions(options);
    } catch (e) {
      console.error("Failed to load filter options:", e);
    }
  }, []);

  const load = useCallback(async () => {
    setError("");
    setApplyingFilters(true);
    try {
      const result = await getAlumniDirectoryApi(filters);
      setAlumni(result.alumni);
      setTotalCount(result.count);

      if (user?.role === "student") {
        const c = await getStudentConnectionsApi();
        setConnections(c);
      } else {
        setConnections([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setApplyingFilters(false);
    }
  }, [user?.role, filters]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const h = () => load();
    window.addEventListener(AC_SOCKET_EVENT, h);
    return () => window.removeEventListener(AC_SOCKET_EVENT, h);
  }, [load]);

  const statusByAlumniId = useMemo(() => {
    const m = new Map<string, ConnectionStatus>();
    connections.forEach((row) => m.set(row.alumni._id, row.status));
    return m;
  }, [connections]);

  const handleFilterChange = (key: keyof DirectoryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const handleResetFilters = () => {
    setFilters({
      department: "all",
      skills: "all",
      location: "all",
      search: "",
    });
  };

  const handleConnect = async (alumniId: string) => {
    setBusyId(alumniId);
    setError("");
    try {
      await requestConnectionApi(alumniId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusyId(null);
    }
  };

  if (user?.role !== "student" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Skill badges display
  const SkillBadges = ({ skills }: { skills?: string[] }) => {
    if (!skills || skills.length === 0) return null;
    const displaySkills = skills.slice(0, 3);
    const remaining = skills.length - 3;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {displaySkills.map((skill, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
        {remaining > 0 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
            +{remaining}
          </span>
        )}
      </div>
    );
  };

  return (
    <PageContainer title="Alumni directory">
      <p className="text-sm text-gray-500 mb-4 max-w-2xl">
        Browse approved alumni and send a connection request. Once they accept,
        you can open Messages and chat in real time when you are both online.
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, skills, or company..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1e3a6e] text-white rounded-lg text-sm font-medium hover:bg-[#153055] transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
            </svg>
            Filters
          </button>
        </div>
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] bg-white"
              >
                <option value="all">All Departments</option>
                {filterOptions.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <select
                value={filters.skills}
                onChange={(e) => handleFilterChange("skills", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] bg-white"
              >
                <option value="all">All Skills</option>
                {filterOptions.skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] bg-white"
              >
                <option value="all">All Locations</option>
                {filterOptions.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => {
                load();
                setShowFilters(false);
              }}
              className="px-4 py-1.5 bg-[#1e3a6e] text-white rounded-lg text-sm font-medium hover:bg-[#153055] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && !applyingFilters && (
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Found{" "}
            <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
            alumni
          </p>
          {Object.values(filters).some((v) => v !== "all" && v !== "") && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-[#1e3a6e] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || applyingFilters ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : alumni.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-gray-500 text-sm">
            No alumni found matching your criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-3 text-sm text-[#1e3a6e] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alumni.map((a) => {
            const st = statusByAlumniId.get(a._id);
            return (
              <div
                key={a._id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1e3a6e] text-lg font-bold text-white">
                    {a.profilePhoto ? (
                      <img
                        src={a.profilePhoto}
                        alt={a.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      a.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">{a.name}</h3>
                    {a.position && (
                      <p className="text-sm text-gray-600">
                        {a.position}
                        {a.company ? ` · ${a.company}` : ""}
                      </p>
                    )}
                    {a.department && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Department: {a.department}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Class of {a.graduationYear || "—"}
                    </p>
                  </div>
                </div>

                {a.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {a.bio}
                  </p>
                )}

                <SkillBadges skills={a.skills} />

                <div className="mt-4 flex flex-wrap gap-2">
                  {user?.role === "student" && (
                    <>
                      {st === "accepted" && (
                        <Link
                          to={`/messages?with=${a._id}`}
                          className="rounded-lg bg-[#1e3a6e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#162d57] transition-colors"
                        >
                          Message
                        </Link>
                      )}
                      {st === "pending" && (
                        <span className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
                          Request pending
                        </span>
                      )}
                      {st === "rejected" && (
                        <button
                          type="button"
                          disabled={busyId === a._id}
                          onClick={() => handleConnect(a._id)}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          {busyId === a._id ? "Sending…" : "Request again"}
                        </button>
                      )}
                      {!st && (
                        <button
                          type="button"
                          disabled={busyId === a._id}
                          onClick={() => handleConnect(a._id)}
                          className="rounded-lg bg-[#d2621a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b85516] disabled:opacity-50 transition-colors"
                        >
                          {busyId === a._id ? "Sending…" : "Connect"}
                        </button>
                      )}
                    </>
                  )}
                  {user?.role === "admin" && (
                    <span className="text-xs text-gray-400">View only</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default AlumniDirectoryPage;
