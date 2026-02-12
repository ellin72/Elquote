const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Shared helper for consistent currency formatting
function formatCurrency(amount) {
  return "N$" + parseFloat(amount).toFixed(2);
}

/**
 * Generate a quotation PDF for Elcorp Namibia and stream it to the given HTTP response.
 * This encapsulates all layout, branding, and rendering logic in a single, reusable place.
 *
 * @param {object} quotationData - Quotation payload from the client
 * @param {object} res - Express response object (writable stream target)
 * @param {number|string} quoteId - Stable quotation identifier to display
 */
function generateQuotationPdf(quotationData, res, quoteId) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
  });

  // Handle response stream errors gracefully so the PDF stream is always closed
  res.on("error", (err) => {
    console.error("Response error while streaming quotation PDF:", err);
    try {
      doc.end();
    } catch {
      // ignore secondary errors while attempting to end the document
    }
  });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="quotation.pdf"',
  );

  // Pipe PDF to response
  doc.pipe(res);

  // Layout helpers
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const marginLeft = doc.page.margins.left || 40;
  const marginRight = doc.page.margins.right || 40;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Logo: circular container with centered image (falls back to monogram if image missing)
  const logoRadius = 45;
  const logoCenterX = marginLeft + logoRadius - 5; // keep near left margin
  const logoCenterY = 65;

  // Always render a simple red/gray circular background similar to the approved design
  doc.save();
  doc.fillColor("#A94442").circle(logoCenterX, logoCenterY, logoRadius);
  doc.fillColor("#5A5A5A");
  doc
    .moveTo(logoCenterX, logoCenterY - logoRadius)
    .quadraticCurveTo(
      logoCenterX + logoRadius,
      logoCenterY,
      logoCenterX,
      logoCenterY + logoRadius,
    )
    .quadraticCurveTo(
      logoCenterX + logoRadius,
      logoCenterY,
      logoCenterX,
      logoCenterY - logoRadius,
    )
    .fill();
  doc.restore();

  // Try to render the actual logo image inside the circle while maintaining aspect ratio
  try {
    const logoPath = path.join(__dirname, "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBoxSize = logoRadius * 2; // diameter

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
      // Fallback: monogram text centered in the circle
      doc
        .fillColor("#ffffff")
        .fontSize(36)
        .font("Helvetica-Bold")
        .text("E", logoCenterX - 25, logoCenterY - 22, {
          width: 50,
          align: "center",
        });
    }
  } catch {
    doc
      .fillColor("#ffffff")
      .fontSize(36)
      .font("Helvetica-Bold")
      .text("E", logoCenterX - 25, logoCenterY - 22, {
        width: 50,
        align: "center",
      });
  }

  // ===== HEADER: Logo, company name, and QUOTATION title =====
  const headerTopY = 45;

  doc
    .fillColor("#000000")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("ELCORP NAMIBIA", marginLeft + logoRadius * 2, headerTopY);

  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text(
      "Professional Business Solutions",
      marginLeft + logoRadius * 2,
      headerTopY + 22,
    );

  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("QUOTATION", marginLeft, headerTopY + 5, {
      width: contentWidth,
      align: "right",
    });

  // ===== Quotation meta information (date + ID) =====
  doc.fontSize(9).font("Helvetica").fillColor("#000000");

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

  // ===== Company contact + meta rows =====
  const contactRowY = headerTopY + 40;

  // Row 1: Phone and Email
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
    .text("elcorpnamibia@gmail.com");

  // Row 2: Website (left), Date + Quotation ID (right)
  const metaRowY = contactRowY + 14;

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("Website: ", marginLeft, metaRowY, { continued: true })
    .font("Helvetica")
    .fillColor("#1A5FB4")
    .text("https://elli-portfolio.vercel.app/");

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#000000")
    .text(`${quoteDate}`, marginLeft + contentWidth / 2, metaRowY, {
      width: contentWidth / 2,
      align: "right",
    });

  doc
    .font("Helvetica-Oblique")
    .fillColor("#000000")
    .text(
      `Quotation ID: QT-${resolvedQuoteId}`,
      marginLeft + contentWidth / 2,
      metaRowY + 12,
      {
        width: contentWidth / 2,
        align: "right",
      },
    );

  // Thin horizontal line below both meta rows
  const headerLineY = metaRowY + 26;
  doc
    .strokeColor("#999999")
    .lineWidth(1)
    .moveTo(marginLeft, headerLineY)
    .lineTo(marginLeft + contentWidth, headerLineY)
    .stroke();

  // ===== Client information section =====
  const clientTopY = headerLineY + 18;

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("CLIENT INFORMATION", marginLeft, clientTopY);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#000000")
    .text(`Name:  ${quotationData.clientName}`, marginLeft, clientTopY + 20)
    .text(`Email:  ${quotationData.clientEmail}`, marginLeft, clientTopY + 35)
    .text(`Phone:  ${quotationData.clientPhone}`, marginLeft, clientTopY + 50);

  // ===== Items table =====
  const tableTop = clientTopY + 80;
  const itemHeight = 20;
  const colWidths = {
    description: 200,
    quantity: 60,
    unitPrice: 80,
    total: 95,
  };

  // Table header
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#F4F4F8")
    .rect(marginLeft, tableTop - 5, contentWidth, 25)
    .fill();

  doc
    .fillColor("#2C3E50")
    .text("Description", marginLeft + 10, tableTop + 5)
    .text("Qty", 250, tableTop + 5, {
      width: colWidths.quantity,
      align: "right",
    })
    .text("Unit Price", 310, tableTop + 5, {
      width: colWidths.unitPrice,
      align: "right",
    })
    .text("Total", 450, tableTop + 5, {
      width: colWidths.total,
      align: "right",
    });

  // Table rows
  doc.fillColor("#000000").font("Helvetica");

  let currentY = tableTop + 30;
  quotationData.items.forEach((item) => {
    const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);

    doc
      .fontSize(9)
      .text(item.name + " - " + item.description, marginLeft + 10, currentY, {
        width: 190,
      })
      .text(item.quantity, 250, currentY, {
        width: colWidths.quantity,
        align: "right",
      })
      .text(formatCurrency(item.unitPrice), 310, currentY, {
        width: colWidths.unitPrice,
        align: "right",
      })
      .text(formatCurrency(itemTotal), 450, currentY, {
        width: colWidths.total,
        align: "right",
      });

    currentY += itemHeight;
  });

  // Horizontal line before totals
  currentY += 10;
  doc
    .strokeColor("#D0D3DC")
    .lineWidth(1)
    .moveTo(marginLeft, currentY)
    .lineTo(marginLeft + contentWidth, currentY)
    .stroke();

  // Calculations (business logic preserved)
  currentY += 20;
  const subtotal = quotationData.items.reduce(
    (sum, item) =>
      sum + parseFloat(item.quantity) * parseFloat(item.unitPrice),
    0,
  );

  const discountAmount = quotationData.discount
    ? (subtotal * parseFloat(quotationData.discount)) / 100
    : 0;

  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount =
    subtotalAfterDiscount * (parseFloat(quotationData.tax) / 100);
  const grandTotal = subtotalAfterDiscount + taxAmount;

  // Totals on the right
  doc.fontSize(10).font("Helvetica").fillColor("#000000");

  const totalsLabelX = marginLeft + contentWidth / 2 + 10;
  const totalsValueX = marginLeft + contentWidth - 10;

  doc.text("Subtotal:", totalsLabelX, currentY);
  doc.text(formatCurrency(subtotal), totalsValueX, currentY, {
    align: "right",
  });

  currentY += 18;

  if (quotationData.discount && parseFloat(quotationData.discount) > 0) {
    doc.text(`Discount (${quotationData.discount}%):`, totalsLabelX, currentY);
    doc.text("-" + formatCurrency(discountAmount), totalsValueX, currentY, {
      align: "right",
    });
    currentY += 18;
  }

  doc.text(`Tax (${quotationData.tax}%):`, totalsLabelX, currentY);
  doc.text(formatCurrency(taxAmount), totalsValueX, currentY, {
    align: "right",
  });

  // Thin divider line above GRAND TOTAL
  currentY += 22;
  doc
    .strokeColor("#D0D3DC")
    .lineWidth(1)
    .moveTo(totalsLabelX, currentY)
    .lineTo(marginLeft + contentWidth, currentY)
    .stroke();

  currentY += 10;

  // GRAND TOTAL row
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text("GRAND TOTAL:", totalsLabelX, currentY);

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#2C3E50")
    .text(formatCurrency(grandTotal), totalsValueX, currentY, {
      align: "right",
    });

  // Small but visible gap before approval section
  const signatureTopY = currentY + 28;

  // Signature section - only add if there's enough space, starting below the totals
  const availableSpace = pageHeight - signatureTopY - 80;
  if (availableSpace >= 80) {
    currentY = signatureTopY;

    // Signature section header
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("APPROVAL & SIGNATURE", marginLeft, currentY, {
        width: contentWidth,
        align: "center",
      });

    currentY += 18;

    // Two column layout for signatures
    const leftColX = marginLeft + 20;
    const rightColX = marginLeft + contentWidth / 2 + 20;
    const signatureLineLength = 140;

    // Customer signature section
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("Customer/Client", leftColX, currentY);

    doc
      .strokeColor("#D0D3DC")
      .lineWidth(1)
      .moveTo(leftColX, currentY + 20)
      .lineTo(leftColX + signatureLineLength, currentY + 20)
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor("#000000")
      .text("Signature:", leftColX, currentY + 24);

    doc
      .strokeColor("#D0D3DC")
      .lineWidth(1)
      .moveTo(leftColX, currentY + 42)
      .lineTo(leftColX + signatureLineLength, currentY + 42)
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .text("Date:", leftColX, currentY + 46);

    // Elcorp Namibia signature section
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#2C3E50")
      .text("Elcorp Namibia Representative", rightColX, currentY);

    doc
      .strokeColor("#D0D3DC")
      .lineWidth(1)
      .moveTo(rightColX, currentY + 20)
      .lineTo(rightColX + signatureLineLength, currentY + 20)
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor("#000000")
      .text("Signature:", rightColX, currentY + 24);

    doc
      .strokeColor("#D0D3DC")
      .lineWidth(1)
      .moveTo(rightColX, currentY + 42)
      .lineTo(rightColX + signatureLineLength, currentY + 42)
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .text("Date:", rightColX, currentY + 46);
  }

  // Footer near the bottom of the last page so it never overwrites main content
  const pageRange = doc.bufferedPageRange();
  if (pageRange.count > 0) {
    const lastPageIndex = pageRange.count - 1;
    const originalPageIndex = doc.page.index;

    doc.switchToPage(lastPageIndex);

    const footerMarginFromBottom = 40;
    const footerY = doc.page.height - footerMarginFromBottom;
    const footerTextWidth = doc.page.width - 80;

    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(marginLeft, footerY)
      .lineTo(doc.page.width - marginLeft, footerY)
      .stroke();

    doc
      .fillColor("#666666")
      .fontSize(7)
      .font("Helvetica-Oblique")
      .text(
        "Professional Solutions for Your Business | This quotation is valid for 30 days from the date of issue. | Contact: +264 81 7244041 | elcorpnamibia@gmail.com",
        marginLeft,
        footerY + 5,
        {
          width: footerTextWidth,
          align: "center",
        },
      );

    if (originalPageIndex >= 0 && originalPageIndex < pageRange.count) {
      doc.switchToPage(originalPageIndex);
    }
  }

  // Finalise PDF
  doc.end();
}

module.exports = {
  generateQuotationPdf,
  formatCurrency,
};

