import { useState } from 'react';
import InputBox from '../components/InputBox';
import CarouselPreview from '../components/CarouselPreview';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState([]);
  const [deckVersion, setDeckVersion] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-5 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] lg:items-center lg:gap-12 lg:py-14">
      <section className="mx-auto flex w-full max-w-2xl flex-col justify-center lg:mx-0">
        <div className="space-y-7">
          <div className="inline-flex w-fit items-center rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-primary">
            AI creative studio
          </div>

          <h1 className="text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
            Turn messy ideas into ready-to-post carousels.
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Drop in raw notes, comparisons, or half-formed angles. The studio turns them into six focused social slides.
          </p>

          <div className="pt-4">
            <InputBox
              topic={topic}
              setTopic={setTopic}
              slides={slides}
              setSlides={setSlides}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              onGenerated={() => setDeckVersion((version) => version + 1)}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          </div>
        </div>
      </section>

      <section className="flex min-h-[560px] items-center justify-center rounded-2xl border border-slate-200 bg-white/55 p-4 shadow-xl shadow-slate-900/5 md:p-8">
        <CarouselPreview key={deckVersion} slides={slides} isLoading={isGenerating} />
      </section>
    </main>
  );
}
