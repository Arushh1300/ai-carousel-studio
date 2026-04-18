// ─── Feature flag ─────────────────────────────────────────────────────────────────
const ENABLE_IMAGES = false; // flip to true to re-enable AI image backgrounds

// ─── Helpers ─────────────────────────────────────────────────────────────────

const cleanJson = (text) =>
  text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const limitWords = (value, maxWords) =>
  String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join(' ');

// ─── Image URL Builder (Pollinations.ai — free, no API key) ──────────────────
// Produces a deterministic URL for a given slide. The browser fetches it lazily.
export function buildImageUrl(slide, slideIndex) {
  const prompt = encodeURIComponent(
    `Minimal clean digital illustration, soft pastel abstract art, representing "${slide.title}": ${slide.content
    }. Geometric shapes, no text, no words, no letters, editorial quality, muted palette`
  );
  // seed is stable per slide position → same slide always gets same image
  const seed = (slideIndex + 1) * 137;
  return `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1080&nologo=true&seed=${seed}&model=flux`;
}

// ─── Fallback (shown when API fails) ─────────────────────────────────────────

export const createFallbackCarousel = (topic) => {
  const main = String(topic || 'your idea').split(/[\+,\/\|;]|\band\b/i)[0].trim();
  return [
    { slide: 1, title: `${main} matters`, content: `${main} is changing everything right now.` },
    { slide: 2, title: 'The real problem', content: `Most people ignore how ${main} affects them.` },
    { slide: 3, title: 'Why it happens', content: `${main} goes unnoticed until it is too late.` },
    { slide: 4, title: 'The fix', content: `Start with one small ${main} habit today.` },
    { slide: 5, title: 'See it work', content: `People who use ${main} daily see real results.` },
    { slide: 6, title: 'Save this post', content: `Share this ${main} guide with someone who needs it.` },
  ].map((s) => ({
    slide: s.slide,
    title: limitWords(s.title, 5),
    content: limitWords(s.content, 12),
  }));
};

// ─── Main API Function (Groq) ─────────────────────────────────────────────────

export async function generateCarousel(topic) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.error('[CarouselAI] No API key found. Set VITE_GROQ_API_KEY in .env.local');
    throw new Error('MISSING_KEY');
  }

  const prompt = `You are a JSON API that creates high-quality Instagram carousel content for parents.

Return ONLY a valid JSON array of exactly 6 slides.
Do NOT include markdown.
Do NOT include explanation.
Do NOT include any text outside JSON.

Each slide must have:
- slide (1 to 6)
- title (3–5 words ONLY)
- content (8–12 words ONLY)

Topic: ${topic}

Rules:
- Content MUST be between 8–12 words (not shorter, not longer)
- Titles MUST be between 3–5 words
- Avoid generic phrases
- Make content clear, simple, and educational
- Write like an expert explaining concepts to parents
- No emojis
- No repetition
- Each slide must add new value

Structure:
1 → Hook (curiosity, strong opening)
2 → Problem (clear pain point)
3 → Insight (simple explanation)
4 → Tip (actionable solution)
5 → Example (real-life relatable)
6 → CTA (clear action like save/share/apply)

Example format:
[
  { "slide": 1, "title": "Strong Hook Line", "content": "Engaging sentence that makes readers curious and interested immediately" },
  { "slide": 2, "title": "Clear Problem Here", "content": "Explain the main issue in a simple and relatable way" },
  { "slide": 3, "title": "Simple Insight Explained", "content": "Break down the concept so anyone can easily understand it" },
  { "slide": 4, "title": "Actionable Tip Given", "content": "Provide a practical step users can immediately apply in life" },
  { "slide": 5, "title": "Real Life Example", "content": "Give a relatable example that connects with everyday situations" },
  { "slide": 6, "title": "Clear Call To Action", "content": "Encourage saving, sharing, or applying the learned concept today" }
]`;

  console.log('[CarouselAI] MODEL USED: llama-3.3-70b-versatile (Groq)');
  console.log('[CarouselAI] Topic:', topic);

  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
  } catch (networkErr) {
    console.error('[CarouselAI] Network error:', networkErr.message);
    throw new Error('API_ERROR');
  }

  if (!response.ok) {
    const status = response.status;
    const errorBody = await response.json().catch(() => ({}));
    console.error('[CarouselAI] API call failed with status:', status);
    console.error('[CarouselAI] Error body:', JSON.stringify(errorBody));
    if (status === 429) throw new Error('RATE_LIMIT');
    if (status === 401) throw new Error('MISSING_KEY');
    throw new Error('API_ERROR');
  }

  const data = await response.json();
  console.log('RAW:', data);
  const text = data?.choices?.[0]?.message?.content || '';
  console.log('TEXT:', text);

  const cleanedText = cleanJson(text);

  try {
    const parsed = JSON.parse(cleanedText);

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    const slides = parsed.map((slide, index) => {
      const s = {
        slide: index + 1,
        title: limitWords(slide.title, 5) || `Slide ${index + 1}`,
        content: limitWords(slide.content, 12) || 'Try a sharper topic',
      };
      if (ENABLE_IMAGES) s.image = buildImageUrl(s, index);
      return s;
    });

    console.log('[CarouselAI] Parsed', slides.length, 'slides successfully');
    return slides;
  } catch (parseErr) {
    console.error('[CarouselAI] JSON parse failed:', parseErr.message);
    return [{ slide: 1, title: 'Error', content: 'Try again later' }];
  }
}

// ─── Per-slide Regeneration ───────────────────────────────────────────────────

const SLIDE_LABELS = ['Hook', 'Problem', 'Insight', 'Tip', 'Example', 'CTA'];

/**
 * Regenerate a single slide without touching the others.
 * @param {string} topic       - Original carousel topic
 * @param {number} slideIndex  - 0-based index of the slide to replace
 * @param {Array}  allSlides   - Current full slides array (for context)
 * @returns {Promise<{title:string, content:string}>}
 */
export async function regenerateSlide(topic, slideIndex, allSlides) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('MISSING_KEY');

  const position = SLIDE_LABELS[slideIndex] ?? `Slide ${slideIndex + 1}`;
  const slideNum = slideIndex + 1;
  const totalNum = allSlides.length;

  // Give the model the full carousel context so it stays coherent and non-repetitive
  const context = allSlides
    .map((s, i) =>
      i === slideIndex
        ? `  Slide ${i + 1} [${SLIDE_LABELS[i] ?? 'Slide'}]: ← regenerate this`
        : `  Slide ${i + 1} [${SLIDE_LABELS[i] ?? 'Slide'}]: "${s.title}" — ${s.content}`
    )
    .join('\n');

  const prompt = `You are a JSON API that writes one slide for an Instagram carousel.

Return ONLY a valid JSON object. No markdown. No explanation. No extra text.

The object must have:
- title (3–5 words)
- content (8–12 words)

Carousel topic: ${topic}
Slide to write: Slide ${slideNum} of ${totalNum} — the "${position}" slide
${position === 'Hook' ? 'Goal: strong curiosity opener; make the reader want to swipe.' : ''}
${position === 'Problem' ? 'Goal: state the core pain point clearly and relatably.' : ''}
${position === 'Insight' ? 'Goal: deliver a simple, non-obvious insight about the topic.' : ''}
${position === 'Tip' ? 'Goal: one concrete, actionable tip the reader can use today.' : ''}
${position === 'Example' ? 'Goal: a brief real-world example that illustrates the concept.' : ''}
${position === 'CTA' ? 'Goal: motivate the reader to save, share, or take action.' : ''}

Full carousel context (your new slide must fit naturally and NOT repeat other slides):
${context}

Rules:
- title: exactly 3–5 words, no emojis
- content: exactly 8–12 words, no emojis
- Do NOT repeat ideas from other slides

Return ONLY this JSON:
{ "title": "...", "content": "..." }`;

  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.75,
      }),
    });
  } catch (networkErr) {
    console.error('[regenerateSlide] Network error:', networkErr.message);
    throw new Error('API_ERROR');
  }

  if (!response.ok) {
    const status = response.status;
    if (status === 429) throw new Error('RATE_LIMIT');
    if (status === 401) throw new Error('MISSING_KEY');
    throw new Error('API_ERROR');
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';
  const cleaned = cleanJson(text);

  try {
    const parsed = JSON.parse(cleaned);
    const newSlide = {
      title: limitWords(parsed.title, 5) || `Slide ${slideNum}`,
      content: limitWords(parsed.content, 12) || 'Try a new angle.',
    };
    if (ENABLE_IMAGES) newSlide.image = buildImageUrl(newSlide, slideIndex);
    return newSlide;
  } catch {
    throw new Error('PARSE_ERROR');
  }
}
