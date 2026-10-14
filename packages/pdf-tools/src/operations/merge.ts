import { PDFDocument } from 'pdf-lib';

export interface MergeOptions {
  outlineMode?: 'preserve' | 'generate' | 'discard';
  onProgress?: (progress: number, message: string) => void;
}

export async function mergePdfs(
  pdfBuffers: Uint8Array[],
  options: MergeOptions = {}
): Promise<Uint8Array> {
  const { onProgress } = options;

  if (!pdfBuffers || pdfBuffers.length < 2) {
    throw new Error('At least two PDF files are required to perform a merge.');
  }

  onProgress?.(10, 'Initializing merged document structure...');
  const mergedPdf = await PDFDocument.create();

  const totalFiles = pdfBuffers.length;
  for (let i = 0; i < totalFiles; i++) {
    const buffer = pdfBuffers[i];
    const progressPercent = Math.round(15 + ((i / totalFiles) * 75));
    onProgress?.(progressPercent, `Merging document ${i + 1} of ${totalFiles}...`);

    let srcDoc: PDFDocument;
    try {
      srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    } catch (err: any) {
      throw new Error(`Failed to read document ${i + 1}: ${err?.message || 'Invalid or encrypted PDF'}`);
    }

    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  onProgress?.(95, 'Finalizing merged document streams...');
  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
  onProgress?.(100, 'Merge completed successfully.');

  return mergedBytes;
}
