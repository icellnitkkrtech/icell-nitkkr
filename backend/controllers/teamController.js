import supabase from "../services/supabaseClient.js"

export const getTeams = async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("team")
      .select("*")

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json(data)

  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }

}