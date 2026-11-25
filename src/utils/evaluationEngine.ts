import {
  AnalysisPoint,
  Campaign,
  CampaignAnalysisResult,
  CampaignSummary,
  CategorySummary,
  EvaluatedKpi,
  KpiCategory,
  KpiIndicator,
  KpiStatus,
  StrategicAction,
  ValidationIssue,
  ValidationResult,
} from '../types/campaign';

export const CATEGORY_LABELS: Record<KpiCategory, string> = {
  output: 'Output',
  outtakes: 'Outtakes',
  outcomes: 'Outcomes',
};

export const CATEGORY_DESCRIPTIONS: Record<KpiCategory, string> = {
  output: 'Hasil langsung aktivitas komunikasi, publikasi media, dan distribusi konten.',
  outtakes: 'Respons audiens, jangkauan pemahaman pesan, interaksi, dan persepsi awal.',
  outcomes: 'Perubahan sikap, kepercayaan publik, partisipasi, dan perilaku nyata audiens.',
};

export function formatNumberId(value: number, maxDecimals = 1): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

export function evaluateKpi(kpi: KpiIndicator): EvaluatedKpi {
  if (
    kpi.actual === null ||
    Number.isNaN(kpi.actual) ||
    kpi.target <= 0 ||
    !kpi.name.trim() ||
    !kpi.unit.trim() ||
    !kpi.source.trim()
  ) {
    return {
      ...kpi,
      percentage: null,
      status: 'perlu_data',
      gapText: 'Menunggu kelengkapan data',
    };
  }

  const actual = kpi.actual;
  const target = kpi.target;

  let percentage = 0;
  let status: KpiStatus = 'belum_tercapai';
  let gapText = '';

  if (kpi.direction === 'lower_better') {
    if (actual <= 0) {
      percentage = 100;
    } else {
      percentage = Number(((target / actual) * 100).toFixed(1));
    }
    status = actual <= target ? 'tercapai' : 'belum_tercapai';
    const diff = target - actual;
    if (status === 'tercapai') {
      gapText =
        diff === 0
          ? 'Tepat pada batas target'
          : `Lebih efisien ${formatNumberId(diff)} ${kpi.unit} dari batas target`;
    } else {
      gapText = `Melebihi batas target sebesar ${formatNumberId(Math.abs(diff))} ${kpi.unit}`;
    }
  } else {
    percentage = Number(((actual / target) * 100).toFixed(1));
    status = actual >= target ? 'tercapai' : 'belum_tercapai';
    const diff = actual - target;
    if (status === 'tercapai') {
      gapText =
        diff === 0
          ? 'Memenuhi target 100%'
          : `Melampaui target sebesar +${formatNumberId(diff)} ${kpi.unit}`;
    } else {
      gapText = `Kurang ${formatNumberId(Math.abs(diff))} ${kpi.unit} dari target`;
    }
  }

  return {
    ...kpi,
    percentage,
    status,
    gapText,
  };
}

export function summarizeCategory(
  category: KpiCategory,
  items: EvaluatedKpi[]
): CategorySummary {
  const total = items.length;
  const achieved = items.filter((item) => item.status === 'tercapai').length;
  const notAchieved = items.filter((item) => item.status === 'belum_tercapai').length;
  const needsData = items.filter((item) => item.status === 'perlu_data').length;

  const validPercentages = items
    .map((item) => item.percentage)
    .filter((p): p is number => p !== null);

  const avgPercentage =
    validPercentages.length > 0
      ? Number(
          (
            validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length
          ).toFixed(1)
        )
      : 0;

  let status: KpiStatus = 'perlu_data';
  if (total === 0 || needsData > 0) {
    status = 'perlu_data';
  } else if (achieved === total) {
    status = 'tercapai';
  } else {
    status = 'belum_tercapai';
  }

  return {
    category,
    label: CATEGORY_LABELS[category],
    total,
    achieved,
    notAchieved,
    needsData,
    avgPercentage,
    status,
    items,
  };
}

export function summarizeCampaign(campaign: Campaign): CampaignSummary {
  const evaluatedKpis = campaign.kpis.map(evaluateKpi);
  const categories: Record<KpiCategory, CategorySummary> = {
    output: summarizeCategory(
      'output',
      evaluatedKpis.filter((k) => k.category === 'output')
    ),
    outtakes: summarizeCategory(
      'outtakes',
      evaluatedKpis.filter((k) => k.category === 'outtakes')
    ),
    outcomes: summarizeCategory(
      'outcomes',
      evaluatedKpis.filter((k) => k.category === 'outcomes')
    ),
  };

  const totalKpis = evaluatedKpis.length;
  const achievedCount = evaluatedKpis.filter((k) => k.status === 'tercapai').length;
  const notAchievedCount = evaluatedKpis.filter(
    (k) => k.status === 'belum_tercapai'
  ).length;
  const needsDataCount = evaluatedKpis.filter((k) => k.status === 'perlu_data').length;

  const validPercentages = evaluatedKpis
    .map((k) => k.percentage)
    .filter((p): p is number => p !== null);

  const overallAchievementPct =
    validPercentages.length > 0
      ? Number(
          (
            validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length
          ).toFixed(1)
        )
      : 0;

  const isAllTargetsMet =
    totalKpis > 0 && needsDataCount === 0 && achievedCount === totalKpis;
  const hasPartialSuccessOnly = achievedCount > 0 && !isAllTargetsMet;

  return {
    categories,
    totalKpis,
    achievedCount,
    notAchievedCount,
    needsDataCount,
    overallAchievementPct,
    isAllTargetsMet,
    hasPartialSuccessOnly,
    evaluatedKpis,
  };
}

export function validateCampaignData(campaign: Campaign): ValidationResult {
  const issues: ValidationIssue[] = [];
  const missingCategories: KpiCategory[] = [];

  if (!campaign.name.trim()) {
    issues.push({
      id: 'identity-name',
      severity: 'error',
      fieldLabel: 'Nama Kampanye',
      message: 'Nama kampanye belum diisi pada dokumen identitas kampanye.',
    });
  }
  if (!campaign.client.trim()) {
    issues.push({
      id: 'identity-client',
      severity: 'error',
      fieldLabel: 'Organisasi / Klien',
      message: 'Nama organisasi atau klien belum diisi.',
    });
  }
  if (!campaign.campaignGoal.trim()) {
    issues.push({
      id: 'identity-goal',
      severity: 'error',
      fieldLabel: 'Tujuan Kampanye',
      message: 'Tujuan kampanye belum ditentukan sebagai acuan evaluasi.',
    });
  }
  if (!campaign.communicationGoal.trim()) {
    issues.push({
      id: 'identity-comm-goal',
      severity: 'error',
      fieldLabel: 'Tujuan Komunikasi',
      message: 'Tujuan komunikasi belum diisi.',
    });
  }
  if (!campaign.targetAudience.trim()) {
    issues.push({
      id: 'identity-audience',
      severity: 'error',
      fieldLabel: 'Target Audiens',
      message: 'Target audiens kampanye belum dicantumkan.',
    });
  }
  if (!campaign.period.trim()) {
    issues.push({
      id: 'identity-period',
      severity: 'error',
      fieldLabel: 'Periode Pelaksanaan',
      message: 'Periode pelaksanaan kampanye belum diisi.',
    });
  }

  (['output', 'outtakes', 'outcomes'] as KpiCategory[]).forEach((cat) => {
    const items = campaign.kpis.filter((k) => k.category === cat);
    if (items.length === 0) {
      missingCategories.push(cat);
      issues.push({
        id: `missing-cat-${cat}`,
        severity: 'error',
        category: cat,
        fieldLabel: `Kategori ${CATEGORY_LABELS[cat]}`,
        message: `Belum ada indikator KPI pada kategori ${CATEGORY_LABELS[cat]}. Minimal 1 indikator diperlukan agar evaluasi mencakup Output, Outtakes, dan Outcomes.`,
      });
    }

    items.forEach((kpi) => {
      const label = kpi.name.trim() || `KPI ${CATEGORY_LABELS[cat]} tanpa nama`;
      if (!kpi.name.trim()) {
        issues.push({
          id: `kpi-name-${kpi.id}`,
          severity: 'error',
          category: cat,
          fieldLabel: label,
          message: `Nama indikator KPI pada kategori ${CATEGORY_LABELS[cat]} masih kosong.`,
        });
      }
      if (!kpi.target || kpi.target <= 0) {
        issues.push({
          id: `kpi-target-${kpi.id}`,
          severity: 'error',
          category: cat,
          fieldLabel: label,
          message: `Target KPI "${label}" harus berupa angka lebih dari 0.`,
        });
      }
      if (!kpi.unit.trim()) {
        issues.push({
          id: `kpi-unit-${kpi.id}`,
          severity: 'error',
          category: cat,
          fieldLabel: label,
          message: `Satuan pengukuran untuk "${label}" belum diisi.`,
        });
      }
      if (!kpi.source.trim()) {
        issues.push({
          id: `kpi-source-${kpi.id}`,
          severity: 'error',
          category: cat,
          fieldLabel: label,
          message: `Sumber data untuk "${label}" belum dicantumkan (misalnya Media Monitoring atau Survei Audiens).`,
        });
      }
      if (kpi.actual === null || Number.isNaN(kpi.actual) || kpi.actual < 0) {
        issues.push({
          id: `kpi-actual-${kpi.id}`,
          severity: 'error',
          category: cat,
          fieldLabel: label,
          message: `Hasil aktual untuk "${label}" belum dimasukkan atau bernilai tidak valid.`,
        });
      }
    });
  });

  const hasError = issues.some((issue) => issue.severity === 'error');
  return {
    isValid: !hasError,
    hasWarningsOnly: !hasError && issues.length > 0,
    issues,
    missingCategories,
  };
}

export function analyzeCampaign(campaign: Campaign): CampaignAnalysisResult {
  const summary = summarizeCampaign(campaign);
  const effectiveBranch: 'tercapai' | 'tidak_tercapai' =
    campaign.decisionOverride === 'tercapai'
      ? 'tercapai'
      : campaign.decisionOverride === 'belum_tercapai'
        ? 'tidak_tercapai'
        : summary.isAllTargetsMet
          ? 'tercapai'
          : 'tidak_tercapai';

  const achievedList = summary.evaluatedKpis.filter((k) => k.status === 'tercapai');
  const notAchievedList = summary.evaluatedKpis.filter(
    (k) => k.status === 'belum_tercapai'
  );
  const needsDataList = summary.evaluatedKpis.filter((k) => k.status === 'perlu_data');

  const dataFacts: string[] = [
    `Dari total ${summary.totalKpis} indikator KPI yang dievaluasi, sebanyak ${summary.achievedCount} indikator berstatus Tercapai, ${summary.notAchievedCount} indikator Belum Tercapai, dan ${summary.needsDataCount} indikator masih Perlu Data.`,
    `Rata-rata pencapaian KPI pada kategori Output adalah ${formatNumberId(summary.categories.output.avgPercentage)}% (${summary.categories.output.achieved}/${summary.categories.output.total} tercapai).`,
    `Rata-rata pencapaian KPI pada kategori Outtakes adalah ${formatNumberId(summary.categories.outtakes.avgPercentage)}% (${summary.categories.outtakes.achieved}/${summary.categories.outtakes.total} tercapai).`,
    `Rata-rata pencapaian KPI pada kategori Outcomes adalah ${formatNumberId(summary.categories.outcomes.avgPercentage)}% (${summary.categories.outcomes.achieved}/${summary.categories.outcomes.total} tercapai).`,
  ];

  const achievedHighlights: AnalysisPoint[] = achievedList.map((k) => ({
    title: `${k.name} (${CATEGORY_LABELS[k.category]})`,
    detail: `Mencapai ${formatNumberId(k.percentage ?? 0)}% terhadap target (${formatNumberId(k.actual ?? 0)} ${k.unit} dari target ${formatNumberId(k.target)} ${k.unit}).`,
    evidence: `Sumber data: ${k.source}${k.notes ? ` · Catatan: ${k.notes}` : ''}`,
  }));

  const unachievedGaps: AnalysisPoint[] = notAchievedList.map((k) => ({
    title: `${k.name} (${CATEGORY_LABELS[k.category]})`,
    detail: `Mencapai ${formatNumberId(k.percentage ?? 0)}% (${formatNumberId(k.actual ?? 0)} ${k.unit} vs target ${formatNumberId(k.target)} ${k.unit}). ${k.gapText}.`,
    evidence: `Sumber data: ${k.source}${k.notes ? ` · Catatan: ${k.notes}` : ''}`,
  }));

  const analyticalInterpretations: AnalysisPoint[] = [];
  const successFactorsOrRootCauses: AnalysisPoint[] = [];
  const communicationWeaknessesOrBestTactics: AnalysisPoint[] = [];
  const dataLimitations: string[] = [];
  const recommendedActions: StrategicAction[] = [];

  if (needsDataList.length > 0) {
    dataLimitations.push(
      `Terdapat ${needsDataList.length} indikator tanpa hasil aktual lengkap (${needsDataList.map((k) => k.name).join(', ')}). Evaluasi keseluruhan tidak dapat dianggap selesai sebelum seluruh data terisi.`
    );
  }

  const sparseNotesCount = summary.evaluatedKpis.filter(
    (k) => !k.notes || k.notes.trim().length < 12
  ).length;
  if (sparseNotesCount > 0) {
    dataLimitations.push(
      `${sparseNotesCount} indikator tidak memiliki catatan konteks pelaksanaan yang rinci. Interpretasi penyebab keberhasilan atau hambatan audiens tetap memerlukan verifikasi kualitatif tambahan (misalnya survei lanjutan atau wawancara audiens).`
    );
  }

  const outAvg = summary.categories.output.avgPercentage;
  const takeAvg = summary.categories.outtakes.avgPercentage;
  const outcomeAvg = summary.categories.outcomes.avgPercentage;

  if (outAvg >= 100 && takeAvg < 100) {
    analyticalInterpretations.push({
      title: 'Kesenjangan Konversi dari Output ke Outtakes',
      detail: `Dugaan analitis: Volume aktivitas komunikasi (Output ${formatNumberId(outAvg)}%) sudah memenuhi target, namun respons dan pemahaman audiens (Outtakes ${formatNumberId(takeAvg)}%) belum seimbang. Hal ini mengindikasikan pesan kampanye atau pemilihan kanal belum sepenuhnya relevan bagi target audiens (${campaign.targetAudience}).`,
    });
  } else if (takeAvg >= 100 && outcomeAvg < 100) {
    analyticalInterpretations.push({
      title: 'Kesenjangan Konversi dari Outtakes ke Outcomes',
      detail: `Dugaan analitis: Audiens sudah cukup memahami pesan (Outtakes ${formatNumberId(takeAvg)}%), tetapi belum seluruhnya berujung pada perubahan sikap atau perilaku (Outcomes ${formatNumberId(outcomeAvg)}%). Diperlukan mekanisme tindak lanjut, ajakan bertindak yang lebih spesifik, atau penguatan kepercayaan di tingkat lapangan.`,
    });
  } else if (outAvg >= 100 && takeAvg >= 100 && outcomeAvg >= 100) {
    analyticalInterpretations.push({
      title: 'Keselarasan Alur Output–Outtakes–Outcomes',
      detail: `Data menunjukkan konsistensi performa di ketiga lapis evaluasi (${formatNumberId(outAvg)}% -> ${formatNumberId(takeAvg)}% -> ${formatNumberId(outcomeAvg)}%), menandakan keselarasan antara distribusi pesan, pemahaman audiens, dan perubahan yang diharapkan.`,
    });
  } else if (outAvg < 100) {
    analyticalInterpretations.push({
      title: 'Hambatan Kapasitas Distribusi pada Tahap Output',
      detail: `Dugaan analitis: Pencapaian Output rata-rata berada di ${formatNumberId(outAvg)}%, yang berpotensi membatasi paparan pesan pada tahap Outtakes (${formatNumberId(takeAvg)}%) dan Outcomes (${formatNumberId(outcomeAvg)}%).`,
    });
  }

  if (effectiveBranch === 'tercapai') {
    const topKpis = [...achievedList]
      .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
      .slice(0, 3);

    topKpis.forEach((k) => {
      successFactorsOrRootCauses.push({
        title: `Kontributor Utama: ${k.name}`,
        detail: `Mencatat pencapaian ${formatNumberId(k.percentage ?? 0)}% berdasarkan data ${k.source}.`,
        evidence: k.notes || 'Konsistensi eksekusi sesuai target dokumen perencanaan.',
      });
    });

    const uniqueSources = Array.from(
      new Set(achievedList.map((k) => k.source.trim()).filter(Boolean))
    );
    communicationWeaknessesOrBestTactics.push({
      title: 'Taktik & Kanal Terukur Paling Efektif',
      detail: `Sumber data dengan capaian optimal meliputi: ${uniqueSources.join(', ')}. Pertahankan standar operasional pada kanal ini sebagai baseline kampanye berikutnya.`,
    });

    if (summary.hasPartialSuccessOnly) {
      communicationWeaknessesOrBestTactics.push({
        title: 'Catatan Kehati-hatian Evaluasi',
        detail: `Meskipun Anda memilih jalur evaluasi tercapai, secara objektif masih terdapat ${summary.notAchievedCount} indikator yang belum mencapai target. Pastikan indikator tersebut tetap ditindaklanjuti dalam rekomendasi.`,
      });
    }

    recommendedActions.push(
      {
        id: 'rec-maintain-output',
        pillar: 'output',
        title: 'Standardisasi Pola Distribusi Kanal Terbaik',
        description: `Dokumentasikan alur produksi dan jadwal publikasi yang mendorong capaian Output (${formatNumberId(outAvg)}%) sebagai SOP kampanye berikutnya.`,
        priority: 'Tinggi',
        timeline: 'Kampanye Berikutnya',
        completed: false,
      },
      {
        id: 'rec-scale-outtakes',
        pillar: 'outtakes',
        title: 'Replikasi Format Pesan dengan Retensi Tertinggi',
        description: `Perluas penggunaan format konten yang terbukti menjaga pemahaman pesan (${campaign.communicationGoal}) pada segmen ${campaign.targetAudience}.`,
        priority: 'Sedang',
        timeline: 'Bulan Depan',
        completed: false,
      },
      {
        id: 'rec-sustain-outcomes',
        pillar: 'outcomes',
        title: 'Pemantauan Keberlanjutan Perubahan Sikap & Perilaku',
        description: `Lakukan pengukuran pasca-kampanye 30–60 hari ke depan untuk memvalidasi apakah capaian Outcomes (${formatNumberId(outcomeAvg)}%) bertahan dalam jangka menengah.`,
        priority: 'Sedang',
        timeline: 'Kampanye Berikutnya',
        completed: false,
      }
    );
  } else {
    notAchievedList.forEach((k) => {
      successFactorsOrRootCauses.push({
        title: `Indikator Belum Tercapai: ${k.name}`,
        detail: `Capaian aktual ${formatNumberId(k.actual ?? 0)} ${k.unit} vs target ${formatNumberId(k.target)} ${k.unit} (${formatNumberId(k.percentage ?? 0)}%). ${k.gapText}.`,
        evidence: k.notes
          ? `Catatan pelaksana: ${k.notes}`
          : `Data berasal dari ${k.source}; belum ada catatan penyebab khusus sehingga diperlukan penelusuran kualitatif tambahan.`,
      });
    });

    if (achievedList.length > 0) {
      communicationWeaknessesOrBestTactics.push({
        title: 'Keberhasilan Parsial Tidak Sama dengan Keberhasilan Penuh',
        detail: `${achievedList.length} dari ${summary.totalKpis} KPI memang tercapai, tetapi ${notAchievedList.length} indikator lain masih di bawah target sehingga efektivitas keseluruhan belum tercapai sepenuhnya.`,
      });
    }

    if (summary.categories.output.notAchieved > 0) {
      communicationWeaknessesOrBestTactics.push({
        title: 'Kekurangan pada Eksekusi & Jangkauan Output',
        detail: `Terdapat ${summary.categories.output.notAchieved} KPI Output di bawah target. Perlu peninjauan ulang frekuensi rilis, kerja sama media, atau kapasitas produksi materi kampanye.`,
      });
    }
    if (summary.categories.outtakes.notAchieved > 0) {
      communicationWeaknessesOrBestTactics.push({
        title: 'Kekurangan pada Resonansi Pesan (Outtakes)',
        detail: `Terdapat ${summary.categories.outtakes.notAchieved} KPI Outtakes di bawah target. Pesan kunci kemungkinan belum cukup mudah diingat atau kanal penyampaian kurang sesuai dengan kebiasaan ${campaign.targetAudience}.`,
      });
    }
    if (summary.categories.outcomes.notAchieved > 0) {
      communicationWeaknessesOrBestTactics.push({
        title: 'Kekurangan pada Dampak Nyata (Outcomes)',
        detail: `Terdapat ${summary.categories.outcomes.notAchieved} KPI Outcomes di bawah target. Kampanye perlu memperkuat call-to-action, kolaborasi komunitas/pemangku kepentingan, dan pengurangan hambatan partisipasi audiens.`,
      });
    }

    if (summary.categories.output.notAchieved > 0) {
      recommendedActions.push({
        id: 'rec-fix-output',
        pillar: 'output',
        title: 'Perbaiki Jadwal Distribusi & Diversifikasi Media',
        description: `Tingkatkan frekuensi dan distribusi materi untuk mengejar celah pada KPI Output (${summary.categories.output.items.filter((i) => i.status === 'belum_tercapai').map((i) => i.name).join(', ')}).`,
        priority: 'Tinggi',
        timeline: 'Segera',
        completed: false,
      });
    }
    if (summary.categories.outtakes.notAchieved > 0) {
      recommendedActions.push({
        id: 'rec-fix-outtakes',
        pillar: 'outtakes',
        title: 'Uji Ulang Kejelasan Pesan & Format Interaktif',
        description: `Lakukan uji pesan singkat (message testing) bersama perwakilan ${campaign.targetAudience} agar tingkat pemahaman dan interaksi meningkat pada siklus berikutnya.`,
        priority: 'Tinggi',
        timeline: 'Bulan Depan',
        completed: false,
      });
    }
    if (summary.categories.outcomes.notAchieved > 0) {
      recommendedActions.push({
        id: 'rec-fix-outcomes',
        pillar: 'outcomes',
        title: 'Perkuat Aktivasi Lapangan & Kemudahan Partisipasi Audiens',
        description: `Sederhanakan langkah partisipasi audiens dan libatkan tokoh komunitas atau mitra kredibel untuk mempercepat perubahan sikap dan perilaku.`,
        priority: 'Tinggi',
        timeline: 'Kampanye Berikutnya',
        completed: false,
      });
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push({
        id: 'rec-complete-data',
        pillar: 'umum',
        title: 'Lengkapi Data Evaluasi yang Masih Kosong',
        description:
          'Pastikan seluruh indikator Output, Outtakes, dan Outcomes memiliki sumber data terverifikasi sebelum menyimpulkan hasil akhir.',
        priority: 'Tinggi',
        timeline: 'Segera',
        completed: false,
      });
    }
  }

  const headlineVerdict = summary.isAllTargetsMet
    ? `Seluruh Target KPI Tercapai (${summary.achievedCount}/${summary.totalKpis} Indikator)`
    : summary.achievedCount > 0
      ? `Target Kampanye Belum Tercapai Penuh (${summary.achievedCount}/${summary.totalKpis} KPI Tercapai)`
      : `Target Kampanye Belum Tercapai (${summary.achievedCount}/${summary.totalKpis} KPI Tercapai)`;

  const executiveConclusion = summary.isAllTargetsMet
    ? `Kampanye "${campaign.name}" untuk ${campaign.client} pada periode ${campaign.period} berhasil memenuhi seluruh ${summary.totalKpis} indikator KPI dengan rata-rata capaian ${formatNumberId(summary.overallAchievementPct)}%. Strategi komunikasi dinilai efektif dari tahap distribusi Output hingga perubahan Outcomes.`
    : `Kampanye "${campaign.name}" untuk ${campaign.client} pada periode ${campaign.period} mencatat ${summary.achievedCount} dari ${summary.totalKpis} indikator KPI tercapai (rata-rata ${formatNumberId(summary.overallAchievementPct)}%). Karena masih terdapat ${summary.notAchievedCount} indikator di bawah target${summary.needsDataCount > 0 ? ` dan ${summary.needsDataCount} indikator tanpa data lengkap` : ''}, keberhasilan kampanye dinyatakan belum penuh dan memerlukan perbaikan terarah pada kampanye berikutnya.`;

  return {
    branch: effectiveBranch,
    headlineVerdict,
    dataFacts,
    achievedHighlights,
    unachievedGaps,
    analyticalInterpretations,
    successFactorsOrRootCauses,
    communicationWeaknessesOrBestTactics,
    dataLimitations,
    recommendedActions,
    executiveConclusion,
  };
}
