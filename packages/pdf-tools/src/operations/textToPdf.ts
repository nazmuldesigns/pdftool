import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export interface TextToPdfOptions {
  documentTitle?: string;
  fontSize?: number;
  onProgress?: (progress: number, message: string) => void;
}

export async function convertTextToPdf(
  text: string,
  options: TextToPdfOptions = {}
): Promise<Uint8Array> {
  const { documentTitle = 'Document', fontSize = 11, onProgress } = options;

  onProgress?.(10, 'Creating document layout...');
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const [pageWidth, pageHeight] = PageSizes.A4;
  const margin = 50;
  const printableWidth = pageWidth - (margin * 2);
  const lineHeight = fontSize * 1.45;

  onProgress?.(30, 'Formatting text and wrapping lines...');

  // Break text into lines that fit within printableWidth
  const rawLines = text.split('\n');
  const wrappedLines: { text: string; isHeader?: boolean }[] = [];

  for (const rawLine of rawLines) {
    if (rawLine.startsWith('# ')) {
      wrappedLines.push({ text: rawLine.replace(/^#\s*/, ''), isHeader: true });
      continue;
    }
    if (rawLine.trim() === '') {
      wrappedLines.push({ text: '' });
      continue;
    }

    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = fontRegular.widthOfTextAtSize(testLine, fontSize);
      if (testWidth <= printableWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) wrappedLines.push({ text: currentLine });
        currentLine = word;
      }
    }
    if (currentLine) wrappedLines.push({ text: currentLine });
  }

  onProgress?.(60, 'Rendering lines to pages...');
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title heading
  if (documentTitle) {
    const titleSize = 20;
    currentPage.drawText(documentTitle, {
      x: margin,
      y: y - titleSize,
      size: titleSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1)
    });
    y -= (titleSize + 25);
  }

  for (const line of wrappedLines) {
    if (y <= margin + lineHeight) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (line.isHeader) {
      y -= 6;
      currentPage.drawText(line.text, {
        x: margin,
        y: y - (fontSize * 1.25),
        size: fontSize * 1.25,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.4)
      });
      y -= (lineHeight * 1.4);
    } else if (line.text === '') {
      y -= (lineHeight * 0.7);
    } else {
      currentPage.drawText(line.text, {
        x: margin,
        y: y - fontSize,
        size: fontSize,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15)
      });
      y -= lineHeight;
    }
  }

  onProgress?.(90, 'Saving rendered PDF...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Text converted to PDF.');

  return outputBytes;
}
