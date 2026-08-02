# Vid.md

Turn a YouTube link into a clean Markdown summary via cloud AI — as a portable desktop app and a web app on Vercel.

Transforme um link do YouTube em um resumo limpo em Markdown via IA na nuvem — como app desktop portable e app web na Vercel.

**License / Licença:** [MIT](LICENSE)

| Language | Section |
| --- | --- |
| English (US) | [English (US)](#english-us) |
| Português (Brasil) | [Português (Brasil)](#português-brasil) |

---

## English (US)

### Scope

Vid.md is an internet-only product with a **hybrid ecosystem**:

- **Desktop** — portable Electron builds for macOS (`.app` / `.dmg`) and Windows (standalone `.exe`)
- **Web** — the same React UI deployed on **Vercel**, with a serverless `/api/summarize` endpoint

Built with **Electron**, **React**, **TypeScript**, **Tailwind CSS**, and **Vite**. Cloud AI processing is still stubbed; the architecture is ready for a real provider.

### Requirements

- Node.js 20+
- npm 10+
- Internet connection (runtime)

### Install dependencies

```bash
npm install
```

### Development

```bash
# Desktop (Electron + Vite)
npm run dev

# Web only (browser + local /api/summarize middleware)
npm run dev:web
```

- `npm run dev` compiles Electron main/preload, starts Vite on `http://localhost:5173`, and opens the desktop window.
- `npm run dev:web` serves the UI in the browser with the same summarize stub over HTTP.

### Production builds

```bash
# Compile renderer + Electron processes
npm run build

# Web static assets (used by Vercel)
npm run build:web

# Package for macOS (.dmg / .app)
npm run build:mac

# Package for Windows (standalone portable .exe, no installer)
npm run build:win
```

Desktop artifacts are written to `release/`.

### Deploy on Vercel

1. Import this repository in Vercel.
2. Framework Preset: Other (or leave automatic — `vercel.json` sets `buildCommand` / `outputDirectory`).
3. Deploy. The SPA is served from `dist/` and `api/summarize` runs as a serverless function.

Optional env for the desktop app pointing at production:

```bash
VIDMD_API_URL=https://your-app.vercel.app
```

See [`.env.example`](.env.example).

### Architecture notes

- `electron/` — Main and preload processes
- `src/` — Shared React UI
- `src/platform/` — Desktop vs web client adapter (UI must use this only)
- `src/core/` — Shared logic (version, YouTube validation, summarization stub)
- `api/` — Vercel serverless functions
- Security: context isolation on, Node integration off; secrets never in the renderer

### License

This project is licensed under the [MIT License](LICENSE).

---

## Português (Brasil)

### Escopo

O Vid.md é um produto **apenas online** com **ecossistema híbrido**:

- **Desktop** — builds portable Electron para macOS (`.app` / `.dmg`) e Windows (`.exe` standalone)
- **Web** — a mesma UI React publicada na **Vercel**, com endpoint serverless `/api/summarize`

Construído com **Electron**, **React**, **TypeScript**, **Tailwind CSS** e **Vite**. O processamento via IA ainda é stub; a arquitetura já está preparada para um provedor real.

### Requisitos

- Node.js 20+
- npm 10+
- Conexão com a internet (em execução)

### Instalar dependências

```bash
npm install
```

### Desenvolvimento

```bash
# Desktop (Electron + Vite)
npm run dev

# Somente web (browser + middleware local /api/summarize)
npm run dev:web
```

- `npm run dev` compila main/preload do Electron, sobe o Vite em `http://localhost:5173` e abre a janela do app.
- `npm run dev:web` serve a UI no navegador com o mesmo stub de resumo via HTTP.

### Builds de produção

```bash
# Compila renderer + processos Electron
npm run build

# Assets estáticos web (usados pela Vercel)
npm run build:web

# Empacota para macOS (.dmg / .app)
npm run build:mac

# Empacota para Windows (.exe portable standalone, sem instalador)
npm run build:win
```

Os artefatos desktop são gerados em `release/`.

### Deploy na Vercel

1. Importe este repositório na Vercel.
2. Framework Preset: Other (ou automático — o `vercel.json` define `buildCommand` / `outputDirectory`).
3. Faça o deploy. A SPA sai de `dist/` e `api/summarize` roda como função serverless.

Env opcional para o desktop apontar para produção:

```bash
VIDMD_API_URL=https://seu-app.vercel.app
```

Veja [`.env.example`](.env.example).

### Notas de arquitetura

- `electron/` — Processos main e preload
- `src/` — UI React compartilhada
- `src/platform/` — Adapter desktop vs web (a UI deve usar somente este client)
- `src/core/` — Lógica compartilhada (versão, validação YouTube, stub de resumo)
- `api/` — Funções serverless da Vercel
- Segurança: context isolation ativado, nodeIntegration desativado; segredos nunca no renderer

### Licença

Este projeto está sob a [Licença MIT](LICENSE).
