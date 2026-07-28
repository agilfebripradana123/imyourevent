import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // AMBIL PROFILE USER
  // =========================
  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, name, role, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Gagal mengambil profile:", error);
        setProfile(null);
        return null;
      }

      setProfile(data);

      return data;
    } catch (error) {
      console.error("Profile error:", error);

      setProfile(null);

      return null;
    }
  };

  useEffect(() => {
    // =========================
    // CEK SESSION PERTAMA KALI
    // =========================

    const getSession = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Gagal mengambil session:", error);

          setUser(null);
          setProfile(null);

          return;
        }

        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Session error:", error);

        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // =========================
    // LOGIN / LOGOUT LISTENER
    // =========================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout gagal:", error.message);

      return false;
    }

    setUser(null);
    setProfile(null);

    return true;
  };

  // =========================
  // ROLE
  // =========================

  const isAdmin = profile?.role === "admin";

  const value = {
    user,
    profile,
    isAdmin,
    loading,
    logout,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }

  return context;
}
