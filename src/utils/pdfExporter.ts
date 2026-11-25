import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Campaign, CampaignAnalysisResult, CampaignSummary } from '../types/campaign';
import { CATEGORY_LABELS, formatNumberId } from './evaluationEngine';

export function exportCampaignReportPdf(
  campaign: Campaign,
  summary: CampaignSummary,
  analysis: CampaignAnalysisResult
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const ensureSpace = (needed: number) => {
    if (y + needed > 276) {
      doc.addPage();
      y = 18;
    }
  };

  const addSectionTitle = (title: string) => {
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(49, 92, 245);
    doc.text(title, margin, y);
    y += 2;
    doc.setDrawColor(225, 229, 238);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const addParagraph = (text: string, fontSize = 9.5, color: [number, number, number] = [27, 27, 27]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    ensureSpace(lines.length * 4.5 + 3);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  };

  // Header Banner
  doc.setFillColor(27, 27, 27);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('HUMALYSIS.AI — LAPORAN EVALUASI KAMPANYE', margin, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(210, 216, 230);
  doc.text(
    `${campaign.name} | ${campaign.client} | Periode: ${campaign.period}`,
    margin,
    21
  );
  y = 38;

  // 1. Identitas Kampanye
  addSectionTitle('1. Identitas Kampanye');
  addParagraph(
    `Nama Kampanye: ${campaign.name}\nOrganisasi / Klien: ${campaign.client}\nPeriode Pelaksanaan: ${campaign.period}\nTarget Audiens: ${campaign.targetAudience}`
  );

  // 2. Tujuan Kampanye & Komunikasi
  addSectionTitle('2. Tujuan Kampanye & Komunikasi');
  addParagraph(
    `Tujuan Kampanye: ${campaign.campaignGoal}\nTujuan Komunikasi: ${campaign.communicationGoal}`
  );

  // 3. Ringkasan Pelaksanaan
  addSectionTitle('3. Ringkasan Pelaksanaan & Status KPI');
  addParagraph(
    `${analysis.headlineVerdict}. Rata-rata pencapaian seluruh indikator adalah ${formatNumberId(summary.overallAchievementPct)}% (${summary.achievedCount} dari ${summary.totalKpis} KPI tercapai).${campaign.customSummaryNote ? `\nCatatan Tim: ${campaign.customSummaryNote}` : ''}`
  );

  // 4-8. Tabel Data Output, Outtakes, Outcomes & Perbandingan KPI
  addSectionTitle('4. Perbandingan Data Output, Outtakes, dan Outcomes');
  const tableRows = summary.evaluatedKpis.map((kpi) => [
    CATEGORY_LABELS[kpi.category],
    kpi.name,
    `${formatNumberId(kpi.target)} ${kpi.unit}`,
    kpi.actual !== null ? `${formatNumberId(kpi.actual)} ${kpi.unit}` : 'Belum ada',
    kpi.percentage !== null ? `${formatNumberId(kpi.percentage)}%` : '-',
    kpi.status === 'tercapai'
      ? 'Tercapai'
      : kpi.status === 'belum_tercapai'
        ? 'Belum Tercapai'
        : 'Perlu Data',
    kpi.source,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Kategori', 'Indikator KPI', 'Target', 'Aktual', 'Capaian', 'Status', 'Sumber']],
    body: tableRows,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [27, 27, 27],
    },
    headStyles: {
      fillColor: [49, 92, 245],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [244, 245, 247],
    },
  });

  const lastTableY = (doc as unknown as { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY;
  y = (lastTableY ?? y + 30) + 8;

  // 9. Hasil Analisis Evaluasi
  addSectionTitle('5. Hasil Analisis Evaluasi (Fakta & Interpretasi)');
  analysis.dataFacts.forEach((fact) => addParagraph(`• Fakta: ${fact}`));
  analysis.analyticalInterpretations.forEach((interp) =>
    addParagraph(`• Interpretasi (${interp.title}): ${interp.detail}`)
  );

  // 10. Faktor Keberhasilan & Kekurangan
  addSectionTitle(
    analysis.branch === 'tercapai'
      ? '6. Faktor Keberhasilan & Taktik Efektif'
      : '6. Akar Masalah & Kekurangan Kampanye'
  );
  analysis.successFactorsOrRootCauses.forEach((item) =>
    addParagraph(`• ${item.title}: ${item.detail}`)
  );
  analysis.communicationWeaknessesOrBestTactics.forEach((item) =>
    addParagraph(`• ${item.title}: ${item.detail}`)
  );

  // 11. Rekomendasi Strategis
  addSectionTitle('7. Rekomendasi Strategis Kampanye Berikutnya');
  const actionsToPrint =
    campaign.strategicActions.length > 0
      ? campaign.strategicActions
      : analysis.recommendedActions;
  actionsToPrint.forEach((act, idx) =>
    addParagraph(
      `${idx + 1}. [${CATEGORY_LABELS[act.pillar as keyof typeof CATEGORY_LABELS] || 'Umum'} · Prioritas ${act.priority} · ${act.timeline}] ${act.title} — ${act.description}`
    )
  );

  // 12. Kesimpulan Evaluasi
  addSectionTitle('8. Kesimpulan Evaluasi');
  addParagraph(analysis.executiveConclusion);

  const safeSlug = campaign.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  doc.save(`laporan-evaluasi-${safeSlug || 'kampanye'}.pdf`);
}
