const slideThemes = [
  {
    background: 'bg-[radial-gradient(circle_at_18%_18%,#ccfbf1_0,#f8fafc_34%,#dbeafe_100%)]',
    accent: 'bg-emerald-500',
    chip: 'bg-white/80 text-emerald-700',
    text: 'text-slate-950',
  },
  {
    background: 'bg-[radial-gradient(circle_at_82%_16%,#fecdd3_0,#fff7ed_38%,#f8fafc_100%)]',
    accent: 'bg-rose-500',
    chip: 'bg-white/80 text-rose-700',
    text: 'text-slate-950',
  },
  {
    background: 'bg-[radial-gradient(circle_at_20%_85%,#cffafe_0,#ecfeff_40%,#f8fafc_100%)]',
    accent: 'bg-cyan-500',
    chip: 'bg-white/80 text-cyan-700',
    text: 'text-slate-950',
  },
  {
    background: 'bg-[radial-gradient(circle_at_80%_75%,#dcfce7_0,#f7fee7_42%,#f8fafc_100%)]',
    accent: 'bg-lime-500',
    chip: 'bg-white/80 text-lime-700',
    text: 'text-slate-950',
  },
  {
    background: 'bg-[radial-gradient(circle_at_22%_20%,#e0e7ff_0,#f0fdfa_42%,#fff1f2_100%)]',
    accent: 'bg-teal-500',
    chip: 'bg-white/80 text-teal-700',
    text: 'text-slate-950',
  },
  {
    background: 'bg-[radial-gradient(circle_at_78%_20%,#bae6fd_0,#f0fdf4_45%,#ffffff_100%)]',
    accent: 'bg-sky-500',
    chip: 'bg-white/80 text-sky-700',
    text: 'text-slate-950',
  },
];

const slideLabels = ['Hook', 'Problem', 'Insight', 'Tip', 'Example', 'CTA'];

export default function SlideCard({ slide, index, total }) {
  const title = slide?.title || `Slide ${index}`;
  const content = slide?.content || 'Add a clear point your audience can act on.';
  const theme = slideThemes[(index - 1) % slideThemes.length];
  const label = slideLabels[index - 1] || 'Slide';

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden p-8 ${theme.background}`}>
      <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-600">
        <span className={`rounded-2xl px-3 py-1 ${theme.chip}`}>
          {label}
        </span>
        <span className="rounded-2xl bg-white/80 px-3 py-1 text-slate-700 shadow-sm">
          {index} / {total}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center py-8">
        <div className={`mb-7 h-2 w-16 rounded-2xl ${theme.accent}`} />
        <h2 className={`break-words text-4xl font-black leading-none ${theme.text}`}>
          {title}
        </h2>
        <p className="mt-7 rounded-2xl border border-white/70 bg-white/80 p-6 text-2xl font-bold leading-tight text-slate-800 shadow-xl shadow-slate-900/5">
          {content}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-white/70 pt-5 text-sm font-bold text-slate-600">
        <span>CarouselAI</span>
        <span>{index === total ? 'Save this' : 'Swipe next'}</span>
      </div>
    </div>
  );
}
