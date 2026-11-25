import { AlertCircle, Check } from 'lucide-react';
import { Campaign, KpiCategory } from '../types/campaign';
import {
  CATEGORY_LABELS,
  formatNumberId,
  summarizeCampaign,
} from '../utils/evaluationEngine';

interface ComparisonViewProps {
  campaign: Campaign;
  onSelectDecision: (decision: 'tercapai' | 'belum_tercapai') => void;
  onBack: () => void;
  onContinueToAnalysis: () => void;
}

export function ComparisonView({
  campaign,
  onSelectDecision,
  onBack,
  onContinueToAnalysis,
}: ComparisonViewProps) {
  const summary = summarizeCampaign(campaign);

  const recommendedDecision: 'tercapai' | 'belum_tercapai' = summary.isAllTargetsMet
    ? 'tercapai'
    : 'belum_tercapai';

  const currentDecision = campaign.decisionOverride ?? recommendedDecision;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header matching Desain A */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Evaluasi Kampanye</span>
          <span className="font-mono">Langkah 4 dari 7</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full ${
                step <= 4 ? 'bg-[#315CF5]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title & Subtitle matching Desain A */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B] leading-tight">
          Bandingkan data aktual dengan target KPI
        </h1>
        <p className="text-sm text-slate-600 mt-1.5">
          Hasil output, outtakes, dan outcomes dicocokkan dengan target di dokumen
          tujuan kampanye.
        </p>
      </div>

      {/* Three Category Summary Cards matching Desain A */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['output', 'outtakes', 'outcomes'] as KpiCategory[]).map((cat) => {
          const catSum = summary.categories[cat];
          const statusLabel =
            catSum.status === 'tercapai'
              ? 'Tercapai'
              : catSum.status === 'belum_tercapai'
                ? 'Belum'
                : 'Perlu Data';
          const statusClass =
            catSum.status === 'tercapai'
              ? 'text-[#218653] bg-[#218653]/10'
              : catSum.status === 'belum_tercapai'
                ? 'text-[#D94B4B] bg-[#D94B4B]/10'
                : 'text-[#9a6b10] bg-[#E5A72E]/15';
          const barClass =
            catSum.status === 'tercapai'
              ? 'bg-[#218653]'
              : catSum.status === 'belum_tercapai'
                ? 'bg-[#D94B4B]'
                : 'bg-[#E5A72E]';

          return (
            <div
              key={cat}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-[#1B1B1B]">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-[#F4F5F7] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barClass}`}
                  style={{ width: `${Math.min(100, catSum.avgPercentage)}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 font-mono tabular-nums">
                Target {catSum.total} KPI · Aktual {catSum.achieved} tercapai (
                {formatNumberId(catSum.avgPercentage)}%)
              </p>
            </div>
          );
        })}
      </section>

      {/* Detailed Comparison Chart & Table */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-[#1B1B1B]">
              Grafik &amp; Rincian Pencapaian per Indikator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Garis putus-putus menandakan batas target 100%.
            </p>
          </div>
          <span className="font-mono text-sm font-bold text-[#1B1B1B] tabular-nums">
            Total: {summary.achievedCount} / {summary.totalKpis} Tercapai
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-3.5 relative pt-1">
          {summary.evaluatedKpis.map((kpi) => {
            const pct = kpi.percentage ?? 0;
            const widthPct = Math.min(100, (pct / 130) * 100);
            const targetLinePct = (100 / 130) * 100;
            const barColor =
              kpi.status === 'tercapai'
                ? 'bg-[#218653]'
                : kpi.status === 'belum_tercapai'
                  ? 'bg-[#D94B4B]'
                  : 'bg-[#E5A72E]';

            return (
              <div key={kpi.id} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-[#1B1B1B] truncate">
                    {kpi.name}{' '}
                    <span className="text-slate-400">
                      ({CATEGORY_LABELS[kpi.category]})
                    </span>
                  </span>
                  <span className="font-mono font-semibold text-[#1B1B1B] tabular-nums shrink-0">
                    {kpi.percentage !== null ? `${formatNumberId(pct)}%` : 'Perlu Data'}
                  </span>
                </div>
                <div className="relative h-3 w-full rounded-full bg-[#F4F5F7] overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 w-px border-l border-dashed border-[#1B1B1B]/40 z-10"
                    style={{ left: `${targetLinePct}%` }}
                  />
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Structured Comparison Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-3">Indikator</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Target</th>
                <th className="py-2.5 px-3 text-right">Aktual</th>
                <th className="py-2.5 px-3 text-right">Capaian</th>
                <th className="py-2.5 pl-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {summary.evaluatedKpis.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-[#F4F5F7]/60">
                  <td className="py-3 pr-3 font-medium text-[#1B1B1B]">
                    <div>{kpi.name}</div>
                    <div className="text-[11px] text-slate-500">{kpi.source}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {CATEGORY_LABELS[kpi.category]}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {formatNumberId(kpi.target)} {kpi.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-[#1B1B1B]">
                    {kpi.actual !== null
                      ? `${formatNumberId(kpi.actual)} ${kpi.unit}`
                      : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                    {kpi.percentage !== null
                      ? `${formatNumberId(kpi.percentage)}%`
                      : '—'}
                  </td>
                  <td className="py-3 pl-3 text-right whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-semibold ${
                        kpi.status === 'tercapai'
                          ? 'text-[#218653] bg-[#218653]/10'
                          : kpi.status === 'belum_tercapai'
                            ? 'text-[#D94B4B] bg-[#D94B4B]/10'
                            : 'text-[#9a6b10] bg-[#E5A72E]/15'
                      }`}
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

      {/* Decision Gate matching Desain A */}
      <section className="rounded-2xl border-2 border-dashed border-[#315CF5] bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-[#1B1B1B]">
              Apakah target KPI tercapai?
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Rekomendasi sistem berdasarkan data:{' '}
              <strong className="text-[#1B1B1B]">
                {summary.isAllTargetsMet
                  ? 'Ya (Seluruh KPI tercapai)'
                  : `Tidak (${summary.achievedCount} dari ${summary.totalKpis} KPI tercapai)`}
              </strong>
            </p>
          </div>
        </div>

        {summary.hasPartialSuccessOnly && (
          <div className="rounded-xl bg-[#E5A72E]/10 border border-[#E5A72E]/30 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-[#1B1B1B]">
            <AlertCircle className="w-4 h-4 text-[#9a6b10] shrink-0 mt-0.5" />
            <span>
              Sebagian KPI sudah tercapai, namun masih ada {summary.notAchievedCount}{' '}
              indikator yang belum memenuhi target. Sesuai prinsip evaluasi objektif,
              kampanye belum dapat dikategorikan berhasil penuh.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectDecision('tercapai')}
            className={`min-h-[48px] px-4 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              currentDecision === 'tercapai'
                ? 'border-[#218653] bg-[#218653]/10 text-[#218653]'
                : 'border-slate-200 text-[#1B1B1B] hover:bg-[#F4F5F7]'
            }`}
          >
            {currentDecision === 'tercapai' && <Check className="w-4 h-4" />}
            <span>Ya</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectDecision('belum_tercapai')}
            className={`min-h-[48px] px-4 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              currentDecision === 'belum_tercapai'
                ? 'border-[#D94B4B] bg-[#D94B4B]/10 text-[#D94B4B]'
                : 'border-slate-200 text-[#1B1B1B] hover:bg-[#F4F5F7]'
            }`}
          >
            {currentDecision === 'belum_tercapai' && <Check className="w-4 h-4" />}
            <span>Tidak</span>
          </button>
        </div>
      </section>

      {/* Bottom Buttons matching Desain A */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-slate-50 transition-colors"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={onContinueToAnalysis}
          className="min-h-[48px] px-5 py-3 rounded-xl bg-[#315CF5] text-white text-sm font-semibold hover:bg-[#274cd1] transition-colors"
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
