import { useState, useRef, useCallback } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

// Synthesized sound effects via Web Audio API
function useSounds() {
  const ctxRef = useRef(null);
  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  };

  const playFlip = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(300 + i * 40, now + i * 0.13);
      gain.gain.setValueAtTime(0.08, now + i * 0.13);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.13 + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.13);
      osc.stop(now + i * 0.13 + 0.1);
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
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
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
    osc.start(now);
    osc.stop(now + 0.4);
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
    osc.start(now);
    osc.stop(now + 0.08);
  }, []);

  return { playFlip, playWin, playLose, playTap };
}

const PARTICLE_COLORS = ["#FFD65D", "#5EE6A8", "#5DA9FF", "#FF5D8F", "#B26EFF"];

function Confetti({ burstKey }) {
  const particles = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 100 + Math.random() * 100;
    return {
      id: `${burstKey}-${i}`,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 4 + Math.random() * 6,
      delay: Math.random() * 0.08,
    };
  });
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `burst 0.9s ease-out ${p.delay}s forwards`,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function CoinToss() {
  const [pick, setPick] = useState(null); // "heads" | "tails"
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null); // "heads" | "tails"
  const [outcome, setOutcome] = useState(null); // "win" | "lose"
  const [spins, setSpins] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const { playFlip, playWin, playLose, playTap } = useSounds();

  const choose = (side) => {
    if (flipping) return;
    playTap();
    setPick(side);
    setResult(null);
    setOutcome(null);
  };

  const toss = () => {
    if (!pick || flipping) return;
    playFlip();
    setFlipping(true);
    setResult(null);
    setOutcome(null);
    setSpins((s) => s + 1);

    const finalResult = Math.random() < 0.5 ? "heads" : "tails";

    setTimeout(() => {
      setFlipping(false);
      setResult(finalResult);
      const win = finalResult === pick;
      setOutcome(win ? "win" : "lose");
      setBurstKey((k) => k + 1);
      if (win) playWin();
      else playLose();
    }, 1500);
  };

  const reset = () => {
    playTap();
    setPick(null);
    setResult(null);
    setOutcome(null);
  };

  return (
    <div className="min-h-screen bg-[#08090C] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <style>{`
        @keyframes burst {
          to { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes drift {
          0% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(20px,-30px) rotate(180deg); }
          100% { transform: translate(0,0) rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes coinFlip {
          0% { transform: rotateY(0deg) translateY(0); }
          25% { transform: rotateY(900deg) translateY(-60px); }
          50% { transform: rotateY(1800deg) translateY(0); }
          75% { transform: rotateY(2700deg) translateY(-30px); }
          100% { transform: rotateY(3600deg) translateY(0); }
        }
        @keyframes coinIdle {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(20deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes glowGold {
          0%, 100% { box-shadow: 0 0 20px 0px rgba(255,214,93,0.4); }
          50% { box-shadow: 0 0 40px 6px rgba(255,214,93,0.7); }
        }
      `}</style>

      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, #FFD65D, transparent 70%)", top: "-5%", left: "-10%", animation: "drift 12s ease-in-out infinite" }}
      />
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #B26EFF, transparent 70%)", bottom: "-10%", right: "-10%", animation: "drift 15s ease-in-out infinite reverse" }}
      />

      <div className="w-full max-w-sm relative z-10 text-center">
        <p
          className="text-xs tracking-[0.35em] uppercase mb-2 font-semibold bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(90deg, #FFD65D, #FF5D8F, #B26EFF, #FFD65D)",
            backgroundSize: "200% auto",
            animation: "shimmer 3s linear infinite",
          }}
        >
          Toss Prediction
        </p>
        <h1 className="text-white text-2xl font-semibold mb-1">
          Pick a side, then flip
        </h1>
        <p className="text-white/40 text-sm mb-8">
          {spins > 0 ? `Round ${spins}` : "Fully random — heads or tails"}
        </p>

        {/* Coin */}
        <div className="flex items-center justify-center mb-8" style={{ perspective: "600px" }}>
          <div
            key={flipping ? "flipping" : `still-${result}`}
            className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold select-none"
            style={{
              background: "linear-gradient(135deg, #FFD65D, #E8A33D)",
              color: "#3A2A00",
              transformStyle: "preserve-3d",
              animation: flipping
                ? "coinFlip 1.5s cubic-bezier(0.45,0.05,0.55,0.95) forwards"
                : "coinIdle 3s ease-in-out infinite",
              boxShadow: "0 0 0 6px rgba(255,214,93,0.15), 0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            {flipping ? "" : result ? (result === "heads" ? "H" : "T") : "?"}
          </div>
        </div>

        {/* Side picker */}
        {!result && (
          <div className="flex gap-3 mb-4">
            {["heads", "tails"].map((side) => (
              <button
                key={side}
                onClick={() => choose(side)}
                disabled={flipping}
                className="flex-1 py-4 rounded-xl font-semibold capitalize transition-all active:scale-95"
                style={{
                  background: pick === side ? "linear-gradient(90deg, #5EE6A8, #5DA9FF)" : "rgba(255,255,255,0.06)",
                  color: pick === side ? "#08090C" : "rgba(255,255,255,0.7)",
                  border: pick === side ? "1px solid transparent" : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {side}
              </button>
            ))}
          </div>
        )}

        {!result ? (
          <button
            onClick={toss}
            disabled={!pick || flipping}
            className="w-full font-bold py-4 rounded-xl transition-transform active:scale-95 disabled:opacity-30"
            style={{
              background: "linear-gradient(90deg, #FFD65D, #FF5D8F)",
              color: "#08090C",
              animation: pick && !flipping ? "glowGold 2s ease-in-out infinite" : "none",
            }}
          >
            {flipping ? "Flipping..." : pick ? `Flip for ${pick}` : "Pick a side first"}
          </button>
        ) : (
          <div className="relative">
            <Confetti burstKey={burstKey} />
            <div
              className="rounded-2xl p-5 relative"
              style={{
                background: outcome === "win"
                  ? "linear-gradient(160deg, #14271B, #0E3D2A)"
                  : "linear-gradient(160deg, #271418, #3D0E16)",
                border: "1px solid rgba(255,255,255,0.1)",
                animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {outcome === "win" && <Sparkles size={18} className="text-[#FFD65D]" />}
                <h2 className="text-white text-lg font-bold capitalize">
                  {result} — {outcome === "win" ? "You called it!" : "Not this time"}
                </h2>
              </div>
              <p className="text-white/50 text-sm mb-4">
                You picked <span className="capitalize text-white/80">{pick}</span>
              </p>
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-transform active:scale-95"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <RotateCcw size={16} /> Toss again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
