/** Render a Markdown-ish transcript to a downloadable PDF (jsPDF, lazy-loaded). */
export async function exportTranscriptPdf(opts: {
  markdown: string;
  filename?: string;
}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const write = (text: string, size: number, bold: boolean) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size + 6;
    }
  };

  for (const rawLine of opts.markdown.split("\n")) {
    const line = rawLine.replace(/\*\*/g, "").trimEnd();
    if (!line.trim()) {
      y += 8;
      continue;
    }
    if (line.startsWith("# ")) {
      write(line.slice(2), 18, true);
      y += 6;
    } else if (line.startsWith("_") && line.endsWith("_")) {
      write(line.slice(1, -1), 9, false);
    } else {
      write(line, 11, false);
    }
  }

  doc.save(opts.filename ?? "advocate-conversation.pdf");
}
