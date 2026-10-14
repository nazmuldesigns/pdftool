import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export interface WatermarkOptions {
  watermarkText: string;
  fontSize?: number;
  opacity?: number;
  rotation?: number;
  color?: 'gray' | 'red' | 'blue' | 'black';
  onProgress?: (progress: number, message: string) => void;
}

export async function addWatermark(
  pdfBuffer: Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const {
    watermarkText = 'CONFIDENTIAL',
    fontSize = 48,
    opacity = 0.3,
    rotation = 45,
    color = 'gray',
    onProgress
  } = options;

  onProgress?.(10, 'Loading document...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  let chosenColor = rgb(0.5, 0.5, 0.5);
  if (color === 'red') chosenColor = rgb(0.85, 0.1, 0.1);
  if (color === 'blue') chosenColor = rgb(0.1, 0.3, 0.85);
  if (color === 'black') chosenColor = rgb(0, 0, 0);

  const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  onProgress?.(30, `Stamping watermark across ${total} pages...`);
  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const x = (width - textWidth) / 2;
    const y = (height - textHeight) / 2;

    page.drawText(watermarkText, {
      x,
      y,
      size: fontSize,
      font,
      color: chosenColor,
      opacity,
      rotate: degrees(rotation)
    });
  });

  onProgress?.(85, 'Saving watermarked document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Watermark applied.');

  return outputBytes;
}
