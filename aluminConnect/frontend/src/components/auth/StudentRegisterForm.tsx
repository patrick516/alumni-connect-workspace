import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RoleSelector from "./RoleSelector";
import AlumniRegisterForm from "./AlumniRegisterForm";
import { useAuth } from "../../context/AuthContext";
import { getDepartmentsApi, type Department } from "../../api/userApi";

type Role = "student" | "alumni" | "admin";

interface StudentRegisterFormProps {
  allowFirstAdmin?: boolean;
}

const StudentRegisterForm = ({
  allowFirstAdmin = false,
}: StudentRegisterFormProps) => {
  const { registerStudent, registerFirstAdmin } = useAuth();
  const [activeRole, setActiveRole] = useState<Role>("student");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  useEffect(() => {
    if (!allowFirstAdmin && activeRole === "admin") setActiveRole("student");
  }, [allowFirstAdmin, activeRole]);

  // Fetch departments for dropdown
  useEffect(() => {
    getDepartmentsApi()
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setDepartmentsLoading(false));
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    registrationNumber: "",
    department: "",
    gender: "",
    graduationYear: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate registration number
    if (!form.registrationNumber) {
      setError("Registration number is required");
      return;
    }

    // Validate department
    if (!form.department) {
      setError("Please select your department");
      return;
    }

    // Validate gender
    if (!form.gender) {
      setError("Please select your gender");
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        graduationYear: form.graduationYear,
        registrationNumber: form.registrationNumber,
        department: form.department,
        gender: form.gender,
      });
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await registerFirstAdmin({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (activeRole === "alumni")
    return <AlumniRegisterForm onSwitchRole={() => setActiveRole("student")} />;

  if (activeRole === "admin") {
    return (
      <form onSubmit={handleAdminSubmit} className="space-y-4">
        <RoleSelector
          activeRole={activeRole}
          onChange={setActiveRole}
          showAdminOption={allowFirstAdmin}
        />
        <div className="rounded-lg border border-purple-200 bg-purple-50/80 px-3 py-2 text-xs text-purple-900">
          This option is only available while <strong>no users</strong> exist.
          You become the first administrator.
        </div>
        {["name", "email"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
              {field === "name" ? "Full Name" : "Email"}
            </label>
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              value={form[field as keyof typeof form]}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-800 bg-white"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-800 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Confirm password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-800 bg-white"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />{" "}
          Show passwords
        </label>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#27155F] hover:bg-purple-900 text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create admin account"}
        </button>
        <p className="text-center text-sm text-gray-600">
          <Link to="/login" className="text-[#1e3a6e] font-semibold">
            Login
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoleSelector
        activeRole={activeRole}
        onChange={setActiveRole}
        showAdminOption={allowFirstAdmin}
      />

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-xs text-gray-400 font-medium tracking-widest">
          OR
        </span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
        />
      </div>

      {/* Registration Number - NEW */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Registration Number *
        </label>
        <input
          type="text"
          name="registrationNumber"
          value={form.registrationNumber}
          onChange={handleChange}
          required
          placeholder="e.g., 2024-ICT-001"
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
        />
        <p className="text-xs text-gray-400 mt-1">
          Enter your student registration number as provided by the university
        </p>
      </div>

      {/* Department - NEW */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Department *
        </label>
        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          required
          disabled={departmentsLoading}
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
        >
          <option value="">Select your department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept.name}>
              {dept.name} ({dept.code})
            </option>
          ))}
        </select>
        {departmentsLoading && (
          <p className="text-xs text-gray-400 mt-1">Loading departments...</p>
        )}
      </div>

      {/* Gender - NEW */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Gender *
        </label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
        >
          <option value="">Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
          placeholder="+265 999 000 000"
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white"
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

      {/* Graduation Year */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Expected Graduation Year
        </label>
        <div className="relative">
          <select
            name="graduationYear"
            value={form.graduationYear}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] focus:border-transparent bg-white appearance-none text-gray-500"
          >
            <option value=""></option>
            {Array.from({ length: 10 }, (_, i) => 2024 + i).map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#27155f] hover:bg-[#27155f] text-white font-semibold py-2.5 rounded transition-colors duration-200 disabled:opacity-60"
      >
        {loading ? "Signing up..." : "Sign Up as Student"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-gray-800 text-[#e40d0a] hover:text-[#e40d0a]"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default StudentRegisterForm;
