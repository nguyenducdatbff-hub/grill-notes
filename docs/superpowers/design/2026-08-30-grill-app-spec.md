# Grill App — Design Spec

> Product decisions locked in via the `grill-me` interview on 2026-08-30.

## Product

A hosted web app that combines note-taking + knowledge base (Obsidian-style) with a Pomodoro focus widget. Deployed to Railway, usable by other people (multi-user).

## Decisions

| Area | Decision |
|---|---|
| Platform | Web app deployed on Railway, public, multi-user |
| Stack | Next.js (App Router) + Postgres + Tailwind CSS |
| Users | Each user owns private data; share a single note via read-only public link |
| Auth | Email + password (Better Auth) |
| Notes | Markdown body, `[[wiki-links]]` backlinks, tags, full-text search |
| AI | Each user enters their own provider API key (stored encrypted server-side). Three interactions: chat panel beside editor, actions on selected text, auto-evaluation after save (incl. "knowledge to master" suggestions) |
| Digest | Daily AI-generated digest (yesterday's notes/tasks/focus + suggestions for today) |
| Pomodoro | Secondary widget: 25/5 timer, focus session log + weekly stats, mini task list, focus mode that hides distracting UI |
| Images/files | Upload images stored in Postgres (bytea); URL links also supported |
| Export/import | Full markdown export to `.zip` (Obsidian-compatible) and import from `.zip` |
| Peak features | Interactive knowledge graph, command palette (Cmd/Ctrl+K), templates, tags + advanced search |
| UI | taste-skill decides the design language; multiple switchable themes |
| Mobile | Mobile-first PWA, installable |

## Global constraints

- Node 20+, npm.
- Next.js App Router, TypeScript strict.
- All AI calls happen server-side; API keys never reach the client.
- API keys encrypted at rest with AES-256-GCM (`ENCRYPTION_KEY`).
- Postgres via `postgres.js` + Drizzle ORM.
- Every user-visible copy in English.
- App name: **Grill** (working title).
