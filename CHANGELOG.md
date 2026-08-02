# Changelog

All notable changes to Vid.md will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] — 2026-08-02

### Added

- Real YouTube summarization via Google Gemini Free Tier (`GEMINI_API_KEY`)
- YouTube video id extraction and canonical watch URL helpers
- Localized API errors for missing key, quota, and unavailable videos
- Optional `GEMINI_MODEL` override (default `gemini-3.5-flash`)
- Vercel function `maxDuration` of 60s for `/api/summarize`

### Changed

- Replaced summarization stub with Gemini `generateContent` + YouTube `fileUri`
- App version bumped to `1.2.0`
- README documents free AI Studio setup for local and Vercel

## [1.1.0] — 2026-08-02

### Added

- Hybrid ecosystem: shared React UI for Electron desktop and Vercel web
- Platform adapter (`src/platform/vidmdClient.ts`) for desktop IPC vs web HTTP
- Vercel serverless endpoint `api/summarize` plus local Vite middleware for `dev:web`
- Optional Electron cloud routing via `VIDMD_API_URL`
- Scripts `dev:web` and `build:web`, `.env.example`, and `vercel.json`
- Dark mode toggle with localStorage persistence and system preference fallback
- Animated theme transition, result panel entrance, and typewriter reveal for summaries
- App-wide language switcher (UI + summary), defaulting to English (US)

### Changed

- App version bumped to `1.1.0`
- README updated for the full desktop + web workflow

## [1.0.0] — 2026-08-02

### Added

- Initial Electron + React + TypeScript + Tailwind architecture
- Main / preload / renderer process separation with context isolation
- Core modules for version reading and summarization stub (`src/core/`)
- Minimal macOS-inspired UI: YouTube URL input, language selector, Markdown output, copy & export actions
- App version exposed from main process to renderer via preload bridge
- Portable packaging targets via electron-builder (`build:mac`, `build:win`)
- Consolidated bilingual README (English + Português)
