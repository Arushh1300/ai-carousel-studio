# AI Carousel Studio

An AI-powered studio that converts messy ideas into structured, ready-to-post social media carousels.

---

## 🔗 Live Demo

👉 https://carousel-studio-ai.vercel.app/

---

## 🚀 Features

* Generate 6-slide carousels from any idea
* Handles messy, unstructured input intelligently
* Smooth slide navigation (next/prev)
* Download all slides as images
* Graceful fallback when API fails

---

## ⚙️ How It Works

1. User enters a messy idea
2. AI structures it into a 6-slide story
3. Slides follow a clear flow:
   **Hook → Problem → Insight → Example → Takeaway → CTA**
4. User can preview and download instantly

---

## 🧠 Problem

Creating educational content for parents is slow and requires structuring ideas clearly.
Most users struggle to convert raw thoughts into engaging posts.

---

## 💡 Solution

This tool transforms unstructured input into a clean storytelling format that is ready to post on social media.

---

## 🛠 Tech Stack

* React (Vite)
* Tailwind CSS
* Groq API (LLM)

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
* Kept UI minimal and fast
* Added fallback system to handle API failures

---

## ⚖️ Trade-offs

* Limited to carousel format only
* No authentication to reduce friction
* No image generation to keep performance fast

---

## 🚀 Future Improvements

* Editable slides
* Multiple formats (stories, posts)
* Brand templates and themes

---

## 📌 Notes

* Designed to handle messy input effectively
* Built with focus on simplicity, speed, and reliability

---

## 📄 License

This project is for educational/demo purposes.
