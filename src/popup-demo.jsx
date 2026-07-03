import { useState } from "react";
import { Zap, X, Rocket } from "lucide-react";

export default function PopupDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[#5EE6A8] text-xs tracking-[0.3em] uppercase mb-2">
            In-app popup
          </p>
          <h1 className="text-white text-2xl font-semibold">
            Tap Start to open it
          </h1>
          <p className="text-white/40 text-sm mt-2">
            This popup only shows inside this app — never on other apps or sites.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="w-full bg-[#5EE6A8] text-[#0B0D10] font-semibold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Zap size={18} strokeWidth={2.5} />
          Start
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#14171B] border border-white/10 rounded-2xl p-6 relative"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="w-11 h-11 rounded-full bg-[#5EE6A8]/10 flex items-center justify-center mb-4">
              <Rocket size={20} className="text-[#5EE6A8]" strokeWidth={2} />
            </div>

            <h2 className="text-white text-lg font-semibold mb-1">
              You're in
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              This is a normal popup, rendered inside the app's own screen.
              Closing it just closes this dialog — nothing follows you anywhere else.
            </p>

            <button
              onClick={() => setOpen(false)}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
