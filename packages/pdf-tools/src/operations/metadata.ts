import { PDFDocument } from 'pdf-lib';

export interface MetadataOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  removeOnly?: boolean;
  onProgress?: (progress: number, message: string) => void;
}

export async function editOrRemoveMetadata(
  pdfBuffer: Uint8Array,
  options: MetadataOptions
): Promise<Uint8Array> {
  const { title, author, subject, keywords, removeOnly = false, onProgress } = options;

  onProgress?.(15, 'Loading PDF document...');
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  if (removeOnly) {
    onProgress?.(45, 'Scrubbing all document metadata and identifiers...');
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    pdfDoc.setCreationDate(new Date(0));
    pdfDoc.setModificationDate(new Date(0));
  } else {
    onProgress?.(45, 'Updating document metadata attributes...');
    if (title !== undefined) pdfDoc.setTitle(title);
    if (author !== undefined) pdfDoc.setAuthor(author);
    if (subject !== undefined) pdfDoc.setSubject(subject);
    if (keywords !== undefined) {
      const kwList = keywords.split(',').map(k => k.trim()).filter(Boolean);
      pdfDoc.setKeywords(kwList);
    }
    pdfDoc.setModificationDate(new Date());
  }

  onProgress?.(85, 'Saving updated document...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, removeOnly ? 'All metadata scrubbed.' : 'Metadata updated successfully.');

  return outputBytes;
}
