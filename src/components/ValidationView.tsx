import { AlertTriangle, ArrowRight, CheckCircle2, PlusCircle } from 'lucide-react';
import { Campaign, KpiCategory } from '../types/campaign';
import { CATEGORY_LABELS, validateCampaignData } from '../utils/evaluationEngine';

interface ValidationViewProps {
  campaign: Campaign;
  onFixCategory: (category?: KpiCategory) => void;
  onEditIdentity: () => void;
  onProceedToComparison: () => void;
}

export function ValidationView({
  campaign,
  onFixCategory,
  onEditIdentity,
  onProceedToComparison,
}: ValidationViewProps) {
  const validation = validateCampaignData(campaign);

  const categoryCounts = {
    output: campaign.kpis.filter((k) => k.category === 'output').length,
    outtakes: campaign.kpis.filter((k) => k.category === 'outtakes').length,
    outcomes: campaign.kpis.filter((k) => k.category === 'outcomes').length,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Evaluasi Kampanye</span>
          <span className="font-mono">Langkah 3 dari 7</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full ${
                step <= 3 ? 'bg-[#315CF5]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B]">
          Validasi Kelengkapan &amp; Keabsahan Data
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Sistem memeriksa apakah identitas kampanye dan seluruh indikator Output,
          Outtakes, serta Outcomes siap dievaluasi.
        </p>
      </div>

      {/* Status Banner */}
      {validation.isValid ? (
        <section className="rounded-2xl bg-[#218653]/10 border border-[#218653]/30 p-5 flex items-start gap-3.5">
          <CheckCircle2 className="w-6 h-6 text-[#218653] shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-base font-bold text-[#1B1B1B]">
              Data Lengkap dan Valid — Siap Dianalisis
            </h2>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">
              Seluruh komponen Output, Outtakes, dan Outcomes memiliki target, hasil
              aktual, satuan, dan sumber data yang lengkap. Anda dapat melanjutkan ke
              tahap perbandingan KPI.
            </p>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl bg-[#E5A72E]/15 border border-[#E5A72E]/40 p-5 flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-[#9a6b10] shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-base font-bold text-[#1B1B1B]">
              Data Belum Lengkap ({validation.issues.length} Catatan Perbaikan)
            </h2>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">
              Lengkapi bagian yang masih kosong sebelum melanjutkan evaluasi agar hasil
              analisis tidak bias atau keliru.
            </p>
          </div>
        </section>
      )}

      {/* 3 Pillar Readiness Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['output', 'outtakes', 'outcomes'] as KpiCategory[]).map((cat) => {
          const count = categoryCounts[cat];
          const catIssues = validation.issues.filter((i) => i.category === cat);
          const ok = count > 0 && catIssues.length === 0;
          return (
            <div
              key={cat}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#1B1B1B]">
                  {CATEGORY_LABELS[cat]}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    ok ? 'text-[#218653]' : 'text-[#9a6b10]'
                  }`}
                >
                  {ok ? 'Siap' : 'Perlu Data'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono tabular-nums">
                {count} indikator · {catIssues.length} catatan
              </p>
            </div>
          );
        })}
      </section>

      {/* Issue Breakdown with Direct Fix Actions */}
      {!validation.isValid && (
        <section className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          <div className="p-4 sm:p-5">
            <h3 className="font-display text-base font-bold text-[#1B1B1B]">
              Daftar Bagian yang Harus Dilengkapi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik &ldquo;Tambahkan Data&rdquo; untuk langsung memperbaiki bagian terkait.
            </p>
          </div>
          {validation.issues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#9a6b10]">
                  {issue.fieldLabel}
                </p>
                <p className="text-sm text-[#1B1B1B] mt-0.5">{issue.message}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  issue.category
                    ? onFixCategory(issue.category)
                    : onEditIdentity()
                }
                className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#315CF5] text-[#315CF5] text-xs font-semibold hover:bg-[#315CF5]/5 inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambahkan Data</span>
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => onFixCategory('output')}
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-slate-50"
        >
          Kembali ke Pengumpulan Data
        </button>

        <button
          type="button"
          disabled={!validation.isValid}
          onClick={onProceedToComparison}
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold hover:bg-[#274cd1] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-colors"
        >
          <span>Lanjutkan Evaluasi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
