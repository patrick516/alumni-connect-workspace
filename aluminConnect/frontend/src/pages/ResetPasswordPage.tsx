import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPasswordApi } from "../api/authApi";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: "#7a9bbf" }}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg px-8 py-8">
        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          Set new password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Choose a new password for your account.
        </p>

        {!token && !done && (
          <p className="text-red-600 text-sm text-center mb-4">
            This link is invalid. Request a new reset from the login page.
          </p>
        )}

        {done ? (
          <div className="rounded-lg border border-green-200 bg-green-50 text-green-800 text-sm px-4 py-3 mb-4">
            Your password was updated. You can sign in now.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm password
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
              disabled={loading || !token}
              className="w-full bg-[#1e3a6e] hover:bg-[#162d57] text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-[#1e3a6e] font-semibold">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
