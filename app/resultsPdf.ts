import { jsPDF } from "jspdf";

export type ResultsPdfData = {
  koalaImage?: Uint8Array;
  generatedAt: string | null;
  summary: string;
  skills: string[];
  roles: Array<{
    name: string;
    fit: string;
    searchTerms: string[];
  }>;
  agencies: Array<{
    name: string;
    portfolio: string;
    reason: string;
    pathway: string;
    questions: string[];
    url: string;
  }>;
  nextSteps: string[];
  recruiterMessage: string;
  limitations: string[];
};

const INK = [20, 43, 45] as const;
const TEAL = [0, 107, 104] as const;
const MUTED = [82, 99, 101] as const;
const PALE = [235, 246, 242] as const;
const LINE = [190, 205, 201] as const;

function safeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function createResultsPdf(data: ResultsPdfData) {
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 17;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 22;
  let y = 18;

  const lineHeight = (fontSize: number) => fontSize * 0.3528 * 1.32;

  const addPageHeader = () => {
    doc.setFillColor(...TEAL);
    doc.rect(0, 0, pageWidth, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...TEAL);
    doc.text("IM2026 SERVICE SWITCHBOARD", margin, 13);
    y = 21;
  };

  const ensureSpace = (height: number) => {
    if (y + height <= bottomLimit) return;
    doc.addPage();
    addPageHeader();
  };

  const writeText = (
    value: string,
    options: {
      fontSize?: number;
      style?: "normal" | "bold" | "italic";
      colour?: readonly [number, number, number];
      width?: number;
      indent?: number;
      gapAfter?: number;
    } = {},
  ) => {
    const fontSize = options.fontSize ?? 10;
    const width = options.width ?? contentWidth;
    const indent = options.indent ?? 0;
    doc.setFont("helvetica", options.style ?? "normal");
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(safeText(value), width) as string[];
    const height = Math.max(lineHeight(fontSize), lines.length * lineHeight(fontSize));
    ensureSpace(height + (options.gapAfter ?? 2));
    doc.setTextColor(...(options.colour ?? INK));
    doc.text(lines, margin + indent, y, { lineHeightFactor: 1.32 });
    y += height + (options.gapAfter ?? 2);
  };

  const addSectionHeading = (title: string) => {
    ensureSpace(18);
    y += 3;
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.7);
    doc.line(margin, y, margin + 12, y);
    y += 7;
    writeText(title, { fontSize: 15, style: "bold", colour: TEAL, gapAfter: 5 });
  };

  const addBulletList = (items: string[]) => {
    items.forEach((item) => {
      const clean = safeText(item);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const lines = doc.splitTextToSize(clean, contentWidth - 8) as string[];
      const height = Math.max(lineHeight(9.5), lines.length * lineHeight(9.5));
      ensureSpace(height + 2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...TEAL);
      doc.text("-", margin + 1, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(lines, margin + 7, y, { lineHeightFactor: 1.32 });
      y += height + 2;
    });
  };

  const addResultItem = (title: string, body: string, detail?: string) => {
    ensureSpace(20);
    writeText(title, { fontSize: 11, style: "bold", colour: INK, gapAfter: 1.5 });
    writeText(body, { fontSize: 9.5, colour: MUTED, gapAfter: detail ? 1.5 : 5 });
    if (detail) {
      writeText(detail, { fontSize: 8.5, style: "bold", colour: TEAL, gapAfter: 5 });
    }
  };

  doc.setProperties({
    title: "Service Switchboard results",
    subject: "AI-generated Australian Public Service career pathways",
    author: "IM2026 Service Switchboard",
    creator: "switchboard.bitpixi.com",
  });

  doc.setFillColor(...INK);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(154, 224, 209);
  doc.text("IM2026 SERVICE SWITCHBOARD", margin, 16);
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("More than one path", margin, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 235, 232);
  const generatedLabel = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString("en-AU")
    : new Date().toLocaleDateString("en-AU");
  doc.text(`AI-generated on ${generatedLabel}`, margin, 38);

  if (data.koalaImage) {
    doc.addImage(data.koalaImage, "PNG", pageWidth - margin - 36, 5.5, 36, 36, undefined, "FAST");
  }
  y = 56;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(safeText(data.summary), contentWidth - 14) as string[];
  const summaryHeight = Math.max(28, summaryLines.length * lineHeight(11) + 18);
  ensureSpace(summaryHeight + 5);
  doc.setFillColor(...PALE);
  doc.roundedRect(margin, y, contentWidth, summaryHeight, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text("YOUR CAREER SUMMARY", margin + 7, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(summaryLines, margin + 7, y + 17, { lineHeightFactor: 1.32 });
  y += summaryHeight + 6;

  if (data.skills.length > 0) {
    writeText(`Transferable skills: ${data.skills.join(", ")}`, {
      fontSize: 9.5,
      style: "bold",
      colour: TEAL,
      gapAfter: 4,
    });
  }

  addSectionHeading("Role families to search");
  data.roles.forEach((role) => {
    const terms = role.searchTerms.length
      ? `Search terms: ${role.searchTerms.join(", ")}`
      : undefined;
    addResultItem(role.name, role.fit, terms);
  });

  addSectionHeading("Organisations worth investigating");
  data.agencies.forEach((agency) => {
    const detail = [
      `${agency.pathway} | ${agency.portfolio} portfolio`,
      `Official page: ${agency.url}`,
    ].join("\n");
    addResultItem(agency.name, agency.reason, detail);
    if (agency.questions.length > 0) {
      writeText(`Questions to check: ${agency.questions.join("; ")}`, {
        fontSize: 8.5,
        style: "italic",
        colour: MUTED,
        indent: 4,
        width: contentWidth - 4,
        gapAfter: 4,
      });
    }
  });

  addSectionHeading("Practical next steps");
  addBulletList(data.nextSteps);

  addSectionHeading("A question for recruitment");
  writeText(data.recruiterMessage, {
    fontSize: 10.5,
    style: "italic",
    colour: INK,
    gapAfter: 5,
  });

  if (data.limitations.length > 0) {
    addSectionHeading("What this map cannot tell you");
    addBulletList(data.limitations);
  }

  const totalPages = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("switchboard.bitpixi.com | Check current official advice", margin, pageHeight - 9);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 9, {
      align: "right",
    });
  }

  const filename = `service-switchboard-results-${new Date().toISOString().slice(0, 10)}.pdf`;
  return { blob: doc.output("blob"), filename };
}
