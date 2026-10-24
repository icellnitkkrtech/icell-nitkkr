import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import {
  Plus,
  Search,
  Trash2,
  Award,
  ChevronDown,
  X,
  Check,
  Users,
  Loader2,
} from "lucide-react";

const BRANCHES = ["CSE",
    "IT",
    "AIDS",
    "AIML",
    "MnC",
    "ECE",
    "ME",
    "Civil",
    "EE",
    "PIE",
    "IIOT",
    "SET",
    "Robotics",
    "Others"];
const YEARS = ["1", "2", "3", "4","5","6"];
const POSITIONS = [
  "Convener",
  "Co-Convener",
  "Secretary",
  "Treasurer",
  "Event Coordinator",
  "Design Head",
  "Media Head",
  "Tech Head",
  "Outreach Head",
  "Management Head",
  "Member",
];

export default function AdminStudents() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({}); // {studentId: {total, present, absent, percentage}}
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [promotePosition, setPromotePosition] = useState("");
  const [promoteToRole, setPromoteToRole] = useState(""); // New: track target role
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
    year: "",
    roll_number: "",
  });

  // Check admin access
  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "post_holder"))
    ) {
      navigate("/");
      return;
    }
  }, [authLoading, user, navigate]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/students/all");
      // Handle both array response and object with students property
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.students || [];
      setStudents(data);

      // Fetch attendance stats for all students
      if (data.length > 0) {
        try {
          setAttendanceLoading(true);
          const studentIds = data.map((s) => s._id);
          // console.log("Sending studentIds:", studentIds);
          const attendanceResponse = await api.post(
            "event-attendance/students/bulk-stats",
            { studentIds }
          );
          // console.log("Attendance API Response:", attendanceResponse.data);
          setAttendance(attendanceResponse.data || {});
        } catch (err) {
          console.error("Error fetching attendance:", err);
          console.error("Error response:", err.response?.data);
          setAttendance({});
        } finally {
          setAttendanceLoading(false);
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterStudents = useCallback(
    (data = students) => {
      let filtered = data;

      if (searchTerm) {
        filtered = filtered.filter(
          (s) =>
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.roll_number?.includes(searchTerm)
        );
      }

      if (selectedBranch) {
        filtered = filtered.filter((s) => s.branch === selectedBranch);
      }

      if (selectedYear) {
        filtered = filtered.filter((s) => s.year === selectedYear);
      }

      setFilteredStudents(filtered);
    },
    [searchTerm, selectedBranch, selectedYear, students]
  );

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    filterStudents(students);
  }, [searchTerm, selectedBranch, selectedYear, students, filterStudents]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/students", formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        branch: "",
        year: "",
        roll_number: "",
      });
      fetchStudents();
    } catch (err) {
      console.error("Error adding student:", err);
      alert("Failed to add student");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await api.delete(`/students/${studentId}`);
      // Remove student locally without refetching entire list
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Failed to delete student");
    }
  };

  const handlePromoteStudent = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    try {
      setUpdatingRole(true);
      let endpoint = "";
      let data = {};
      let nextRole = "";
      let nextPosition = null;

      // Student → Member or Post Holder
      if (selectedStudent.role === "student") {
        const targetRole = promoteToRole || "member";
        endpoint = "/admin/students/promote";
        data.studentId = selectedStudent._id;
        data.newRole = targetRole;
        nextRole = targetRole;
        if (targetRole === "post_holder" && promotePosition) {
          data.postPosition = promotePosition;
          nextPosition = promotePosition;
        }
      }
      // Member → Post Holder or Student
      else if (selectedStudent.role === "member") {
        endpoint = "/admin/students/change-role";
        data.userId = selectedStudent._id;
        data.newRole = promoteToRole || "post_holder";
        nextRole = promoteToRole || "post_holder";
        if (
          (promoteToRole || "post_holder") === "post_holder" &&
          promotePosition
        ) {
          data.postPosition = promotePosition;
          nextPosition = promotePosition;
        }
      }
      // Post Holder → Member or Student
      else if (selectedStudent.role === "post_holder") {
        endpoint = "/admin/students/change-role";
        data.userId = selectedStudent._id;
        data.newRole = promoteToRole || "member";
        nextRole = promoteToRole || "member";
        if (nextRole === "post_holder" && promotePosition) {
          data.postPosition = promotePosition;
          nextPosition = promotePosition;
        }
      }

      if (!endpoint) {
        alert("This user cannot be promoted");
        return;
      }

      const response = await api.post(endpoint, data);
      const studentId = selectedStudent._id;
      const finalRole = response.data?.newRole || nextRole;
      const finalPosition =
        response.data?.postPosition !== undefined
          ? response.data.postPosition
          : nextPosition;

      // Update state locally without re-fetching all students from DB
      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId
            ? {
                ...s,
                role: finalRole,
                post_position: finalPosition,
                is_member:
                  finalRole === "member" || finalRole === "post_holder",
              }
            : s
        )
      );

      setShowPromoteModal(false);
      setSelectedStudent(null);
      setPromotePosition("");
      setPromoteToRole("");
    } catch (err) {
      console.error("Error promoting student:", err);
      alert(
        "Failed to promote student: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleDemoteStudent = async (studentId) => {
    const student = students.find((s) => s._id === studentId);
    if (!student) return;

    try {
      setActionLoadingId(studentId);
      const endpoint = "/admin/students/demote";

      await api.post(endpoint, {
        userId: studentId,
      });

      // Update UI state directly for this student instead of refetching all students from DB
      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId
            ? {
                ...s,
                role: "student",
                is_member: false,
                post_position: null,
              }
            : s
        )
      );
    } catch (err) {
      console.error("Error demoting student:", err);
      alert(
        "Failed to demote student: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Get attendance color and badge style based on percentage
  const getAttendanceColorAndStyle = (percentage) => {
    if (percentage === 0) {
      return {
        bgColor: "#1f1f1f",
        textColor: "#666",
        badge: "#1f1f1f30",
        badgeText: "#666",
      };
    }
    if (percentage < 50) {
      return {
        bgColor: "#ef4444",
        textColor: "#fca5a5",
        badge: "#ef444415",
        badgeText: "#ef4444",
      };
    }
    if (percentage < 75) {
      return {
        bgColor: "#f97316",
        textColor: "#fed7aa",
        badge: "#f9731615",
        badgeText: "#f97316",
      };
    }
    return {
      bgColor: "#22c55e",
      textColor: "#dcfce7",
      badge: "#22c55e15",
      badgeText: "#22c55e",
    };
  };


  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto">
        <div
          className="p-4 sm:p-6 md:p-8 min-h-screen max-md:pt-20"
          style={{ background: "#0d0d0d" }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Student Management
              </h1>
              <p className="text-[#555] text-xs sm:text-sm mt-1">
                Manage all students, branches, and roles
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all text-sm sm:text-base whitespace-nowrap"
            >
              <Plus size={20} />
              Add Student
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* Search */}
            <div className="sm:col-span-2 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555]"
              />
              <input
                type="text"
                placeholder="Search name, email, or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111111] border border-[#1f1f1f] text-white placeholder-[#555] focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#111111] border border-[#1f1f1f] text-white focus:outline-none focus:border-purple-500 text-sm"
            >
              <option value="">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#111111] border border-[#1f1f1f] text-white focus:outline-none focus:border-purple-500 text-sm"
            >
              <option value="">All Years</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content Area: Dedicated Loader UI or Students Table */}
          {loading ? (
            <div
              className="rounded-lg sm:rounded-xl border p-6 sm:p-10"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              <div className="flex flex-col items-center justify-center text-center py-6 mb-6">
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <Users
                    size={22}
                    className="absolute inset-0 m-auto text-purple-400 animate-pulse"
                  />
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold text-white mb-1.5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Loading Student Records
                </h3>
                <p className="text-xs sm:text-sm text-[#777] max-w-md">
                  Fetching students directory and calculating bulk attendance metrics...
                </p>
              </div>

              {/* Skeleton Table Rows Preview */}
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5, 6, 7].map((idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1a1a1a]" />
                      <div className="space-y-1.5 text-left">
                        <div className="w-28 sm:w-44 h-3.5 bg-[#262626] rounded" />
                        <div className="w-36 sm:w-56 h-2.5 bg-[#1a1a1a] rounded" />
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                      <div className="w-14 h-3 bg-[#1a1a1a] rounded" />
                      <div className="w-10 h-3 bg-[#1a1a1a] rounded" />
                      <div className="w-16 h-5 bg-[#1a1a1a] rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 sm:w-20 h-7 bg-[#1a1a1a] rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Students Table */}
              <div
                className="rounded-lg sm:rounded-xl border overflow-hidden"
                style={{ background: "#111111", borderColor: "#1f1f1f" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                          Name
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                          Email
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                          Branch
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                          Year
                        </th>
                        {/* <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                          Roll #
                        </th> */}
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                          Attend.
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                          Role
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => {
                        const attendanceData = attendance[student._id];
                        const percentage = attendanceData?.percentage || 0;
                        const total = attendanceData?.total || 0;
                        const colorStyle = getAttendanceColorAndStyle(percentage);

                        return (
                          <tr
                            key={student._id}
                            style={{ borderBottom: "1px solid #1f1f1f" }}
                            className="hover:bg-[#0d0d0d] transition text-sm"
                          >
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white font-medium whitespace-nowrap">
                              {student.name}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#555] whitespace-nowrap">
                              {student.email}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#555] whitespace-nowrap">
                              {student.branch || "-"}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#555] whitespace-nowrap">
                              {student.year || "-"}
                            </td>
                            {/* <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#555] whitespace-nowrap">
                              {student.roll_number || "-"}
                            </td> */}
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                              {attendanceLoading ? (
                                <span className="text-[#555]">Loading...</span>
                              ) : total === 0 ? (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#1f1f1f] text-[#666]">
                                  No data
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                    style={{
                                      background: colorStyle.badge,
                                      color: colorStyle.badgeText,
                                    }}
                                  >
                                    {percentage}%
                                  </span>
                                  <span className="text-[#555] text-xs hidden sm:inline">
                                    {attendanceData.present}/{total}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                              {student.role === "post_holder" ? (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                  {student.post_position || "Post Holder"}
                                </span>
                              ) : student.role === "member" ? (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-400">
                                  Member
                                </span>
                              ) : (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                  Student
                                </span>
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setShowPromoteModal(true);
                                  }}
                                  className="px-2 sm:px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition text-xs font-medium"
                                  title="Change Role"
                                >
                                  <span className="hidden sm:inline">Change</span>
                                  <span className="inline sm:hidden">CH</span>
                                </button>
                                {student.role !== "student" && (
                                  <button
                                    onClick={() => handleDemoteStudent(student._id)}
                                    disabled={actionLoadingId === student._id}
                                    className="px-2 sm:px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Demote"
                                  >
                                    <span className="hidden sm:inline">
                                      {actionLoadingId === student._id
                                        ? "Demoting..."
                                        : "Demote"}
                                    </span>
                                    <span className="inline sm:hidden">
                                      {actionLoadingId === student._id ? "..." : "DM"}
                                    </span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#555]">No students found</p>
                </div>
              )}
            </>
          )}

          {/* Add Student Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div
                className="rounded-2xl border p-8 w-full max-w-md"
                style={{ background: "#111111", borderColor: "#1f1f1f" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Add New Student
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-[#555] hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddStudent} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white placeholder-[#555] focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white placeholder-[#555] focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white placeholder-[#555] focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Roll Number"
                    value={formData.roll_number}
                    onChange={(e) =>
                      setFormData({ ...formData, roll_number: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white placeholder-[#555] focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Branch</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white hover:border-[#2f2f2f] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition font-medium"
                    >
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Promote Modal */}
          {showPromoteModal && selectedStudent && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div
                className="rounded-2xl border p-8 w-full max-w-md"
                style={{ background: "#111111", borderColor: "#1f1f1f" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Change {selectedStudent.name}'s Role
                  </h2>
                  <button
                    onClick={() => {
                      setShowPromoteModal(false);
                      setPromoteToRole("");
                      setPromotePosition("");
                    }}
                    className="text-[#555] hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <p className="text-[#555] mb-4">
                  Current role:{" "}
                  <span className="text-white font-medium capitalize">
                    {selectedStudent.role}
                  </span>
                </p>

                {/* Role selection based on current role */}
                <div className="space-y-3 mb-6">
                  {selectedStudent.role === "student" && (
                    <>
                      <p className="text-[#555] text-sm mb-3">
                        Select the role to promote to:
                      </p>
                      <label
                        className="flex items-center p-3 rounded-lg border cursor-pointer transition"
                        style={{
                          background:
                            promoteToRole === "member"
                              ? "#3b82f620"
                              : "transparent",
                          borderColor:
                            promoteToRole === "member" ? "#3b82f6" : "#1f1f1f",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="member"
                          checked={promoteToRole === "member"}
                          onChange={(e) => {
                            setPromoteToRole(e.target.value);
                            setPromotePosition("");
                          }}
                          className="mr-3 cursor-pointer"
                        />
                        <div>
                          <div className="text-white font-medium">Member</div>
                          <div className="text-[#555] text-sm">
                            Regular member, no specific position
                          </div>
                        </div>
                      </label>

                      <label
                        className="flex items-center p-3 rounded-lg border cursor-pointer transition"
                        style={{
                          background:
                            promoteToRole === "post_holder"
                              ? "#10b98120"
                              : "transparent",
                          borderColor:
                            promoteToRole === "post_holder"
                              ? "#10b981"
                              : "#1f1f1f",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="post_holder"
                          checked={promoteToRole === "post_holder"}
                          onChange={(e) => {
                            setPromoteToRole(e.target.value);
                          }}
                          className="mr-3 cursor-pointer"
                        />
                        <div>
                          <div className="text-white font-medium">
                            Post Holder
                          </div>
                          <div className="text-[#555] text-sm">
                            Leadership position with specific role
                          </div>
                        </div>
                      </label>
                    </>
                  )}

                  {selectedStudent.role === "member" && (
                    <>
                      <p className="text-[#555] text-sm mb-3">
                        Select the role to change to:
                      </p>
                      <label
                        className="flex items-center p-3 rounded-lg border cursor-pointer transition"
                        style={{
                          background:
                            promoteToRole === "post_holder"
                              ? "#10b98120"
                              : "transparent",
                          borderColor:
                            promoteToRole === "post_holder"
                              ? "#10b981"
                              : "#1f1f1f",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="post_holder"
                          checked={
                            promoteToRole === "post_holder" ||
                            promoteToRole === ""
                          }
                          onChange={(e) => {
                            setPromoteToRole(e.target.value);
                          }}
                          className="mr-3 cursor-pointer"
                          defaultChecked
                        />
                        <div>
                          <div className="text-white font-medium">
                            Post Holder
                          </div>
                          <div className="text-[#555] text-sm">
                            Promote to leadership position with specific role
                          </div>
                        </div>
                      </label>

                      <label
                        className="flex items-center p-3 rounded-lg border cursor-pointer transition"
                        style={{
                          background:
                            promoteToRole === "student"
                              ? "#ef444420"
                              : "transparent",
                          borderColor:
                            promoteToRole === "student" ? "#ef4444" : "#1f1f1f",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          checked={promoteToRole === "student"}
                          onChange={(e) => {
                            setPromoteToRole(e.target.value);
                            setPromotePosition("");
                          }}
                          className="mr-3 cursor-pointer"
                        />
                        <div>
                          <div className="text-white font-medium">Student</div>
                          <div className="text-[#555] text-sm">
                            Demote to regular student
                          </div>
                        </div>
                      </label>
                    </>
                  )}

                  {selectedStudent.role === "post_holder" && (
                    <>
                      <p className="text-[#555] text-sm mb-3">
                        Select the role to demote to:
                      </p>
                      <label
                        className="flex items-center p-3 rounded-lg border cursor-pointer transition"
                        style={{
                          background:
                            promoteToRole === "member"
                              ? "#3b82f620"
                              : "transparent",
                          borderColor:
                            promoteToRole === "member" ? "#3b82f6" : "#1f1f1f",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="member"
                          checked={
                            promoteToRole === "member" || promoteToRole === ""
                          }
                          onChange={(e) => {
                            setPromoteToRole(e.target.value);
                            setPromotePosition("");
                          }}
                          className="mr-3 cursor-pointer"
                          defaultChecked
                        />
                        <div>
                          <div className="text-white font-medium">Member</div>
                          <div className="text-[#555] text-sm">
                            Demote to regular member
                          </div>
                        </div>
                      </label>

                      <label
                        className="flex items-center p-3 rounded-lg border cursor-pointer transition"
                        style={{
                          background:
                            promoteToRole === "student"
                              ? "#ef444420"
                              : "transparent",
                          borderColor:
                            promoteToRole === "student" ? "#ef4444" : "#1f1f1f",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          checked={promoteToRole === "student"}
                          onChange={(e) => {
                            setPromoteToRole(e.target.value);
                            setPromotePosition("");
                          }}
                          className="mr-3 cursor-pointer"
                        />
                        <div>
                          <div className="text-white font-medium">Student</div>
                          <div className="text-[#555] text-sm">
                            Demote to regular student
                          </div>
                        </div>
                      </label>
                    </>
                  )}
                </div>

                {/* Show position dropdown when promoting to post_holder */}
                {(promoteToRole === "post_holder" ||
                  (selectedStudent.role === "member" &&
                    (promoteToRole === "" ||
                      promoteToRole === "post_holder"))) && (
                  <>
                    <label className="block text-[#555] text-sm mb-2">
                      Select Position
                    </label>
                    <select
                      value={promotePosition}
                      onChange={(e) => setPromotePosition(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white focus:outline-none focus:border-purple-500 mb-6"
                    >
                      <option value="">-- Select a position --</option>
                      {POSITIONS.filter((p) => p !== "Member").map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPromoteModal(false);
                      setPromoteToRole("");
                      setPromotePosition("");
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white hover:border-[#2f2f2f] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePromoteStudent}
                    disabled={
                      updatingRole ||
                      (selectedStudent.role === "student" && !promoteToRole) ||
                      ((promoteToRole === "post_holder" ||
                        selectedStudent.role === "member") &&
                        (promoteToRole === "post_holder" ||
                          promoteToRole === "") &&
                        !promotePosition)
                    }
                    className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingRole
                      ? "Saving..."
                      : selectedStudent.role === "student"
                      ? "Promote"
                      : "Change Role"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
