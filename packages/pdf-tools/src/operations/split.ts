import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export interface SplitOptions {
  splitMode: 'ranges' | 'all' | 'interval';
  pageRanges?: string; // e.g. "1-3, 5, 8-10"
  intervalCount?: number;
  baseFilename?: string;
  onProgress?: (progress: number, message: string) => void;
}

export interface SplitResult {
  data: Uint8Array;
  mimeType: string;
  filename: string;
  isZip: boolean;
}

// Parses string like "1-3, 5, 8-10" into 0-indexed page numbers
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          pages.add(i - 1);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function splitPdf(
  pdfBuffer: Uint8Array,
  options: SplitOptions
): Promise<SplitResult> {
  const { splitMode, pageRanges = '1', intervalCount = 1, baseFilename = 'document', onProgress } = options;

  onProgress?.(10, 'Loading source PDF...');
  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error('PDF document has no pages.');
  }

  if (splitMode === 'ranges') {
    const indices = parsePageRangeString(pageRanges, totalPages);
    if (indices.length === 0) {
      throw new Error(`No valid pages found in range "${pageRanges}". Document has ${totalPages} pages.`);
    }

    onProgress?.(40, `Extracting ${indices.length} pages...`);
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, indices);
    copiedPages.forEach(p => newDoc.addPage(p));

    onProgress?.(90, 'Generating extracted document...');
    const bytes = await newDoc.save({ useObjectStreams: true });
    onProgress?.(100, 'Split completed.');

    return {
      data: bytes,
      mimeType: 'application/pdf',
      filename: `${baseFilename}-extracted.pdf`,
      isZip: false
    };
  }

  // If extracting all pages or by interval, package into a ZIP
  onProgress?.(20, 'Creating archive for split documents...');
  const zip = new JSZip();

  if (splitMode === 'all') {
    for (let i = 0; i < totalPages; i++) {
      const pct = Math.round(20 + ((i / totalPages) * 70));
      onProgress?.(pct, `Extracting page ${i + 1} of ${totalPages}...`);
      const singlePageDoc = await PDFDocument.create();
      const [copied] = await singlePageDoc.copyPages(srcDoc, [i]);
      singlePageDoc.addPage(copied);
      const pageBytes = await singlePageDoc.save({ useObjectStreams: true });
      zip.file(`${baseFilename}-page-${String(i + 1).padStart(3, '0')}.pdf`, pageBytes);
    }
  } else if (splitMode === 'interval') {
    const step = Math.max(1, intervalCount);
    let chunkIndex = 1;
    for (let i = 0; i < totalPages; i += step) {
      const chunkEnd = Math.min(i + step, totalPages);
      const pct = Math.round(20 + ((i / totalPages) * 70));
      onProgress?.(pct, `Generating part ${chunkIndex} (pages ${i + 1} to ${chunkEnd})...`);

      const chunkIndices: number[] = [];
      for (let j = i; j < chunkEnd; j++) chunkIndices.push(j);

      const chunkDoc = await PDFDocument.create();
      const copiedPages = await chunkDoc.copyPages(srcDoc, chunkIndices);
      copiedPages.forEach(p => chunkDoc.addPage(p));
      const chunkBytes = await chunkDoc.save({ useObjectStreams: true });

      zip.file(`${baseFilename}-part-${chunkIndex}-pages-${i + 1}-${chunkEnd}.pdf`, chunkBytes);
      chunkIndex++;
    }
  }

  onProgress?.(95, 'Compressing ZIP archive...');
  const zipBytes = await zip.generateAsync({ type: 'uint8array' });
  onProgress?.(100, 'All pages split and archived.');

  return {
    data: zipBytes,
    mimeType: 'application/zip',
    filename: `${baseFilename}-split.zip`,
    isZip: true
  };
}
