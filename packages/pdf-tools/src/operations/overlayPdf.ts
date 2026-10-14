import { PDFDocument } from 'pdf-lib';

export interface OverlayPdfOptions {
  opacity?: number;
  onProgress?: (progress: number, message: string) => void;
}

export async function overlayPdfDocuments(
  primaryBuffer: Uint8Array,
  overlayBuffer: Uint8Array,
  options: OverlayPdfOptions = {}
): Promise<Uint8Array> {
  const { opacity = 0.85, onProgress } = options;

  onProgress?.(15, 'Loading primary and overlay PDF documents...');
  const pdfDoc = await PDFDocument.load(primaryBuffer, { ignoreEncryption: true });
  const overlayDoc = await PDFDocument.load(overlayBuffer, { ignoreEncryption: true });

  const embeddedPages = await pdfDoc.embedPdf(overlayDoc);
  if (embeddedPages.length === 0) {
    throw new Error('Overlay PDF contains no pages.');
  }

  const defaultOverlayPage = embeddedPages[0];
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const pct = Math.round(25 + ((i / total) * 65));
    onProgress?.(pct, `Applying overlay to page ${i + 1} of ${total}...`);
    const page = pages[i];
    const pageDims = page.getSize();
    const overlayToUse = embeddedPages[i] || defaultOverlayPage;

    page.drawPage(overlayToUse, {
      x: 0,
      y: 0,
      width: pageDims.width,
      height: pageDims.height,
      opacity: Math.max(0.1, Math.min(1.0, opacity))
    });
  }

  onProgress?.(92, 'Saving combined overlay document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, `Overlay applied to ${total} pages.`);

  return outputBytes;
}
