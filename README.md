<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/dark/header.svg" />
  <img src="assets/light/header.svg" alt="Sketches Architecture Header" width="100%" />
</picture>

<p></p>

<a href="https://sketches-canvas.vercel.app/"><img src="https://img.shields.io/badge/Live_App-sketches--canvas.vercel.app-F0ECDD?style=for-the-badge&logo=vercel&logoColor=02122F" height="34" alt="Live App" /></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://www.linkedin.com/in/suhani-%E3%85%A4-%E2%80%8E-6b30702a0"><img src="https://img.shields.io/badge/LinkedIn-Suhani_Verma-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" height="34" alt="LinkedIn" /></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://suhanive.netlify.app/"><img src="https://img.shields.io/badge/Portfolio-suhanive.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" height="34" alt="Portfolio" /></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/tecnicoviola/Sketches"><img src="https://img.shields.io/badge/GitHub-tecnicoviola%2FSketches-181717?style=for-the-badge&logo=github&logoColor=white" height="34" alt="GitHub Repo"/></a>

<p></p>

</div>

## 🚀 Overview

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/dark/overview.svg" />
    <img src="assets/light/overview.svg" alt="Overview and Philosophy" width="100%" />
  </picture>
</div>

---

## 🧠 System Architecture

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/dark/architecture.svg" />
    <img src="assets/light/architecture.svg" alt="Monorepo Architecture Diagram" width="100%" />
  </picture>
</div>

### 🗂️ Workspace Directory Topology

```text
sketches/
├── apps/
│   ├── sketches-frontend/      # Next.js 16 frontend (Canvas engine, Dashboard, Sketches+)
│   ├── http-backend/           # Express.js API (Auth, Room routes, Prisma client)
│   └── ws-backend/             # Node.js WebSocket server (Real-time broadcasting)
│
├── packages/
│   ├── common/                 # Shared Zod schemas & TypeScript interfaces (types.ts)
│   ├── backend-common/         # Shared JWT utils & authentication middleware
│   ├── db/                     # Prisma ORM schema, migrations & Client instance
│   ├── typescript-config/      # Shared tsconfig definitions
│   └── eslint-config/          # Shared ESLint configuration
│
├── turbo.json                  # Turborepo task pipeline configuration
├── package.json                # Root monorepo workspace dependencies
└── README.md                   # Project documentation
```

---

## ✨ Features & Capabilities

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/dark/features.svg" />
    <img src="assets/light/features.svg" alt="Features and Capabilities" width="100%" />
  </picture>
</div>

---

## 🛠️ Technical Stack

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/dark/stack.svg" />
    <img src="assets/light/stack.svg" alt="Technical Stack Grid" width="100%" />
  </picture>
</div>

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router, Turbopack) | Server &amp; Client Components, Lucide React, Custom HTML5 2D Canvas Engine |
| **HTTP Backend** | Express.js / Node.js | REST API for Auth (`/signup`, `/signin`), Room CRUD, and JWT signing |
| **Realtime Engine**| WebSockets (`ws`) | Dedicated WebSocket server handling room subscriptions and broadcasts |
| **Database &amp; ORM** | PostgreSQL &amp; Prisma ORM | Relational schema for Users, Rooms, Chats, Comments, and Threads |
| **AI Integration** | Groq API | LLM-assisted text-to-diagram &amp; Mermaid code generation |
| **Architecture** | Turborepo &amp; pnpm 10 | High-speed monorepo task orchestration and workspace dependencies |
| **Styling** | Vanilla CSS Tokens | `--oxford: #02122F`, `--moonlight: #F0ECDD`, `Cormorant Garamond`, `Jost` |
| **Deployment** | Vercel &amp; Render | Vercel (Frontend), Render (HTTP &amp; WS Backends), Neon (Database) |

---

## 🎥 Project Showcase (OpenScreen Demo)

<div align="center">
  <!-- 
    ===================================================================
    OPENSCREEN VIDEO DEMO PLACEHOLDER
    Replace the src below with your OpenScreen video link or asset path:
    ===================================================================
  -->
  <video src="assets/sketches-showcase.mp4" width="100%" controls poster="assets/thumbnail-poster.png" style="border-radius: 8px; border: 1px solid rgba(240,236,221,0.15);">
    Your browser does not support the video tag.
  </video>
  <p><i>Recorded with OpenScreen — Demonstrating real-time WebSocket synchronization, custom drawing tools, decaying eraser trail, and AI diagramming.</i></p>
</div>

---

## ⚙️ Setup & Deployment Guide

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/dark/setup.svg" />
    <img src="assets/light/setup.svg" alt="Setup and Deployment Guide" width="100%" />
  </picture>
</div>

---

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/dark/footer.svg" />
    <img src="assets/light/footer.svg" alt="Footer Status" width="100%" />
  </picture>
</div>
