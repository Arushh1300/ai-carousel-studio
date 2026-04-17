# AI Carousel Studio

An AI-powered studio that converts messy ideas into structured, ready-to-post social media carousels.

---

## 🚀 Features

* Generate 6-slide carousels from any idea
* Handles messy, unstructured input intelligently
* Smooth slide navigation (next/prev)
* Download all slides as images
* Graceful fallback when API fails

---

## 🧠 Problem

Creating educational content for parents is slow and requires structuring ideas clearly.
Most users struggle to convert raw thoughts into engaging posts.

---

## 💡 Solution

This tool takes messy input and transforms it into a structured storytelling format:

**Hook → Problem → Insight → Tip → Example → CTA**

---

## 🛠 Tech Stack

* React (Vite)
* Tailwind CSS
* Groq API (LLM)

---

## 🔗 Live Demo

👉 https://carousel-studio-ai.vercel.app/

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

* Designed to handle messy input and convert it into usable content
* Built with focus on simplicity, speed, and reliability

---

## 📄 License

This project is for educational/demo purposes.
