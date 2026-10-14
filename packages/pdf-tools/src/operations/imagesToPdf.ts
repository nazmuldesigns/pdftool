import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ImageInput {
  name: string;
  data: Uint8Array;
  mimeType: string;
}

export interface ImagesToPdfOptions {
  pageSize?: 'a4' | 'letter' | 'fit';
  orientation?: 'auto' | 'portrait' | 'landscape';
  margin?: 'none' | 'small' | 'standard';
  onProgress?: (progress: number, message: string) => void;
}

export async function convertImagesToPdf(
  images: ImageInput[],
  options: ImagesToPdfOptions = {}
): Promise<Uint8Array> {
  const { pageSize = 'a4', orientation = 'auto', margin = 'none', onProgress } = options;

  if (!images || images.length === 0) {
    throw new Error('At least one image is required.');
  }

  onProgress?.(10, 'Initializing new PDF document...');
  const pdfDoc = await PDFDocument.create();

  const marginMap = {
    none: 0,
    small: 28.3,   // ~10mm
    standard: 56.7  // ~20mm
  };
  const pad = marginMap[margin];

  const total = images.length;
  for (let i = 0; i < total; i++) {
    const img = images[i];
    const pct = Math.round(15 + ((i / total) * 75));
    onProgress?.(pct, `Embedding image ${i + 1} of ${total} (${img.name})...`);

    let embeddedImage;
    if (img.mimeType === 'image/jpeg' || img.mimeType === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(img.data);
    } else {
      // Default to PNG embedding (if webp/gif was converted to png or png directly)
      embeddedImage = await pdfDoc.embedPng(img.data);
    }

    const imgDims = embeddedImage.scale(1);

    let pageWidth = PageSizes.A4[0];
    let pageHeight = PageSizes.A4[1];

    if (pageSize === 'letter') {
      pageWidth = PageSizes.Letter[0];
      pageHeight = PageSizes.Letter[1];
    } else if (pageSize === 'fit') {
      pageWidth = imgDims.width + (pad * 2);
      pageHeight = imgDims.height + (pad * 2);
    }

    // Determine orientation
    let useLandscape = false;
    if (orientation === 'landscape') useLandscape = true;
    else if (orientation === 'portrait') useLandscape = false;
    else if (orientation === 'auto' && pageSize !== 'fit') {
      useLandscape = imgDims.width > imgDims.height;
    }

    if (useLandscape && pageSize !== 'fit') {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate scaled dimensions to fit within page margins
    const availableWidth = pageWidth - (pad * 2);
    const availableHeight = pageHeight - (pad * 2);

    const scale = Math.min(
      availableWidth / imgDims.width,
      availableHeight / imgDims.height,
      pageSize === 'fit' ? 1 : 1 // don't upscale on standard pages beyond fit
    );

    const drawWidth = imgDims.width * scale;
    const drawHeight = imgDims.height * scale;

    const x = pad + (availableWidth - drawWidth) / 2;
    const y = pad + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight
    });
  }

  onProgress?.(92, 'Generating PDF output...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Images converted to PDF.');

  return outputBytes;
}
