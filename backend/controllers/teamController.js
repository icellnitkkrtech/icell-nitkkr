


import supabase from "../services/supabaseClient.js";

export const getTeams = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("team")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    // ✅ Normalise "insta" → "instagram" so the frontend never needs to know
    //    about the DB column name. One place to fix, everywhere works.
    const normalised = (data ?? []).map((m) => ({
      ...m,
      instagram: m.instagram ?? m.insta ?? null,
    }));

    res.json(normalised);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }

}


export const addTeamMember = async (req, res) => {
  try {
    const { name, position, image, linkedin, instagram } = req.body

    if (!name) {
      return res.status(400).json({ error: "Name  required" })
    }

    const { data, error } = await supabase
      .from("team")
      .insert([
        {
          name: name,
          position: position,
          image: image,
          linkedin: linkedin,
          insta: instagram
        }
      ]);

    if (error) throw error

    res.status(201).json(data)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params
    const { name, position, image, linkedin, insta } = req.body

    if (!id) {
      return res.status(400).json({ error: "Member ID required" })
    }

    const { data, error } = await supabase
      .from("team")
      .update({
        name: name,
        position: position,
        image: image,
        linkedin: linkedin,
        insta: insta
      })
      .eq("id", id)
      .select()

    if (error) throw error

    res.json(data[0])

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: "Member ID required" })
    }

    const { error } = await supabase
      .from("team")
      .delete()
      .eq("id", id)

    if (error) throw error

    res.json({ message: "Member deleted successfully" })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}