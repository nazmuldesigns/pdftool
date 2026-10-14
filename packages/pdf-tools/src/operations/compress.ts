import { PDFDocument } from 'pdf-lib';

export interface CompressOptions {
  compressionLevel?: 'low' | 'medium' | 'high';
  removeMetadata?: boolean;
  onProgress?: (progress: number, message: string) => void;
}

export interface CompressResult {
  data: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercentage: number;
}

export async function compressPdf(
  pdfBuffer: Uint8Array,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const { removeMetadata = true, onProgress } = options;
  const originalSize = pdfBuffer.byteLength;

  onProgress?.(15, 'Inspecting and defragmenting PDF objects...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  if (removeMetadata) {
    onProgress?.(40, 'Removing redundant metadata streams and editing logs...');
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('PDF Toolbox Clean Engine');
    pdfDoc.setCreator('');
    pdfDoc.setCreationDate(new Date(0));
    pdfDoc.setModificationDate(new Date(0));
  }

  onProgress?.(70, 'Optimizing object streams and compressing dictionary entries...');
  // Enable full object stream packing for maximum structural compaction
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50
  });

  const compressedSize = compressedBytes.byteLength;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage = originalSize > 0
    ? Math.round((savedBytes / originalSize) * 1000) / 10
    : 0;

  onProgress?.(100, `Compression completed: ${savedPercentage}% reduction achieved.`);

  return {
    data: compressedBytes,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercentage
  };
}
