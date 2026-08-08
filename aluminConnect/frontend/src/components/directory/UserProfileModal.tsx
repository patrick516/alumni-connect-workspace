import { useEffect, useState } from "react";
import {
  X,
  Mail,
  Briefcase,
  Building2,
  GraduationCap,
  Eye,
} from "lucide-react";
import { getUserProfileByIdApi } from "../../api/directoryApi";
import type { DirectoryUser } from "../../types";

export default function UserProfileModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<
    (DirectoryUser & { profileViews: number }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserProfileByIdApi(userId)
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse mx-auto" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2 mx-auto" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3 mx-auto" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : profile ? (
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 rounded-full bg-[#1e3a6e] flex items-center justify-center text-white font-bold text-2xl overflow-hidden mb-3">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {profile.name}
              </h2>
              {profile.position && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {profile.position}
                  {profile.company ? ` at ${profile.company}` : ""}
                </p>
              )}
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400 shrink-0" />
                {profile.email}
              </div>
              {profile.department && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 size={14} className="text-gray-400 shrink-0" />
                  Program: {profile.department}
                </div>
              )}
              {profile.graduationYear && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap size={14} className="text-gray-400 shrink-0" />
                  {profile.role === "student"
                    ? `Expected graduation: ${profile.graduationYear}`
                    : `Class of ${profile.graduationYear}`}
                </div>
              )}
              {profile.role === "alumni" && profile.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={14} className="text-gray-400 shrink-0" />
                  {profile.company}
                </div>
              )}
              {profile.employmentStatus && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={14} className="text-gray-400 shrink-0" />
                  <span className="capitalize">
                    {profile.employmentStatus.replace("-", " ")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Eye size={14} className="shrink-0" />
                {profile.profileViews}{" "}
                {profile.profileViews === 1 ? "view" : "views"}
              </div>
            </div>

            {profile.bio && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                  About
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
