// services/deleteTeamMember.js
import supabase from "./supabaseClient";

export default async function deleteTeamMember(memberId) {
  const session = await supabase.auth.getSession();

  const res = await fetch(`http://localhost:5000/api/teams/${memberId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data.session.access_token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to delete member");
  }

  return res.json();
}
