import { useState } from "react";

const initialTeams = [
  {
    id: 1,
    name: "Technical Team",
    color: "#6366f1",
    members: [
      { id: 1, name: "Rahul Sharma", position: "Lead", email: "rahul@college.edu" },
      { id: 2, name: "Aman Verma", position: "Developer", email: "aman@college.edu" },
      { id: 3, name: "Priya Mehta", position: "Designer", email: "priya@college.edu" },
    ],
  },
  {
    id: 2,
    name: "Marketing Team",
    color: "#a855f7",
    members: [
      { id: 4, name: "Sneha Roy", position: "Lead", email: "sneha@college.edu" },
      { id: 5, name: "Karan Gupta", position: "Content Writer", email: "karan@college.edu" },
    ],
  },
  {
    id: 3,
    name: "Events Team",
    color: "#0ea5e9",
    members: [
      { id: 6, name: "Ananya Singh", position: "Coordinator", email: "ananya@college.edu" },
      { id: 7, name: "Rohit Patel", position: "Logistics", email: "rohit@college.edu" },
      { id: 8, name: "Maya Iyer", position: "Volunteer Head", email: "maya@college.edu" },
    ],
  },
];

const positions = ["Lead", "Co-Lead", "Developer", "Designer", "Content Writer", "Coordinator", "Logistics", "Volunteer Head", "Member"];

export default function AdminTeams() {
  const [teams, setTeams] = useState(initialTeams);
  const [selectedTeam, setSelectedTeam] = useState(initialTeams[0]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: "", email: "", position: "Member" });
  const [teamForm, setTeamForm] = useState({ name: "", color: "#a855f7" });
  const [editMember, setEditMember] = useState(null);

  const getTeam = (id) => teams.find(t => t.id === id);

  const addMember = () => {
    if (!memberForm.name) return;
    const updated = teams.map(t =>
      t.id === selectedTeam.id
        ? { ...t, members: [...t.members, { id: Date.now(), ...memberForm }] }
        : t
    );
    setTeams(updated);
    setSelectedTeam(updated.find(t => t.id === selectedTeam.id));
    setMemberForm({ name: "", email: "", position: "Member" });
    setShowAddMember(false);
  };

  const removeMember = (memberId) => {
    const updated = teams.map(t =>
      t.id === selectedTeam.id
        ? { ...t, members: t.members.filter(m => m.id !== memberId) }
        : t
    );
    setTeams(updated);
    setSelectedTeam(updated.find(t => t.id === selectedTeam.id));
  };

  const updateMemberPosition = (memberId, position) => {
    const updated = teams.map(t =>
      t.id === selectedTeam.id
        ? { ...t, members: t.members.map(m => m.id === memberId ? { ...m, position } : m) }
        : t
    );
    setTeams(updated);
    setSelectedTeam(updated.find(t => t.id === selectedTeam.id));
    setEditMember(null);
  };

  const addTeam = () => {
    if (!teamForm.name) return;
    const newTeam = { id: Date.now(), name: teamForm.name, color: teamForm.color, members: [] };
    setTeams(prev => [...prev, newTeam]);
    setTeamForm({ name: "", color: "#a855f7" });
    setShowAddTeam(false);
  };

  const deleteTeam = (id) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    if (selectedTeam.id === id) setSelectedTeam(teams.find(t => t.id !== id));
  };

  const currentTeam = getTeam(selectedTeam?.id) || teams[0];

  return (
    <div className="p-8 min-h-screen" style={{ background: "#0d0d0d" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Team Management</h1>
          <p className="text-[#555] text-sm mt-1">Create teams and assign member positions</p>
        </div>
        <button
          onClick={() => setShowAddTeam(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}
        >
          <span className="text-lg">+</span> New Team
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div>
          <div className="rounded-xl border overflow-hidden" style={{ background: "#111", borderColor: "#1f1f1f" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#1f1f1f" }}>
              <p className="text-[#666] text-xs font-medium uppercase tracking-wider">All Teams ({teams.length})</p>
            </div>
            <div className="divide-y" style={{ borderColor: "#1f1f1f" }}>
              {teams.map(team => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className="px-4 py-4 cursor-pointer hover:bg-[#161616] transition-colors flex items-center gap-3"
                  style={{ background: currentTeam?.id === team.id ? "#161616" : "transparent" }}
                >
                  <div
                    className="w-2.5 h-8 rounded-full flex-shrink-0"
                    style={{ background: team.color }}
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{team.name}</p>
                    <p className="text-[#555] text-xs">{team.members.length} members</p>
                  </div>
                  {currentTeam?.id === team.id && (
                    <span className="text-[#555]">›</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {currentTeam && (
            <div className="rounded-xl border" style={{ background: "#111", borderColor: "#1f1f1f" }}>
              {/* Team Header */}
              <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "#1f1f1f" }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: currentTeam.color }} />
                  <h2 className="text-white font-semibold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentTeam.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${currentTeam.color}18`, color: currentTeam.color }}>
                    {currentTeam.members.length} members
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}
                  >
                    + Add Member
                  </button>
                  <button
                    onClick={() => deleteTeam(currentTeam.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                  >
                    Delete Team
                  </button>
                </div>
              </div>

              {/* Members */}
              <div className="divide-y" style={{ borderColor: "#1f1f1f" }}>
                {currentTeam.members.map(member => (
                  <div key={member.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#161616] transition-colors">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: `${currentTeam.color}20`, color: currentTeam.color }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{member.name}</p>
                      <p className="text-[#555] text-xs">{member.email}</p>
                    </div>
                    {editMember === member.id ? (
                      <select
                        defaultValue={member.position}
                        onChange={e => updateMemberPosition(member.id, e.target.value)}
                        className="text-xs rounded-lg px-2 py-1.5 outline-none"
                        style={{ background: "#1a1a1a", color: "#fff", border: "1px solid #2a2a2a" }}
                        autoFocus
                        onBlur={() => setEditMember(null)}
                      >
                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditMember(member.id)}
                        className="text-xs px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
                        style={{ background: `${currentTeam.color}15`, color: currentTeam.color }}
                      >
                        {member.position} ✎
                      </button>
                    )}
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-[#444] hover:text-red-500 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {currentTeam.members.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-[#444] text-sm">No members yet. Add your first member!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setShowAddMember(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#111", border: "1px solid #2a2a2a" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Add Member to {currentTeam?.name}</h3>
            <div className="space-y-4">
              {[
                { label: "Full Name *", field: "name", placeholder: "e.g. Rahul Sharma" },
                { label: "Email", field: "email", placeholder: "e.g. rahul@college.edu" },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="text-[#666] text-xs mb-1.5 block">{label}</label>
                  <input
                    value={memberForm[field]}
                    onChange={e => setMemberForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border"
                    style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Position</label>
                <select
                  value={memberForm.position}
                  onChange={e => setMemberForm(f => ({ ...f, position: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border"
                  style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                >
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addMember} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}>
                Add Member
              </button>
              <button onClick={() => setShowAddMember(false)} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: "#1a1a1a", color: "#666" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setShowAddTeam(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#111", border: "1px solid #2a2a2a" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create New Team</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Team Name *</label>
                <input
                  value={teamForm.name}
                  onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Design Team"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border"
                  style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
                />
              </div>
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Team Color</label>
                <div className="flex gap-2">
                  {["#a855f7", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"].map(c => (
                    <button
                      key={c}
                      onClick={() => setTeamForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{ background: c, outline: teamForm.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addTeam} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}>
                Create Team
              </button>
              <button onClick={() => setShowAddTeam(false)} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: "#1a1a1a", color: "#666" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
