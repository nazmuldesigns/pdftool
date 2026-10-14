import { PDFDocument } from 'pdf-lib';

export interface HalvePagesOptions {
  splitDirection?: 'vertical' | 'horizontal'; // vertical = left/right, horizontal = top/bottom
  onProgress?: (progress: number, message: string) => void;
}

export async function halvePdfPages(
  pdfBuffer: Uint8Array,
  options: HalvePagesOptions = {}
): Promise<Uint8Array> {
  const { splitDirection = 'vertical', onProgress } = options;

  onProgress?.(10, 'Loading document pages...');
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const pageCount = srcDoc.getPageCount();

  onProgress?.(25, `Halving ${pageCount} pages...`);

  for (let i = 0; i < pageCount; i++) {
    const pct = Math.round(25 + ((i / pageCount) * 65));
    onProgress?.(pct, `Splitting page ${i + 1} of ${pageCount}...`);

    // Copy page twice: once for part 1, once for part 2
    const [pageLeft, pageRight] = await newDoc.copyPages(srcDoc, [i, i]);
    const { width, height } = pageLeft.getSize();

    if (splitDirection === 'vertical') {
      const halfWidth = width / 2;
      // First half: [0, 0, halfWidth, height]
      pageLeft.setCropBox(0, 0, halfWidth, height);
      newDoc.addPage(pageLeft);

      // Second half: [halfWidth, 0, halfWidth, height]
      pageRight.setCropBox(halfWidth, 0, halfWidth, height);
      newDoc.addPage(pageRight);
    } else {
      const halfHeight = height / 2;
      // Top half
      pageLeft.setCropBox(0, halfHeight, width, halfHeight);
      newDoc.addPage(pageLeft);

      // Bottom half
      pageRight.setCropBox(0, 0, width, halfHeight);
      newDoc.addPage(pageRight);
    }
  }

  onProgress?.(95, 'Saving split sheets...');
  const outputBytes = await newDoc.save({ useObjectStreams: true });
  onProgress?.(100, `Pages halved: generated ${pageCount * 2} individual pages.`);

  return outputBytes;
}
