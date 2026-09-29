# 🧠 Java-RAG React Frontend

A modern, high-aesthetic web interface for the **Java-RAG AI Knowledge Assistant** built with **React**, **Vite**, and **Vanilla CSS**.

---

## 🚀 Quick Start

From the `frontend` folder:

```bash
# Install dependencies (already installed)
npm install

# Start Vite dev server
npm run dev

# Or build for production
npm run build
```

The application will run on **`http://localhost:5173`** and automatically connects to your Spring Boot backend on **`http://localhost:8081`**.

---

## ✨ Features & Architecture

| Feature Tab | Endpoint Connected | Capabilities |
|---|---|---|
| **🧠 RAG Assistant** | `POST /api/ai/ask` | Grounded question answering backed by PostgreSQL + pgvector similarity search. Features step-by-step pipeline indicators, starter chips, response copy, and text-to-speech. |
| **📥 Knowledge Base** | `POST /api/ai/documents` | Ingest knowledge into pgvector. Features drag-and-drop file upload (`.txt`, `.md`, `.json`, `.csv`), character/token/chunk preview, 1-click preset templates, and session history with direct RAG query shortcuts. |
| **💬 General Chat** | `POST /api/ai/chat` | Conversational playground directly with the LLM (OpenAI / Ollama) without vector retrieval. Includes conversation export to Markdown. |
| **📋 Text Summarizer** | `POST /api/ai/summarize` | Showcases Spring AI's structured entity extraction (`SummaryResponse`). Displays Title, Executive Summary, Key Points, and raw JSON schema toggle. |
| **⚙️ System Settings** | Health Probe | Configure backend port/URL on the fly, run connection latency tests, and review active vector store configuration. |

---

## 🎨 Design System

- **Palette**: Dark obsidian (`#080b11`), frosted glass surfaces, and tailored accents (Indigo `#6366f1`, Cyan `#06b6d4`, Emerald `#10b981`).
- **Typography**: Google Fonts (*Plus Jakarta Sans*, *Outfit*, and *JetBrains Mono*).
- **Responsive**: Adapts dynamically for desktops, laptops, and tablet displays.

## PROJECT SCREENSHOTS

<img width="1919" height="830" alt="image" src="https://github.com/user-attachments/assets/3efcfa11-3d5e-4df6-8adf-0d4c18e4ee4a" />
<img width="1919" height="958" alt="image" src="https://github.com/user-attachments/assets/4c7ee46c-0410-4d82-b1c7-6cd1335de87b" />
<img width="1918" height="879" alt="image" src="https://github.com/user-attachments/assets/341dc388-b3bd-4256-8d6e-119be85de663" />
<img width="1916" height="788" alt="image" src="https://github.com/user-attachments/assets/fc3f0d01-ad1b-4b49-8f30-e9e8ec331183" />

