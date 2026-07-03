import { useState, useRef, useCallback, useEffect } from "react";
import { Zap, X, RotateCcw } from "lucide-react";

function useSounds() {
  const ctxRef = useRef(null);
  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };

  const playClick = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.12);
  }, []);

  const playRoll = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    for (let i = 0; i < 8; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(250 + i * 30, now + i * 0.1);
      gain.gain.setValueAtTime(0.07, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.08);
    }
  }, []);

  const playWin = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.4);
    });
  }, []);

  const playLose = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.4);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.4);
  }, []);

  const playTap = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.08);
  }, []);

  const playClose = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.15);
  }, []);

  return { playClick, playRoll, playWin, playLose, playTap, playClose };
}

function GlitchText({ children, className = "" }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="absolute inset-0 text-[#ff3b3b] opacity-70" style={{ animation: "glitchA 3.2s infinite", clipPath: "inset(0 0 60% 0)" }} aria-hidden="true">{children}</span>
      <span className="absolute inset-0 text-[#5DA9FF] opacity-60" style={{ animation: "glitchB 3.2s infinite", clipPath: "inset(60% 0 0 0)" }} aria-hidden="true">{children}</span>
      <span className="relative">{children}</span>
    </span>
  );
}

export default function SmallBigCall() {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(null); // "small" | "big"
  const [rolling, setRolling] = useState(false);
  const [num, setNum] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [rounds, setRounds] = useState(0);
  const [wins, setWins] = useState(0);
  const [pingMs, setPingMs] = useState(21);
  const [displayNum, setDisplayNum] = useState(0);
  const [cooldownMs, setCooldownMs] = useState(0);
  const nextAvailableAtRef = useRef(0);
  const { playClick, playRoll, playWin, playLose, playTap, playClose } = useSounds();

  // Real-time-based cooldown: recompute from an absolute timestamp every tick,
  // so it stays accurate even if the tab is backgrounded/throttled.
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => {
      const remaining = nextAvailableAtRef.current - Date.now();
      setCooldownMs(remaining > 0 ? remaining : 0);
    }, 250);
    return () => clearInterval(iv);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => setPingMs(14 + Math.floor(Math.random() * 20)), 900);
    return () => clearInterval(iv);
  }, [open]);

  useEffect(() => {
    if (!rolling) return;
    const iv = setInterval(() => setDisplayNum(Math.floor(Math.random() * 10)), 70);
    return () => clearInterval(iv);
  }, [rolling]);

  const openPopup = () => {
    playClick();
    setPick(null); setNum(null); setOutcome(null);
    setOpen(true);
  };
  const closePopup = () => { playClose(); setOpen(false); };

  const choose = (side) => {
    if (rolling) return;
    playTap();
    setPick(side); setNum(null); setOutcome(null);
  };

  const roll = () => {
    if (!pick || rolling) return;
    playRoll();
    setRolling(true);
    setRounds((r) => r + 1);
    const finalNum = Math.floor(Math.random() * 10); // 0-9
    setTimeout(() => {
      setRolling(false);
      setNum(finalNum);
      const side = finalNum <= 4 ? "small" : "big";
      const win = side === pick;
      setOutcome(win ? "win" : "lose");
      if (win) { playWin(); setWins((w) => w + 1); } else playLose();
    }, 1400);
  };

  const resetRound = () => { playTap(); setPick(null); setNum(null); setOutcome(null); };

  const streakPct = rounds > 0 ? Math.round((wins / rounds) * 100) : 0;
  const resultSide = num !== null ? (num <= 4 ? "small" : "big") : null;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono relative overflow-hidden">
      <style>{`
        @keyframes glitchA { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-2px,1px)} 40%{transform:translate(2px,-1px)} 60%{transform:translate(-1px,0)} 80%{transform:translate(1px,1px)} }
        @keyframes glitchB { 0%,100%{transform:translate(0,0)} 25%{transform:translate(2px,-1px)} 50%{transform:translate(-2px,1px)} 75%{transform:translate(1px,-1px)} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 20px 4px rgba(255,59,59,0.5),inset 0 0 30px rgba(255,59,59,0.15)} 50%{box-shadow:0 0 45px 10px rgba(255,59,59,0.8),inset 0 0 40px rgba(255,59,59,0.25)} }
        @keyframes spin360 { to { transform: rotate(360deg); } }
        @keyframes spin360rev { to { transform: rotate(-360deg); } }
        @keyframes popIn { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.05);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
        @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:0.85} }
        @keyframes numPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <p className="text-[#ff3b3b] text-xs tracking-[0.35em] uppercase mb-2">System Ready</p>
          <h1 className="text-white text-2xl font-semibold">Tap Start</h1>
          <p className="text-white/40 text-sm mt-2">Opens a small/big number call — pure chance, for fun</p>
        </div>

        <button
          onClick={openPopup}
          className="w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform border border-[#ff3b3b]/60"
          style={{ background: "linear-gradient(90deg, #2a0000, #1a0000)", animation: "ringPulse 2.2s ease-in-out infinite" }}
        >
          <Zap size={18} strokeWidth={2.5} className="text-[#ff3b3b]" />
          START
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-5 z-50" onClick={closePopup}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative rounded-full flex items-center justify-center"
            style={{ width: 340, height: 340, animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
          >
            <div className="absolute inset-0 rounded-full" style={{ border: "3px solid rgba(255,59,59,0.5)", animation: "spin360 18s linear infinite" }} />
            <div className="absolute inset-2 rounded-full" style={{ border: "1px solid rgba(255,59,59,0.3)", animation: "spin360rev 24s linear infinite" }} />
            <div className="absolute inset-3 rounded-full" style={{ border: "4px solid #ff3b3b", animation: "ringPulse 2.2s ease-in-out infinite" }} />

            <div
              className="absolute inset-8 rounded-full flex flex-col items-center justify-center px-6 text-center overflow-hidden"
              style={{ background: "radial-gradient(circle at 50% 30%, #1a0505, #0a0202 75%)" }}
            >
              <div className="absolute left-0 right-0 h-16 pointer-events-none" style={{ background: "linear-gradient(rgba(255,59,59,0) 0%, rgba(255,59,59,0.08) 50%, rgba(255,59,59,0) 100%)", animation: "scan 3s linear infinite" }} />

              <button onClick={closePopup} className="absolute top-3 right-3 text-white/40 hover:text-white z-10">
                <X size={18} />
              </button>

              <div className="border border-[#ff3b3b]/50 rounded-lg px-3 py-1 mb-3 text-[#ff8a8a] text-[11px] tracking-widest" style={{ animation: "flicker 4s infinite" }}>
                @byflovex
              </div>

              <p className="text-[#ff8a8a] text-[10px] tracking-[0.25em] uppercase mb-1">Small / Big Terminal</p>
              <h2 className="text-white text-xl font-bold mb-3">
                <GlitchText>[ {rolling ? "ROLLING" : num !== null ? "RESULT" : "READY"} ]</GlitchText>
              </h2>

              <div className="flex gap-2 mb-3 text-[10px]">
                <div className="border border-[#ff3b3b]/40 rounded px-2 py-1">
                  <div className="text-[#ff8a8a] tracking-wider">ROUND</div>
                  <div className="text-white font-bold">{rounds}</div>
                </div>
                <div className="border border-[#ff3b3b]/40 rounded px-2 py-1">
                  <div className="text-[#ff8a8a] tracking-wider">PING</div>
                  <div className="text-yellow-300 font-bold">{pingMs}ms</div>
                </div>
                <div className="border border-[#ff3b3b]/40 rounded px-2 py-1">
                  <div className="text-[#ff8a8a] tracking-wider">STREAK</div>
                  <div className="text-white font-bold">{streakPct}%</div>
                </div>
              </div>

              {/* number display */}
              <div
                key={rolling ? "rolling" : `still-${num}`}
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold select-none mb-3"
                style={{
                  background: "linear-gradient(135deg, #ff5c5c, #7a0000)",
                  color: "#fff",
                  boxShadow: "0 0 0 3px rgba(255,59,59,0.25), 0 6px 18px rgba(0,0,0,0.6)",
                  animation: !rolling && num !== null ? "numPop 0.4s ease-out" : "none",
                }}
              >
                {rolling ? displayNum : num !== null ? num : "?"}
              </div>

              {!num && (
                <div className="flex gap-2 mb-3 w-full max-w-[220px]">
                  {["small", "big"].map((side) => (
                    <button
                      key={side}
                      onClick={() => choose(side)}
                      disabled={rolling}
                      className="flex-1 py-2 rounded-md text-xs font-bold capitalize tracking-wide transition-all active:scale-95"
                      style={{
                        background: pick === side ? "#ff3b3b" : "rgba(255,59,59,0.08)",
                        color: pick === side ? "#0a0202" : "#ff8a8a",
                        border: "1px solid rgba(255,59,59,0.4)",
                      }}
                    >
                      {side} {side === "small" ? "(0-4)" : "(5-9)"}
                    </button>
                  ))}
                </div>
              )}

              {!num ? (
                <button
                  onClick={roll}
                  disabled={!pick || rolling}
                  className="text-white font-bold text-xs tracking-widest py-2.5 px-6 rounded-md transition-transform active:scale-95 disabled:opacity-30 flex items-center gap-2"
                  style={{ background: "linear-gradient(90deg, #ff3b3b, #a80000)" }}
                >
                  <Zap size={13} />
                  {rolling ? "ROLLING..." : "EXECUTE ROLL"}
                </button>
              ) : (
                <div className="w-full max-w-[220px]">
                  <p className="text-white text-sm font-bold capitalize mb-0.5">
                    {num} is {resultSide} {outcome === "win" ? "— you called it" : "— missed"}
                  </p>
                  <p className="text-white/40 text-[10px] mb-2">picked: {pick}</p>
                  <button
                    onClick={resetRound}
                    className="w-full flex items-center justify-center gap-1.5 text-[#ff8a8a] text-xs font-semibold py-2 rounded-md border border-[#ff3b3b]/40"
                  >
                    <RotateCcw size={12} /> roll again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
