import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Sparkles, LayoutPanelLeft, Pencil, Check, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import SlideCard from './SlideCard';
import { regenerateSlide } from '../lib/groq';

const MotionDiv = motion.div;

// ─── Format Config ────────────────────────────────────────────────────────────
const FORMAT_CONFIG = {
  square: {
    label: 'Square',
    sub: '1:1',
    heightConstrained: false,
    aspectClass: 'aspect-square',
    previewMax: 'max-w-[400px]',
    hiddenW: 1080,
    hiddenH: 1080,
  },
  story: {
    label: 'Story',
    sub: '9:16',
    heightConstrained: true,
    previewH: 430,
    get previewW() { return Math.round(this.previewH * 9 / 16); },
    hiddenW: 1080,
    hiddenH: 1920,
  },
  post: {
    label: 'Post',
    sub: '4:5',
    heightConstrained: false,
    aspectClass: 'aspect-[4/5]',
    previewMax: 'max-w-[360px]',
    hiddenW: 1080,
    hiddenH: 1350,
  },
};

// SVG icons
const FormatIcons = {
  square: (
    <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="14" height="14" rx="2.5" />
    </svg>
  ),
  story: (
    <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="1.5" width="9" height="15" rx="2" />
    </svg>
  ),
  post: (
    <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2.5" width="14" height="13" rx="2.5" />
    </svg>
  ),
};

// Slide transitions
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0, scale: 0.97 }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit:  (dir) => ({ zIndex: 0, x: dir < 0 ? 200 : -200, opacity: 0, scale: 0.97 }),
};

function previewSizing(cfg) {
  if (cfg.heightConstrained) {
    return {
      className: 'relative flex items-center justify-center',
      style: { height: cfg.previewH, width: cfg.previewW },
    };
  }
  return {
    className: `relative flex w-full ${cfg.previewMax} ${cfg.aspectClass} items-center justify-center`,
    style: undefined,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CarouselPreview({
  slides,
  setSlides,
  isLoading,
  format = 'square',
  onFormatChange,
  topic = '',
}) {
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [direction, setDirection]             = useState(1);
  const [isEditing, setIsEditing]             = useState(false);
  const [draftSlides, setDraftSlides]         = useState([]);
  const [snapshot, setSnapshot]               = useState([]);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null); // which slide is loading

  const safeSlides    = Array.isArray(slides) ? slides : [];
  const cfg           = FORMAT_CONFIG[format] ?? FORMAT_CONFIG.square;
  const sizing        = previewSizing(cfg);
  const displaySlides = isEditing ? draftSlides : safeSlides;

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((p) => Math.min(p + 1, displaySlides.length - 1));
  };
  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((p) => Math.max(p - 1, 0));
  };

  // ── Edit mode ─────────────────────────────────────────────────────────────
  const enterEditMode = () => {
    const copy = safeSlides.map((s) => ({ ...s }));
    setSnapshot(copy);
    setDraftSlides(copy);
    setIsEditing(true);
  };
  const handleSave = () => {
    setSlides?.(draftSlides);
    setIsEditing(false);
    setSnapshot([]);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setDraftSlides([]);
    setSnapshot([]);
  };
  const handleSlideEdit = (field, value) => {
    setDraftSlides((prev) =>
      prev.map((s, i) => (i === activeIndex ? { ...s, [field]: value } : s))
    );
  };

  // ── Regenerate single slide ───────────────────────────────────────────────
  const handleRegenerate = async (slideIdx) => {
    if (regeneratingIndex !== null) return; // already regenerating one
    if (!topic.trim()) return;              // no topic to regen from

    setRegeneratingIndex(slideIdx);
    try {
      const newSlide = await regenerateSlide(topic, slideIdx, safeSlides);
      setSlides?.((prev) =>
        prev.map((s, i) =>
          i === slideIdx ? { ...s, title: newSlide.title, content: newSlide.content } : s
        )
      );
    } catch (err) {
      console.warn('[CarouselAI] Regen failed, keeping old slide:', err.message);
      // No state change — old slide is preserved
    } finally {
      setRegeneratingIndex(null);
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    const el = document.getElementById('carousel-card');
    if (!el) return;
    try {
      await document.fonts?.ready;
      const url = await htmlToImage.toPng(el, { backgroundColor: '#ffffff', cacheBust: true, pixelRatio: 3 });
      const a = document.createElement('a');
      a.download = `slide-${currentIndex + 1}-${format}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch { /* silent */ }
  };

  const handleDownloadAll = async () => {
    if (!safeSlides.length) return;
    const container = document.getElementById('hidden-slides');
    if (!container) return;
    await document.fonts?.ready;
    for (const [i, node] of Array.from(container.children).entries()) {
      try {
        const url = await htmlToImage.toPng(node, { backgroundColor: '#ffffff', cacheBust: true, pixelRatio: 2 });
        const a = document.createElement('a');
        a.download = `slide-${i + 1}-${format}.png`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch { /* skip */ }
    }
  };

  // ── Sub-components ────────────────────────────────────────────────────────

  const FormatSelector = () => (
    <div className="mb-4 mx-auto flex w-fit items-center gap-px rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
      {Object.entries(FORMAT_CONFIG).map(([key, val]) => {
        const active = format === key;
        return (
          <button
            key={key}
            id={`format-btn-${key}`}
            onClick={() => !isEditing && onFormatChange?.(key)}
            disabled={isEditing}
            className={
              active
                ? 'group relative flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80 transition-all duration-200 select-none outline-none'
                : isEditing
                  ? 'group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed select-none outline-none'
                  : 'group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-500 transition-all duration-200 select-none outline-none hover:text-slate-700'
            }
          >
            <span className={active ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}>
              {FormatIcons[key]}
            </span>
            <span>{val.label}</span>
            <span className={active ? 'font-normal tabular-nums text-slate-400' : 'font-normal tabular-nums text-slate-400/70'}>
              {val.sub}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Toolbar: Edit / Regenerate / Save / Cancel
  const ActionToolbar = () => {
    const isRegening = regeneratingIndex !== null;
    return (
      <div className="mb-3 flex w-full items-center justify-between">
        {/* Left: status badges */}
        <div className="flex items-center gap-2 h-6">
          {isEditing && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-amber-600 ring-1 ring-amber-200/80">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
              </span>
              Editing mode
            </span>
          )}
          {isRegening && !isEditing && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-violet-600 ring-1 ring-violet-200/80">
              <RefreshCw size={9} className="animate-spin" />
              Regenerating…
            </span>
          )}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              >
                <X size={12} strokeWidth={2.5} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
              >
                <Check size={12} strokeWidth={2.5} />
                Save
              </button>
            </>
          ) : (
            <>
              {/* Regenerate current slide */}
              {safeSlides.length > 0 && topic.trim() && (
                <button
                  id="btn-regenerate-slide"
                  onClick={() => handleRegenerate(activeIndex)}
                  disabled={isRegening}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={12} strokeWidth={2.5} className={isRegening ? 'animate-spin' : ''} />
                  Regenerate
                </button>
              )}
              {/* Edit mode */}
              {safeSlides.length > 0 && (
                <button
                  id="btn-edit-slides"
                  onClick={enterEditMode}
                  disabled={isRegening}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil size={12} strokeWidth={2.5} />
                  Edit Slides
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const cardShell = (children) => (
    <div className={`${sizing.className} transition-all duration-300`} style={sizing.style}>
      <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18),0_2px_8px_-2px_rgba(0,0,0,0.06)]">
        {children}
      </div>
    </div>
  );

  const DownloadStrip = ({ disabled }) => (
    <div className="mt-4 flex w-full items-center gap-2.5">
      <button
        onClick={handleDownload}
        disabled={disabled}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        <Download size={14} strokeWidth={2.5} />
        Download
      </button>
      <button
        onClick={handleDownloadAll}
        disabled={disabled}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:text-slate-400 disabled:bg-slate-50"
      >
        <Download size={14} strokeWidth={2.5} />
        All Slides
      </button>
    </div>
  );

  const NavBar = ({ activeIdx, isFirst, isLast }) => (
    <div
      className={`mt-4 flex items-center justify-between gap-2 ${cfg.heightConstrained ? '' : `w-full ${cfg.previewMax}`}`}
      style={cfg.heightConstrained ? { width: cfg.previewW } : undefined}
    >
      <button
        onClick={handlePrev}
        disabled={isFirst}
        aria-label="Previous slide"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      <div className="flex items-center gap-1.5">
        {displaySlides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > activeIdx ? 1 : -1); setCurrentIndex(i); }}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIdx ? 'w-5 bg-slate-900' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={isLast}
        aria-label="Next slide"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center">
        <FormatSelector />
        {cardShell(
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-emerald-50/60 to-white p-8 text-center">
            <div className="relative mb-5 flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-60" />
              <div className="relative h-8 w-8 animate-spin rounded-full border-[3px] border-emerald-100 border-t-emerald-500" />
            </div>
            <p className="text-lg font-black tracking-tight text-slate-900">Crafting slides…</p>
            <p className="mt-1.5 text-xs font-medium text-slate-400">Usually takes 5–10 seconds</p>
          </div>
        )}
        <DownloadStrip disabled />
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (safeSlides.length === 0) {
    return (
      <div className="flex w-full flex-col items-center">
        <FormatSelector />
        {cardShell(
          <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <Sparkles size={26} strokeWidth={2} />
            </div>
            <p className="text-lg font-black tracking-tight text-slate-900">Your canvas awaits</p>
            <p className="mt-2 max-w-[180px] text-xs font-medium leading-relaxed text-slate-400">
              Enter a topic on the left and hit generate
            </p>
            <div className="mt-5 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 ring-1 ring-slate-100">
              <LayoutPanelLeft size={12} />
              {cfg.label} · {cfg.sub}
            </div>
          </div>
        )}
        <DownloadStrip disabled />
      </div>
    );
  }

  // ── Main carousel ─────────────────────────────────────────────────────────
  const activeIndex  = Math.min(currentIndex, displaySlides.length - 1);
  const currentSlide = displaySlides[activeIndex] ?? displaySlides[0];
  const isFirstSlide = activeIndex === 0;
  const isLastSlide  = activeIndex === displaySlides.length - 1;
  const isSlideRegenerating = regeneratingIndex === activeIndex;

  return (
    <div className="flex w-full flex-col items-center">
      <FormatSelector />
      <ActionToolbar />

      {/* Live preview card */}
      <div
        className={`${sizing.className} transition-all duration-300 ${
          isEditing ? 'ring-2 ring-amber-300/60 ring-offset-2 rounded-[22px]' : ''
        } ${
          isSlideRegenerating ? 'ring-2 ring-violet-300/60 ring-offset-2 rounded-[22px]' : ''
        }`}
        style={sizing.style}
      >
        <div
          id="carousel-card"
          className="relative h-full w-full overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18),0_2px_8px_-2px_rgba(0,0,0,0.06)]"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <MotionDiv
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 320, damping: 32 },
                opacity: { duration: 0.18 },
                scale:   { duration: 0.18 },
              }}
              className="absolute inset-0 h-full w-full"
            >
              <SlideCard
                slide={currentSlide}
                index={activeIndex + 1}
                total={displaySlides.length}
                format={format}
                isEditing={isEditing}
                isRegenerating={isSlideRegenerating}
                onTitleChange={(val) => handleSlideEdit('title', val)}
                onContentChange={(val) => handleSlideEdit('content', val)}
              />
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>

      <NavBar activeIdx={activeIndex} isFirst={isFirstSlide} isLast={isLastSlide} />

      {/* Hidden off-screen slides for bulk download */}
      <div id="hidden-slides" className="absolute -left-[9999px] top-0">
        {safeSlides.map((slide, i) => (
          <div
            key={`${slide?.slide ?? i}-${i}`}
            style={{ width: cfg.hiddenW, height: cfg.hiddenH }}
            className="overflow-hidden bg-white"
          >
            <SlideCard slide={slide} index={i + 1} total={safeSlides.length} format={format} />
          </div>
        ))}
      </div>

      <DownloadStrip disabled={false} />
    </div>
  );
}
