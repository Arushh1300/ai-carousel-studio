# AI Carousel Studio

An AI-powered studio that converts messy ideas into structured, ready-to-post social media carousels.

---

## 🔗 Live Demo

👉 https://carousel-studio-ai.vercel.app/

---

## 🚀 Features

* Generate 6-slide carousels from any idea
* Handles messy, unstructured input intelligently
* Clean storytelling flow (Hook → Problem → Insight → Tip → Example → CTA)
* Editable slides for quick customization
* Per-slide regeneration for fast iteration
* Format support (1:1, 9:16, 4:5)
* Smooth slide navigation (next/prev)
* Download all slides as high-quality images
* Graceful fallback when API fails

---

## ⚙️ How It Works

1. User enters a messy idea
2. AI structures it into a 6-slide story
3. Slides follow a clear storytelling flow
4. User can preview, edit, regenerate, and download instantly

---

## 🧠 Problem

Creating educational content for parents is slow and requires structuring ideas clearly. Most users struggle to convert raw thoughts into engaging posts.

---

## 💡 Solution

This tool transforms unstructured input into a clean storytelling format that is ready to post on social media.

---

## 🛠 Tech Stack

* React (Vite)
* Tailwind CSS
* Groq API (Llama 3.3)

---

## 📦 Local Setup

```bash
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_GROQ_API_KEY=your_api_key_here
```

⚠️ Do NOT commit your API key.

---

## ⚙️ Key Decisions

* Focused on core flow: idea → structured output
* Prioritized clarity and readability over unnecessary visual complexity
* Disabled image generation to maintain consistency and reliability
* Ensured the app never breaks using fallback handling

---

## ⚖️ Trade-offs

* Limited to carousel format only
* No authentication to reduce friction
* Image generation disabled in final version for better UX

---

## 🚀 Future Improvements

* AI-generated visuals with better control
* Brand templates (colors, fonts)
* More formats (stories, posts)
* Slide-level customization enhancements

---

## 📌 Notes

* Designed to handle messy input effectively
* Built with focus on simplicity, speed, and reliability

---

## 📄 License

This project is for educational/demo purposes.
