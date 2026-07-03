import { useState, useRef, useCallback, useEffect } from "react";
import { Zap, X, Clock } from "lucide-react";

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

  const playReveal = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    [523.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.001, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.09); osc.stop(now + i * 0.09 + 0.4);
    });
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

  return { playClick, playRoll, playReveal, playClose };
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

const COOLDOWN_MS = 60 * 1000; // 1 real minute

export default function SmallBigReveal() {
  const [open, setOpen] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null); // "small" | "big"
  const [displayNum, setDisplayNum] = useState(0);
  const [cooldownMs, setCooldownMs] = useState(0);
  const nextAvailableAtRef = useRef(0);
  const { playClick, playRoll, playReveal, playClose } = useSounds();

  // Real-time-based countdown: derived from an absolute timestamp each tick,
  // so it stays accurate even if the tab is backgrounded or throttled.
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => {
      const remaining = nextAvailableAtRef.current - Date.now();
      setCooldownMs(remaining > 0 ? remaining : 0);
    }, 250);
    return () => clearInterval(iv);
  }, [open]);

  useEffect(() => {
    if (!rolling) return;
    const iv = setInterval(() => setDisplayNum(Math.floor(Math.random() * 10)), 70);
    return () => clearInterval(iv);
  }, [rolling]);

  const openPopup = () => {
    playClick();
    setResult(null);
    setOpen(true);
  };
  const closePopup = () => { playClose(); setOpen(false); };

  const generate = () => {
    if (rolling || cooldownMs > 0) return;
    playRoll();
    setRolling(true);
    setResult(null);

    setTimeout(() => {
      setRolling(false);
      const finalNum = Math.floor(Math.random() * 10); // 0-9
      const side = finalNum <= 4 ? "small" : "big";
      setResult(side);
      playReveal();
      nextAvailableAtRef.current = Date.now() + COOLDOWN_MS;
      setCooldownMs(COOLDOWN_MS);
    }, 1400);
  };

  const secondsLeft = Math.ceil(cooldownMs / 1000);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const locked = cooldownMs > 0;

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
        @keyframes resultPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <p className="text-[#ff3b3b] text-xs tracking-[0.35em] uppercase mb-2">System Ready</p>
          <h1 className="text-white text-2xl font-semibold">Tap Start</h1>
          <p className="text-white/40 text-sm mt-2">Opens a random small/big generator — one per minute</p>
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

              <p className="text-[#ff8a8a] text-[10px] tracking-[0.25em] uppercase mb-1">Small / Big Generator</p>
              <h2 className="text-white text-xl font-bold mb-4">
                <GlitchText>[ {rolling ? "ROLLING" : result ? result.toUpperCase() : "READY"} ]</GlitchText>
              </h2>

              <div
                key={rolling ? "rolling" : `still-${result}`}
                className="w-20 h-20 rounded-full flex items-center justify-center text-lg font-bold select-none mb-4"
                style={{
                  background: "linear-gradient(135deg, #ff5c5c, #7a0000)",
                  color: "#fff",
                  boxShadow: "0 0 0 3px rgba(255,59,59,0.25), 0 6px 18px rgba(0,0,0,0.6)",
                  animation: !rolling && result ? "resultPop 0.4s ease-out" : "none",
                }}
              >
                {rolling ? displayNum : result ? result.toUpperCase() : "?"}
              </div>

              {locked ? (
                <div className="flex items-center gap-2 text-[#ff8a8a] text-xs tracking-widest border border-[#ff3b3b]/40 rounded-md py-2.5 px-5">
                  <Clock size={13} />
                  NEXT IN {mm}:{ss}
                </div>
              ) : (
                <button
                  onClick={generate}
                  disabled={rolling}
                  className="text-white font-bold text-xs tracking-widest py-2.5 px-6 rounded-md transition-transform active:scale-95 disabled:opacity-30 flex items-center gap-2"
                  style={{ background: "linear-gradient(90deg, #ff3b3b, #a80000)" }}
                >
                  <Zap size={13} />
                  {rolling ? "ROLLING..." : "START"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
