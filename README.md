<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/dark/header.svg" />
  <img src="assets/light/header.svg" alt="Sketches Architecture Header" width="100%" />
</picture>

</div>

## 🚀 Overview

**Sketches** is a real-time collaborative drawing application and AI-assisted diagramming engine built for scale and aesthetic restraint. Architected as a high-performance **pnpm monorepo** with Turborepo, it pairs a Next.js 16 frontend with an Express.js HTTP API and a standalone WebSocket server for live stroke-by-stroke canvas synchronization.

Designed around a curated Moonlight & Oxford Navy design system (`#02122F` dark surface, `#F0ECDD` text, `Cormorant Garamond` serif wordmarks, and `Jost` sans-serif controls), Sketches delivers a distraction-free environment for deep thinking, wild diagrams, and quiet focus.

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

- ⚡ **Real-Time WebSocket Synchronization**: Sub-millisecond multi-user stroke and cursor broadcasting connected via 5-character lining code slugs (e.g. `cdY3V`).
- ✍️ **12 Core Canvas Tools**: Selection, Pan (`grab`/`grabbing`), Rectangle, Diamond, Ellipse, Arrow, Line, Freehand Pencil, Text, Image, Eraser, and Laser Pointer.
- 🪄 **Decaying Eraser Trail**: Opacity-decay animation (`350ms`) rendered behind active eraser movements with a floating circular ring cursor overlay.
- 🤖 **AI Diagramming & Generation**: Groq AI integration (`/api/text-to-diagram`, `/api/mermaid-to-diagram`, `/api/wireframe-to-code`) to convert natural language descriptions and Mermaid code into interactive canvas shapes.
- 🏠 **Dashboard & Hard Room Limits**: Read-only generated code displays, instant inline clipboard sharing, fixed card boundaries, and a hard 3-room active limit per account.
- 🌌 **Sketches+ Pro Showcase**: Full-bleed hero artwork (`/orbital-dawn.png`), animated phrase rotation, and feature cards.
- 🔒 **Production Ready Security**: JWT authentication, Zod schema validation, CORS origin parameterization, and Neon Serverless PostgreSQL integration.

---

## 🛠️ Technical Stack

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
