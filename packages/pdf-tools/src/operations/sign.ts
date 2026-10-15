import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface SignPdfOptions {
  signatureText?: string;
  signatureImageBytes?: Uint8Array;
  signatureImageMime?: string;
  pageNumber?: number; // 1-based, default: last page
  xPosition?: number;
  yPosition?: number;
  stampWidth?: number;
  stampHeight?: number;
  includeDate?: boolean;
  dateString?: string;
  onProgress?: (progress: number, message: string) => void;
}

export async function signPdfDocument(
  pdfBuffer: Uint8Array,
  options: SignPdfOptions = {}
): Promise<Uint8Array> {
  const {
    signatureText = 'Digitally Signed',
    signatureImageBytes,
    signatureImageMime = 'image/png',
    pageNumber,
    xPosition,
    yPosition,
    stampWidth,
    stampHeight,
    includeDate,
    dateString,
    onProgress
  } = options;

  onProgress?.(15, 'Loading target document...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const targetPageIndex = pageNumber ? Math.min(Math.max(1, pageNumber), pages.length) - 1 : pages.length - 1;
  const targetPage = pages[targetPageIndex];
  const { width } = targetPage.getSize();

  onProgress?.(45, 'Applying electronic signature to page...');

  const stampX = xPosition !== undefined ? xPosition : width - 220;
  const stampY = yPosition !== undefined ? yPosition : 70;

  if (signatureImageBytes) {
    // Embed signature image (PNG or JPG)
    let img;
    if (signatureImageMime.includes('jpeg') || signatureImageMime.includes('jpg')) {
      img = await pdfDoc.embedJpg(signatureImageBytes);
    } else {
      img = await pdfDoc.embedPng(signatureImageBytes);
    }
    const dims = img.scale(0.5);
    const targetW = stampWidth || Math.min(dims.width, 160);
    const targetH = stampHeight || Math.min(dims.height, 60);

    targetPage.drawImage(img, {
      x: stampX,
      y: stampY,
      width: targetW,
      height: targetH
    });

    if (includeDate) {
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const textToDraw = `Date: ${dateString || new Date().toISOString().slice(0, 10)}`;
      targetPage.drawText(textToDraw, {
        x: stampX,
        y: Math.max(8, stampY - 14),
        size: 9,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3)
      });
    }
  } else {
    // Stylized signature text stamp
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Decorative signature background box
    targetPage.drawRectangle({
      x: stampX - 8,
      y: stampY - 8,
      width: 180,
      height: 52,
      color: rgb(0.97, 0.98, 1),
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 1
    });

    targetPage.drawText(signatureText, {
      x: stampX,
      y: stampY + 20,
      size: 16,
      font: fontItalic,
      color: rgb(0.1, 0.2, 0.5)
    });

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    targetPage.drawText(`Signed: ${timestamp}`, {
      x: stampX,
      y: stampY + 4,
      size: 7,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4)
    });
  }

  onProgress?.(85, 'Saving signed document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, `Signature placed on page ${targetPageIndex + 1}.`);

  return outputBytes;
}
