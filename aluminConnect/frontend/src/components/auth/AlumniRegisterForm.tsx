import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RoleSelector from "./RoleSelector";
import { useAuth } from "../../context/AuthContext";
import { getDepartmentsApi, type Department } from "../../api/userApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
interface AlumniRegisterFormProps {
  onSwitchRole?: () => void;
}

type Role = "student" | "alumni" | "admin";

const AlumniRegisterForm = ({ onSwitchRole }: AlumniRegisterFormProps) => {
  const { registerAlumni } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  // Fetch departments for dropdown
  useEffect(() => {
    getDepartmentsApi()
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setDepartmentsLoading(false));
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "", // NEW
    gender: "", // NEW
    graduationYear: "",
    company: "",
    position: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleChange = (role: Role | "admin") => {
    if (role === "student" && onSwitchRole) onSwitchRole();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      const { pendingApproval } = await registerAlumni({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        department: form.department,
        gender: form.gender,
        graduationYear: form.graduationYear,
        company: form.company,
        position: form.position,
      });
      if (pendingApproval) {
        window.location.href = "/login?pending=alumni";
        return;
      }
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoleSelector
        activeRole="alumni"
        onChange={handleRoleChange}
        showAdminOption={false}
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
            className="w-full border border-gray-300 rounded px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#d2621a] focus:border-transparent bg-white"
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
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d2621a] focus:border-transparent bg-white"
        />
      </div>

      {/* Department - NEW */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Department *
        </label>
        <Select
          value={form.department}
          onValueChange={(value) => setForm({ ...form, department: value })}
          disabled={departmentsLoading}
        >
          <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-[#d2621a]">
            <SelectValue placeholder="Select your department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept._id} value={dept.name}>
                {dept.name} ({dept.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        value={form.gender}
        {departmentsLoading && (
          <p className="text-xs text-gray-400 mt-1">Loading departments...</p>
        )}
        {!departmentsLoading && departments.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            No departments available. Please contact the administrator.
          </p>
        )}
      </div>

      {/* Gender - NEW */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Gender *
        </label>
        <Select
          value={form.gender}
          onValueChange={(value) => setForm({ ...form, gender: value })}
        >
          <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-[#d2621a]">
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
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
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d2621a] focus:border-transparent bg-white"
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
            className="w-full border border-gray-300 rounded px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#d2621a] focus:border-transparent bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Graduation Year */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Graduation Year
        </label>
        <Select
          value={form.graduationYear}
          onValueChange={(value) => setForm({ ...form, graduationYear: value })}
        >
          <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-[#d2621a]">
            <SelectValue placeholder="Select graduation year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(
              { length: 40 },
              (_, i) => new Date().getFullYear() - i,
            ).map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Company <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d2621a] focus:border-transparent bg-white"
        />
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Position <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          name="position"
          value={form.position}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d2621a] focus:border-transparent bg-white"
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#e40d0a] hover:bg-[#b85516] text-white font-semibold py-2.5 rounded transition-colors duration-200 disabled:opacity-60"
      >
        {loading ? "Signing up..." : "Sign Up as Alumni"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-gray-800 hover:text-[#d2621a]"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default AlumniRegisterForm;
