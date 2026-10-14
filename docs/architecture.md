# PDF Toolbox — Architecture & Technical Manifesto

## 1. System Overview

**PDF Toolbox** is an independent, modular, privacy-first PDF utility web application inspired by PDF24 Tools. It provides both pure in-browser client-side execution (via PDF-Lib and WebAssembly) and asynchronous cloud processing (via Google Cloud Run containerized workers).

### Monorepo Structure

```
├── apps/
│   └── web/                   # React 19 + TypeScript + Vite frontend
├── packages/
│   ├── shared/                # Core types, category definitions, tool registry, retention rules
│   ├── pdf-tools/             # PDF processing operations and execution adapter
│   └── ui/                    # Design tokens and shared UI components
├── services/
│   ├── pdf-api/               # Node.js job orchestration and polling API for Cloud Run
│   └── pdf-worker/            # Docker container with LibreOffice, Ghostscript, QPDF, Tesseract
├── firebase/
│   ├── firebase.json          # Hosting, Firestore, and Cloud Storage configuration
│   ├── firestore.rules        # Strict database security rules
│   ├── storage.rules          # Strict file storage security rules
│   └── firestore.indexes.json # Composite query indexes
├── tests/
│   └── test-suite.mjs         # Automated regression and integrity tests
└── docs/
    ├── architecture.md
    ├── feature-registry.md
    └── operations-and-deployment.md
```

---

## 2. Processing Pipeline: Client-First vs. Cloud-Assisted

### A. Client-Side Operations (Private, Instant, Free)
All Core PDF manipulations (Merge, Split, Rotate, Delete Pages, Extract Pages, Reorder Pages, Watermark, Page Numbers, Metadata Scrubbing/Editing, Images-to-PDF, Text-to-PDF, Password Generation, and Image Conversion) execute directly in the user's browser.
- **Privacy:** Document bytes never traverse any network.
- **Cost:** $0 compute and storage costs.
- **Speed:** Instant processing bounded only by client CPU and RAM.

### B. Cloud-Assisted Operations (Phases 3–5)
Operations requiring specialized system engines (LibreOffice for Word/Excel/PowerPoint conversion, Tesseract for OCR, QPDF for structural repair, and ZUGFeRD Schematron validators for e-invoicing) are routed through asynchronous jobs.
- **Client uploads** to a short-lived temporary storage bucket with signed URLs.
- **Cloud Run Worker** pulls the object, performs deterministic processing with memory limits, and writes the output.
- **Client polls** `/api/jobs/:id` for progress updates.
- **Immediate cleanup:** Intermediates deleted immediately; outputs expired and purged after 24 hours.

---

## 3. Data & Security Architecture

### Firestore Collections
- `users/{uid}`: Profile, preferences, and retention configuration.
- `users/{uid}/jobs/{jobId}`: Job lifecycle metadata, error codes, and progress metrics.
- `users/{uid}/documents/{documentId}`: User-saved documents with storage paths and expiration timestamps.

### Storage Security
- **No public buckets:** Public read is strictly disabled by default.
- **Authenticated isolation:** Users can only read and write to `users/{userId}/*`.
- **Retention schedule:**
  - Anonymous temporary uploads: Purged after 1 hour.
  - Temporary job outputs: Purged after 24 hours.
  - User-saved documents: Kept until user deletion or quota exhaustion.
