const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Shared helper for consistent currency formatting
function formatCurrency(amount) {
  return "N$" + parseFloat(amount).toFixed(2);
}

/**
 * Generate a single-page A4 quotation PDF for Elcorp Namibia.
 * Layout: exact specification, professional spacing, no page overflow.
 *
 * @param {object} quotationData - Quotation payload from the client
 * @param {object} res - Express response object
 * @param {number|string} quoteId - Stable quotation identifier
 */
function generateQuotationPdf(quotationData, res, quoteId) {
  const doc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    margin: 35,
    bufferPages: true,
  });

  if (typeof res.on === "function") {
    res.on("error", (err) => {
      console.error("Response error while streaming quotation PDF:", err);
      try {
        doc.end();
      } catch {
        // ignore
      }
    });
  }

  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="quotation.pdf"',
    );
  }
  doc.pipe(res);

  // Layout constants (A4: 595.28 x 841.89 pt)
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const marginLeft = doc.page.margins.left || 35;
  const marginRight = doc.page.margins.right || 35;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const footerHeight = 50;

  // ===== 1. LOGO (circular frame, centered, visible) =====
  const logoRadius = 38;
  const logoCenterX = marginLeft + logoRadius;
  const logoCenterY = 52;

  doc.save();
  doc.fillColor("#A94442").circle(logoCenterX, logoCenterY, logoRadius);
  doc.restore();

  try {
    const logoPath = path.join(__dirname, "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBoxSize = logoRadius * 2;
      doc
        .save()
        .circle(logoCenterX, logoCenterY, logoRadius)
        .clip()
        .image(
          logoPath,
          logoCenterX - logoBoxSize / 2,
          logoCenterY - logoBoxSize / 2,
          {
            fit: [logoBoxSize, logoBoxSize],
            align: "center",
            valign: "center",
          },
        )
        .restore();
    } else {
      doc
        .fillColor("#ffffff")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("E", logoCenterX - 18, logoCenterY - 14, {
          width: 36,
          align: "center",
        });
    }
  } catch {
    doc
      .fillColor("#ffffff")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("E", logoCenterX - 18, logoCenterY - 14, {
        width: 36,
        align: "center",
      });
  }

  // ===== 2. COMPANY NAME & TAGLINE =====
  const headerTopY = 38;
  doc
    .fillColor("#000000")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("ELCORP NAMIBIA", marginLeft + logoRadius * 2 + 10, headerTopY);

  doc
    .fontSize(9)
    .font("Helvetica-Oblique")
    .fillColor("#333333")
    .text(
      "Professional Business Solutions",
      marginLeft + logoRadius * 2 + 10,
      headerTopY + 22,
    );

  // ===== 3. DOCUMENT TITLE (top-right) =====
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("QUOTATION", marginLeft, headerTopY, {
      width: contentWidth,
      align: "right",
    });

  // ===== 4. CONTACT INFORMATION ROW =====
  const contactRowY = headerTopY + 42;
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("Phone: ", marginLeft, contactRowY, { continued: true })
    .font("Helvetica")
    .fillColor("#000000")
    .text("+264 81 7244041", { continued: true })
    .fillColor("#999999")
    .text("  |  ", { continued: true })
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("Email: ", { continued: true })
    .font("Helvetica")
    .fillColor("#000000")
    .text("elcorpnamibia@gmail.com", { continued: true })
    .fillColor("#999999")
    .text("  |  ", { continued: true })
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("Website: ", { continued: true })
    .font("Helvetica")
    .fillColor("#1A5FB4")
    .text("https://elli-portfolio.vercel.app/");

  const headerLineY = contactRowY + 14;
  doc
    .strokeColor("#999999")
    .lineWidth(0.5)
    .moveTo(marginLeft, headerLineY)
    .lineTo(marginLeft + contentWidth, headerLineY)
    .stroke();

  // ===== 5. QUOTATION META (right-aligned) =====
  const rawQuoteDate = quotationData.quotationDate || new Date().toISOString();
  const parsedQuoteDate = new Date(rawQuoteDate);
  const safeQuoteDate = Number.isNaN(parsedQuoteDate.getTime())
    ? new Date()
    : parsedQuoteDate;
  const quoteDate = safeQuoteDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const resolvedQuoteId = quoteId || quotationData.id;

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#000000")
    .text("Date: " + quoteDate, marginLeft + contentWidth / 2, headerLineY + 4, {
      width: contentWidth / 2,
      align: "right",
    });
  doc
    .font("Helvetica-Oblique")
    .text("Quotation ID: QT-" + resolvedQuoteId, marginLeft + contentWidth / 2, headerLineY + 16, {
      width: contentWidth / 2,
      align: "right",
    });

  // ===== 6. CLIENT INFORMATION =====
  const clientTopY = headerLineY + 40;
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("CLIENT INFORMATION", marginLeft, clientTopY);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#000000")
    .text("Name:  " + (quotationData.clientName || ""), marginLeft, clientTopY + 16)
    .text("Email:  " + (quotationData.clientEmail || ""), marginLeft, clientTopY + 30)
    .text("Phone:  " + (quotationData.clientPhone || ""), marginLeft, clientTopY + 44);

  // ===== 7. ITEMIZED TABLE =====
  const tableTop = clientTopY + 68;
  const items = quotationData.items || [];
  const itemCount = items.length;
  const itemHeight = itemCount <= 8 ? 18 : itemCount <= 15 ? 15 : 12;
  const colWidths = {
    description: 200,
    quantity: 50,
    unitPrice: 75,
    total: 90,
  };
  const descX = marginLeft + 8;
  const qtyX = marginLeft + 210;
  const unitX = marginLeft + 265;
  const totalX = marginLeft + contentWidth - colWidths.total;

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#F4F4F8")
    .rect(marginLeft, tableTop - 4, contentWidth, 22)
    .fill();

  doc
    .fillColor("#2C3E50")
    .text("Description", descX, tableTop + 4)
    .text("Qty", qtyX, tableTop + 4, { width: colWidths.quantity, align: "right" })
    .text("Unit Price", unitX, tableTop + 4, { width: colWidths.unitPrice, align: "right" })
    .text("Total", totalX, tableTop + 4, { width: colWidths.total, align: "right" });

  doc.fillColor("#000000").font("Helvetica");
  let currentY = tableTop + 24;

  const tableFontSize = itemHeight <= 12 ? 7 : 8;
  items.forEach((item) => {
    const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
    const desc = (item.name || "") + (item.description ? " - " + item.description : "");
    doc
      .fontSize(tableFontSize)
      .text(desc, descX, currentY, { width: 195 })
      .text(String(item.quantity), qtyX, currentY, { width: colWidths.quantity, align: "right" })
      .text(formatCurrency(item.unitPrice), unitX, currentY, { width: colWidths.unitPrice, align: "right" })
      .text(formatCurrency(itemTotal), totalX, currentY, { width: colWidths.total, align: "right" });
    currentY += itemHeight;
  });

  currentY += 8;

  // ===== 8. FINANCIAL SUMMARY =====
  doc
    .strokeColor("#D0D3DC")
    .lineWidth(0.5)
    .moveTo(marginLeft, currentY)
    .lineTo(marginLeft + contentWidth, currentY)
    .stroke();

  currentY += 16;

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.unitPrice),
    0,
  );
  const taxRate = parseFloat(quotationData.tax) || 15;
  const discountRate = parseFloat(quotationData.discount) || 0;
  const discountAmount = discountRate ? (subtotal * discountRate) / 100 : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * (taxRate / 100);
  const grandTotal = subtotalAfterDiscount + taxAmount;

  const totalsLabelX = marginLeft + contentWidth / 2 + 8;
  const totalsValueWidth = 105;
  const totalsValueX = marginLeft + contentWidth - totalsValueWidth;

  doc.fontSize(9).font("Helvetica").fillColor("#000000");
  doc.text("Subtotal:", totalsLabelX, currentY);
  doc.text(formatCurrency(subtotal), totalsValueX, currentY, {
    width: totalsValueWidth,
    align: "right",
  });
  currentY += 14;

  if (discountRate > 0) {
    doc.text("Discount (" + discountRate + "%):", totalsLabelX, currentY);
    doc.text("-" + formatCurrency(discountAmount), totalsValueX, currentY, {
      width: totalsValueWidth,
      align: "right",
    });
    currentY += 14;
  }

  doc.text("Tax (" + taxRate + "%):", totalsLabelX, currentY);
  doc.text(formatCurrency(taxAmount), totalsValueX, currentY, {
    width: totalsValueWidth,
    align: "right",
  });
  currentY += 18;

  doc
    .strokeColor("#D0D3DC")
    .lineWidth(0.5)
    .moveTo(totalsLabelX, currentY)
    .lineTo(marginLeft + contentWidth, currentY)
    .stroke();

  currentY += 12;

  const grandTotalRowHeight = 18;
  doc
    .fillColor("#E8F4F8")
    .rect(totalsLabelX - 6, currentY - 4, marginLeft + contentWidth - totalsLabelX + 12, grandTotalRowHeight)
    .fill();

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("GRAND TOTAL:", totalsLabelX, currentY);
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#1A5276")
    .text(formatCurrency(grandTotal), totalsValueX, currentY, {
      width: totalsValueWidth,
      align: "right",
    });

  // ===== 9. INSTRUCTIONS / IMPORTANT NOTES =====
  currentY += 14;

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("INSTRUCTIONS / IMPORTANT NOTES", marginLeft, currentY);

  currentY += 12;

  const instructionsFontSize = 7;
  const instructions = [
    "This quotation does not include a monthly maintenance fee unless explicitly stated.",
    "All payments must be made directly and strictly via: https://buymeacoffee.com/ellin72",
    "Work will commence only after full payment or agreed deposit is received.",
    "Any additional features or changes requested outside this quotation will be billed separately.",
    "Delivery timelines begin once payment and all required client information are provided.",
    "This quotation is valid for 30 days from the date of issue.",
  ];

  doc.fontSize(instructionsFontSize).font("Helvetica").fillColor("#333333");
  const instructionsText = instructions.map((line) => "•  " + line).join("\n");
  const instructionsOptions = { width: contentWidth - 12, lineGap: 2 };
  doc.text(instructionsText, marginLeft + 4, currentY, instructionsOptions);
  currentY += doc.heightOfString(instructionsText, instructionsOptions);

  currentY += 12;

  // ===== 10. APPROVAL & SIGNATURE =====
  const signatureTopY = currentY;
  const footerY = pageHeight - footerHeight;

  if (signatureTopY + 85 < footerY) {
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("APPROVAL & SIGNATURE", marginLeft, signatureTopY, {
        width: contentWidth,
        align: "center",
      });

    currentY = signatureTopY + 16;
    const leftColX = marginLeft + 20;
    const rightColX = marginLeft + contentWidth / 2 + 20;
    const lineLen = 130;

    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("Customer/Client", leftColX, currentY);

    doc
      .strokeColor("#D0D3DC")
      .lineWidth(0.5)
      .moveTo(leftColX, currentY + 16)
      .lineTo(leftColX + lineLen, currentY + 16)
      .stroke();
    doc.fontSize(7).font("Helvetica-Oblique").fillColor("#666666")
      .text("Signature", leftColX, currentY + 20);
    doc
      .moveTo(leftColX, currentY + 34)
      .lineTo(leftColX + lineLen, currentY + 34)
      .stroke();
    doc.fontSize(7).font("Helvetica-Oblique").fillColor("#000000")
      .text("Date", leftColX, currentY + 38);

    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("Elcorp Namibia Representative", rightColX, currentY);

    doc
      .strokeColor("#D0D3DC")
      .lineWidth(0.5)
      .moveTo(rightColX, currentY + 16)
      .lineTo(rightColX + lineLen, currentY + 16)
      .stroke();
    doc.fontSize(7).font("Helvetica-Oblique").fillColor("#666666")
      .text("Signature", rightColX, currentY + 20);
    doc
      .moveTo(rightColX, currentY + 34)
      .lineTo(rightColX + lineLen, currentY + 34)
      .stroke();
    doc.fontSize(7).font("Helvetica-Oblique").fillColor("#000000")
      .text("Date", rightColX, currentY + 38);
  }

  // ===== 11. PAYMENT QR CODE (fixed position, bottom-right, never moves) =====
  const qrSize = 55;
  const qrX = pageWidth - marginRight - qrSize;
  const qrY = pageHeight - footerHeight - 85;
  const qrImagePath = path.join(__dirname, "public", "bmc_qr.png");

  if (fs.existsSync(qrImagePath)) {
    doc.image(qrImagePath, qrX, qrY, { width: qrSize, height: qrSize });
    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("Make Payment", qrX, qrY + qrSize + 4, {
        width: qrSize,
        align: "center",
      });
  }

  // ===== 12. FOOTER (on last page only) =====
  const pageRange = doc.bufferedPageRange();
  if (pageRange.count > 0) {
    const lastPageIndex = pageRange.count - 1;
    const originalPageIndex = doc.page.index;

    doc.switchToPage(lastPageIndex);

    const footerMarginFromBottom = 40;
    const footerLineY = doc.page.height - footerMarginFromBottom - 8;

    doc
      .strokeColor("#cccccc")
      .lineWidth(0.5)
      .moveTo(marginLeft, footerLineY)
      .lineTo(doc.page.width - marginLeft, footerLineY)
      .stroke();

    doc
      .fillColor("#666666")
      .fontSize(7)
      .font("Helvetica-Oblique")
      .text(
        "Professional Solutions for Your Business | This quotation is valid for 30 days from the date of issue. | Contact: +264 81 7244041 | elcorpnamibia@gmail.com",
        marginLeft,
        footerLineY + 4,
        {
          width: contentWidth,
          align: "center",
        },
      );

    if (originalPageIndex >= 0 && originalPageIndex < pageRange.count) {
      doc.switchToPage(originalPageIndex);
    }
  }

  doc.end();
}

module.exports = {
  generateQuotationPdf,
  formatCurrency,
};
