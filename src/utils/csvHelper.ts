import { KpiCategory, KpiDirection, KpiIndicator } from '../types/campaign';

export function downloadKpiCsvTemplate(): void {
  const headers = [
    'Kategori (output/outtakes/outcomes)',
    'Nama KPI',
    'Target',
    'Aktual',
    'Satuan',
    'Arah (higher_better/lower_better)',
    'Sumber Data',
    'Keterangan',
  ];
  const sampleRows = [
    [
      'output',
      'Jumlah Publikasi Media Massa',
      '25',
      '28',
      'berita',
      'higher_better',
      'Media Monitoring',
      'Liputan media lokal dan nasional',
    ],
    [
      'outtakes',
      'Tingkat Pemahaman Pesan Utama',
      '75',
      '72',
      '%',
      'higher_better',
      'Survei Audiens',
      'Survei pasca-kampanye n=250',
    ],
    [
      'outcomes',
      'Jumlah Keluhan Layanan Publik',
      '20',
      '14',
      'keluhan',
      'lower_better',
      'Pusat Pengaduan Resmi',
      'Semakin rendah semakin baik',
    ],
  ];

  const csvContent =
    '\uFEFF' +
    [headers, ...sampleRows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'template_kpi_humalysis.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeCategory(raw: string): KpiCategory {
  const val = raw.toLowerCase().trim();
  if (val.includes('outtake')) return 'outtakes';
  if (val.includes('outcome')) return 'outcomes';
  return 'output';
}

function normalizeDirection(raw: string): KpiDirection {
  const val = raw.toLowerCase().trim();
  if (
    val.includes('lower') ||
    val.includes('rendah') ||
    val.includes('turun') ||
    val.includes('min')
  ) {
    return 'lower_better';
  }
  return 'higher_better';
}

export function parseKpiCsv(text: string): {
  kpis: KpiIndicator[];
  skippedRows: number;
} {
  const cleaned = text.replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    return { kpis: [], skippedRows: 0 };
  }

  const lines = cleaned.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { kpis: [], skippedRows: 0 };
  }

  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';

  const firstCells = splitCsvLine(firstLine, delimiter).map((c) => c.toLowerCase());
  const hasHeader =
    firstCells.some(
      (c) =>
        c.includes('kategori') ||
        c.includes('nama') ||
        c.includes('kpi') ||
        c.includes('target')
    );

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const parsed: KpiIndicator[] = [];
  let skippedRows = 0;

  dataLines.forEach((line, idx) => {
    const cols = splitCsvLine(line, delimiter);
    if (cols.length < 3) {
      skippedRows++;
      return;
    }

    const category = normalizeCategory(cols[0] || 'output');
    const name = (cols[1] || '').trim();
    const targetNum = Number((cols[2] || '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
    const actualRaw = (cols[3] || '').trim();
    const actualNum =
      actualRaw === ''
        ? null
        : Number(actualRaw.replace(/[^0-9.,-]/g, '').replace(',', '.'));
    const unit = (cols[4] || 'poin').trim();
    const direction = normalizeDirection(cols[5] || 'higher_better');
    const source = (cols[6] || 'Impor CSV').trim();
    const notes = (cols[7] || '').trim();

    if (!name || Number.isNaN(targetNum) || targetNum <= 0) {
      skippedRows++;
      return;
    }

    parsed.push({
      id: `csv-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      category,
      name,
      target: targetNum,
      actual: actualNum !== null && !Number.isNaN(actualNum) ? actualNum : null,
      unit,
      direction,
      source,
      notes,
    });
  });

  return { kpis: parsed, skippedRows };
}
