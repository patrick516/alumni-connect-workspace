import { useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import {
  getAllDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  type Department,
} from "../../api/userApi";
import { useToast } from "../../hooks/use-toast";

const ManageDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartmentsApi();
      setDepartments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDepartmentApi(editingDept._id, formData);
        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        await createDepartmentApi(formData);
        toast({
          title: "Success",
          description: "Department created successfully",
        });
      }
      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: "", code: "", description: "" });
      fetchDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete department "${name}"?`)) {
      try {
        await deleteDepartmentApi(id);
        toast({
          title: "Success",
          description: "Department deleted successfully",
        });
        fetchDepartments();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Delete failed",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <PageContainer title="Manage Departments">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[#1e3a6e] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Manage Departments">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Departments</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage academic departments for students and alumni
            </p>
          </div>
          <button
            onClick={() => {
              setEditingDept(null);
              setFormData({ name: "", code: "", description: "" });
              setShowModal(true);
            }}
            className="bg-[#1e3a6e] hover:bg-[#153055] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16M4 12h16" />
            </svg>
            Add Department
          </button>
        </div>

        {/* Department List */}
        <div className="divide-y divide-gray-100">
          {departments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No departments created yet. Click "Add Department" to get started.
            </div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept._id}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1e3a6e]/10 flex items-center justify-center">
                      <span className="text-[#1e3a6e] font-bold text-sm">
                        {dept.code}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {dept.name}
                      </h3>
                      {dept.description && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      dept.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {dept.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-2 text-gray-400 hover:text-[#1e3a6e] transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id, dept.name)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDept ? "Edit Department" : "Add New Department"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                  placeholder="e.g., CS, ENG, BUS"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Short code used for identification
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                  placeholder="Brief description of the department"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#1e3a6e] hover:bg-[#153055] text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {editingDept ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ManageDepartments;
