import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import SlideCard from './SlideCard';

const MotionDiv = motion.div;

export default function CarouselPreview({ slides, isLoading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const safeSlides = Array.isArray(slides) ? slides : [];

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => Math.min(prev + 1, safeSlides.length - 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleDownload = async () => {
    const element = document.getElementById('carousel-card');

    if (!element) {
      alert('Carousel card not found');
      return;
    }

    try {
      await document.fonts?.ready;
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#ffffff',
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `carousel-slide-${Math.min(currentIndex + 1, safeSlides.length)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Download failed');
    }
  };

  const handleDownloadAll = async () => {
    if (safeSlides.length === 0) {
      alert('No slides to download');
      return;
    }

    const container = document.getElementById('hidden-slides');

    if (!container) {
      alert('Slides not found');
      return;
    }

    await document.fonts?.ready;

    const slideNodes = Array.from(container.children);

    for (const [index, slideNode] of slideNodes.entries()) {
      try {
        const dataUrl = await htmlToImage.toPng(slideNode, {
          backgroundColor: '#ffffff',
          cacheBust: true,
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.download = `slide-${index + 1}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch {
        // Keep downloading the remaining slides if one conversion fails.
      }
    }
  };

  const renderDownloadActions = (disabled = false) => (
    <div className="mt-5 flex w-full max-w-[400px] flex-col gap-3 sm:flex-row sm:justify-center">
      <button
        onClick={handleDownload}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        <Download size={16} />
        Download
      </button>
      <button
        onClick={handleDownloadAll}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        <Download size={16} />
        Download All Slides
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="flex aspect-[4/5] w-full max-w-[400px] flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-[radial-gradient(circle_at_50%_20%,#ccfbf1_0,#ffffff_45%,#f8fafc_100%)] p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-emerald-900/10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-primary" />
          </div>
          <p className="text-xl font-black text-slate-950">Generating...</p>
          <p className="mt-3 max-w-[260px] text-sm font-semibold leading-relaxed text-slate-600">
            Generating your carousel... this may take a few seconds
          </p>
        </div>
        {renderDownloadActions(true)}
      </div>
    );
  }

  if (safeSlides.length === 0) {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="flex aspect-[4/5] w-full max-w-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-primary shadow-inner">
            <Sparkles size={34} strokeWidth={2.4} />
          </div>
          <p className="text-2xl font-black leading-tight text-slate-950">
            Start by entering a topic
          </p>
          <p className="mt-3 max-w-[270px] text-sm font-semibold leading-relaxed text-slate-500">
            Messy notes are welcome. The studio will shape the story.
          </p>
        </div>
        {renderDownloadActions(true)}
      </div>
    );
  }

  const activeIndex = Math.min(currentIndex, safeSlides.length - 1);
  const currentSlide = safeSlides[activeIndex] ?? safeSlides[0];
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === safeSlides.length - 1;

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 240 : -240,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 240 : -240,
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative flex aspect-[4/5] w-full max-w-[400px] items-center justify-center">
        <div
          id="carousel-card"
          className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <MotionDiv
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 h-full w-full"
            >
              <SlideCard
                slide={currentSlide}
                index={activeIndex + 1}
                total={safeSlides.length}
              />
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 flex w-full max-w-[400px] items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={isFirstSlide}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          Previous
        </button>

        <div className="flex gap-2">
          {safeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > activeIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'w-7 bg-primary' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={isLastSlide}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Next slide"
        >
          Next
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div id="hidden-slides" className="absolute -left-[9999px] top-0">
        {safeSlides.map((slide, index) => (
          <div
            key={`${slide?.slide ?? index}-${index}`}
            className="mb-6 h-[500px] w-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <SlideCard
              slide={slide}
              index={index + 1}
              total={safeSlides.length}
            />
          </div>
        ))}
      </div>

      {renderDownloadActions(false)}
    </div>
  );
}
