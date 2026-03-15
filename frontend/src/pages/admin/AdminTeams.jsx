import addTeamMember from "../../services/addTeamMember";
import deleteTeamMember from "../../services/deleteTeamMember";
import updateTeamMember from "../../services/updateTeamMember";
import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Loader } from "lucide-react";


export default function AdminTeams() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", position: "", image: "", linkedin: "", insta: "" });
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: "", position: "", image: "", linkedin: "", insta: "" });

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/teams");
        const data = await res.json();
        // Handle both array of members and object with members property
        const teamData = Array.isArray(data) 
          ? { members: data }
          : data;
        setTeam(teamData);
      } catch (error) {
        console.error("Error fetching team:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);


const addMember = async () => {
  if (!memberForm.name) return;

  try {
    console.log("Adding member with data:", memberForm);
    const newMember = await addTeamMember(memberForm);

    setTeam({
      ...team,
      members: [...(team.members || []), newMember]
    });

    setMemberForm({
      name: "",
      position: "",
      image: "",
      linkedin: "",
      instagram: ""
    });

    setShowAddMember(false);

  } catch (err) {
    console.error(err);
    alert("Failed to add member");
  }
};

  const removeMember = async (memberId) => {
    try {
      await deleteTeamMember(memberId);
      const updatedTeam = {
        ...team,
        members: team.members.filter(m => m.id !== memberId)
      };
      setTeam(updatedTeam);
    } catch (err) {
      console.error(err);
      alert("Failed to delete member");
    }
  };

  const startEditingMember = (member) => {
    setEditingMember(member.id);
    setEditForm({
      name: member.name || "",
      position: member.position || "",
      image: member.image || "",
      linkedin: member.linkedin || "",
      insta: member.insta || ""
    });
  };

  const updateMember = async (memberId) => {
    try {
      await updateTeamMember(memberId, editForm);
      const updatedTeam = {
        ...team,
        members: team.members.map(m => m.id === memberId ? { ...m, ...editForm } : m)
      };
      setTeam(updatedTeam);
      setEditingMember(null);
      setEditForm({ name: "", position: "", image: "", linkedin: "", insta: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to update member");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div className="text-center">
          <Loader className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-3" />
          <p className="text-white">Loading team...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div className="text-center">
          <p className="text-white text-lg mb-4">No team data found</p>
          <p className="text-[#555] text-sm">Please contact an administrator</p>
        </div>
      </div>
    );
  }

  const members = team.members || [];

  return (
    <div className="p-8 min-h-screen" style={{ background: "#0d0d0d" }}>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Team Management
            </h1>
            <p className="text-[#555] text-sm mt-2">Edit team members and manage positions</p>
          </div>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-4 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            style={{ background: "", color: "white" }}
          >
            <Plus size={18} /> Add Member
          </button>
        </div>

        {/* Team Info Card */}
        <div className="rounded-xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{team.name || "Leadership Team"}</h2>
              <p className="text-[#555] text-sm mt-1">{members.length} team members</p>
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ background: "rgba(168,85,247,0.1)" }}>
              <p className="text-yellow-400 text-sm font-medium">Team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map(member => (
            <div
              key={member.id}
              className="rounded-xl border overflow-hidden transition-all hover:border-yellow-400/30"
              style={{ background: "#111", borderColor: "#1f1f1f" }}
            >
              {/* Member Card */}
              <div className="p-6">
                {/* Avatar */}
                <div className="mb-4 flex justify-center">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover border-2"
                      style={{ borderColor: "#a855f7" }}
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
                    >
                      {member.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Member Info */}
                <div className="text-center mb-4">
                  <h3 className="text-white font-semibold text-lg mb-1">{member.name || "Unknown"}</h3>
                  <p className="text-yellow-400 text-sm font-medium mb-2">{member.position || "Team Member"}</p>
                  {member.email && <p className="text-[#555] text-xs">{member.email}</p>}
                </div>

                {editingMember === member.id ? (
                  <div className="mb-4 space-y-3">
                    <div>
                      <label className="text-[#666] text-xs mb-1.5 block">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none border"
                        style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                      />
                    </div>
                    <div>
                      <label className="text-[#666] text-xs mb-1.5 block">Position</label>
                      <input
                        type="text"
                        value={editForm.position}
                        onChange={e => setEditForm({ ...editForm, position: e.target.value })}
                        placeholder="e.g. Lead Developer"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none border"
                        style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                      />
                    </div>
                    <div>
                      <label className="text-[#666] text-xs mb-1.5 block">Image URL</label>
                      <input
                        type="text"
                        value={editForm.image}
                        onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                        placeholder="e.g. https://example.com/image.jpg"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none border"
                        style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                      />
                    </div>
                    <div>
                      <label className="text-[#666] text-xs mb-1.5 block">LinkedIn URL</label>
                      <input
                        type="text"
                        value={editForm.linkedin}
                        onChange={e => setEditForm({ ...editForm, linkedin: e.target.value })}
                        placeholder="e.g. https://linkedin.com/in/username"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none border"
                        style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                      />
                    </div>
                    <div>
                      <label className="text-[#666] text-xs mb-1.5 block">Instagram URL</label>
                      <input
                        type="text"
                        value={editForm.insta} 
                        onChange={e => setEditForm({ ...editForm, insta: e.target.value })}
                        placeholder="e.g. https://instagram.com/username"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none border"
                        style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                      />
                    </div>
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {editingMember === member.id ? (
                    <>
                      <button
                        onClick={() => updateMember(member.id)}
                        className="flex-1 cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          color: "#22c55e"
                        }}
                      >
                        <Edit2 size={14} />
                        Done
                      </button>
                      <button
                        onClick={() => {
                          setEditingMember(null);
                          setEditForm({ name: "", position: "", image: "", linkedin: "", insta: "" });
                        }}
                        className="flex-1 cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: "rgba(107,114,128,0.1)",
                          color: "#9ca3af"
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditingMember(member)}
                        className="flex-1 cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        style={{
                          background: "rgba(168,85,247,0.1)",
                          color: "#a855f7"
                        }}
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="px-3 cursor-pointer py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444"
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-white text-lg mb-2">No team members yet</p>
          <p className="text-[#555] text-sm">Add your first team member to get started</p>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowAddMember(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "#111", border: "1px solid #2a2a2a" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold text-lg mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Add Team Member
            </h3>
            <div className="space-y-4">
              {[
                { label: "Full Name *", field: "name", placeholder: "e.g. Rahul Sharma" },
                { label: "Position", field: "position", placeholder: "e.g. Lead Developer" },
                { label: "Image URL", field: "image", placeholder: "e.g. https://example.com/image.jpg" },
                { label: "LinkedIn URL", field: "linkedin", placeholder: "e.g. https://linkedin.com/in/rahulsharma" },
                { label: "Instagram URL", field: "insta", placeholder: "e.g. https://instagram.com/rahulsharma" },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="text-[#666] text-xs mb-1.5 block">{label}</label>
                  <input
                    type="text"
                    value={memberForm[field]}
                    onChange={e => setMemberForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border"
                    style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                  />
                </div>
              ))}
              <div>

              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addMember} className="flex-1 cursor-pointer py-2.5 rounded-lg text-sm font-semibold" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}>
                Add Member
              </button>
              <button onClick={() => setShowAddMember(false)} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: "#1a1a1a", color: "#666" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
