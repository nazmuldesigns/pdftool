import { PDFDocument } from 'pdf-lib';

export interface CropPagesOptions {
  margin?: number; // margin to trim in points (e.g. 20, 36, 72)
  onProgress?: (progress: number, message: string) => void;
}

export async function cropPdfPages(
  pdfBuffer: Uint8Array,
  options: CropPagesOptions = {}
): Promise<Uint8Array> {
  const { margin = 28.3, onProgress } = options; // Default: ~10mm (~28.3pt)

  onProgress?.(15, 'Loading document for margin trimming...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const pct = Math.round(20 + ((i / total) * 70));
    onProgress?.(pct, `Trimming margins on page ${i + 1} of ${total}...`);
    const page = pages[i];
    const { x, y, width, height } = page.getMediaBox();

    const cropMargin = Math.min(margin, width / 4, height / 4);
    const newX = x + cropMargin;
    const newY = y + cropMargin;
    const newWidth = Math.max(10, width - (cropMargin * 2));
    const newHeight = Math.max(10, height - (cropMargin * 2));

    page.setCropBox(newX, newY, newWidth, newHeight);
  }

  onProgress?.(92, 'Generating cropped PDF document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, `Cropped margins on ${total} pages.`);

  return outputBytes;
}
