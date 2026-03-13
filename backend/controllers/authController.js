import {
  createAuthUser,
  insertUserProfile,
  loginUser
} from "../models/authModel.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {

    const { data, error } = await createAuthUser(email, password);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;

    const { error: profileError } = await insertUserProfile(
      user.id,
      name,
      email
    );

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    res.json({
      message: "User created successfully",
      user
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const { data, error } = await loginUser(email, password);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Login successful",
      session: data.session,
      user: data.user
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};