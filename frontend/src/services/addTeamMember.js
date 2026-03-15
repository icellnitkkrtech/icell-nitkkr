// services/addTeamMember.js
import supabase from "./supabaseClient";

export default async function addTeamMember(member) {
  const session = await supabase.auth.getSession();

  const res = await fetch("http://localhost:5000/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.access_token}`
    },
    body: JSON.stringify(member)
  });

  if (!res.ok) {
    throw new Error("Failed to add member");
  }

  return res.json();
}