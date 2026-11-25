import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Info,
  XCircle,
} from 'lucide-react';
import { Campaign } from '../types/campaign';
import { analyzeCampaign, formatNumberId, summarizeCampaign } from '../utils/evaluationEngine';

interface AnalysisViewProps {
  campaign: Campaign;
  onBack: () => void;
  onProceedToRecommendations: () => void;
}

export function AnalysisView({
  campaign,
  onBack,
  onProceedToRecommendations,
}: AnalysisViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    setIsAnalyzing(true);
    const timer = window.setTimeout(() => setIsAnalyzing(false), 320);
    return () => window.clearTimeout(timer);
  }, [campaign.id, campaign.decisionOverride, campaign.kpis]);

  const summary = summarizeCampaign(campaign);
  const analysis = analyzeCampaign(campaign);
  const isSuccessPath = analysis.branch === 'tercapai';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Evaluasi Kampanye · Analisis Dua Jalur</span>
          <span className="font-mono">Langkah 5 dari 7</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full ${
                step <= 5 ? 'bg-[#315CF5]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B]">
          Hasil Analisis Evaluasi Kampanye
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Analisis disusun langsung dari data KPI {campaign.name} dengan memisahkan
          fakta terukur dan interpretasi analitis.
        </p>
      </div>

      {isAnalyzing ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="h-5 w-56 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="h-28 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Branch Verdict Card */}
          <section
            className={`rounded-2xl border p-5 sm:p-6 ${
              isSuccessPath
                ? 'bg-[#218653]/[0.06] border-[#218653]/30'
                : 'bg-[#D94B4B]/[0.06] border-[#D94B4B]/30'
            }`}
          >
            <div className="flex items-start gap-3.5">
              {isSuccessPath ? (
                <CheckCircle2 className="w-6 h-6 text-[#218653] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-[#D94B4B] shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isSuccessPath ? 'text-[#218653]' : 'text-[#D94B4B]'
                  }`}
                >
                  {isSuccessPath
                    ? 'Jalur 1: Target KPI Tercapai'
                    : 'Jalur 2: Target KPI Belum Tercapai'}
                </p>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#1B1B1B] mt-0.5">
                  {analysis.headlineVerdict}
                </h2>
                <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
                  Rata-rata pencapaian seluruh indikator:{' '}
                  <strong className="font-mono tabular-nums">
                    {formatNumberId(summary.overallAchievementPct)}%
                  </strong>
                  .{' '}
                  {isSuccessPath
                    ? 'Fokus analisis diarahkan pada faktor keberhasilan dan taktik komunikasi yang paling efektif untuk dipertahankan.'
                    : 'Fokus analisis diarahkan pada indikator yang belum tercapai, dugaan akar permasalahan berbasis data, serta kekurangan strategi komunikasi.'}
                </p>
              </div>
            </div>
          </section>

          {/* 1. Fakta dari Data */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-[#315CF5]" />
              <h2 className="font-display text-base font-bold text-[#1B1B1B]">
                Fakta Objektif dari Data Kampanye
              </h2>
            </div>

            <ul className="space-y-2 text-sm text-slate-700">
              {analysis.dataFacts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#315CF5] mt-1">
                    {idx + 1}.
                  </span>
                  <span className="leading-relaxed">{fact}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Achieved KPIs */}
              <div className="rounded-xl bg-[#F4F5F7] p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-[#218653]">
                  KPI Berhasil Tercapai ({analysis.achievedHighlights.length})
                </h3>
                {analysis.achievedHighlights.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Belum ada KPI yang memenuhi target pada data saat ini.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {analysis.achievedHighlights.map((item) => (
                      <div key={item.title} className="text-xs">
                        <p className="font-semibold text-[#1B1B1B]">{item.title}</p>
                        <p className="text-slate-600 mt-0.5">{item.detail}</p>
                        {item.evidence && (
                          <p className="text-slate-500 mt-0.5">{item.evidence}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unachieved KPIs */}
              <div className="rounded-xl bg-[#F4F5F7] p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-[#D94B4B]">
                  KPI Belum Tercapai ({analysis.unachievedGaps.length})
                </h3>
                {analysis.unachievedGaps.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Tidak ada KPI yang berada di bawah target.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {analysis.unachievedGaps.map((item) => (
                      <div key={item.title} className="text-xs">
                        <p className="font-semibold text-[#1B1B1B]">{item.title}</p>
                        <p className="text-slate-600 mt-0.5">{item.detail}</p>
                        {item.evidence && (
                          <p className="text-slate-500 mt-0.5">{item.evidence}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. Conditional Branch Findings */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-base font-bold text-[#1B1B1B]">
                {isSuccessPath
                  ? 'Faktor Keberhasilan Utama'
                  : 'Identifikasi Kemungkinan Akar Permasalahan'}
              </h2>
              <div className="space-y-3">
                {analysis.successFactorsOrRootCauses.map((point) => (
                  <div
                    key={point.title}
                    className="pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold text-[#1B1B1B]">
                      {point.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {point.detail}
                    </p>
                    {point.evidence && (
                      <p className="text-xs text-slate-500 mt-1">{point.evidence}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-base font-bold text-[#1B1B1B]">
                {isSuccessPath
                  ? 'Taktik Komunikasi Terbaik'
                  : 'Kekurangan Strategi Komunikasi'}
              </h2>
              <div className="space-y-3">
                {analysis.communicationWeaknessesOrBestTactics.map((point) => (
                  <div
                    key={point.title}
                    className="pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold text-[#1B1B1B]">
                      {point.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {point.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Interpretasi Analitis & Batasan Data */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#315CF5]" />
              <h2 className="font-display text-base font-bold text-[#1B1B1B]">
                Interpretasi Analitis Pola Output → Outtakes → Outcomes
              </h2>
            </div>

            <div className="space-y-3">
              {analysis.analyticalInterpretations.map((interp) => (
                <div key={interp.title} className="rounded-xl bg-[#F4F5F7] p-4">
                  <p className="text-sm font-semibold text-[#1B1B1B]">{interp.title}</p>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {interp.detail}
                  </p>
                </div>
              ))}
            </div>

            {analysis.dataLimitations.length > 0 && (
              <div className="rounded-xl bg-[#E5A72E]/10 border border-[#E5A72E]/30 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#9a6b10]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Catatan Kecukupan Data</span>
                </div>
                {analysis.dataLimitations.map((lim, idx) => (
                  <p key={idx} className="text-xs text-slate-700 leading-relaxed">
                    {lim}
                  </p>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-slate-50"
        >
          Kembali ke Perbandingan KPI
        </button>
        <button
          type="button"
          onClick={onProceedToRecommendations}
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold hover:bg-[#274cd1] inline-flex items-center justify-center gap-2"
        >
          <span>Susun Rekomendasi Strategis (Langkah 6)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
