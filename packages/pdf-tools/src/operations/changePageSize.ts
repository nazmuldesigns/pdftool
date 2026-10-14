import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ChangePageSizeOptions {
  pageSize?: 'a4' | 'letter' | 'legal' | 'a3';
  orientation?: 'portrait' | 'landscape';
  onProgress?: (progress: number, message: string) => void;
}

export async function changePdfPageSize(
  pdfBuffer: Uint8Array,
  options: ChangePageSizeOptions = {}
): Promise<Uint8Array> {
  const { pageSize = 'a4', orientation = 'portrait', onProgress } = options;

  onProgress?.(15, 'Loading document...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const total = pages.length;

  let [targetWidth, targetHeight] = PageSizes.A4;
  if (pageSize === 'letter') [targetWidth, targetHeight] = PageSizes.Letter;
  else if (pageSize === 'legal') [targetWidth, targetHeight] = [612.0, 1008.0];
  else if (pageSize === 'a3') [targetWidth, targetHeight] = [841.89, 1190.55];

  if (orientation === 'landscape') {
    const temp = targetWidth;
    targetWidth = targetHeight;
    targetHeight = temp;
  }

  for (let i = 0; i < total; i++) {
    const pct = Math.round(20 + ((i / total) * 70));
    onProgress?.(pct, `Resizing page ${i + 1} of ${total} to ${pageSize.toUpperCase()}...`);
    const page = pages[i];
    page.setSize(targetWidth, targetHeight);
  }

  onProgress?.(92, 'Saving resized document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, `Page size updated to ${pageSize.toUpperCase()} (${total} pages).`);

  return outputBytes;
}
