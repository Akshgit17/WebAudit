# WebAudit UI

The React + TypeScript web interface for [WebAudit](../README.md) — an accessibility audit platform that reads your website the way a user does: in HTML, in rendered pixels, and across the journeys between pages.

---

## Overview

WebAudit UI provides an interactive interface to trigger audits, monitor progress, inspect visual violations on rendered screenshot canvases, and export comprehensive WCAG 2.2 accessibility reports.

Audits are evaluated by the backend microservices (CrawlerAPI, PageBuilder, VisualDesignAudit, InformationArchitectureAudit, ContentAudit, AuditManager) communicating over Neo4j and Pub/Sub.

### Key Capabilities

- **Visual Inspections** — color contrast, typography scale, whitespace, and logo placement calculated against actual rendered browser pixels.
- **Interactive Screenshot Canvas** — overlays bounding boxes and numbered violation markers on page screenshots at scaled viewport coordinates.
- **Information Architecture** — landmarks, heading hierarchy, link accessibility, and SEO metadata.
- **User Journeys** — automated headless browser walkthroughs across user interaction paths.
- **Export Reports** — download findings in Excel spreadsheet (.xlsx) or formatted PDF formats.
- **Local-First Architecture** — runs entirely locally without requiring live GCP credentials or cloud accounts.

---

## Quick Start (Local Development)

### Prerequisites

- **Node.js**: v18+ (v20+ recommended)
- **npm**: v9+

### Installation & Run

1. Navigate to the UI directory:
   ```bash
   cd WebAudit-UI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application starts at `http://localhost:4200/` (bound to `0.0.0.0:4200`).

4. Or run via Docker Compose (from repo root):
   ```bash
   docker compose up ui
   ```

---

## Development Commands

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server on port 4200 |
| `npm test` | Runs Vitest unit test suite (components, URL normalisation, SSRF prevention) |
| `npm test:watch` | Runs Vitest in interactive watch mode |
| `npm run build` | Builds production bundle into `dist/` |
| `npm run preview` | Previews the production build locally on port 4200 |

---

## Authentication & Configuration

The application reads runtime configuration from `/config.json` at startup.

### Local Development (Zero Credentials Needed)
By default, WebAudit UI operates with a built-in local development user (`Local Developer`, `local-dev-user@webaudit.local`). No Auth0 credentials or API keys are required to use the local stack.

### Optional Integrations
If connecting to external services in staging or production, edit `.env` or `public/config.json`:

```json
{
  "production": false,
  "base_url": "http://localhost:4200",
  "api_url": "http://localhost:9080/v1",
  "auth": {
    "domain": "your-auth0-domain.auth0.com",
    "clientId": "your-auth0-client-id",
    "authorizationParams": {
      "audience": "https://your-api-domain.com",
      "redirect_uri": "http://localhost:4200"
    },
    "errorPath": "/error"
  },
  "pusher": {
    "app_id": "",
    "key": "",
    "secret": "",
    "cluster": ""
  }
}
```

---

## Architecture

- **Framework**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS with WebAudit semantic design tokens (`--surface-*`, `--text-*`, `--border-*`, `--score-*`)
- **Routing**: React Router v6 (`react-router-dom`)
- **Testing**: Vitest + React Testing Library + jsdom
- **Icons**: Lucide React icons matching original look and feel

### Routes

- `/` — Landing page with hero, live URL input, and WCAG inspection pillars
- `/audit` — Audit list table with score badges, status chips, and quick audit trigger
- `/audit/:id/page` & `/audit/:id/review` — Page review workspace with interactive screenshot canvas and violation inspector
- `/audit/:id/domain` — Domain audit dashboard with category scores and journey statistics
- `/domains` — Domain management
- `/how-it-works` — 4-step audit walkthrough
- `/integration` — Integrations catalog
- `/account` — User profile and local dev settings
- Compatibility aliases: `/home`, `/sites`, `/audits`, `/audits/:id`, `/settings`, `/integrations`, `/help`
- `*` — 404 Not Found page

---

