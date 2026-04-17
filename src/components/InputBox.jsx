import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { generateCarousel } from '../lib/groq';

// Fallback slides shown when API fails for any reason
const FALLBACK_SLIDES = [
  { slide: 1, title: 'AI Basics', content: 'AI helps machines think smarter' },
  { slide: 2, title: 'Used Daily', content: 'Apps, automation, recommendations' },
  { slide: 3, title: 'Why Important', content: 'Saves time and effort' },
  { slide: 4, title: 'Problem', content: 'Can be misused' },
  { slide: 5, title: 'Solution', content: 'Use responsibly' },
  { slide: 6, title: 'Save This', content: 'Learn AI basics today' },
];

export default function InputBox({
  topic,
  setTopic,
  slides,
  setSlides,
  isGenerating,
  setIsGenerating,
  onGenerated,
  errorMessage,
  setErrorMessage,
}) {
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const intervalRef = useRef(null);

  // Effect 1: Run the interval tick while cooldown is active
  useEffect(() => {
    if (cooldown <= 0) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [cooldown]);

  // Effect 2: When cooldown reaches 0, clear the error message (never inside updater)
  useEffect(() => {
    if (cooldown === 0) {
      setErrorMessage('');
    }
  }, [cooldown]);

  const startCooldown = (seconds = 30) => {
    clearInterval(intervalRef.current);
    setCooldown(seconds);
  };

  const isDisabled = isGenerating || cooldown > 0;

  const handleGenerate = async () => {
    if (isDisabled) return;

    const cleanTopic = topic.trim();

    if (!cleanTopic) {
      setErrorMessage('Enter a topic before generating.');
      return;
    }

    if (cleanTopic.length < 3) {
      setErrorMessage('Add a little more detail to your topic.');
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);

    try {
      const response = await generateCarousel(cleanTopic);
      setSlides(response);
    } catch (err) {
      const msg = String(err?.message || '');
      console.log('API ERROR:', err);

      if (msg === 'RATE_LIMIT') {
        setErrorMessage("You're generating too fast. Please wait a few seconds.");
        startCooldown(30);
        // If no slides yet, show fallback so panel isn't empty
        if (!slides || slides.length === 0) {
          setSlides(FALLBACK_SLIDES);
        }
      } else if (msg === 'MISSING_KEY') {
        // No API key — show fallback + helpful message
        setErrorMessage('No API key set. Showing example slides.');
        setSlides(FALLBACK_SLIDES);
      } else {
        // Any other error — always show fallback slides, never blank
        setErrorMessage('API unavailable. Showing example slides.');
        setSlides(FALLBACK_SLIDES);
      }
    } finally {
      setIsGenerating(false);
      onGenerated();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleGenerate();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 transition focus-within:border-primary"
    >
      <textarea
        className="min-h-[170px] w-full resize-none bg-transparent p-2 text-lg text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70 md:text-xl"
        placeholder="Type messy ideas… AI will structure it into a polished carousel"
        value={topic}
        onChange={(e) => {
          setTopic(e.target.value);
          if (errorMessage && cooldown === 0) setErrorMessage('');
        }}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
      />

      {/* Error / Rate limit message */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {errorMessage}
          {cooldown > 0 && (
            <span className="ml-2 tabular-nums text-rose-500">
              Try again in {cooldown}s
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {cooldown > 0
            ? `Cooling down — ${cooldown} second${cooldown !== 1 ? 's' : ''} left`
            : 'Press Enter or click Generate.'}
        </p>

        <button
          type="submit"
          disabled={isDisabled}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold text-white shadow-lg transition active:scale-95 ${
            isDisabled
              ? 'cursor-not-allowed bg-slate-300 text-slate-600 shadow-none'
              : 'bg-primary shadow-emerald-900/15 hover:bg-primary-hover'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="h-5 w-5 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : cooldown > 0 ? (
            <>
              Wait {cooldown}s
            </>
          ) : (
            <>
              Generate Carousel
              <Sparkles size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
