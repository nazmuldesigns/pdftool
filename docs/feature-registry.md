# PDF Toolbox — Feature & Implementation Registry

This registry tracks every advertised tool from the Master Specification across the six planned phases.
As mandated by Rule 2: **Every tool must have a real implementation or an explicitly documented pending status. Never show a fake success message or an inoperative placeholder button.**

| Category | Tool Name | ID | Status | Engine |
| :--- | :--- | :--- | :--- | :--- |
| **A. Core PDF** | Merge PDF | `merge-pdf` | **Ready (Phase 1)** | Client (pdf-lib) |
| **A. Core PDF** | Split PDF | `split-pdf` | **Ready (Phase 1)** | Client (pdf-lib + JSZip) |
| **A. Core PDF** | Compress PDF | `compress-pdf` | **Ready (Phase 1)** | Client (pdf-lib object packing) |
| **A. Core PDF** | Rotate Pages | `rotate-pages` | **Ready (Phase 1)** | Client (pdf-lib) |
| **A. Core PDF** | Images to PDF | `images-to-pdf` | **Ready (Phase 1)** | Client (Canvas / pdf-lib) |
| **A. Core PDF** | PDF to Images | `pdf-to-images` | **Ready (Phase 1)** | Client (PDF.js / Canvas) |
| **A. Core PDF** | Sign PDF | `sign-pdf` | **Ready (Phase 1)** | Client (Electronic signature) |
| **A. Core PDF** | Create PDF | `create-pdf` | **Ready (Phase 1)** | Client (pdf-lib font rendering) |
| **B. Creation** | Text & Markdown to PDF | `text-to-pdf` | **Ready (Phase 1)** | Client (pdf-lib layout engine) |
| **B. Creation** | QR Code to PDF | `qr-code-to-pdf` | **Ready (Phase 1)** | Client (Canvas / pdf-lib) |
| **B. Creation** | Camera to PDF | `camera-to-pdf` | Scheduled (Phase 2) | Client MediaStream API |
| **C. Invoice** | Create Invoice | `invoice-generator` | **Ready (Phase 1)** | Client (pdf-lib invoice layout) |
| **C. Invoice** | Electronic Invoice (ZUGFeRD) | `e-invoice-generator` | Scheduled (Phase 5) | Cloud Run (XML Schematron) |
| **C. Invoice** | Validate E-Invoice | `validate-e-invoice` | Scheduled (Phase 5) | Cloud Run (EN 16931 rules) |
| **D. Editing** | Add Watermark | `add-watermark` | **Ready (Phase 1)** | Client (pdf-lib vector stamps) |
| **D. Editing** | Add Page Numbers | `add-page-numbers` | **Ready (Phase 1)** | Client (pdf-lib headers/footers) |
| **D. Editing** | Edit Metadata | `edit-metadata` | **Ready (Phase 1)** | Client (pdf-lib info dicts) |
| **D. Editing** | Crop Pages | `crop-pages` | Scheduled (Phase 4) | Client (pdf-lib CropBox) |
| **D. Editing** | Change Page Size | `change-page-size` | Scheduled (Phase 4) | Client (pdf-lib MediaBox scale) |
| **D. Editing** | Overlay PDF | `overlay-pdf` | Scheduled (Phase 4) | Client (Embedded page stamps) |
| **E. Organization** | Remove Pages | `remove-pages` | **Ready (Phase 1)** | Client (pdf-lib page removal) |
| **E. Organization** | Extract Pages | `extract-pages` | **Ready (Phase 1)** | Client (pdf-lib page copying) |
| **E. Organization** | Rearrange Pages | `rearrange-pages` | **Ready (Phase 1)** | Client (pdf-lib sequence build) |
| **E. Organization** | Halve Pages | `halve-pages` | Scheduled (Phase 2) | Client (Crop/split viewport) |
| **F. Optimization** | OCR Scanned PDF | `ocr-pdf` | Scheduled (Phase 5) | Cloud Run (Tesseract OCR) |
| **F. Optimization** | Repair PDF | `repair-pdf` | Scheduled (Phase 5) | Cloud Run (QPDF / Ghostscript) |
| **F. Optimization** | Convert PDF to PDF/A | `pdf-to-pdfa` | Scheduled (Phase 5) | Cloud Run (Ghostscript PDF/A) |
| **G. Security** | Protect PDF | `protect-pdf` | **Ready (Phase 1)** | Client (Standard encryption) |
| **G. Security** | Unlock PDF | `unlock-pdf` | **Ready (Phase 1)** | Client (Decryption pass) |
| **G. Security** | Scrub / Remove Metadata | `remove-metadata` | **Ready (Phase 1)** | Client (Deep metadata purge) |
| **G. Security** | Secure Password Generator | `password-generator` | **Ready (Phase 1)** | Client (Crypto.getRandomValues) |
| **G. Security** | Permanently Redact PDF | `redact-pdf` | Scheduled (Phase 4) | Cloud Run (Vector sanitization) |
| **H. Viewing** | View & Read PDF | `view-pdf` | **Ready (Phase 1)** | Client (PDF.js viewer) |
| **H. Viewing** | Compare Two PDFs | `compare-pdf` | Scheduled (Phase 5) | Client (Dual-canvas diffing) |
| **I. Convert to PDF** | Word to PDF | `word-to-pdf` | Scheduled (Phase 3) | Cloud Run (LibreOffice container) |
| **I. Convert to PDF** | PowerPoint to PDF | `powerpoint-to-pdf` | Scheduled (Phase 3) | Cloud Run (LibreOffice container) |
| **I. Convert to PDF** | Excel to PDF | `excel-to-pdf` | Scheduled (Phase 3) | Cloud Run (LibreOffice container) |
| **J. Convert from PDF** | PDF to Word (DOCX) | `pdf-to-word` | Scheduled (Phase 3) | Cloud Run (PyMuPDF / LibreOffice) |
| **J. Convert from PDF** | PDF to Plain Text | `pdf-to-text` | **Ready (Phase 1)** | Client (PDF.js text extractor) |
| **K. Image Converter** | WEBP to JPG | `webp-to-jpg` | **Ready (Phase 1)** | Client (Canvas JPEG encoder) |
| **K. Image Converter** | WEBP to PNG | `webp-to-png` | **Ready (Phase 1)** | Client (Canvas PNG encoder) |
| **L. Platform** | Saved Documents | `saved-documents` | **Ready (Phase 1)** | LocalStorage / Cloud Firestore |
| **L. Platform** | Recent Tasks & History | `recent-tasks` | **Ready (Phase 1)** | LocalStorage / Cloud Firestore |
| **L. Platform** | PWA & Offline Shell | `pwa-offline` | **Ready (Phase 1)** | Vite PWA / Static bundle |
