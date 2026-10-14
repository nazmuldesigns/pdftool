import * as pdfjsLib from 'pdfjs-dist';
import QRCode from 'qrcode';
import JSZip from 'jszip';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PdfPageImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Renders all pages of a PDF to images using pdfjs and canvas
 */
export async function convertPdfToImages(
  pdfBytes: Uint8Array,
  format: 'png' | 'jpeg' = 'png',
  scale = 2.0,
  onProgress?: (progress: number, message: string) => void
): Promise<{ images: PdfPageImage[]; zipBlob: Blob }> {
  onProgress?.(10, 'Loading PDF structure...');
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const images: PdfPageImage[] = [];
  const zip = new JSZip();

  for (let i = 1; i <= numPages; i++) {
    const pct = Math.round(15 + ((i / numPages) * 75));
    onProgress?.(pct, `Rendering page ${i} of ${numPages}...`);

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const dataUrl = canvas.toDataURL(mime, 0.92);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mime, 0.92);
    });

    images.push({
      pageNumber: i,
      dataUrl,
      blob,
      width: viewport.width,
      height: viewport.height
    });

    zip.file(`page-${String(i).padStart(3, '0')}.${ext}`, blob);
  }

  onProgress?.(95, 'Archiving images into ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, `Successfully rendered ${numPages} pages.`);

  return { images, zipBlob };
}

/**
 * Extracts all readable text from a PDF document
 */
export async function extractTextFromPdf(
  pdfBytes: Uint8Array,
  onProgress?: (progress: number, message: string) => void
): Promise<string> {
  onProgress?.(10, 'Loading PDF document...');
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const pct = Math.round(15 + ((i / numPages) * 80));
    onProgress?.(pct, `Extracting text from page ${i} of ${numPages}...`);

    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ');

    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }

  onProgress?.(100, `Text extraction complete (${numPages} pages).`);
  return fullText;
}

/**
 * Renders thumbnail for the first page of a PDF file
 */
export async function getPdfFirstPageThumbnail(
  pdfBytes: Uint8Array,
  scale = 0.4
): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (err) {
    console.error('Thumbnail generation error:', err);
    return '';
  }
}

/**
 * Generates QR code as PNG data URL
 */
export async function generateQrCodeDataUrl(content: string, margin = 2): Promise<string> {
  return await QRCode.toDataURL(content, {
    width: 600,
    margin,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
}
