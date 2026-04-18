// ─── Feature flag ─────────────────────────────────────────────────────────────
// Set to true when image generation is ready to re-enable
const ENABLE_IMAGES = false;

// ─── Themes ───────────────────────────────────────────────────────────────────
const THEMES = [
  { bg: 'bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,#d1fae5,#f8fafc_55%,#eff6ff)]', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80', bar: 'bg-emerald-500', spinner: 'border-t-emerald-500', dot: 'bg-emerald-500' },
  { bg: 'bg-[radial-gradient(ellipse_80%_60%_at_80%_10%,#fce7f3,#fff7ed_55%,#f8fafc)]', chip: 'bg-rose-50 text-rose-700 ring-rose-200/80',           bar: 'bg-rose-500',    spinner: 'border-t-rose-500',    dot: 'bg-rose-500'    },
  { bg: 'bg-[radial-gradient(ellipse_80%_60%_at_10%_80%,#cffafe,#f0fdff_50%,#f8fafc)]', chip: 'bg-cyan-50 text-cyan-700 ring-cyan-200/80',           bar: 'bg-cyan-500',    spinner: 'border-t-cyan-500',    dot: 'bg-cyan-500'    },
  { bg: 'bg-[radial-gradient(ellipse_80%_60%_at_80%_80%,#dcfce7,#f7fee7_50%,#f8fafc)]', chip: 'bg-lime-50 text-lime-700 ring-lime-200/80',           bar: 'bg-lime-500',    spinner: 'border-t-lime-500',    dot: 'bg-lime-500'    },
  { bg: 'bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,#e0e7ff,#f0fdf9_50%,#fff1f2)]', chip: 'bg-teal-50 text-teal-700 ring-teal-200/80',           bar: 'bg-teal-500',    spinner: 'border-t-teal-500',    dot: 'bg-teal-500'    },
  { bg: 'bg-[radial-gradient(ellipse_80%_60%_at_80%_20%,#bae6fd,#f0fdf4_50%,#fefce8)]', chip: 'bg-sky-50 text-sky-700 ring-sky-200/80',              bar: 'bg-sky-500',     spinner: 'border-t-sky-500',     dot: 'bg-sky-500'     },
];

const LABELS = ['Hook', 'Problem', 'Insight', 'Tip', 'Example', 'CTA'];

// ─── Format-aware layout tokens ───────────────────────────────────────────────
const LAYOUT = {
  square: {
    outer: 'p-7', titleSize: 'text-[2rem] leading-[1.15]', bodySize: 'text-[1.1rem] leading-[1.55]',
    bodyPad: 'p-5', barClass: 'mb-6 h-[3px] w-14 rounded-full', centerPy: 'py-6',
    footerPt: 'pt-4', labelText: 'text-[10px] tracking-widest uppercase font-bold',
    counterText: 'text-[11px] font-semibold', footerText: 'text-[11px] font-semibold', bodyMt: 'mt-6',
  },
  story: {
    outer: 'p-5', titleSize: 'text-[1.35rem] leading-[1.2]', bodySize: 'text-[0.85rem] leading-[1.55]',
    bodyPad: 'p-3.5', barClass: 'mb-4 h-[2.5px] w-10 rounded-full', centerPy: 'py-4',
    footerPt: 'pt-3', labelText: 'text-[9px] tracking-widest uppercase font-bold',
    counterText: 'text-[9px] font-semibold', footerText: 'text-[9px] font-semibold', bodyMt: 'mt-4',
  },
  post: {
    outer: 'p-6', titleSize: 'text-[1.65rem] leading-[1.2]', bodySize: 'text-[0.95rem] leading-[1.55]',
    bodyPad: 'p-4', barClass: 'mb-5 h-[3px] w-12 rounded-full', centerPy: 'py-5',
    footerPt: 'pt-4', labelText: 'text-[10px] tracking-widest uppercase font-bold',
    counterText: 'text-[11px] font-semibold', footerText: 'text-[11px] font-semibold', bodyMt: 'mt-5',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SlideCard({
  slide,
  index,
  total,
  format = 'square',
  isEditing = false,
  isRegenerating = false,
  onTitleChange,
  onContentChange,
}) {
  const title   = slide?.title   || `Slide ${index}`;
  const content = slide?.content || 'Add a clear point your audience can act on.';
  const theme   = THEMES[(index - 1) % THEMES.length];
  const label   = LABELS[index - 1] ?? 'Slide';
  const L       = LAYOUT[format] ?? LAYOUT.square;

  // Images are disabled — always use gradient background (ENABLE_IMAGES = false)
  // When re-enabling: flip the flag above, the image layer below will activate automatically.
  void ENABLE_IMAGES;

  const inputBase = 'w-full resize-none bg-transparent outline-none transition-all duration-150 placeholder:text-slate-400/60 focus:outline-none';

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden ${L.outer} ${theme.bg}`}>

      {/* ── Regenerating shimmer overlay ──────────────────────────────── */}
      {isRegenerating && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[3px]">
          <div className="relative mb-3 flex h-11 w-11 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
            <div className={`absolute inset-0 animate-spin rounded-full border-[3px] border-transparent ${theme.spinner}`} />
            <div className={`h-2 w-2 rounded-full ${theme.dot}`} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Regenerating</p>
          <div className="mt-4 flex w-28 flex-col gap-2">
            <div className="h-2.5 animate-pulse rounded-full bg-slate-200" />
            <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-slate-200" style={{ animationDelay: '80ms' }} />
            <div className="mt-1 h-2 animate-pulse rounded-full bg-slate-100"  style={{ animationDelay: '160ms' }} />
            <div className="h-2 w-3/5 animate-pulse rounded-full bg-slate-100" style={{ animationDelay: '240ms' }} />
          </div>
        </div>
      )}

      {/* ── Header row ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 ring-1 ${theme.chip} ${L.labelText}`}>
          {label}
        </span>
        <span className={`rounded-full bg-black/5 px-2.5 py-1 text-slate-500 ${L.counterText}`}>
          {index}&thinsp;/&thinsp;{total}
        </span>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className={`flex min-h-0 flex-1 flex-col justify-center ${L.centerPy}`}>
        <div className={`${L.barClass} ${theme.bar}`} />

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Slide title…"
            className={`${inputBase} ${L.titleSize} font-black text-slate-950
              rounded-lg border border-transparent px-1 -mx-1
              hover:border-white/60 focus:border-white/80 focus:bg-white/30
              focus:shadow-[0_0_0_3px_rgba(255,255,255,0.5)] focus:ring-0`}
          />
        ) : (
          <h2 className={`break-words font-black text-slate-950 ${L.titleSize}`}>
            {title}
          </h2>
        )}

        {/* Content */}
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            placeholder="Slide content…"
            rows={format === 'story' ? 3 : 4}
            className={`${inputBase} ${L.bodyMt} ${L.bodySize} ${L.bodyPad} font-semibold text-slate-700
              rounded-xl border border-white/60 bg-white/75
              shadow-[0_2px_16px_-4px_rgba(0,0,0,0.10)] backdrop-blur-sm
              hover:border-white/80 focus:border-white/90 focus:bg-white/90
              focus:shadow-[0_0_0_3px_rgba(255,255,255,0.6)]`}
          />
        ) : (
          <p className={`${L.bodyMt} rounded-xl border border-white/60 bg-white/75 font-semibold text-slate-700
              shadow-[0_2px_16px_-4px_rgba(0,0,0,0.10)] backdrop-blur-sm ${L.bodyPad} ${L.bodySize}`}>
            {content}
          </p>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between border-t border-white/50 ${L.footerPt} text-slate-400 ${L.footerText}`}>
        <span className="font-bold tracking-tight text-slate-500">CarouselAI</span>
        <span>{index === total ? '✦ Save this' : 'Swipe →'}</span>
      </div>
    </div>
  );
}
