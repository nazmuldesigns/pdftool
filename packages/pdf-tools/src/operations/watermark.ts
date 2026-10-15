import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export interface WatermarkOptions {
  watermarkText: string;
  fontSize?: number;
  opacity?: number;
  rotation?: number;
  color?: 'gray' | 'red' | 'blue' | 'black' | 'purple' | 'green';
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  xPercent?: number;
  yPercent?: number;
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
    position = 'center',
    xPercent = 50,
    yPercent = 50,
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
  if (color === 'purple') chosenColor = rgb(0.58, 0.2, 0.92);
  if (color === 'green') chosenColor = rgb(0.09, 0.64, 0.29);

  const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  onProgress?.(30, `Stamping watermark across ${total} pages...`);
  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    let x = (width - textWidth) / 2;
    let y = (height - textHeight) / 2;

    if (position === 'top-left') {
      x = 40;
      y = height - textHeight - 40;
    } else if (position === 'top-right') {
      x = width - textWidth - 40;
      y = height - textHeight - 40;
    } else if (position === 'bottom-left') {
      x = 40;
      y = 40;
    } else if (position === 'bottom-right') {
      x = width - textWidth - 40;
      y = 40;
    } else if (position === 'custom') {
      x = Math.max(20, Math.min(width - textWidth - 20, (width * xPercent) / 100 - textWidth / 2));
      y = Math.max(20, Math.min(height - textHeight - 20, height - ((height * yPercent) / 100) - textHeight / 2));
    }

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
