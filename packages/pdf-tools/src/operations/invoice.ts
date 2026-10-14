import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceOptions {
  invoiceNumber?: string;
  senderName?: string;
  senderEmail?: string;
  clientName?: string;
  clientEmail?: string;
  currency?: string;
  taxRatePercent?: number;
  items?: InvoiceItem[];
  notes?: string;
  onProgress?: (progress: number, message: string) => void;
}

export async function generateInvoicePdf(
  options: InvoiceOptions = {}
): Promise<Uint8Array> {
  const {
    invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    senderName = 'My Business Ltd',
    senderEmail = 'billing@business.com',
    clientName = 'Client Company Inc',
    clientEmail = 'accounts@client.com',
    currency = 'USD',
    taxRatePercent = 10,
    items = [
      { description: 'Professional Consulting Services', quantity: 10, rate: 120 },
      { description: 'Software Development & Architecture', quantity: 25, rate: 95 },
      { description: 'Cloud Infrastructure Setup', quantity: 1, rate: 450 }
    ],
    notes = 'Thank you for your business. Payment due within 30 days.',
    onProgress
  } = options;

  onProgress?.(15, 'Creating invoice document layout...');
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const [pageWidth, pageHeight] = PageSizes.A4;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const margin = 50;

  onProgress?.(35, 'Drawing invoice header & company info...');

  // Brand header
  page.drawText('INVOICE', {
    x: margin,
    y: pageHeight - margin - 30,
    size: 28,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.6)
  });

  page.drawText(`#${invoiceNumber}`, {
    x: margin,
    y: pageHeight - margin - 52,
    size: 13,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4)
  });

  // Date and Due
  const today = new Date().toLocaleDateString();
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
  page.drawText(`Date: ${today}`, {
    x: pageWidth - margin - 150,
    y: pageHeight - margin - 30,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3)
  });
  page.drawText(`Due Date: ${dueDate}`, {
    x: pageWidth - margin - 150,
    y: pageHeight - margin - 45,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3)
  });

  // Horizontal divider
  page.drawLine({
    start: { x: margin, y: pageHeight - 120 },
    end: { x: pageWidth - margin, y: pageHeight - 120 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85)
  });

  // From / To sections
  const infoY = pageHeight - 150;
  page.drawText('FROM:', { x: margin, y: infoY, size: 9, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(senderName, { x: margin, y: infoY - 16, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(senderEmail, { x: margin, y: infoY - 30, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

  page.drawText('BILL TO:', { x: margin + 260, y: infoY, size: 9, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(clientName, { x: margin + 260, y: infoY - 16, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(clientEmail, { x: margin + 260, y: infoY - 30, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

  onProgress?.(60, 'Calculating line items & subtotal...');

  // Line items table
  const tableY = pageHeight - 230;
  const colDesc = margin;
  const colQty = margin + 270;
  const colRate = margin + 350;
  const colAmount = margin + 420;

  // Table header bar
  page.drawRectangle({
    x: margin,
    y: tableY - 6,
    width: pageWidth - (margin * 2),
    height: 22,
    color: rgb(0.95, 0.96, 0.98)
  });

  page.drawText('Description', { x: colDesc + 8, y: tableY, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.4) });
  page.drawText('Qty', { x: colQty, y: tableY, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.4) });
  page.drawText('Rate', { x: colRate, y: tableY, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.4) });
  page.drawText('Amount', { x: colAmount, y: tableY, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.4) });

  let curY = tableY - 30;
  let subtotal = 0;

  for (const item of items) {
    const itemAmount = item.quantity * item.rate;
    subtotal += itemAmount;

    page.drawText(item.description, { x: colDesc + 8, y: curY, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(String(item.quantity), { x: colQty, y: curY, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`${currency} ${item.rate.toFixed(2)}`, { x: colRate, y: curY, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`${currency} ${itemAmount.toFixed(2)}`, { x: colAmount, y: curY, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });

    page.drawLine({
      start: { x: margin, y: curY - 8 },
      end: { x: pageWidth - margin, y: curY - 8 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9)
    });

    curY -= 26;
  }

  // Totals
  const tax = subtotal * (taxRatePercent / 100);
  const total = subtotal + tax;

  curY -= 15;
  const totalsX = margin + 310;
  page.drawText(`Subtotal:`, { x: totalsX, y: curY, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${currency} ${subtotal.toFixed(2)}`, { x: colAmount, y: curY, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

  curY -= 18;
  page.drawText(`Tax (${taxRatePercent}%):`, { x: totalsX, y: curY, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${currency} ${tax.toFixed(2)}`, { x: colAmount, y: curY, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

  curY -= 22;
  page.drawRectangle({
    x: totalsX - 10,
    y: curY - 6,
    width: pageWidth - margin - totalsX + 10,
    height: 26,
    color: rgb(0.92, 0.95, 1)
  });
  page.drawText(`Total Due:`, { x: totalsX, y: curY, size: 11, font: fontBold, color: rgb(0.15, 0.25, 0.6) });
  page.drawText(`${currency} ${total.toFixed(2)}`, { x: colAmount, y: curY, size: 11, font: fontBold, color: rgb(0.15, 0.25, 0.6) });

  // Notes & Footer
  if (notes) {
    page.drawText('Notes / Payment Instructions:', { x: margin, y: curY - 40, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(notes, { x: margin, y: curY - 56, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  }

  onProgress?.(92, 'Generating finalized invoice PDF...');
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, `Invoice #${invoiceNumber} successfully created.`);

  return outputBytes;
}
