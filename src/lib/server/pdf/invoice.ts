import PDFDocument from "pdfkit";
import type { Client, Job, Material } from "../db/schema";
import { createWriteStream } from "fs";
export type Company = {
    name: string;
    address: string;
    phone: string;
    email: string;
}
export type InvoiceData = {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    paymentTerms: string;
    project: string;
    company: Company;
    client: Client | null;
    materials: Material[];
    discount: number;
    gst: number;
    notes: string;
}

class InvoiceGenerator {
    doc: PDFKit.PDFDocument;
    data: InvoiceData;

    constructor(data: InvoiceData) {
        this.doc = new PDFDocument({ margin: 50 });
        this.data = data;
    }

    generateInvoice(filePath: string) {
        // Create write stream
        this.doc.pipe(createWriteStream(filePath));

        // Add content
        this.addHeader(this.data);
        this.addCompanyInfo(this.data.company);
        if (this.data.client)
            this.addClientInfo(this.data.client);
        this.addInvoiceDetails(this.data);
        this.addMaterialsTable(this.data.materials);
        this.addTotals(this.data);
        this.addFooter(this.data);

        // Finalize the PDF
        this.doc.end();
    }

    addHeader(invoiceData: InvoiceData) {
        this.doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('INVOICE', 50, 50)
            .font('Helvetica')
            .fontSize(12)
            .text('UDElectrics', 50, 75)
            .text(`Invoice #: ${invoiceData.invoiceNumber}`, 400, 55)
            .text(`Date: ${invoiceData.date}`, 400, 70)
            .text(`Due Date: ${invoiceData.dueDate}`, 400, 85);

        // Add a line separator
        this.doc
            .moveTo(50, 120)
            .lineTo(550, 120)
            .stroke();
    }
    addCompanyInfo(company: Company) {
        this.doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('FROM:', 50, 140)
            .fontSize(12)
            .font('Helvetica')
            .text(company.name, 50, 160)
            .text(company.address, 50, 175)
            .text(`Phone: ${company.phone}`, 50, 205)
            .text(`Email: ${company.email}`, 50, 220);
    }

    addClientInfo(client: Client) {
        this.doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('BILL TO:', 300, 140)
            .fontSize(12)
            .font('Helvetica')
            .text(client.name, 300, 160)
            .text(client.address ?? "", 300, 175)
            .text(`Phone: ${client.phone}`, 300, 205)
    }

    addInvoiceDetails(invoiceData: InvoiceData) {
        // Add another line separator
        this.doc
            .moveTo(50, 250)
            .lineTo(550, 250)
            .stroke();

        this.doc
            .fontSize(12)
            .font('Helvetica')
            .text(`Payment Terms:`, 50, 270)
            .text(invoiceData.paymentTerms, 50, 290)
    }

    addMaterialsTable(materials: Material[]) {
        const tableTop = 320;
        const itemHeight = 25;

        // Table headers
        this.doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Description', 50, tableTop)
            .text('Qty', 250, tableTop, { width: 50, align: 'center' })
            .text('Unit Price', 320, tableTop, { width: 80, align: 'right' })
            .text('Total', 470, tableTop, { width: 80, align: 'right' });

        // Header underline
        this.doc
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();

        // Table rows
        let currentY = tableTop + 30;
        this.doc.font('Helvetica');

        materials.forEach((item, index) => {
            const itemTotal = (item.quantity ?? 1) * item.cost;

            this.doc
                .text(item.name, 50, currentY, { width: 180 })
                .text(item.quantity?.toString() ?? "", 250, currentY, { width: 50, align: 'center' })
                .text(`$${item.cost.toFixed(2)}`, 320, currentY, { width: 80, align: 'right' })
                .text(`$${itemTotal.toFixed(2)}`, 470, currentY, { width: 80, align: 'right' });

            currentY += itemHeight;

            // Add line between items
            if (index < materials.length - 1) {
                this.doc
                    .moveTo(50, currentY - 5)
                    .lineTo(550, currentY - 5)
                    .strokeColor('#CCCCCC')
                    .stroke()
                    .strokeColor('black');
            }
        });

        return currentY;
    }

    addTotals(invoiceData: InvoiceData) {
        const subtotal = invoiceData.materials.reduce((sum, item) => sum + (item.quantity ?? 1 * item.cost), 0);
        const discountAmount = subtotal * (invoiceData.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const gstAmount = afterDiscount * (invoiceData.gst / 100);
        const total = afterDiscount + gstAmount;

        const totalsY = 500;
        const rightAlign = 550;

        // Totals section
        this.doc
            .moveTo(350, totalsY - 10)
            .lineTo(rightAlign, totalsY - 10)
            .stroke();

        this.doc
            .fontSize(12)
            .font('Helvetica')
            .text('Subtotal:', 400, totalsY, { width: 130, align: 'left' })
            .text(`$${subtotal.toFixed(2)}`, 470, totalsY, { width: 80, align: 'right' });

        // Discount (if applicable)
        if (invoiceData.discount > 0) {
            this.doc
                .text(`Discount (${invoiceData.discount}%):`, 400, totalsY + 20, { width: 130, align: 'left' })
                .text(`-$${discountAmount.toFixed(2)}`, 470, totalsY + 20, { width: 80, align: 'right' });
        }

        // GST
        this.doc
            .text(`GST (${invoiceData.gst}%):`, 400, totalsY + 40, { width: 130, align: 'left' })
            .text(`$${gstAmount.toFixed(2)}`, 470, totalsY + 40, { width: 80, align: 'right' });

        // Total line
        this.doc
            .moveTo(400, totalsY + 55)
            .lineTo(rightAlign, totalsY + 55)
            .stroke();

        // Final total
        this.doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('TOTAL:', 400, totalsY + 65, { width: 130, align: 'left' })
            .text(`$${total.toFixed(2)}`, 470, totalsY + 65, { width: 80, align: 'right' });
    }

    addFooter(invoiceData: InvoiceData) {
        const footerY = 650;

        this.doc
            .fontSize(10)
            .font('Helvetica')
            .text(invoiceData.notes || 'Thank you for your business!', 50, footerY)
            .text('Payment is due within 30 days of invoice date.', 50, footerY + 15)
            .text('Please include invoice number on payment.', 50, footerY + 30);
    }
}


export function createInvoice(job: Job, client: Client | null, materials: Material[], filePath: string) {
    const invoiceData = {
        invoiceNumber: 'INV-2024-001',
        date: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        paymentTerms: 'BSB: XXX-XXX, Account Number: 12345678',
        project: 'Website Development',
        company: {
            name: 'Your Company Name',
            address: '123 Business Street',
            city: 'Business City',
            state: 'BC',
            zip: '12345',
            phone: '(555) 123-4567',
            email: 'info@yourcompany.com'
        },
        client,
        materials,
        discount: 10, // 10% discount
        gst: 10, // 10% GST
        notes: 'Thank you for choosing our services. We look forward to working with you again!'
    };

    const invoiceGenerator = new InvoiceGenerator(invoiceData);
    console.log(filePath)
    invoiceGenerator.generateInvoice(filePath);
}