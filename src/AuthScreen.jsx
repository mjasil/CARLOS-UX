import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase auth is email-based under the hood; we map username -> a
  // synthetic email so users only ever see "username" in the UI.
  const emailFor = (u) => `${u.trim().toLowerCase()}@carlosux.local`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter a username and password.");
      return;
    }
    setLoading(true);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email: emailFor(username),
        password,
        options: { data: { username: username.trim() } },
      });
      if (signUpError) setError(signUpError.message);
      else onAuthed();
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailFor(username),
        password,
      });
      if (signInError) setError("Invalid username or password.");
      else onAuthed();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
      <div
        className="w-full max-w-[320px] rounded-xl p-6"
        style={{
          background: "radial-gradient(circle at 50% 20%, #1a0505, #0a0202 75%)",
          border: "2px solid #ff3b3b",
        }}
      >
        <h1 className="text-white text-xl font-bold text-center mb-1">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-white/40 text-xs text-center mb-6">Carlos UX</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoCapitalize="none"
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-[#ff3b3b]/60"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-[#ff3b3b]/60"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm py-2.5 rounded-lg disabled:opacity-50"
            style={{ background: "linear-gradient(90deg, #ff3b3b, #a80000)" }}
          >
            {mode === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          className="w-full text-center text-white/40 text-xs mt-4 underline"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
