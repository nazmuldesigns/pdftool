import { PDFDocument, degrees } from 'pdf-lib';
import { parsePageRangeString } from './split.js';

export interface RotateOptions {
  rotationAngle: 90 | 180 | 270 | number;
  targetPages: 'all' | 'portrait' | 'landscape' | 'custom';
  customRange?: string;
  onProgress?: (progress: number, message: string) => void;
}

export async function rotatePdfPages(
  pdfBuffer: Uint8Array,
  options: RotateOptions
): Promise<Uint8Array> {
  const { rotationAngle = 90, targetPages = 'all', customRange = '1', onProgress } = options;

  onProgress?.(10, 'Loading document...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const total = pages.length;

  let targetIndices: Set<number>;
  if (targetPages === 'all') {
    targetIndices = new Set(pages.map((_, i) => i));
  } else if (targetPages === 'custom') {
    targetIndices = new Set(parsePageRangeString(customRange, total));
  } else {
    targetIndices = new Set();
    pages.forEach((page, i) => {
      const { width, height } = page.getSize();
      const isPortrait = height >= width;
      if (targetPages === 'portrait' && isPortrait) targetIndices.add(i);
      if (targetPages === 'landscape' && !isPortrait) targetIndices.add(i);
    });
  }

  onProgress?.(30, `Applying ${rotationAngle}° rotation to ${targetIndices.size} pages...`);
  pages.forEach((page, i) => {
    if (targetIndices.has(i)) {
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + rotationAngle) % 360;
      page.setRotation(degrees(newRotation));
    }
  });

  onProgress?.(80, 'Saving rotated document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Rotation complete.');

  return outputBytes;
}
