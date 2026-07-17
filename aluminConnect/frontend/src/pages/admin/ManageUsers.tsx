import { useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import {
  getAllUsersApi,
  deleteUserApi,
  approveAlumniApi,
  inviteAdminApi,
  getDepartmentsApi,
  type Department,
} from "../../api/userApi";
import type { User } from "../../types";
import {
  X,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Building2,
  FileDown,
  Users,
  BookOpen,
} from "lucide-react";

// ── User detail drawer ───────────────────────────────────────────────────────
const UserDrawer = ({ user, onClose }: { user: User; onClose: () => void }) => {
  const initials = user.name.charAt(0).toUpperCase();
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1e3a6e] flex items-center justify-center border-2 border-gray-200 shrink-0">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user.name}</p>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : user.role === "alumni"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-[#1e3a6e]"
                }`}
              >
                {user.role}
              </span>
              {user.role === "alumni" && (
                <span
                  className={`ml-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${user.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {user.isApproved ? "Approved" : "Pending"}
                </span>
              )}
            </div>
          </div>

          {/* NEW: Department and Registration Number */}
          {(user.department || user.registrationNumber) && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Academic Info
              </h4>
              {user.department && (
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <BookOpen size={14} className="text-gray-400 shrink-0" />
                  {user.department}
                </div>
              )}
              {user.registrationNumber && (
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Users size={14} className="text-gray-400 shrink-0" />
                  Reg No: {user.registrationNumber}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Contact
            </h4>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Mail size={14} className="text-gray-400 shrink-0" />
              {user.email}
            </div>
            {user.phone ? (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Phone size={14} className="text-gray-400 shrink-0" />
                {user.phone}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-sm text-gray-400 italic">
                <Phone size={14} className="shrink-0" />
                No phone added
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Academic / Professional
            </h4>
            {user.graduationYear && (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <GraduationCap size={14} className="text-gray-400 shrink-0" />
                Class of {user.graduationYear}
              </div>
            )}
            {user.university && (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Building2 size={14} className="text-gray-400 shrink-0" />
                {user.university}
              </div>
            )}
            {(user.position || user.company) && (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Briefcase size={14} className="text-gray-400 shrink-0" />
                {[user.position, user.company].filter(Boolean).join(" at ")}
              </div>
            )}
            {!user.graduationYear &&
              !user.university &&
              !user.position &&
              !user.company && (
                <p className="text-sm text-gray-400 italic">
                  No details added yet.
                </p>
              )}
          </div>

          {/* NEW: Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.bio && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Bio
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.cvUrl && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                CV / Resume
              </h4>
              <a
                href={user.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#1e3a6e] hover:underline"
              >
                <FileDown size={14} /> View CV
              </a>
            </div>
          )}

          {user.createdAt && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Mobile user card ──────────────────────────────────────────────────────────
const UserCard = ({
  u,
  roleBadge,
  onView,
  onApprove,
  onDelete,
}: {
  u: User;
  roleBadge: (role: string) => string;
  onView: () => void;
  onApprove: () => void;
  onDelete: () => void;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1e3a6e] flex items-center justify-center text-white font-bold text-sm shrink-0">
        {u.profilePhoto ? (
          <img
            src={u.profilePhoto}
            alt={u.name}
            className="w-full h-full object-cover"
          />
        ) : (
          u.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
        <p className="text-xs text-gray-400 truncate">{u.email}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadge(u.role)}`}
          >
            {u.role}
          </span>
          {u.department && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {u.department}
            </span>
          )}
          {u.role === "alumni" && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {u.isApproved ? "Approved" : "Pending"}
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
      <button
        onClick={onView}
        className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-1.5 rounded-lg transition-colors"
      >
        View
      </button>
      {u.role === "alumni" && !u.isApproved && (
        <button
          onClick={onApprove}
          className="flex-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium py-1.5 rounded-lg transition-colors"
        >
          Approve
        </button>
      )}
      <button
        onClick={onDelete}
        className="flex-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 font-medium py-1.5 rounded-lg transition-colors"
      >
        Delete
      </button>
    </div>
  </div>
);

// ── Main page ────────────────────────────────────────────────────────────────
const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [invite, setInvite] = useState({
    name: "",
    email: "",
    tempPassword: "",
  });
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsersApi()
      .then((result) => setUsers(Array.isArray(result) ? result : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchDepartments = () => {
    getDepartmentsApi().then(setDepartments).catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUserApi(id);
      setSuccess("User deleted.");
      if (selectedUser?._id === id) setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviteLoading(true);
    try {
      await inviteAdminApi({
        name: invite.name.trim(),
        email: invite.email.trim(),
        tempPassword: invite.tempPassword,
      });
      setSuccess(
        "Invitation sent. The new admin will receive email with a temporary password and a link to set their own password.",
      );
      setInvite({ name: "", email: "", tempPassword: "" });
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAlumniApi(id);
      setSuccess("Alumni approved.");
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.registrationNumber &&
        u.registrationNumber.toLowerCase().includes(search.toLowerCase()));
    const matchRole = filterRole ? u.role === filterRole : true;
    const matchDepartment = filterDepartment
      ? u.department === filterDepartment
      : true;
    return matchSearch && matchRole && matchDepartment;
  });

  const roleBadge = (role: string) => {
    if (role === "admin") return "bg-purple-100 text-purple-700";
    if (role === "alumni") return "bg-orange-100 text-orange-700";
    return "bg-blue-100 text-[#1e3a6e]";
  };

  return (
    <PageContainer title="Manage Users">
      {selectedUser && (
        <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} users found
          </p>
        </div>
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

      {/* Invite admin */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">
          Invite administrator
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Creates an admin account and emails them a temporary password plus a
          secure link to choose a new password (Brevo must be configured in
          server .env).
        </p>
        <form
          onSubmit={handleInviteAdmin}
          className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              value={invite.name}
              onChange={(e) =>
                setInvite((s) => ({ ...s, name: e.target.value }))
              }
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={invite.email}
              onChange={(e) =>
                setInvite((s) => ({ ...s, email: e.target.value }))
              }
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Temporary password (8+ chars)
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={invite.tempPassword}
              onChange={(e) =>
                setInvite((s) => ({ ...s, tempPassword: e.target.value }))
              }
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={inviteLoading}
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-60 h-[38px]"
          >
            {inviteLoading ? "Sending…" : "Send invite"}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search name, email, or registration number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] bg-white"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="alumni">Alumni</option>
          <option value="admin">Admins</option>
        </select>
        {/* NEW: Department filter */}
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] bg-white"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile: cards — hidden on md+ */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 rounded-xl animate-pulse"
            />
          ))
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            No users found.
          </p>
        ) : (
          filtered.map((u) => (
            <UserCard
              key={u._id}
              u={u}
              roleBadge={roleBadge}
              onView={() => setSelectedUser(u)}
              onApprove={() => handleApprove(u._id)}
              onDelete={() => handleDelete(u._id)}
            />
          ))
        )}
      </div>

      {/* Desktop: table — hidden on mobile */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "User",
                  "Role",
                  "Department",
                  "Phone",
                  "Grad Year",
                  "Status",
                  "Actions",
                ].map((h) => (
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
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-gray-400 text-sm py-10"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="flex items-center gap-3 text-left group"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1e3a6e] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {u.profilePhoto ? (
                            <img
                              src={u.profilePhoto}
                              alt={u.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm group-hover:text-[#1e3a6e] transition-colors">
                            {u.name}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                          {u.registrationNumber && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Reg: {u.registrationNumber}
                            </p>
                          )}
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleBadge(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {u.department || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {u.phone || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {u.graduationYear || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {u.role === "alumni" ? (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {u.isApproved ? "Approved" : "Pending"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        {u.role === "alumni" && !u.isApproved && (
                          <button
                            onClick={() => handleApprove(u._id)}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(u._id)}
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

export default ManageUsers;
