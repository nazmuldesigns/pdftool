import { PDFDocument } from 'pdf-lib';
import { parsePageRangeString } from './split.js';

export interface RearrangePagesOptions {
  pageOrder: string; // "reverse" or comma-separated list like "3, 1, 2, 4"
  onProgress?: (progress: number, message: string) => void;
}

export async function rearrangePdfPages(
  pdfBuffer: Uint8Array,
  options: RearrangePagesOptions
): Promise<Uint8Array> {
  const { pageOrder = 'reverse', onProgress } = options;

  onProgress?.(10, 'Loading document...');
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const total = srcDoc.getPageCount();

  let newIndices: number[] = [];
  if (pageOrder.trim().toLowerCase() === 'reverse') {
    for (let i = total - 1; i >= 0; i--) newIndices.push(i);
  } else {
    // Sequence of 1-based indices
    const parts = pageOrder.split(',').map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      const num = parseInt(p, 10);
      if (!isNaN(num) && num >= 1 && num <= total) {
        newIndices.push(num - 1);
      }
    }
    if (newIndices.length === 0) {
      throw new Error(`Invalid page sequence: "${pageOrder}". Must be page numbers from 1 to ${total}.`);
    }
  }

  onProgress?.(30, 'Rebuilding document in new page sequence...');
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, newIndices);
  copiedPages.forEach(p => newDoc.addPage(p));

  onProgress?.(80, 'Saving reordered document...');
  const outputBytes = await newDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Page order updated.');

  return outputBytes;
}

export async function extractPdfPages(
  pdfBuffer: Uint8Array,
  pagesToExtract: string,
  onProgress?: (progress: number, message: string) => void
): Promise<Uint8Array> {
  onProgress?.(10, 'Loading document...');
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const total = srcDoc.getPageCount();

  const indices = parsePageRangeString(pagesToExtract, total);
  if (indices.length === 0) {
    throw new Error(`No valid pages selected for extraction from range "${pagesToExtract}".`);
  }

  onProgress?.(40, `Extracting ${indices.length} pages...`);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach(p => newDoc.addPage(p));

  onProgress?.(80, 'Saving extracted PDF...');
  const outputBytes = await newDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Extraction complete.');

  return outputBytes;
}
