import { useState, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { Search } from "lucide-react";
const SUPABASE_URL = "https://vvmucctcaaagfxdvzccj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_m8LhxxVliAONC77JfzKrOg_zA60bxGa";
const TABLE_NAME = "members";

export const MemberProfilePage = () => {
  const [members, setMembers] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch members");

        const data = await response.json();
        setMembers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const yearLabels = [
    { value: "All", label: "All" },
    { value: 1, label: "1st Year" },
    { value: 2, label: "2nd Year" },
    { value: 3, label: "3rd Year" },
    { value: 4, label: "4th Year" },
  ];

  const filteredMembers = (
    selectedYear === "All"
      ? [...members].sort((a, b) => {
          if (Number(a.year) !== Number(b.year))
            return Number(a.year) - Number(b.year);
          return a.name.localeCompare(b.name);
        })
      : members
          .filter((m) => Number(m.year) === Number(selectedYear))
          .sort((a, b) => a.name.localeCompare(b.name))
  ).filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(m.rollno).includes(searchQuery)
  );

  return (
    <div className="min-h-screen w-full bg-slate-900 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Members</h1>
          <p className="text-slate-400 text-sm">{members.length} total members</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-3 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Year Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {yearLabels.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedYear(value)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-all duration-200
                ${selectedYear === value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="text-center text-slate-400 py-20 text-sm animate-pulse">
            Loading members...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-6 text-sm">
            Error: {error}
          </div>
        )}

        {/* Members List */}
        {!loading && !error && (
          <div className="flex flex-col gap-4">
            {filteredMembers.length === 0 ? (
              <div className="text-center text-slate-500 py-20 text-sm">
                No members found.
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-5 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 hover:border-indigo-500/40 transition-all duration-200"
                >
                  {/* Avatar */}
                  {member.profile_image ? (
                    <img
                      src={member.profile_image}
                      alt={member.name.charAt(0).toUpperCase()}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center shrink-0 ring-2 ring-indigo-500/20">
                      <CgProfile size={36} className="text-indigo-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-wrap gap-x-10 gap-y-1 items-center">
                    <h3 className="text-white font-semibold text-base w-full">
                      {member.name}
                    </h3>
                    <span className="text-slate-400 text-sm">
                      Year: <span className="text-slate-200 font-medium">{member.year}</span>
                    </span>
                    <span className="text-slate-400 text-sm">
                      Roll No: <span className="text-slate-200 font-medium">{member.rollno}</span>
                    </span>
                  </div>

                  {/* Year Badge */}
                  <div className="ml-auto shrink-0">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/20">
                      Year {member.year}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};