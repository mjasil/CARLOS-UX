import { useState, useRef, useCallback } from "react";
import { Zap, X, Rocket, Sparkles } from "lucide-react";

// Synthesized sound effects via Web Audio API (no external files needed)
function useSounds() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
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
    osc.start(now);
    osc.stop(now + 0.12);
  }, []);

  const playSuccess = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C chime
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.35);
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
    osc.start(now);
    osc.stop(now + 0.15);
  }, []);

  return { playClick, playSuccess, playClose };
}

const PARTICLE_COLORS = ["#5EE6A8", "#FF5D8F", "#5DA9FF", "#FFD65D", "#B26EFF"];

function Particles({ burstKey }) {
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 90 + Math.random() * 90;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
    const size = 4 + Math.random() * 6;
    const delay = Math.random() * 0.08;
    return { id: `${burstKey}-${i}`, tx, ty, color, size, delay };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
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

export default function PopupDemo() {
  const [open, setOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const { playClick, playSuccess, playClose } = useSounds();

  const handleStart = () => {
    playClick();
    setTimeout(() => {
      playSuccess();
      setBurstKey((k) => k + 1);
      setOpen(true);
    }, 120);
  };

  const handleClose = () => {
    playClose();
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#08090C] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <style>{`
        @keyframes burst {
          to {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
        @keyframes popIn {
          0% { transform: scale(0.7) translateY(30px); opacity: 0; }
          60% { transform: scale(1.05) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px 0px rgba(94,230,168,0.5); }
          50% { box-shadow: 0 0 45px 8px rgba(94,230,168,0.8); }
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
      `}</style>

      {/* ambient drifting blobs */}
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-25"
        style={{
          background: "radial-gradient(circle, #5EE6A8, transparent 70%)",
          top: "-5%",
          left: "-10%",
          animation: "drift 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #B26EFF, transparent 70%)",
          bottom: "-10%",
          right: "-10%",
          animation: "drift 15s ease-in-out infinite reverse",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <p
            className="text-xs tracking-[0.35em] uppercase mb-2 font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #5EE6A8, #5DA9FF, #B26EFF, #5EE6A8)",
              backgroundSize: "200% auto",
              animation: "shimmer 3s linear infinite",
            }}
          >
            In-app popup
          </p>
          <h1 className="text-white text-2xl font-semibold">
            Tap Start to open it
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Full color, sound, and motion — all contained inside this app.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full text-[#08090C] font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(90deg, #5EE6A8, #5DA9FF)",
            animation: "glow 2.2s ease-in-out infinite",
          }}
        >
          <Zap size={18} strokeWidth={2.5} />
          Start
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-6 z-50"
          onClick={handleClose}
        >
          <Particles burstKey={burstKey} />
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{
              background: "linear-gradient(160deg, #14171B, #1B1030)",
              border: "1px solid rgba(255,255,255,0.1)",
              animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, #5EE6A8, #5DA9FF)",
              }}
            >
              <Rocket size={22} className="text-[#08090C]" strokeWidth={2.2} />
            </div>

            <h2 className="text-white text-lg font-semibold mb-1 flex items-center gap-2">
              You're in <Sparkles size={16} className="text-[#FFD65D]" />
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              This popup lives inside the app's own screen — colors, motion,
              and sound are all real, but it never leaves this window.
            </p>

            <button
              onClick={handleClose}
              className="w-full text-[#08090C] font-semibold py-3 rounded-xl transition-transform active:scale-95"
              style={{ background: "linear-gradient(90deg, #FF5D8F, #B26EFF)" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
