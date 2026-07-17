import { useState } from "react";
import { Navigate } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import { useAuth } from "../context/AuthContext";
import { changePasswordApi } from "../api/userApi";

const ChangePasswordPage = () => {
  const { user, updateStoredUser, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const forced = !!user.mustChangePassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!forced && !currentPassword) {
      setError("Enter your current password");
      return;
    }
    setLoading(true);
    try {
      const updated = await changePasswordApi(
        forced
          ? { newPassword }
          : { currentPassword, newPassword },
      );
      updateStoredUser({
        ...updated,
        token: user.token,
        mustChangePassword: false,
      });
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title={forced ? "Choose a new password" : "Change password"}>
      <div className="max-w-md mx-auto">
        {forced && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3">
            For security, you must set a new password before continuing (e.g.
            after signing in with a temporary admin password).
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          {!forced && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required={!forced}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a6e] hover:bg-[#162d57] text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading ? "Saving…" : "Update password"}
          </button>
          {forced && (
            <button
              type="button"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-800 py-2"
            >
              Sign out instead
            </button>
          )}
        </form>
      </div>
    </PageContainer>
  );
};

export default ChangePasswordPage;
