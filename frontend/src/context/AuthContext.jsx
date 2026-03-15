import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // send the session id to backend
      const res = await fetch(`http://localhost:5000/api/users/${sessionUser.id}`);
      const profile = await res.json();


      setUser({
        ...sessionUser,
        role: profile.role,
      });

    } catch (err) {
      console.error("Failed to fetch profile:", err);

      // fallback if API fails
      setUser(sessionUser);
    }

    setLoading(false);
  };

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      await loadUser(sessionUser);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await loadUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);