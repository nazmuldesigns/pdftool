import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface PageNumberOptions {
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
  format?: 'page-of-total' | 'n-slash-total' | 'page-n' | 'plain';
  startPage?: number;
  fontSize?: number;
  onProgress?: (progress: number, message: string) => void;
}

export async function addPageNumbers(
  pdfBuffer: Uint8Array,
  options: PageNumberOptions = {}
): Promise<Uint8Array> {
  const {
    position = 'bottom-center',
    format = 'page-of-total',
    startPage = 1,
    fontSize = 10,
    onProgress
  } = options;

  onProgress?.(10, 'Loading document...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  onProgress?.(30, `Adding page numbers to ${total} pages...`);
  pages.forEach((page, i) => {
    const pageNum = i + startPage;
    let label = '';
    if (format === 'page-of-total') label = `Page ${pageNum} of ${total}`;
    else if (format === 'n-slash-total') label = `${pageNum} / ${total}`;
    else if (format === 'page-n') label = `Page ${pageNum}`;
    else label = `${pageNum}`;

    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const { width, height } = page.getSize();
    const margin = 28; // ~10mm

    let x = (width - textWidth) / 2;
    let y = margin;

    if (position === 'bottom-right') {
      x = width - textWidth - margin;
      y = margin;
    } else if (position === 'bottom-left') {
      x = margin;
      y = margin;
    } else if (position === 'top-right') {
      x = width - textWidth - margin;
      y = height - margin - fontSize;
    } else if (position === 'top-center') {
      x = (width - textWidth) / 2;
      y = height - margin - fontSize;
    }

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });
  });

  onProgress?.(85, 'Saving numbered document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Page numbers added.');

  return outputBytes;
}
