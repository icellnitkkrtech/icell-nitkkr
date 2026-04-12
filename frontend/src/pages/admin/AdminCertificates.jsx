import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Award,
  Plus,
  Search,
  Download,
  Trash2,
  Eye,
  Filter,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AdminCertificates() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // CSV Upload states
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewData, setCsvPreviewData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [batchId, setBatchId] = useState(null);
  const [certificateIds, setCertificateIds] = useState([]);
  const [confirmingBatch, setConfirmingBatch] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "post_holder"))
    ) {
      navigate("/");
      return;
    }

    // Don't fetch if still waiting for auth
    if (authLoading) {
      return;
    }

    const fetchCertificates = async () => {
      try {
        const response = await api.get("/certificate/admin/all");
        if (response.data && response.data.certificates) {
          setCertificates(response.data.certificates);
        }
      } catch (err) {
        console.warn("Could not fetch certificates:", err);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user, navigate, authLoading]);

  const handleCSVFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      parseCsvContent(content);
    };
    reader.readAsText(file);
  };

  const parseCsvContent = (content) => {
    try {
      const lines = content.trim().split("\n");
      if (lines.length < 2) {
        setCsvErrors(["CSV must contain header row and at least one data row"]);
        setCsvPreviewData([]);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const requiredHeaders = ["email", "name", "achievement"];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        setCsvErrors([
          `Missing required columns: ${missingHeaders.join(
            ", "
          )}. Required: email, name, achievement`,
        ]);
        setCsvPreviewData([]);
        return;
      }

      const emailIdx = headers.indexOf("email");
      const nameIdx = headers.indexOf("name");
      const achievementIdx = headers.indexOf("achievement");

      const records = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(",").map((c) => c.trim());
        if (
          cells.length < 3 ||
          !cells[emailIdx] ||
          !cells[nameIdx] ||
          !cells[achievementIdx]
        ) {
          errors.push(`Row ${i + 1}: Missing required data`);
          continue;
        }

        records.push({
          email: cells[emailIdx],
          name: cells[nameIdx],
          achievement: cells[achievementIdx],
        });
      }

      if (errors.length > 0) {
        setCsvErrors(errors);
      }
      setCsvPreviewData(records);
    } catch (err) {
      setCsvErrors(["Error parsing CSV: " + err.message]);
      setCsvPreviewData([]);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile || csvPreviewData.length === 0) {
      alert("No valid records to upload");
      return;
    }

    setCsvUploading(true);
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await api.post(
        "/certificate/admin/upload-csv",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setBatchId(response.data.batch_id);
      setCertificateIds(response.data.certificate_ids || []);
      alert(
        `Successfully uploaded ${response.data.count} certificates. Click "Confirm Batch" to issue them.`
      );
      setCsvFile(null);
      setCsvPreviewData([]);
      setCsvErrors([]);
      setShowCSVModal(false);
    } catch (err) {
      console.error("CSV upload error:", err);
      alert(
        "Failed to upload CSV: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setCsvUploading(false);
    }
  };

  const handleConfirmBatch = async () => {
    if (!batchId) {
      alert("No batch to confirm");
      return;
    }

    setConfirmingBatch(true);
    try {
      await api.post("/certificate/admin/issue-batch", {
        batchId: batchId,
        certificateIds: certificateIds,
      });
      alert("Batch certificates confirmed and issued!");
      setBatchId(null);
      setCertificateIds([]);

      // Refresh certificates list
      const response = await api.get("/certificate/admin/all");
      if (response.data && response.data.certificates) {
        setCertificates(response.data.certificates);
      }
    } catch (err) {
      console.error("Batch confirmation error:", err);
      alert(
        "Failed to confirm batch: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setConfirmingBatch(false);
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      await api.delete(`/certificate/admin/${id}`);
      setCertificates(certificates.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting certificate:", err);
      alert("Failed to delete certificate");
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.metadata?.achievement
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (selectedFilter === "member")
      return matchesSearch && cert.certificate_type === "member";
    if (selectedFilter === "post_holder")
      return matchesSearch && cert.certificate_type === "post_holder";
    if (selectedFilter === "event")
      return matchesSearch && cert.certificate_type === "event";
    return matchesSearch;
  });

  const memberCerts = certificates.filter(
    (c) => c.certificate_type === "member"
  ).length;
  const postHolderCerts = certificates.filter(
    (c) => c.certificate_type === "post_holder"
  ).length;
  const eventCerts = certificates.filter(
    (c) => c.certificate_type === "event"
  ).length;
  return (
    <div
      className="flex h-screen bg-[#0d0d0d] text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-md:pt-20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Certificates</h1>
            <p className="text-[#555]">
              Manage and issue certificates to students
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: "#1f1f1f", background: "#111111" }}
            >
              <p className="text-[#555] text-sm mb-2">Total Certificates</p>
              <p className="text-3xl font-bold">{certificates.length}</p>
            </div>
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: "#fbbf2430", background: "#fbbf2408" }}
            >
              <p className="text-[#999] text-sm mb-2">Member Certificates</p>
              <p className="text-3xl font-bold text-[#fbbf24]">{memberCerts}</p>
            </div>
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: "#e9456030", background: "#e9456008" }}
            >
              <p className="text-[#999] text-sm mb-2">Post Holder</p>
              <p className="text-3xl font-bold text-[#e94560]">
                {postHolderCerts}
              </p>
            </div>
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: "#06b6d430", background: "#06b6d408" }}
            >
              <p className="text-[#999] text-sm mb-2">Achievements</p>
              <p className="text-3xl font-bold text-[#06b6d4]">{eventCerts}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-col md:flex-row gap-3">
            <button
              onClick={() => setShowCSVModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all md:flex-1"
              style={{
                background: "#0ea5e930",
                color: "#0ea5e9",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0ea5e940";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0ea5e930";
              }}
            >
              <Upload size={18} />
              Upload CSV
            </button>
            {batchId && (
              <button
                onClick={handleConfirmBatch}
                disabled={confirmingBatch}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all md:flex-1"
                style={{
                  background: confirmingBatch ? "#6b7280" : "#10b98130",
                  color: confirmingBatch ? "#ffffff" : "#10b981",
                }}
              >
                <CheckCircle size={18} />
                {confirmingBatch ? "Confirming..." : "Confirm Batch"}
              </button>
            )}
          </div>

          {/* Search & Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-[#555]" />
              <input
                type="text"
                placeholder="Search by email, name, or achievement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111111] border border-[#1f1f1f] text-white placeholder-[#555] focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-[#111111] border border-[#1f1f1f] text-white focus:outline-none focus:border-[#0ea5e9]"
            >
              <option value="all">All Types</option>
              <option value="member">Member</option>
              <option value="post_holder">Post Holder</option>
              <option value="event">Event Achievement</option>
            </select>
          </div>

          {/* Certificates Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-[#555]">Loading certificates...</div>
            </div>
          ) : filteredCertificates.length > 0 ? (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "#1f1f1f" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        background: "#111111",
                        borderBottom: "1px solid #1f1f1f",
                      }}
                    >
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#555] uppercase">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#555] uppercase">
                        Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#555] uppercase">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#555] uppercase">
                        Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#555] uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-[#555] uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.map((cert) => {
                      let typeLabel = "Unknown";
                      let typeColor = "#666";
                      let typeBg = "#66666610";
                      let icon = "📜";

                      if (cert.certificate_type === "member") {
                        typeLabel = "Member";
                        typeColor = "#fbbf24";
                        typeBg = "#fbbf2415";
                        icon = "🎖️";
                      } else if (cert.certificate_type === "post_holder") {
                        typeLabel = "Post Holder";
                        typeColor = "#e94560";
                        typeBg = "#e9456015";
                        icon = "👑";
                      } else if (cert.certificate_type === "event") {
                        typeLabel = "Achievement";
                        typeColor = "#06b6d4";
                        typeBg = "#06b6d415";
                        icon = "⭐";
                      }

                      return (
                        <tr
                          key={cert._id}
                          className="border-t hover:bg-[#111111] transition-colors"
                          style={{ borderColor: "#1f1f1f" }}
                        >
                          <td className="px-6 py-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
                              style={{
                                background: typeBg,
                                color: typeColor,
                              }}
                            >
                              <span>{icon}</span>
                              {typeLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">
                              {cert.user_name || "(Deleted User)"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-[#999]">
                            {cert.user_email || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-[#999]">
                            {cert.certificate_type === "event"
                              ? cert.metadata?.achievement
                              : cert.certificate_type === "post_holder"
                              ? cert.metadata?.post_position
                              : "Member"}
                          </td>
                          <td className="px-6 py-4 text-[#999]">
                            {new Date(cert.issued_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleDeleteCertificate(cert._id)
                                }
                                className="p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} className="text-[#ef4444]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ borderColor: "#1f1f1f" }}
            >
              <Award size={40} className="mx-auto mb-4 text-[#555]" />
              <p className="text-[#555]">No certificates found</p>
              <p className="text-[#444] text-sm mt-1">
                Upload a CSV file to issue certificates in bulk
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-[#111111] rounded-xl border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ borderColor: "#1f1f1f" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upload Certificates CSV</h2>
              <button
                onClick={() => setShowCSVModal(false)}
                className="p-1 hover:bg-[#1f1f1f] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[#555] text-sm mb-4">
              CSV must have columns: <code>email</code>, <code>name</code>,{" "}
              <code>achievement</code>
            </p>

            {/* File Input */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVFileSelect}
                className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-[#0ea5e9] file:text-white file:border-0 file:cursor-pointer"
              />
            </div>

            {/* Error Messages */}
            {csvErrors.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-[#ef444415] border border-[#ef444430]">
                <p className="text-[#ef4444] text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Errors
                </p>
                <ul className="text-[#ff6b6b] text-xs space-y-1">
                  {csvErrors.map((err, idx) => (
                    <li key={idx}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Data */}
            {csvPreviewData.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  Preview ({csvPreviewData.length} records)
                </p>
                <div className="bg-[#0d0d0d] rounded-lg border border-[#1f1f1f] overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                        <th className="px-4 py-2 text-left text-[#555]">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-[#555]">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-[#555]">
                          Achievement
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreviewData.slice(0, 5).map((row, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: "1px solid #1f1f1f" }}
                        >
                          <td className="px-4 py-2 text-[#999]">{row.email}</td>
                          <td className="px-4 py-2 text-[#999]">{row.name}</td>
                          <td className="px-4 py-2 text-[#999]">
                            {row.achievement}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvPreviewData.length > 5 && (
                    <div className="px-4 py-2 text-[#555] text-xs">
                      ... and {csvPreviewData.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCSVModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border transition-colors"
                style={{ borderColor: "#1f1f1f" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCSVUpload}
                disabled={
                  csvUploading ||
                  csvPreviewData.length === 0 ||
                  csvErrors.length > 0
                }
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  background:
                    csvUploading ||
                    csvPreviewData.length === 0 ||
                    csvErrors.length > 0
                      ? "#6b7280"
                      : "#0ea5e930",
                  color:
                    csvUploading ||
                    csvPreviewData.length === 0 ||
                    csvErrors.length > 0
                      ? "#ffffff"
                      : "#0ea5e9",
                }}
              >
                {csvUploading ? "Uploading..." : "Upload Certificates"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
