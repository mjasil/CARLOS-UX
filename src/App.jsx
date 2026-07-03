import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AuthScreen from "./AuthScreen";
import MainApp from "./MainApp";
import AdminPanel from "./AdminPanel";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error("Failed to load profile:", error);
        setProfile(data ?? null);
      });
  }, [session?.user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAdmin(false);
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/40 text-sm font-mono">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onAuthed={() => {}} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/40 text-sm font-mono">Setting up your account...</p>
      </div>
    );
  }

  return (
    <>
      <MainApp profile={profile} onLogout={handleLogout} onOpenAdmin={() => setShowAdmin(true)} />
      {showAdmin && profile.role === "admin" && (
        <AdminPanel onClose={() => setShowAdmin(false)} onSignOut={handleLogout} />
      )}
    </>
  );
}
