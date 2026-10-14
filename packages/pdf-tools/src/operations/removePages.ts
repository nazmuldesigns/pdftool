import { PDFDocument } from 'pdf-lib';
import { parsePageRangeString } from './split.js';

export interface RemovePagesOptions {
  pagesToRemove: string; // e.g. "1, 3-5"
  onProgress?: (progress: number, message: string) => void;
}

export async function removePdfPages(
  pdfBuffer: Uint8Array,
  options: RemovePagesOptions
): Promise<Uint8Array> {
  const { pagesToRemove, onProgress } = options;

  onProgress?.(10, 'Loading document...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const total = pdfDoc.getPageCount();

  const toRemoveIndices = parsePageRangeString(pagesToRemove, total);
  if (toRemoveIndices.length === 0) {
    throw new Error('Please specify at least one valid page number to remove.');
  }

  if (toRemoveIndices.length >= total) {
    throw new Error(`Cannot delete all ${total} pages. At least one page must remain.`);
  }

  onProgress?.(30, `Removing ${toRemoveIndices.length} page(s)...`);
  // Remove in descending order so earlier indices remain valid
  const sortedDesc = [...toRemoveIndices].sort((a, b) => b - a);
  for (const idx of sortedDesc) {
    pdfDoc.removePage(idx);
  }

  onProgress?.(80, 'Saving modified document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Selected pages removed.');

  return outputBytes;
}
