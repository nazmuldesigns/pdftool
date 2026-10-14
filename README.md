# PDF Toolbox

> All-in-One, Private, Fast & Modular Document Utility Web Application.
> Inspired by the utility of PDF24 Tools, built with independent architecture, privacy-first client execution, and original design.

---

## Highlights

- **Privacy-First:** Core tools (Merge, Split, Rotate, Compress, Remove Pages, Watermark, Numbers, Images-to-PDF, Metadata Scrubbing) run 100% inside your browser. No files leave your machine for client operations.
- **Modern SaaS Aesthetics:** Clean, accessible design system with native light/dark theme support (`color-scheme: light dark`), fluid typography, and responsive desktop/tablet/mobile layouts.
- **Zero Mock Buttons:** Every advertised tool is either fully functional with real byte manipulation or explicitly documents its phased technical roadmap.
- **Monorepo Architecture:** Clean separation into `@pdf-toolbox/shared`, `@pdf-toolbox/pdf-tools`, `@pdf-toolbox/web`, and `@pdf-toolbox/pdf-api`.
- **Firebase & Cloud Run Ready:** Security rules (`firestore.rules`, `storage.rules`), composite indexes, and Cloud Run Dockerfiles included.

---

## Monorepo Layout

- `apps/web`: React 19 + TypeScript + Vite frontend
- `packages/shared`: Data schemas, complete tool inventory, retention policies, and constants
- `packages/pdf-tools`: High-performance PDF processing operations and execution adapter
- `services/pdf-api`: Google Cloud Run job orchestration API
- `services/pdf-worker`: Containerized document processing worker (LibreOffice, Ghostscript, QPDF, Tesseract)
- `firebase`: Firebase Hosting, Firestore Rules, and Cloud Storage Rules
- `tests`: Automated test suite for registry integrity, retention logic, and PDF operations
- `docs`: Architecture manifesto, feature registry, and operations manual

---

## Quickstart

```bash
# 1. Install dependencies across workspaces
npm install

# 2. Run automated test suite
npm run test

# 3. Launch local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.
