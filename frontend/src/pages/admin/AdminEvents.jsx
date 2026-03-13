import { useState, useRef } from "react";

const initialEvents = [
  {
    id: 1,
    name: "Hackathon 2025",
    date: "Mar 28, 2025",
    description: "36-hour coding marathon with prizes worth ₹50,000",
    status: "upcoming",
    participants: [
      { id: 1, name: "Rahul Sharma", email: "rahul@college.edu", certificate: null },
      { id: 2, name: "Aman Verma", email: "aman@college.edu", certificate: "cert_aman.pdf" },
      { id: 3, name: "Priya Mehta", email: "priya@college.edu", certificate: null },
    ],
  },
  {
    id: 2,
    name: "WebDev Workshop",
    date: "Mar 15, 2025",
    description: "Full-stack web development workshop for beginners",
    status: "upcoming",
    participants: [
      { id: 4, name: "Sneha Roy", email: "sneha@college.edu", certificate: null },
    ],
  },
  {
    id: 3,
    name: "Open Source Sprint",
    date: "Feb 10, 2025",
    description: "Contribute to open source projects over 2 days",
    status: "completed",
    participants: [
      { id: 5, name: "Karan Gupta", email: "karan@college.edu", certificate: "cert_karan.pdf" },
      { id: 6, name: "Ananya Singh", email: "ananya@college.edu", certificate: "cert_ananya.pdf" },
    ],
  },
];

export default function AdminEvents() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[0]);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [eventForm, setEventForm] = useState({ name: "", date: "", description: "" });
  const [participantForm, setParticipantForm] = useState({ name: "", email: "" });
  const [sendingAll, setSendingAll] = useState(false);
  const [sent, setSent] = useState({});
  const certRef = useRef();
  const [certTarget, setCertTarget] = useState(null);

  const getEvent = (id) => events.find(e => e.id === id);
  const current = getEvent(selectedEvent?.id) || events[0];

  const createEvent = () => {
    if (!eventForm.name || !eventForm.date) return;
    const newEvent = { id: Date.now(), ...eventForm, status: "upcoming", participants: [] };
    setEvents(prev => [...prev, newEvent]);
    setSelectedEvent(newEvent);
    setEventForm({ name: "", date: "", description: "" });
    setShowNewEvent(false);
  };

  const addParticipant = () => {
    if (!participantForm.name) return;
    const updated = events.map(e =>
      e.id === current.id
        ? { ...e, participants: [...e.participants, { id: Date.now(), ...participantForm, certificate: null }] }
        : e
    );
    setEvents(updated);
    setSelectedEvent(updated.find(e => e.id === current.id));
    setParticipantForm({ name: "", email: "" });
    setShowAddParticipant(false);
  };

  const removeParticipant = (pId) => {
    const updated = events.map(e =>
      e.id === current.id
        ? { ...e, participants: e.participants.filter(p => p.id !== pId) }
        : e
    );
    setEvents(updated);
    setSelectedEvent(updated.find(e => e.id === current.id));
  };

  const uploadCert = (pId, file) => {
    if (!file) return;
    const updated = events.map(e =>
      e.id === current.id
        ? { ...e, participants: e.participants.map(p => p.id === pId ? { ...p, certificate: file.name } : p) }
        : e
    );
    setEvents(updated);
    setSelectedEvent(updated.find(e => e.id === current.id));
    setCertTarget(null);
  };

  const sendCertificate = (pId) => {
    setSent(prev => ({ ...prev, [pId]: true }));
  };

  const sendAll = () => {
    setSendingAll(true);
    const ids = {};
    current.participants.filter(p => p.certificate).forEach(p => { ids[p.id] = true; });
    setTimeout(() => { setSent(prev => ({ ...prev, ...ids })); setSendingAll(false); }, 1500);
  };

  const statusColor = { upcoming: "#0ea5e9", completed: "#10b981" };

  return (
    <div className="p-8 min-h-screen" style={{ background: "#0d0d0d" }}>
      <input ref={certRef} type="file" accept=".pdf" className="hidden" onChange={e => certTarget && uploadCert(certTarget, e.target.files[0])} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Event Management</h1>
          <p className="text-[#555] text-sm mt-1">Create events, manage participants and send certificates</p>
        </div>
        <button
          onClick={() => setShowNewEvent(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}
        >
          <span>+</span> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Sidebar */}
        <div>
          <div className="rounded-xl border overflow-hidden" style={{ background: "#111", borderColor: "#1f1f1f" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#1f1f1f" }}>
              <p className="text-[#666] text-xs font-medium uppercase tracking-wider">Events ({events.length})</p>
            </div>
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="px-4 py-4 cursor-pointer hover:bg-[#161616] border-b transition-colors"
                style={{
                  background: current?.id === event.id ? "#161616" : "transparent",
                  borderColor: "#1f1f1f"
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-white text-sm font-medium leading-tight">{event.name}</p>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0"
                    style={{ background: `${statusColor[event.status]}18`, color: statusColor[event.status] }}
                  >
                    {event.status}
                  </span>
                </div>
                <p className="text-[#555] text-xs">{event.date}</p>
                <p className="text-[#444] text-xs mt-1">{event.participants.length} participants</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event Details */}
        <div className="lg:col-span-2 space-y-4">
          {current && (
            <>
              {/* Event Info */}
              <div className="rounded-xl border p-5" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-white text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{current.name}</h2>
                    <p className="text-[#555] text-sm mt-0.5">{current.date}</p>
                    <p className="text-[#666] text-sm mt-1">{current.description}</p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: `${statusColor[current.status]}18`, color: statusColor[current.status] }}
                  >
                    {current.status}
                  </span>
                </div>
                <div className="flex gap-3 flex-wrap mt-4">
                  <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg" style={{ background: "#1a1a1a" }}>
                    <span className="text-[#666]">👥</span>
                    <span className="text-white">{current.participants.length} Participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg" style={{ background: "#1a1a1a" }}>
                    <span className="text-[#666]">🎓</span>
                    <span className="text-white">{current.participants.filter(p => p.certificate).length} Certs uploaded</span>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="rounded-xl border" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#1f1f1f" }}>
                  <h3 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Participants</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={sendAll}
                      disabled={sendingAll || current.participants.filter(p => p.certificate).length === 0}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 flex items-center gap-1"
                      style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}
                    >
                      {sendingAll ? "Sending..." : "📧 Send All Certs"}
                    </button>
                    <button
                      onClick={() => setShowAddParticipant(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
                <div className="divide-y" style={{ borderColor: "#1f1f1f" }}>
                  {current.participants.map(p => (
                    <div key={p.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[#161616] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{p.name}</p>
                        <p className="text-[#555] text-xs">{p.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.certificate ? (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                            📄 {p.certificate}
                          </span>
                        ) : (
                          <button
                            onClick={() => { setCertTarget(p.id); certRef.current.click(); }}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ background: "#1a1a1a", color: "#666", border: "1px solid #2a2a2a" }}
                          >
                            Upload Cert
                          </button>
                        )}
                        {p.certificate && (
                          <button
                            onClick={() => sendCertificate(p.id)}
                            disabled={sent[p.id]}
                            className="text-xs px-2 py-1 rounded-lg disabled:opacity-50 transition-colors"
                            style={{
                              background: sent[p.id] ? "rgba(16,185,129,0.12)" : "rgba(14,165,233,0.12)",
                              color: sent[p.id] ? "#10b981" : "#0ea5e9"
                            }}
                          >
                            {sent[p.id] ? "✓ Sent" : "Send"}
                          </button>
                        )}
                        <button
                          onClick={() => removeParticipant(p.id)}
                          className="text-[#333] hover:text-red-500 transition-colors text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {current.participants.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-3xl mb-2">👥</p>
                      <p className="text-[#444] text-sm">No participants yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Event Modal */}
      {showNewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setShowNewEvent(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#111", border: "1px solid #2a2a2a" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create New Event</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Event Name *</label>
                <input value={eventForm.name} onChange={e => setEventForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. AI Hackathon 2025" className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border" style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }} />
              </div>
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Event Date *</label>
                <input type="date" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border" style={{ background: "#0d0d0d", borderColor: "#2a2a2a", colorScheme: "dark" }} />
              </div>
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Description</label>
                <textarea value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief event description..." rows={3} className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border resize-none" style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={createEvent} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}>
                Create Event
              </button>
              <button onClick={() => setShowNewEvent(false)} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: "#1a1a1a", color: "#666" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setShowAddParticipant(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#111", border: "1px solid #2a2a2a" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Add Participant</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Name *</label>
                <input value={participantForm.name} onChange={e => setParticipantForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border" style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }} />
              </div>
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Email</label>
                <input value={participantForm.email} onChange={e => setParticipantForm(f => ({ ...f, email: e.target.value }))} placeholder="email@college.edu" className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border" style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addParticipant} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}>
                Add Participant
              </button>
              <button onClick={() => setShowAddParticipant(false)} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: "#1a1a1a", color: "#666" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
