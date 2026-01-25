import PDFDocument from "pdfkit";
import type { Client, Work, Material, BusinessSettings } from "../db/schema";
import { createWriteStream } from "fs";

export type InvoiceType = 'quote' | 'invoice';

export type InvoiceData = {
    type: InvoiceType;
    invoiceNumber: string;
    jobNumber: number;
    date: Date;
    dueDate?: Date;
    client: Client | null;
    works: (Work & { materials: Material[] })[];
    businessSettings: BusinessSettings;
    showMaterials: boolean;
    showLabour: boolean;
    discount: number;
    notes?: string;
}

class ModernInvoiceGenerator {
    doc: PDFKit.PDFDocument;
    data: InvoiceData;
    primaryColor: string = '#2563eb'; // Blue
    accentColor: string = '#64748b'; // Slate gray
    pageWidth: number = 595.28; // A4 width in points
    margin: number = 50;

    constructor(data: InvoiceData) {
        this.doc = new PDFDocument({
            margin: this.margin,
            size: 'A4'
        });
        this.data = data;
    }

    generateInvoice(filePath: string) {
        this.doc.pipe(createWriteStream(filePath));

        this.addHeader();
        this.addBusinessAndClientInfo();
        this.addInvoiceDetails();
        this.addTotalHighlight();
        this.addWorksTable();
        this.addTotalsSection();
        this.addFooter();

        this.doc.end();
    }

    addHeader() {
        const headerY = 50;

        // Document type (QUOTE or INVOICE) - large and bold
        this.doc
            .fontSize(32)
            .fillColor(this.primaryColor)
            .font('Helvetica-Bold')
            .text(this.data.type.toUpperCase(), this.margin, headerY);

        // Logo space (top right) - if logo exists
        if (this.data.businessSettings.logo) {
            // Add logo here if needed
            // this.doc.image(this.data.businessSettings.logo, this.pageWidth - this.margin - 100, headerY, { width: 100 });
        }

        // Add divider line
        this.doc
            .strokeColor(this.primaryColor)
            .lineWidth(2)
            .moveTo(this.margin, headerY + 45)
            .lineTo(this.pageWidth - this.margin, headerY + 45)
            .stroke();
    }

    addBusinessAndClientInfo() {
        const startY = 120;
        const columnWidth = (this.pageWidth - 2 * this.margin) / 2;

        // Business Details (Left Column)
        this.doc
            .fontSize(10)
            .fillColor(this.accentColor)
            .font('Helvetica-Bold')
            .text('FROM', this.margin, startY);

        let currentY = startY + 15;
        this.doc
            .fontSize(12)
            .fillColor('black')
            .font('Helvetica-Bold')
            .text(this.data.businessSettings.businessName || 'Business Name', this.margin, currentY);

        currentY += 15;
        this.doc.fontSize(9).font('Helvetica').fillColor('#4b5563');

        if (this.data.businessSettings.abn) {
            this.doc.text(`ABN: ${this.data.businessSettings.abn}`, this.margin, currentY);
            currentY += 12;
        }

        if (this.data.businessSettings.address) {
            this.doc.text(this.data.businessSettings.address, this.margin, currentY, { width: columnWidth - 20 });
            currentY += 12;
        }

        if (this.data.businessSettings.phone) {
            this.doc.text(`Phone: ${this.data.businessSettings.phone}`, this.margin, currentY);
            currentY += 12;
        }

        if (this.data.businessSettings.email) {
            this.doc.text(`Email: ${this.data.businessSettings.email}`, this.margin, currentY);
        }

        // Client Details (Right Column)
        const rightColumnX = this.margin + columnWidth + 20;
        currentY = startY;

        this.doc
            .fontSize(10)
            .fillColor(this.accentColor)
            .font('Helvetica-Bold')
            .text('BILL TO', rightColumnX, currentY);

        currentY += 15;

        if (this.data.client) {
            this.doc
                .fontSize(12)
                .fillColor('black')
                .font('Helvetica-Bold')
                .text(this.data.client.name, rightColumnX, currentY);

            currentY += 15;
            this.doc.fontSize(9).font('Helvetica').fillColor('#4b5563');

            if (this.data.client.email) {
                this.doc.text(this.data.client.email, rightColumnX, currentY);
                currentY += 12;
            }

            if (this.data.client.phone) {
                this.doc.text(this.data.client.phone, rightColumnX, currentY);
                currentY += 12;
            }

            if (this.data.client.address) {
                this.doc.text(this.data.client.address, rightColumnX, currentY, { width: columnWidth - 20 });
            }
        } else {
            this.doc
                .fontSize(9)
                .fillColor('#9ca3af')
                .font('Helvetica')
                .text('No client specified', rightColumnX, currentY);
        }
    }

    addInvoiceDetails() {
        const detailsY = 240;
        const boxWidth = 220;
        const leftBoxX = this.margin;

        // Create gray details box on the LEFT
        this.doc
            .fillColor('#f3f4f6')
            .rect(leftBoxX, detailsY, boxWidth, 90)
            .fill();

        this.doc.fontSize(9).fillColor('#4b5563').font('Helvetica');

        let currentY = detailsY + 10;

        // Invoice/Quote Number
        this.doc
            .fillColor(this.accentColor)
            .text(`${this.data.type === 'invoice' ? 'Invoice' : 'Quote'} #:`, leftBoxX + 10, currentY)
            .fillColor('black')
            .font('Helvetica-Bold')
            .text(this.data.invoiceNumber, leftBoxX + 90, currentY, { align: 'right', width: 120 });

        currentY += 15;

        // Job Number
        this.doc
            .font('Helvetica')
            .fillColor(this.accentColor)
            .text('Job #:', leftBoxX + 10, currentY)
            .fillColor('black')
            .font('Helvetica-Bold')
            .text(`#${this.data.jobNumber}`, leftBoxX + 120, currentY, { align: 'right', width: 90 });

        currentY += 15;

        // Date
        this.doc
            .font('Helvetica')
            .fillColor(this.accentColor)
            .text('Date:', leftBoxX + 10, currentY)
            .fillColor('black')
            .text(this.data.date.toLocaleDateString('en-AU'), leftBoxX + 120, currentY, { align: 'right', width: 90 });

        currentY += 15;

        // Due Date (for invoices)
        if (this.data.type === 'invoice' && this.data.dueDate) {
            this.doc
                .fillColor(this.accentColor)
                .text('Due Date:', leftBoxX + 10, currentY)
                .fillColor('black')
                .text(this.data.dueDate.toLocaleDateString('en-AU'), leftBoxX + 120, currentY, { align: 'right', width: 90 });
        }
    }

    addTotalHighlight() {
        const highlightY = 240;
        const boxWidth = 240;
        const rightBoxX = this.pageWidth - this.margin - boxWidth;

        const subtotal = this.calculateSubtotal();
        const discountAmount = subtotal * (this.data.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const gstAmount = afterDiscount * 0.1; // 10% GST for Australia
        const total = afterDiscount + gstAmount;

        // Create blue highlighted box for total on the RIGHT
        this.doc
            .fillColor(this.primaryColor)
            .rect(rightBoxX, highlightY, boxWidth, 90)
            .fill();

        this.doc
            .fontSize(12)
            .fillColor('white')
            .font('Helvetica')
            .text('TOTAL AMOUNT', rightBoxX + 15, highlightY + 15);

        this.doc
            .fontSize(32)
            .font('Helvetica-Bold')
            .text(
                `$${total.toFixed(2)}`,
                rightBoxX + 15,
                highlightY + 35
            );

        // Add GST label (positioned properly to avoid overlap)
        this.doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('white')
            .text('(inc. GST)', rightBoxX + 15, highlightY + 70);
    }

    addWorksTable() {
        let tableY = 350;

        // Table header
        this.doc
            .fontSize(10)
            .fillColor('white')
            .font('Helvetica-Bold');

        // Header background
        this.doc
            .fillColor(this.accentColor)
            .rect(this.margin, tableY, this.pageWidth - 2 * this.margin, 25)
            .fill();

        tableY += 8;

        // Column headers
        this.doc
            .fillColor('white')
            .text('Description', this.margin + 10, tableY)
            .text('Qty', this.pageWidth - this.margin - 180, tableY, { width: 40, align: 'center' })
            .text('Rate', this.pageWidth - this.margin - 130, tableY, { width: 60, align: 'right' })
            .text('Amount', this.pageWidth - this.margin - 60, tableY, { width: 50, align: 'right' });

        tableY += 25;

        // Table rows
        this.doc.fontSize(9).font('Helvetica').fillColor('black');

        this.data.works.forEach((work, index) => {
            const labourCost = work.labourCostOverride ?? (work.labourHours * work.labourRate);
            const materialCost = work.materialCostOverride ??
                work.materials.reduce((sum, m) => sum + (m.quantity * m.cost), 0);
            const workTotal = labourCost + materialCost;

            // Alternate row background
            if (index % 2 === 0) {
                this.doc
                    .fillColor('#f9fafb')
                    .rect(this.margin, tableY - 5, this.pageWidth - 2 * this.margin, 20)
                    .fill();
            }

            // Work title
            this.doc
                .fillColor('black')
                .font('Helvetica-Bold')
                .text(work.title, this.margin + 10, tableY, { width: 250 });

            // Work amount
            this.doc
                .text('', this.pageWidth - this.margin - 180, tableY, { width: 40, align: 'center' })
                .text('', this.pageWidth - this.margin - 130, tableY, { width: 60, align: 'right' })
                .text(`$${workTotal.toFixed(2)}`, this.pageWidth - this.margin - 60, tableY, { width: 50, align: 'right' });

            tableY += 18;

            // Work description (if exists)
            if (work.description) {
                this.doc
                    .fontSize(8)
                    .fillColor('#6b7280')
                    .font('Helvetica')
                    .text(work.description, this.margin + 20, tableY, { width: 300 });
                tableY += 12;
            }

            // Labour details
            if (work.labourHours > 0 && this.data.showLabour) {
                this.doc
                    .fontSize(8)
                    .fillColor('#6b7280')
                    .text(`Labour: ${work.labourHours}h @ $${work.labourRate}/h`, this.margin + 20, tableY);
                tableY += 12;
            }

            // Materials (if enabled)
            if (this.data.showMaterials && work.materials.length > 0) {
                work.materials.forEach(material => {
                    const matTotal = material.quantity * material.cost;
                    this.doc
                        .fontSize(8)
                        .fillColor('#6b7280')
                        .text(`• ${material.name}`, this.margin + 20, tableY)
                        .text(`${material.quantity}`, this.pageWidth - this.margin - 180, tableY, { width: 40, align: 'center' })
                        .text(`$${material.cost.toFixed(2)}`, this.pageWidth - this.margin - 130, tableY, { width: 60, align: 'right' })
                        .text(`$${matTotal.toFixed(2)}`, this.pageWidth - this.margin - 60, tableY, { width: 50, align: 'right' });
                    tableY += 12;
                });
            }

            tableY += 8;

            // Check if we need a new page
            if (tableY > 700) {
                this.doc.addPage();
                tableY = 50;
            }
        });
    }

    addTotalsSection() {
        let totalsY = this.doc.y + 30;

        const subtotal = this.calculateSubtotal();
        const discountAmount = subtotal * (this.data.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const gstAmount = afterDiscount * 0.1;
        const total = afterDiscount + gstAmount;

        const rightX = this.pageWidth - this.margin - 150;

        // Divider line
        this.doc
            .strokeColor('#e5e7eb')
            .lineWidth(1)
            .moveTo(rightX - 20, totalsY)
            .lineTo(this.pageWidth - this.margin, totalsY)
            .stroke();

        totalsY += 15;

        this.doc.fontSize(10).font('Helvetica').fillColor('#4b5563');

        // Subtotal
        this.doc
            .text('Subtotal:', rightX, totalsY)
            .font('Helvetica-Bold')
            .fillColor('black')
            .text(`$${subtotal.toFixed(2)}`, rightX + 80, totalsY, { align: 'right', width: 70 });

        totalsY += 18;

        // Discount (if applicable)
        if (this.data.discount > 0) {
            this.doc
                .font('Helvetica')
                .fillColor('#4b5563')
                .text(`Discount (${this.data.discount}%):`, rightX, totalsY)
                .fillColor('#dc2626')
                .text(`-$${discountAmount.toFixed(2)}`, rightX + 80, totalsY, { align: 'right', width: 70 });

            totalsY += 18;
        }

        // GST
        this.doc
            .fillColor('#4b5563')
            .text('GST (10%):', rightX, totalsY)
            .fillColor('black')
            .font('Helvetica-Bold')
            .text(`$${gstAmount.toFixed(2)}`, rightX + 80, totalsY, { align: 'right', width: 70 });

        totalsY += 25;

        // Total line
        this.doc
            .strokeColor(this.primaryColor)
            .lineWidth(2)
            .moveTo(rightX - 20, totalsY)
            .lineTo(this.pageWidth - this.margin, totalsY)
            .stroke();

        totalsY += 12;

        // Final total
        this.doc
            .fontSize(14)
            .fillColor(this.primaryColor)
            .font('Helvetica-Bold')
            .text('TOTAL:', rightX, totalsY)
            .fontSize(16)
            .text(`$${total.toFixed(2)}`, rightX + 80, totalsY, { align: 'right', width: 70 });
    }

    addFooter() {
        const footerY = this.doc.y + 40;
        let currentY = footerY;

        // Payment details section - PROMINENT BOX (shown for both quotes and invoices)
        if (this.data.businessSettings.bsb) {
            const boxWidth = 350;
            const boxHeight = 85;

            // Draw prominent box with blue border and light background
            this.doc
                .strokeColor(this.primaryColor)
                .lineWidth(2)
                .fillColor('#eff6ff')
                .rect(this.margin, currentY, boxWidth, boxHeight)
                .fillAndStroke();

            currentY += 12;

            this.doc
                .fontSize(11)
                .fillColor(this.primaryColor)
                .font('Helvetica-Bold')
                .text('PAYMENT DETAILS', this.margin + 15, currentY);

            currentY += 18;
            this.doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af');

            if (this.data.businessSettings.accountName) {
                this.doc.text(`Account Name: `, this.margin + 15, currentY, { continued: true })
                    .font('Helvetica')
                    .fillColor('black')
                    .text(this.data.businessSettings.accountName);
                currentY += 14;
            }

            if (this.data.businessSettings.bsb) {
                this.doc.font('Helvetica-Bold').fillColor('#1e40af')
                    .text(`BSB: `, this.margin + 15, currentY, { continued: true })
                    .font('Helvetica')
                    .fillColor('black')
                    .text(this.data.businessSettings.bsb);
                currentY += 14;
            }

            if (this.data.businessSettings.accountNumber) {
                this.doc.font('Helvetica-Bold').fillColor('#1e40af')
                    .text(`Account Number: `, this.margin + 15, currentY, { continued: true })
                    .font('Helvetica')
                    .fillColor('black')
                    .text(this.data.businessSettings.accountNumber);
                currentY += 14;
            }

            currentY += 20;
        }

        // Terms section
        if (this.data.businessSettings.terms) {
            this.doc
                .fontSize(10)
                .fillColor(this.accentColor)
                .font('Helvetica-Bold')
                .text('TERMS & CONDITIONS', this.margin, currentY);

            currentY += 12;
            this.doc
                .fontSize(8)
                .fillColor('#6b7280')
                .font('Helvetica')
                .text(this.data.businessSettings.terms, this.margin, currentY, {
                    width: this.pageWidth - 2 * this.margin,
                    lineGap: 2
                });

            currentY = this.doc.y + 15;
        }

        // Notes section
        const notes = this.data.notes || this.data.businessSettings.defaultNotes;
        if (notes) {
            this.doc
                .fontSize(10)
                .fillColor(this.accentColor)
                .font('Helvetica-Bold')
                .text('NOTES', this.margin, currentY);

            currentY += 12;
            this.doc
                .fontSize(8)
                .fillColor('#6b7280')
                .font('Helvetica')
                .text(notes, this.margin, currentY, {
                    width: this.pageWidth - 2 * this.margin,
                    lineGap: 2
                });
        }
    }

    calculateSubtotal(): number {
        return this.data.works.reduce((sum, work) => {
            const labourCost = work.labourCostOverride ?? (work.labourHours * work.labourRate);
            const materialCost = work.materialCostOverride ??
                work.materials.reduce((matSum, m) => matSum + (m.quantity * m.cost), 0);
            return sum + labourCost + materialCost;
        }, 0);
    }
}

export function createInvoice(
    type: InvoiceType,
    invoiceNumber: string,
    jobNumber: number,
    date: Date,
    client: Client | null,
    works: (Work & { materials: Material[] })[],
    businessSettings: BusinessSettings,
    filePath: string,
    options: {
        showMaterials?: boolean;
        showLabour?: boolean;
        discount?: number;
        notes?: string;
        dueDate?: Date;
    } = {}
) {
    const invoiceData: InvoiceData = {
        type,
        invoiceNumber,
        jobNumber,
        date,
        dueDate: options.dueDate,
        client,
        works,
        businessSettings,
        showMaterials: options.showMaterials ?? true,
        showLabour: options.showLabour ?? true,
        discount: options.discount ?? 0,
        notes: options.notes,
    };

    const generator = new ModernInvoiceGenerator(invoiceData);
    generator.generateInvoice(filePath);
}
