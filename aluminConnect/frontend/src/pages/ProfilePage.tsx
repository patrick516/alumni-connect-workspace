import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/layout/PageContainer";
import {
  uploadCvApi,
  uploadPhotoApi,
  openCvInNewTab,
  updateProfileApi,
  getProfileStatsApi,
  type ProfileStats,
} from "../api/userApi";
import {
  Pencil,
  FileDown,
  X,
  ShieldCheck,
  Mail,
  User,
  FileUp,
  Loader2,
  Camera,
  Briefcase,
  GraduationCap,
  Building2,
  Phone,
  ChevronRight,
} from "lucide-react";

const GRAD_YEARS = Array.from({ length: 26 }, (_, i) => String(2000 + i));

// ── Simple modal wrapper ──────────────────────────────────────────────────────
const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-500"
        >
          <X size={18} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-5">{children}</div>
    </div>
  </div>
);

// ── Admin profile ────────────────────────────────────────────────────────────
const AdminProfile = () => {
  const { user } = useAuth();
  const initials = (user?.name ?? "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-full bg-[#1e3a6e] flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{initials}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
          <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 bg-[#1e3a6e]/10 text-[#1e3a6e] text-xs font-semibold rounded-full">
            <ShieldCheck size={12} /> Administrator
          </span>
        </div>
        <div className="w-full border-t border-gray-100 pt-4 space-y-3 text-left">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={15} className="text-gray-400 shrink-0" />
            {user?.email}
          </div>
          {user?.phone && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone size={15} className="text-gray-400 shrink-0" />
              {user.phone}
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <User size={15} className="text-gray-400 shrink-0" />
            Role:{" "}
            <span className="capitalize font-medium text-gray-800">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400">
        Admin accounts are managed by the system. Contact support to update your
        details.
      </p>
    </div>
  );
};

// ── Student / Alumni profile ─────────────────────────────────────────────────
const UserProfile = () => {
  const { user, updateStoredUser } = useAuth();
  const isAlumni = user?.role === "alumni";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);

  // Upload states
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvOpening, setCvOpening] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [hasCv, setHasCv] = useState(Boolean(user?.cvUrl));
  const [cvFileName, setCvFileName] = useState(
    user?.cvUrl ? "CV uploaded" : "",
  );

  // Save states
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Modals
  const [modal, setModal] = useState<"jobs" | "connections" | "events" | null>(
    null,
  );

  useEffect(() => {
    getProfileStatsApi()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    graduationYear: user?.graduationYear ?? "",
    company: user?.company ?? "",
    position: user?.position ?? "",
    university: user?.university ?? "",
    employmentStatus: user?.employmentStatus ?? "",
    skills: user?.skills ?? ([] as string[]),
    bio: user?.bio ?? "",
    profilePhoto: user?.profilePhoto ?? "",
    skillInput: "",
  });
  const [saved, setSaved] = useState({ ...form });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const removeSkill = (skill: string) =>
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && form.skillInput.trim()) {
      e.preventDefault();
      const trimmed = form.skillInput.trim();
      if (!form.skills.includes(trimmed)) {
        setForm((f) => ({
          ...f,
          skills: [...f.skills, trimmed],
          skillInput: "",
        }));
      } else {
        setForm((f) => ({ ...f, skillInput: "" }));
      }
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Only image files are allowed.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError("Image must be under 3 MB.");
      return;
    }
    setPhotoError(null);
    setPhotoUploading(true);
    try {
      const result = await uploadPhotoApi(file);
      setForm((f) => ({ ...f, profilePhoto: result.profilePhoto }));
      setSaved((s) => ({ ...s, profilePhoto: result.profilePhoto }));
      updateStoredUser(result.user);
    } catch (err: unknown) {
      setPhotoError(
        err instanceof Error ? err.message : "Failed to upload photo.",
      );
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setCvError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError("File must be under 5 MB.");
      return;
    }
    setCvError(null);
    setCvUploading(true);
    try {
      const result = await uploadCvApi(file);
      setHasCv(true);
      setCvFileName(file.name);
      updateStoredUser(result.user);
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : "Failed to upload CV.");
    } finally {
      setCvUploading(false);
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  };

  const handleOpenCv = async () => {
    setCvOpening(true);
    setCvError(null);
    try {
      await openCvInNewTab();
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : "Could not open CV.");
    } finally {
      setCvOpening(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateProfileApi({
        name: form.name,
        phone: form.phone,
        graduationYear: form.graduationYear,
        university: form.university,
        company: form.company,
        position: form.position,
        employmentStatus: form.employmentStatus,
        skills: form.skills,
        bio: form.bio,
      });
      // Preserve token — updateProfile response has no token
      updateStoredUser({ ...updated, token: user?.token });
      const next = {
        name: updated.name ?? form.name,
        email: updated.email ?? form.email,
        phone: updated.phone ?? form.phone,
        graduationYear: updated.graduationYear ?? form.graduationYear,
        university: updated.university ?? form.university,
        company: updated.company ?? form.company,
        position: updated.position ?? form.position,
        employmentStatus: updated.employmentStatus ?? form.employmentStatus,
        skills: updated.skills ?? form.skills,
        bio: updated.bio ?? form.bio,
        profilePhoto: updated.profilePhoto ?? form.profilePhoto,
        skillInput: "",
      };
      setForm(next);
      setSaved(next);
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ ...saved });
    setCvError(null);
    setPhotoError(null);
    setSaveError(null);
    setEditing(false);
  };

  const initials = (saved.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const subtitleParts: string[] = [];
  if (isAlumni) {
    if (saved.position) subtitleParts.push(saved.position);
    if (saved.company) subtitleParts.push(saved.company);
  }
  if (saved.graduationYear)
    subtitleParts.push(`Class of ${saved.graduationYear}`);
  const subtitle = subtitleParts.join("  ·  ");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Modals */}
      {modal === "jobs" && stats && (
        <Modal
          title={`Jobs Applied (${stats.jobsApplied})`}
          onClose={() => setModal(null)}
        >
          {stats.appliedJobs.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No jobs applied yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.appliedJobs.map((j) => (
                <div
                  key={j._id}
                  className="border border-gray-100 rounded-lg p-3"
                >
                  <p className="font-semibold text-gray-900 text-sm">
                    {j.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {j.company}
                    {j.location ? ` · ${j.location}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        j.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : j.status === "rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {j.status}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {j.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {modal === "connections" && stats && (
        <Modal
          title={`Connections (${stats.connectionsCount})`}
          onClose={() => setModal(null)}
        >
          {stats.connectionsList.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No connections yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.connectionsList.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center gap-3 border border-gray-100 rounded-lg p-3"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1e3a6e] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                    {c.photo ? (
                      <img
                        src={c.photo}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      c.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {isAlumni
                        ? [
                            c.graduationYear
                              ? `Class of ${c.graduationYear}`
                              : "",
                            c.university,
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : [c.position, c.company]
                            .filter(Boolean)
                            .join(" at ") || c.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {modal === "events" && stats && (
        <Modal
          title={`Events Joined (${stats.eventsJoined})`}
          onClose={() => setModal(null)}
        >
          {stats.eventsList.length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No events joined yet.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.eventsList.map((e) => (
                <div
                  key={e._id}
                  className="border border-gray-100 rounded-lg p-3"
                >
                  <p className="font-semibold text-gray-900 text-sm">
                    {e.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(e.eventDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                  {e.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {e.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Organized by {e.organizer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#d2621a] flex items-center justify-center border-2 border-gray-200">
              {saved.profilePhoto ? (
                <img
                  src={saved.profilePhoto}
                  alt={saved.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            <p className="text-center text-xs text-green-600 font-medium mt-1">
              Online
            </p>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{saved.name}</h1>
            {subtitle ? (
              <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
            ) : (
              <p className="text-gray-400 text-sm mt-0.5 italic">
                {isAlumni
                  ? "Add your position, company & graduation year"
                  : "Add your graduation year"}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-[#1e3a6e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#162d55] transition"
              >
                <Pencil size={14} /> Edit Profile
              </button>
              {hasCv ? (
                <button
                  type="button"
                  onClick={handleOpenCv}
                  disabled={cvOpening}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
                >
                  {cvOpening ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Opening…
                    </>
                  ) : (
                    <>
                      <FileDown size={14} /> View CV
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  title="Upload a CV first"
                  className="flex items-center gap-2 border border-gray-300 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  <FileDown size={14} /> View CV
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Your Profile</h2>
          <p className="text-gray-500 text-sm mb-6">
            Update your information and skills.
          </p>
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+265 999 000 000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Graduation Year
                  </label>
                  <select
                    name="graduationYear"
                    value={form.graduationYear}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                  >
                    <option value="">— select —</option>
                    {GRAD_YEARS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  University
                </label>
                <input
                  name="university"
                  value={form.university}
                  onChange={handleChange}
                  placeholder="e.g. University of Malawi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Employment Status{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <select
                  name="employmentStatus"
                  value={form.employmentStatus}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                >
                  <option value="">— not specified —</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="freelance">Freelance</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>

              {isAlumni && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Position
                    </label>
                    <input
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Company
                    </label>
                    <input
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="e.g. Accenture"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Skills
                </label>
                <div className="border border-gray-300 rounded-lg px-3 py-2 min-h-[48px] flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <X
                          size={12}
                          className="text-gray-400 hover:text-red-500"
                        />
                      </button>
                    </span>
                  ))}
                  <input
                    name="skillInput"
                    value={form.skillInput}
                    onChange={handleChange}
                    onKeyDown={addSkill}
                    placeholder="Type skill + Enter"
                    className="flex-1 min-w-[80px] text-sm outline-none bg-transparent text-gray-600 placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Press Enter to add each skill
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell others about yourself…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                />
              </div>

              {/* CV */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  CV / Resume{" "}
                  <span className="font-normal text-gray-400">
                    (PDF, max 5 MB)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleCvChange}
                  />
                  <button
                    type="button"
                    onClick={() => cvInputRef.current?.click()}
                    disabled={cvUploading}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
                  >
                    {cvUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />{" "}
                        Uploading…
                      </>
                    ) : (
                      <>
                        <FileUp size={14} />
                        {hasCv ? "Replace CV" : "Upload CV"}
                      </>
                    )}
                  </button>
                  {hasCv && !cvUploading && (
                    <button
                      type="button"
                      onClick={handleOpenCv}
                      disabled={cvOpening}
                      className="flex items-center gap-1.5 text-sm text-[#1e3a6e] hover:underline disabled:opacity-60"
                      title={cvFileName}
                    >
                      {cvOpening ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />{" "}
                          Opening…
                        </>
                      ) : (
                        <>
                          <FileDown size={13} />
                          {cvFileName || "View current CV"}
                        </>
                      )}
                    </button>
                  )}
                </div>
                {cvError && (
                  <p className="text-xs text-red-500 mt-1.5">{cvError}</p>
                )}
                {hasCv && !cvUploading && !cvError && cvFileName && (
                  <p className="text-xs text-green-600 mt-1.5">
                    ✓ CV uploaded successfully
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {saveError && (
                  <p className="text-xs text-red-500 text-center">
                    {saveError}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-[#1e3a6e] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#162d55] transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving…
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Photo */}
            <div className="w-44 shrink-0 flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-gray-800">
                Profile Photo
              </p>
              <div className="relative w-28 h-28">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-[#d2621a] flex items-center justify-center border-2 border-gray-300">
                  {form.profilePhoto ? (
                    <img
                      src={form.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {initials}
                    </span>
                  )}
                </div>
                {photoUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 size={22} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="w-full flex items-center justify-center gap-2 bg-[#1e3a6e] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#162d55] transition disabled:opacity-60"
              >
                {photoUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Camera size={14} /> Upload Photo
                  </>
                )}
              </button>
              {photoError && (
                <p className="text-xs text-red-500 text-center">{photoError}</p>
              )}
              {form.profilePhoto && !photoUploading && !photoError && (
                <p className="text-xs text-green-600 text-center">
                  ✓ Photo updated
                </p>
              )}
              <p className="text-xs text-gray-400 text-center">
                JPG, PNG or WebP · max 3 MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">About Me</h3>
              {saved.bio ? (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {saved.bio}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  No bio added yet.
                </p>
              )}
            </div>
            {saved.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400 shrink-0" />
                {saved.phone}
              </div>
            )}
            {saved.university && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 size={14} className="text-gray-400 shrink-0" />
                {saved.university}
              </div>
            )}
            {saved.graduationYear && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap size={14} className="text-gray-400 shrink-0" />
                Class of {saved.graduationYear}
              </div>
            )}
            {isAlumni && (saved.position || saved.company) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase size={14} className="text-gray-400 shrink-0" />
                {[saved.position, saved.company].filter(Boolean).join(" at ")}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
              {saved.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {saved.skills.map((skill, i) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        i % 3 === 1
                          ? "border-green-300 text-green-700 bg-green-50"
                          : i % 3 === 2
                            ? "border-blue-300 text-blue-700 bg-blue-50"
                            : "border-gray-300 text-gray-700 bg-gray-50"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  No skills added yet.
                </p>
              )}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Jobs Applied */}
            <button
              onClick={() => setModal("jobs")}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-[#1e3a6e]/30 hover:shadow-sm transition group"
            >
              <p className="text-gray-500 text-xs mb-1">Jobs Applied</p>
              {statsLoading ? (
                <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mx-auto" />
              ) : (
                <p className="text-3xl font-bold text-[#1e3a6e]">
                  {stats?.jobsApplied ?? "—"}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-0.5 group-hover:text-[#1e3a6e] transition">
                View all <ChevronRight size={11} />
              </p>
            </button>

            {/* Connections */}
            <button
              onClick={() => setModal("connections")}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-green-300 hover:shadow-sm transition group"
            >
              <p className="text-gray-500 text-xs mb-1">Connections</p>
              {statsLoading ? (
                <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mx-auto" />
              ) : (
                <p className="text-3xl font-bold text-green-500">
                  {stats?.connectionsCount ?? "—"}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-0.5 group-hover:text-green-600 transition">
                View all <ChevronRight size={11} />
              </p>
            </button>

            {/* Events Joined */}
            <button
              onClick={() => setModal("events")}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-red-300 hover:shadow-sm transition group"
            >
              <p className="text-gray-500 text-xs mb-1">Events Joined</p>
              {statsLoading ? (
                <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mx-auto" />
              ) : (
                <p className="text-3xl font-bold text-red-400">
                  {stats?.eventsJoined ?? "—"}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-0.5 group-hover:text-red-500 transition">
                View all <ChevronRight size={11} />
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <PageContainer title="Profile">
      {user?.role === "admin" ? <AdminProfile /> : <UserProfile />}
    </PageContainer>
  );
};

export default ProfilePage;
