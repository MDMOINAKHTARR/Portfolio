/**
 * DailyBugle — Evidence Wall left sidebar
 * Compact Daily Bugle broadsheet with real logo + full content.
 */
export function DailyBugle() {
  return (
    <div className="hidden xl:flex w-[240px] shrink-0 flex-col border-r-2 border-ink/20 bg-[#faf6ee] relative z-40 select-none overflow-hidden">
      <div className="absolute inset-0 bg-texture opacity-25 pointer-events-none" />

      {/* ── LOGO / MASTHEAD ── */}
      <div className="relative bg-ink shrink-0">
        <div className="h-[4px] bg-yellow-400 w-full" />
        <div className="px-4 py-2.5 flex items-center justify-center">
          <img
            src="/Daily-Bugle-Logo.jpg"
            alt="The Daily Bugle"
            className="w-full max-h-[68px] object-contain"
            draggable={false}
          />
        </div>
        <div className="h-[4px] bg-yellow-400 w-full" />
      </div>

      {/* ── DATELINE ── */}
      <div className="relative px-4 py-1 border-b border-ink/15 flex justify-between items-center shrink-0">
        <span className="text-[7px] font-mono font-black text-ink/45 tracking-wider uppercase">New Delhi, IN</span>
        <span className="text-[7px] font-mono text-ink/25">·</span>
        <span className="text-[7px] font-mono font-black text-ink/45 tracking-wider uppercase">Evidence Wall · 2026</span>
      </div>

      {/* ── LEAD STORY ── */}
      <div className="relative px-4 pt-3 pb-3 border-b-2 border-ink shrink-0">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex-1 h-px bg-ink" />
          <span className="text-[6.5px] font-mono font-black text-ink tracking-[0.3em] uppercase whitespace-nowrap">EXCLUSIVE</span>
          <div className="flex-1 h-px bg-ink" />
        </div>
        <h2 className="font-stamp text-[18px] font-black text-ink leading-[1.07] tracking-wide uppercase mb-2">
          DEVELOPER'S FILES NOW OPEN TO PUBLIC!
        </h2>
        <div className="border-t border-ink/20 pt-2">
          <p className="text-[9.5px] font-mono text-ink/70 leading-[1.65]">
            <span className="font-black text-ink">NEW DELHI —</span> Moin Akhtar has pinned his complete portfolio to this board. All 11 files are now open for public inspection.
          </p>
        </div>
      </div>

      {/* ── SECONDARY STORY ── */}
      <div className="relative px-4 pt-2.5 pb-2.5 border-b border-ink/20 shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex-1 h-px bg-ink/40" />
          <span className="text-[6.5px] font-mono font-black text-ink/60 tracking-[0.25em] uppercase whitespace-nowrap">ALSO REPORTED</span>
          <div className="flex-1 h-px bg-ink/40" />
        </div>
        <h3 className="font-stamp text-[13px] font-black text-ink leading-[1.1] tracking-wide uppercase mb-1.5">
          RED THREADS TRACE HIDDEN CONNECTIONS
        </h3>
        <p className="text-[9px] font-mono text-ink/60 leading-[1.6]">
          Investigators confirm that yarn threads on the board visually link related projects, awards, and certifications back to their source.
        </p>
      </div>

      {/* ── PULL QUOTE ── */}
      <div className="relative px-4 pt-2.5 pb-2.5 border-b border-ink/20 shrink-0">
        <blockquote className="border-l-[3px] border-yellow-400 pl-3">
          <p className="font-stamp text-[13px] font-black text-ink leading-snug italic">
            "I want the public to see everything."
          </p>
          <footer className="text-[7.5px] font-mono font-bold text-ink/40 tracking-wider mt-1 uppercase">
            — Moin Akhtar
          </footer>
        </blockquote>
      </div>

      {/* ── HOW TO USE ── */}
      <div className="relative flex-1 px-4 pt-2.5 pb-2.5 border-b border-ink/20 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2 shrink-0">
          <div className="flex-1 h-px bg-ink/20" />
          <span className="text-[6.5px] font-mono font-black text-ink/50 tracking-[0.3em] uppercase whitespace-nowrap">HOW TO USE</span>
          <div className="flex-1 h-px bg-ink/20" />
        </div>
        <div className="space-y-1.5">
          {[
            { bold: 'Click',        rest: 'a card to flip it.' },
            { bold: 'Double-click', rest: 'to open the full file.' },
            { bold: 'Red threads',  rest: 'link related cards.' },
          ].map(({ bold, rest }) => (
            <p key={bold} className="text-[10px] font-mono text-ink/65 leading-snug">
              <span className="font-black text-ink">{bold}</span>{' '}{rest}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-auto pt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <span className="text-[7.5px] font-mono font-bold text-ink/40 uppercase tracking-widest">Live Edition</span>
        </div>
      </div>

      {/* ── CLASSIFIED AD ── vintage newspaper style ── */}
      <div className="relative px-4 pt-2.5 pb-2.5 border-b border-ink/20 shrink-0">
        <div className="border border-ink/30 px-3 py-2 text-center bg-yellow-50/40">
          <p className="text-[6.5px] font-mono font-black text-ink/40 tracking-[0.35em] uppercase mb-1">— ADVERTISEMENT —</p>
          <p className="font-stamp text-[11px] font-black text-ink leading-tight tracking-wide uppercase">
            OPEN FOR HIRE
          </p>
          <p className="text-[8.5px] font-mono text-ink/60 leading-snug mt-0.5">
            Full-stack developer. ML enthusiast. Available now.
          </p>
        </div>
      </div>

      {/* ── FOOTER ── inverted, always visible ── */}
      <div className="relative shrink-0 bg-ink px-4 py-3 text-center">
        <p className="text-[6.5px] font-mono font-black text-paper/40 tracking-[0.4em] uppercase mb-1.5 leading-none">— AUTHORIZED ACCESS —</p>
        <p className="font-stamp text-[13px] font-black text-yellow-400 tracking-[0.25em] uppercase leading-none mb-1">
          ACCESS GRANTED
        </p>
        <p className="text-[7px] font-mono text-paper/25 tracking-[0.15em] leading-none">#MOIN-PORTFOLIO-2026</p>
      </div>
    </div>
  );
}
