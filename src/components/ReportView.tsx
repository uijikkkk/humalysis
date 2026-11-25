import { BookmarkCheck, Download, Printer } from 'lucide-react';
import { Campaign, KpiCategory, UserProfile } from '../types/campaign';
import {
  analyzeCampaign,
  CATEGORY_LABELS,
  formatNumberId,
  summarizeCampaign,
} from '../utils/evaluationEngine';
import { exportCampaignReportPdf } from '../utils/pdfExporter';

interface ReportViewProps {
  campaign: Campaign;
  profile: UserProfile;
  onSaveReportToHistory: () => void;
  onBack: () => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, description?: string) => void;
}

export function ReportView({
  campaign,
  profile,
  onSaveReportToHistory,
  onBack,
  onNotify,
}: ReportViewProps) {
  const summary = summarizeCampaign(campaign);
  const analysis = analyzeCampaign(campaign);
  const recommendations =
    campaign.strategicActions.length > 0
      ? campaign.strategicActions
      : analysis.recommendedActions;

  const handleDownloadPdf = () => {
    try {
      exportCampaignReportPdf(campaign, summary, analysis);
      onNotify(
        'success',
        'Laporan PDF berhasil diunduh',
        `Berkas evaluasi untuk ${campaign.name} telah disimpan ke perangkat Anda.`
      );
    } catch {
      onNotify(
        'error',
        'Gagal membuat berkas PDF',
        'Gunakan tombol Cetak untuk menyimpan melalui dialog print browser.'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="no-print space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Evaluasi Kampanye · Dokumen Akhir</span>
          <span className="font-mono">Langkah 7 dari 7</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div key={step} className="h-1.5 rounded-full bg-[#315CF5]" />
          ))}
        </div>
      </div>

      {/* Action Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B]">
            Laporan Evaluasi Kampanye
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Pratinjau 12 bagian laporan evaluasi siap simpan dan unduh dalam format PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSaveReportToHistory}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#1B1B1B] hover:bg-slate-50 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <BookmarkCheck className="w-4 h-4 text-[#218653]" />
            <span>Simpan Laporan</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#1B1B1B] hover:bg-slate-50 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#315CF5] text-white text-xs font-semibold hover:bg-[#274cd1] inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Printable 12-Section Document */}
      <article className="print-area bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Document Cover Header */}
        <header className="bg-[#1B1B1B] text-white p-6 sm:p-8 space-y-2">
          <div className="flex items-center justify-between gap-4 text-xs text-slate-300">
            <span className="font-display font-bold tracking-wide text-white">
              HUMALYSIS.AI
            </span>
            <span className="font-mono">
              {new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold pt-2 leading-tight">
            {campaign.name}
          </h2>
          <p className="text-sm text-slate-300">
            Laporan Evaluasi Efektivitas Kampanye Hubungan Masyarakat · {campaign.client}
          </p>
        </header>

        <div className="p-6 sm:p-8 space-y-7 text-sm text-[#1B1B1B]">
          {/* 1. Identitas Kampanye */}
          <section className="space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              01. Identitas Kampanye
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F4F5F7] rounded-xl p-4 text-xs">
              <div>
                <p className="text-slate-500">Nama Kampanye</p>
                <p className="font-semibold mt-0.5">{campaign.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Organisasi / Klien</p>
                <p className="font-semibold mt-0.5">{campaign.client}</p>
              </div>
              <div>
                <p className="text-slate-500">Periode Pelaksanaan</p>
                <p className="font-semibold mt-0.5">{campaign.period}</p>
              </div>
              <div>
                <p className="text-slate-500">Target Audiens</p>
                <p className="font-semibold mt-0.5">{campaign.targetAudience}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-500">Penyusun Evaluasi</p>
                <p className="font-semibold mt-0.5">
                  {profile.name} ({profile.role} · {profile.organization})
                </p>
              </div>
            </div>
          </section>

          {/* 2. Tujuan Kampanye */}
          <section className="space-y-2">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              02. Tujuan Kampanye &amp; Tujuan Komunikasi
            </h3>
            <p className="text-slate-700 leading-relaxed">
              <strong className="text-[#1B1B1B]">Tujuan Kampanye:</strong>{' '}
              {campaign.campaignGoal}
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong className="text-[#1B1B1B]">Tujuan Komunikasi:</strong>{' '}
              {campaign.communicationGoal}
            </p>
          </section>

          {/* 3. Ringkasan Pelaksanaan */}
          <section className="space-y-2">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              03. Ringkasan Pelaksanaan
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {campaign.customSummaryNote ||
                `Pelaksanaan kampanye mencakup ${summary.totalKpis} indikator KPI di tiga pilar evaluasi (Output, Outtakes, dan Outcomes) selama periode ${campaign.period}.`}
            </p>
          </section>

          {/* 4, 5, 6. Data Output, Outtakes, Outcomes */}
          <section className="space-y-3">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              04–06. Ringkasan Data Output, Outtakes, dan Outcomes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['output', 'outtakes', 'outcomes'] as KpiCategory[]).map((cat, idx) => {
                const catSum = summary.categories[cat];
                return (
                  <div
                    key={cat}
                    className="border border-slate-200 rounded-xl p-4 space-y-2"
                  >
                    <p className="text-xs font-bold text-[#1B1B1B]">
                      0{idx + 4}. Data {CATEGORY_LABELS[cat]}
                    </p>
                    <p className="font-mono text-xl font-bold text-[#1B1B1B] tabular-nums">
                      {formatNumberId(catSum.avgPercentage)}%
                    </p>
                    <p className="text-xs text-slate-600 font-mono tabular-nums">
                      {catSum.achieved} dari {catSum.total} indikator tercapai
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7 & 8. Perbandingan Target vs Aktual & Persentase Pencapaian */}
          <section className="space-y-3">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              07–08. Perbandingan Target &amp; Aktual serta Persentase Pencapaian KPI
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F5F7] border-b border-slate-200 font-semibold text-slate-600">
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Nama KPI</th>
                    <th className="p-3 text-right">Target</th>
                    <th className="p-3 text-right">Aktual</th>
                    <th className="p-3 text-right">Capaian</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.evaluatedKpis.map((kpi) => (
                    <tr key={kpi.id}>
                      <td className="p-3 text-slate-600">
                        {CATEGORY_LABELS[kpi.category]}
                      </td>
                      <td className="p-3 font-medium text-[#1B1B1B]">
                        {kpi.name}
                        <span className="block text-[11px] text-slate-400">
                          {kpi.source}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums">
                        {formatNumberId(kpi.target)} {kpi.unit}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums font-semibold">
                        {kpi.actual !== null
                          ? `${formatNumberId(kpi.actual)} ${kpi.unit}`
                          : '—'}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums font-semibold">
                        {kpi.percentage !== null
                          ? `${formatNumberId(kpi.percentage)}%`
                          : '—'}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        <span
                          className={
                            kpi.status === 'tercapai'
                              ? 'text-[#218653]'
                              : kpi.status === 'belum_tercapai'
                                ? 'text-[#D94B4B]'
                                : 'text-[#9a6b10]'
                          }
                        >
                          {kpi.status === 'tercapai'
                            ? 'Tercapai'
                            : kpi.status === 'belum_tercapai'
                              ? 'Belum Tercapai'
                              : 'Perlu Data'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 9. Hasil Analisis */}
          <section className="space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              09. Hasil Analisis Evaluasi
            </h3>
            <p className="font-semibold text-[#1B1B1B]">{analysis.headlineVerdict}</p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {analysis.dataFacts.map((fact, idx) => (
                <li key={idx}>• {fact}</li>
              ))}
            </ul>
            {analysis.analyticalInterpretations.map((interp) => (
              <div key={interp.title} className="rounded-xl bg-[#F4F5F7] p-3.5 text-xs">
                <p className="font-semibold text-[#1B1B1B]">{interp.title}</p>
                <p className="text-slate-700 mt-1 leading-relaxed">{interp.detail}</p>
              </div>
            ))}
          </section>

          {/* 10. Faktor Keberhasilan dan Kekurangan */}
          <section className="space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              10. Faktor Keberhasilan &amp; Kekurangan Kampanye
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="font-bold text-[#1B1B1B]">
                  {analysis.branch === 'tercapai'
                    ? 'Faktor Keberhasilan'
                    : 'Indikator & Akar Permasalahan'}
                </p>
                {analysis.successFactorsOrRootCauses.map((p) => (
                  <p key={p.title} className="text-slate-700 leading-relaxed">
                    <strong className="text-[#1B1B1B]">{p.title}:</strong> {p.detail}
                  </p>
                ))}
              </div>
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="font-bold text-[#1B1B1B]">
                  {analysis.branch === 'tercapai'
                    ? 'Taktik Komunikasi Efektif'
                    : 'Kekurangan Strategi Komunikasi'}
                </p>
                {analysis.communicationWeaknessesOrBestTactics.map((p) => (
                  <p key={p.title} className="text-slate-700 leading-relaxed">
                    <strong className="text-[#1B1B1B]">{p.title}:</strong> {p.detail}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* 11. Rekomendasi Strategis */}
          <section className="space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              11. Rekomendasi Strategis Kampanye Berikutnya
            </h3>
            <ol className="space-y-2 text-xs text-slate-700">
              {recommendations.map((rec, idx) => (
                <li
                  key={rec.id}
                  className="p-3 rounded-xl bg-[#F4F5F7] flex flex-col gap-0.5"
                >
                  <span className="font-bold text-[#1B1B1B]">
                    {idx + 1}. {rec.title} ({rec.priority} · {rec.timeline})
                  </span>
                  <span className="leading-relaxed">{rec.description}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 12. Kesimpulan Evaluasi */}
          <section className="space-y-2 pt-2 border-t border-slate-200">
            <h3 className="font-display text-base font-bold text-[#315CF5]">
              12. Kesimpulan Evaluasi
            </h3>
            <p className="text-sm text-[#1B1B1B] leading-relaxed font-medium">
              {analysis.executiveConclusion}
            </p>
          </section>
        </div>
      </article>

      {/* Bottom Action */}
      <div className="no-print flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-slate-50"
        >
          Kembali ke Rekomendasi
        </button>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onSaveReportToHistory}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#1B1B1B]/90 inline-flex items-center justify-center gap-2"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Simpan ke Riwayat Laporan</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold hover:bg-[#274cd1] inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
