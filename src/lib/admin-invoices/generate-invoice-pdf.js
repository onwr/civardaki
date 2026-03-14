import { jsPDF } from "jspdf";
import { formatDate, formatDateTime } from "./formatters";
import { getTypeLabel, getStatusLabel } from "./status-config";

const LOGO_URL = "/logo.png";
const FONT_INTER_TIGHT_MEDIUM = "/fonts/InterTight-Medium.ttf";
const FONT_INTER_TIGHT_BOLD = "/fonts/InterTight-Bold.ttf";
const PDF_FONT_FAMILY = "InterTight";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 14;
const MARGIN_Y = 16;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const COLORS = {
  brand: [0, 74, 173],
  brandDark: [0, 58, 138],
  brandSoft: [239, 246, 255],
  text: [20, 24, 31],
  muted: [107, 114, 128],
  border: [223, 228, 235],
  soft: [248, 250, 252],
  white: [255, 255, 255],
  success: [22, 163, 74],
  danger: [220, 38, 38],
  warning: [217, 119, 6],
};

const FONT = {
  title: 22,
  h1: 13,
  h2: 11,
  body: 10,
  small: 8.5,
  tiny: 7.5,
};

const ISSUER = {
  companyName: "Civardaki",
  companyEmail: "destek@civardaki.com",
  companyWebsite: "civardaki.com",
  supportEmail: "destek@civardaki.com",
  companyAddress: "Türkiye",
};

function safeStr(value, fallback = "—") {
  if (value == null) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function safeDate(value, formatter = formatDate) {
  if (!value) return "—";
  try {
    return formatter(value);
  } catch {
    return "—";
  }
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeFileName(invoice) {
  const raw = invoice?.invoiceNumber || invoice?.id || "fatura";
  return String(raw).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function formatAmountForPdf(value, currency = "TRY") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const amount = Number(value);

  if (currency === "TRY") {
    return (
      new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + " TL"
    );
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function fetchFontBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Font fetch failed");
  return await res.arrayBuffer();
}

async function ensureFonts(doc) {
  try {
    const [mediumBuf, boldBuf] = await Promise.all([
      fetchFontBuffer(FONT_INTER_TIGHT_MEDIUM),
      fetchFontBuffer(FONT_INTER_TIGHT_BOLD),
    ]);
    doc.addFileToVFS("InterTight-Medium.ttf", arrayBufferToBase64(mediumBuf));
    doc.addFont("InterTight-Medium.ttf", PDF_FONT_FAMILY, "normal");
    doc.addFileToVFS("InterTight-Bold.ttf", arrayBufferToBase64(boldBuf));
    doc.addFont("InterTight-Bold.ttf", PDF_FONT_FAMILY, "bold");
    doc.setFont(PDF_FONT_FAMILY, "normal");
    return PDF_FONT_FAMILY;
  } catch {
    doc.setFont("helvetica", "normal");
    return "helvetica";
  }
}

async function loadLogoBase64() {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) return null;
    const blob = await res.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function setTextColor(doc, color = COLORS.text) {
  doc.setTextColor(...color);
}

function setDrawColor(doc, color = COLORS.border) {
  doc.setDrawColor(...color);
}

function setFillColor(doc, color = COLORS.soft) {
  doc.setFillColor(...color);
}

function drawBox(doc, x, y, w, h, options = {}) {
  const {
    fill = null,
    stroke = COLORS.border,
    radius = 2.5,
    lineWidth = 0.2,
    mode,
  } = options;

  doc.setLineWidth(lineWidth);

  if (fill) setFillColor(doc, fill);
  if (stroke) setDrawColor(doc, stroke);

  const drawMode = mode || (fill ? "FD" : "S");
  doc.roundedRect(x, y, w, h, radius, radius, drawMode);
}

function drawText(doc, value, x, y, options = {}) {
  const {
    size = FONT.body,
    weight = "normal",
    color = COLORS.text,
    align = "left",
    font = PDF_FONT_FAMILY,
  } = options;
  doc.setFont(font, weight);
  doc.setFontSize(size);
  setTextColor(doc, color);
  doc.text(String(value ?? ""), x, y, { align });
}

function drawWrappedText(doc, value, x, y, maxWidth, options = {}) {
  const {
    size = FONT.body,
    weight = "normal",
    color = COLORS.text,
    lineHeight = 4.6,
    font = PDF_FONT_FAMILY,
  } = options;
  doc.setFont(font, weight);
  doc.setFontSize(size);
  setTextColor(doc, color);

  const raw = safeStr(value, "");
  const lines = raw ? doc.splitTextToSize(raw, maxWidth) : ["—"];
  doc.text(lines, x, y);

  return y + lines.length * lineHeight;
}

function getStatusColor(statusLabel) {
  const s = String(statusLabel || "").toLowerCase();

  if (s.includes("ödendi") || s.includes("aktif") || s.includes("tamam")) {
    return COLORS.success;
  }
  if (s.includes("taslak") || s.includes("bekle")) {
    return COLORS.warning;
  }
  if (s.includes("iptal") || s.includes("başarısız")) {
    return COLORS.danger;
  }
  return COLORS.white;
}

function buildRows(invoice) {
  const currency = invoice?.currency || "TRY";

  return [
    {
      item: safeStr(getTypeLabel(invoice?.type), "Hizmet"),
      description:
        safeStr(invoice?.description, "") ||
        (invoice?.type === "SUBSCRIPTION" ? "Abonelik ödemesi" : "Fatura kalemi"),
      date:
        invoice?.subscriptionPayment?.paidAt
          ? safeDate(invoice.subscriptionPayment.paidAt, formatDate)
          : safeDate(invoice?.issueDate, formatDate),
      amount: formatAmountForPdf(invoice?.amount, currency),
    },
  ];
}

function drawTable(doc, x, y, width, rows, fontName) {
  const cols = {
    item: 38,
    description: 76,
    date: 28,
    amount: width - (38 + 76 + 28),
  };

  const headerH = 10;

  drawBox(doc, x, y, width, headerH, {
    fill: COLORS.brandSoft,
    stroke: COLORS.border,
    radius: 1.5,
  });

  drawText(doc, "Hizmet / Kalem", x + 3, y + 6.5, {
    size: FONT.small,
    weight: "bold",
    font: fontName,
  });
  drawText(doc, "Açıklama", x + cols.item + 3, y + 6.5, {
    size: FONT.small,
    weight: "bold",
    font: fontName,
  });
  drawText(doc, "Tarih", x + cols.item + cols.description + 3, y + 6.5, {
    size: FONT.small,
    weight: "bold",
    font: fontName,
  });
  drawText(doc, "Tutar", x + width - 3, y + 6.5, {
    size: FONT.small,
    weight: "bold",
    align: "right",
    font: fontName,
  });

  let currentY = y + headerH + 2;

  rows.forEach((row) => {
    doc.setFont(fontName, "normal");
    doc.setFontSize(FONT.small);

    const descLines = doc.splitTextToSize(safeStr(row.description), cols.description - 6);
    const rowH = Math.max(12, descLines.length * 4.5 + 5);

    drawBox(doc, x, currentY, width, rowH, {
      fill: COLORS.white,
      stroke: COLORS.border,
      radius: 1.2,
      lineWidth: 0.15,
    });

    drawText(doc, row.item, x + 3, currentY + 6, {
      size: FONT.small,
      weight: "bold",
      font: fontName,
    });

    doc.setFont(fontName, "normal");
    doc.setFontSize(FONT.small);
    setTextColor(doc, COLORS.muted);
    doc.text(descLines, x + cols.item + 3, currentY + 6);

    drawText(doc, row.date, x + cols.item + cols.description + 3, currentY + 6, {
      size: FONT.small,
      color: COLORS.text,
      font: fontName,
    });

    drawText(doc, row.amount, x + width - 3, currentY + 6, {
      size: FONT.small,
      weight: "bold",
      align: "right",
      font: fontName,
    });

    currentY += rowH + 2;
  });

  return currentY;
}

function drawSummary(doc, x, y, w, invoice, fontName) {
  const currency = invoice?.currency || "TRY";
  const subtotal = safeNumber(invoice?.amount);
  const tax = safeNumber(invoice?.taxAmount, 0);
  const total = subtotal + tax;

  const h = 38;

  drawBox(doc, x, y, w, h, {
    fill: COLORS.soft,
    stroke: COLORS.border,
    radius: 2.5,
  });

  const rows = [
    ["Ara Toplam", formatAmountForPdf(subtotal, currency), false],
    ["Vergi / KDV", formatAmountForPdf(tax, currency), false],
    ["Toplam", formatAmountForPdf(total, currency), true],
    ["Para Birimi", safeStr(currency), false],
  ];

  let cy = y + 6;

  rows.forEach(([label, value, isTotal]) => {
    drawText(doc, label, x + 4, cy, {
      size: isTotal ? FONT.h2 : FONT.small,
      weight: isTotal ? "bold" : "normal",
      color: isTotal ? COLORS.text : COLORS.muted,
      font: fontName,
    });

    drawText(doc, value, x + w - 4, cy, {
      size: isTotal ? FONT.h2 : FONT.small,
      weight: isTotal ? "bold" : "normal",
      align: "right",
      color: COLORS.text,
      font: fontName,
    });

    cy += isTotal ? 7 : 5.5;
  });

  return y + h;
}

export async function generateInvoicePdf(invoice) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const activeFont = await ensureFonts(doc);

  let y = MARGIN_Y;

  // FULL BLUE HEADER
  drawBox(doc, MARGIN_X, y, CONTENT_W, 32, {
    fill: COLORS.brand,
    stroke: COLORS.brand,
    radius: 4,
  });

  const logo = await loadLogoBase64();
  const logoX = MARGIN_X + 4;
  const logoY = y + 6;
  const logoW = 32;
  const logoH = 10;

  if (logo) {
    try {
      doc.addImage(logo, "PNG", logoX, logoY, logoW, logoH);
    } catch {
      drawText(doc, ISSUER.companyName, logoX, logoY + 7, {
        size: FONT.h2,
        weight: "normal",
        color: COLORS.white,
        font: activeFont,
      });
    }
  } else {
    drawText(doc, ISSUER.companyName, logoX, logoY + 7, {
      size: FONT.h2,
      weight: "normal",
      color: COLORS.white,
      font: activeFont,
    });
  }

  drawText(doc, "FATURA", MARGIN_X + CONTENT_W - 4, y + 11, {
    size: FONT.title,
    weight: "normal",
    color: COLORS.white,
    align: "right",
    font: activeFont,
  });

  drawText(
    doc,
    `No: ${safeStr(invoice?.invoiceNumber)}`,
    MARGIN_X + CONTENT_W - 4,
    y + 18,
    {
      size: FONT.small,
      color: COLORS.white,
      align: "right",
      font: activeFont,
    }
  );

  y += 38;

  // SELLER / BUYER
  const colGap = 6;
  const colW = (CONTENT_W - colGap) / 2;

  drawBox(doc, MARGIN_X, y, colW, 38, {
    fill: COLORS.white,
    stroke: COLORS.border,
    radius: 3,
  });
  drawBox(doc, MARGIN_X + colW + colGap, y, colW, 38, {
    fill: COLORS.white,
    stroke: COLORS.border,
    radius: 3,
  });

  drawText(doc, "SATICI", MARGIN_X + 4, y + 7, {
    size: FONT.small,
    weight: "bold",
    color: COLORS.brand,
    font: activeFont,
  });

  drawText(doc, "ALICI", MARGIN_X + colW + colGap + 4, y + 7, {
    size: FONT.small,
    weight: "bold",
    color: COLORS.brand,
    font: activeFont,
  });

  drawWrappedText(
    doc,
    [ISSUER.companyName, ISSUER.companyEmail, ISSUER.companyWebsite, ISSUER.companyAddress]
      .filter(Boolean)
      .join("\n"),
    MARGIN_X + 4,
    y + 14,
    colW - 8,
    { size: FONT.small, color: COLORS.text, lineHeight: 4.8, font: activeFont }
  );

  drawWrappedText(
    doc,
    [
      invoice?.business?.name,
      invoice?.business?.slug,
      invoice?.business?.email,
      invoice?.business?.phone,
      invoice?.business?.address,
    ]
      .filter(Boolean)
      .join("\n") || "—",
    MARGIN_X + colW + colGap + 4,
    y + 14,
    colW - 8,
    { size: FONT.small, color: COLORS.text, lineHeight: 4.8, font: activeFont }
  );

  y += 44;

  // META CARDS
  const metaGap = 3;
  const metaW = (CONTENT_W - metaGap * 3) / 4;

  const statusLabel = safeStr(getStatusLabel(invoice?.status));
  const typeLabel = safeStr(getTypeLabel(invoice?.type));

  const meta = [
    ["Kesim Tarihi", safeDate(invoice?.issueDate, formatDate)],
    ["Vade Tarihi", safeDate(invoice?.dueDate, formatDate)],
    ["Durum", statusLabel],
    ["Tip", typeLabel],
  ];

  meta.forEach((item, i) => {
    const x = MARGIN_X + i * (metaW + metaGap);

    drawBox(doc, x, y, metaW, 18, {
      fill: COLORS.white,
      stroke: COLORS.border,
      radius: 2.5,
    });

    drawText(doc, item[0], x + 3, y + 5, {
      size: FONT.tiny,
      weight: "bold",
      color: COLORS.muted,
      font: activeFont,
    });

    drawText(doc, item[1], x + 3, y + 11, {
      size: FONT.small,
      weight: "bold",
      color: i === 2 ? getStatusColor(statusLabel) : COLORS.text,
      font: activeFont,
    });
  });

  y += 24;

  // TITLE
  drawText(doc, "FATURA ÖZETİ", MARGIN_X, y, {
    size: FONT.h1,
    weight: "bold",
    color: COLORS.text,
    font: activeFont,
  });

  y += 7;

  // TABLE
  y = drawTable(doc, MARGIN_X, y, CONTENT_W, buildRows(invoice), activeFont);
  y += 4;

  // NOTES + SUMMARY
  const summaryW = 56;
  const notesW = CONTENT_W - summaryW - 6;

  drawBox(doc, MARGIN_X, y, notesW, 42, {
    fill: COLORS.white,
    stroke: COLORS.border,
    radius: 3,
  });

  drawText(doc, "AÇIKLAMA / NOTLAR", MARGIN_X + 4, y + 7, {
    size: FONT.small,
    weight: "bold",
    color: COLORS.brand,
    font: activeFont,
  });

  drawWrappedText(
    doc,
    [
      safeStr(invoice?.description, "Bu belge sistem tarafından otomatik oluşturulmuştur."),
      invoice?.subscriptionPayment?.paidAt
        ? `Ödeme Tarihi: ${safeDate(invoice.subscriptionPayment.paidAt, formatDate)}`
        : "",
      invoice?.subscriptionPayment?.amount != null
        ? `Ödeme Tutarı: ${formatAmountForPdf(invoice.subscriptionPayment.amount, invoice?.currency || "TRY")}`
        : "",
      invoice?.createdAt
        ? `Oluşturulma: ${safeDate(invoice.createdAt, formatDateTime)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
    MARGIN_X + 4,
    y + 14,
    notesW - 8,
    { size: FONT.small, color: COLORS.text, lineHeight: 4.8, font: activeFont }
  );

  drawSummary(doc, MARGIN_X + notesW + 6, y, summaryW, invoice, activeFont);

  // FOOTER
  const footerY = PAGE_H - 22;
  setDrawColor(doc, COLORS.border);
  doc.line(MARGIN_X, footerY, PAGE_W - MARGIN_X, footerY);

  drawText(doc, "Destek", MARGIN_X, footerY + 5, {
    size: FONT.tiny,
    weight: "bold",
    color: COLORS.muted,
    font: activeFont,
  });

  drawText(
    doc,
    `${ISSUER.supportEmail} • ${ISSUER.companyWebsite}`,
    MARGIN_X,
    footerY + 10,
    {
      size: FONT.tiny,
      color: COLORS.muted,
      font: activeFont,
    }
  );

  drawText(
    doc,
    "Bu belge sistem tarafından otomatik oluşturulmuştur.",
    MARGIN_X,
    footerY + 15,
    {
      size: FONT.tiny,
      color: COLORS.muted,
      font: activeFont,
    }
  );

  doc.save(`invoice_${safeFileName(invoice)}.pdf`);
}