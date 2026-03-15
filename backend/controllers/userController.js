import supabase from "../services/supabaseClient.js"

export const getUser = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .single()

  if (error) {
    return res.status(400).json(error)
  }

  res.json(data)
}