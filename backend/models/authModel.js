import supabase from "../services/supabaseClient.js";

export const createAuthUser = async (email, password) => {
  return await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
};

export const insertUserProfile = async (userId, name, email) => {
  return await supabase
    .from("profiles")
    .insert([
      {
        id: userId,
        name,
        email,
        role: "member"
      }
    ]);
};

export const loginUser = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};