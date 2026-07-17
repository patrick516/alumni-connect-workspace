import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { mustChangePassword } = await login(form.email, form.password);
      if (mustChangePassword) {
        window.location.href = "/change-password";
        return;
      }
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Log in to reconnect with your fellow alumni and explore career
          opportunities.
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Login button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3a2080] hover:bg-[#3a2080] text-white font-semibold py-2.5 rounded transition-colors duration-200 disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>

      {/* Forgot password */}
      <p className="text-center text-sm text-gray-500">
        <Link
          to="/forgot-password"
          className="hover:text-[#1e3a6e] transition-colors"
        >
          Forgot Password?
        </Link>
      </p>

      {/* Register link */}
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-[#e40d0a] font-semibold hover:text-[#e40d0a] transition-colors"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
