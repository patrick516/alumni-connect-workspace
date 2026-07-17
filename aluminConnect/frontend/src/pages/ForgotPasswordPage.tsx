import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../api/authApi";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          Forgot password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email. If an account exists, we will send reset
          instructions.
        </p>

        {done ? (
          <div className="rounded-lg border border-green-200 bg-green-50 text-green-800 text-sm px-4 py-3 mb-4">
            If an account exists for that email, check your inbox for a reset
            link (and spam folder).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              {loading ? "Sending…" : "Send reset link"}
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

export default ForgotPasswordPage;
