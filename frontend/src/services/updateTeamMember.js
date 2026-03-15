// services/updateTeamMember.js
import supabase from "./supabaseClient";

export default async function updateTeamMember(memberId, memberData) {
  const session = await supabase.auth.getSession();

  const res = await fetch(`http://localhost:5000/api/teams/${memberId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.access_token}`
    },
    body: JSON.stringify(memberData)
  });

  if (!res.ok) {
    throw new Error("Failed to update member");
  }

  return res.json();
}
