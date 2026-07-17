type Role = "student" | "alumni" | "admin";

interface RoleSelectorProps {
  activeRole: Role;
  onChange: (role: Role) => void;
  /** Only while the database has zero users — first admin signup */
  showAdminOption?: boolean;
}

const RoleSelector = ({
  activeRole,
  onChange,
  showAdminOption = false,
}: RoleSelectorProps) => {
  return (
    <div
      className={`grid gap-3 mb-2 ${showAdminOption ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}
    >
      <button
        type="button"
        onClick={() => onChange("student")}
        className={`py-2.5 px-4 rounded font-semibold text-sm transition-all duration-200 ${
          activeRole === "student"
            ? "bg-[#27155f] text-white shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Register as Student
      </button>
      <button
        type="button"
        onClick={() => onChange("alumni")}
        className={`py-2.5 px-4 rounded font-semibold text-sm transition-all duration-200 ${
          activeRole === "alumni"
            ? "bg-[#e40d0a] text-white shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Register as Alumni
      </button>
      {showAdminOption && (
        <button
          type="button"
          onClick={() => onChange("admin")}
          className={`py-2.5 px-4 rounded font-semibold text-sm transition-all duration-200 sm:col-span-1 col-span-2 ${
            activeRole === "admin"
              ? "bg-[#27155F] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Register as Admin (first user only)
        </button>
      )}
    </div>
  );
};

export default RoleSelector;
