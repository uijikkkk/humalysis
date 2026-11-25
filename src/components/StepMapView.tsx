import { ArrowRight, Check } from 'lucide-react';
import { AppPage, Campaign, WorkflowStep } from '../types/campaign';
import { summarizeCampaign, validateCampaignData } from '../utils/evaluationEngine';

interface StepMapViewProps {
  campaign: Campaign;
  onGoToStep: (step: WorkflowStep, page: AppPage) => void;
}

const STEP_META: {
  step: WorkflowStep;
  title: string;
  page: AppPage;
}[] = [
  {
    step: 1,
    title: 'Siapkan dokumen tujuan dan target KPI',
    page: 'form-kampanye',
  },
  {
    step: 2,
    title: 'Kumpulkan data output, outtakes, outcomes',
    page: 'data-evaluasi',
  },
  {
    step: 3,
    title: 'Data lengkap dan valid? Jika tidak, gunakan tools tambahan',
    page: 'validasi',
  },
  {
    step: 4,
    title: 'Bandingkan dengan target KPI',
    page: 'perbandingan',
  },
  {
    step: 5,
    title: 'Capai target KPI?',
    page: 'analisis',
  },
  {
    step: 6,
    title: 'Rancang rekomendasi strategis ke depan',
    page: 'rekomendasi',
  },
  {
    step: 7,
    title: 'Susun laporan akhir evaluasi',
    page: 'laporan',
  },
];

export function StepMapView({ campaign, onGoToStep }: StepMapViewProps) {
  const validation = validateCampaignData(campaign);
  const summary = summarizeCampaign(campaign);
  const activeStep = campaign.currentStep;

  const branchChosen: 'ya' | 'tidak' =
    campaign.decisionOverride === 'tercapai'
      ? 'ya'
      : campaign.decisionOverride === 'belum_tercapai'
        ? 'tidak'
        : summary.isAllTargetsMet
          ? 'ya'
          : 'tidak';

  const currentStepMeta =
    STEP_META.find((s) => s.step === activeStep) ?? STEP_META[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header matching Desain C */}
      <div>
        <p className="text-xs font-medium text-slate-500">Alur evaluasi</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B] mt-0.5">
          Peta langkah kampanye
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {campaign.name} · {campaign.client}
        </p>
      </div>

      {/* 7-Step Connected Flowchart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7">
        <div className="relative space-y-4">
          {STEP_META.map((item, idx) => {
            const isCompleted = item.step < activeStep;
            const isActive = item.step === activeStep;
            const isStep5 = item.step === 5;
            const isLast = idx === STEP_META.length - 1;

            return (
              <div key={item.step} className="relative">
                {/* Vertical connector line */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className={`absolute left-[15px] top-8 bottom-[-18px] w-[1.5px] ${
                      isCompleted ? 'bg-[#218653]' : 'bg-slate-200'
                    }`}
                  />
                )}

                {isActive ? (
                  <div className="rounded-2xl border-2 border-[#315CF5] bg-[#315CF5]/[0.03] p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#315CF5] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1B1B1B] leading-snug">
                          {item.title}
                        </p>
                        <p className="text-xs font-medium text-[#315CF5] mt-0.5">
                          Sedang berjalan
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onGoToStep(item.step, item.page)}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-[#315CF5] text-white text-xs font-semibold hover:bg-[#274cd1] transition-colors whitespace-nowrap shrink-0"
                    >
                      Buka
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3.5 py-1.5">
                    <button
                      type="button"
                      onClick={() => onGoToStep(item.step, item.page)}
                      className={`w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors z-10 ${
                        isCompleted
                          ? 'bg-[#218653] text-white'
                          : 'bg-white border border-slate-300 text-slate-500 hover:border-[#315CF5] hover:text-[#315CF5]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : item.step}
                    </button>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onGoToStep(item.step, item.page)}
                          className={`text-left text-sm leading-snug hover:text-[#315CF5] transition-colors ${
                            isCompleted
                              ? 'font-medium text-[#1B1B1B]'
                              : 'font-normal text-slate-600'
                          }`}
                        >
                          {item.title}
                        </button>
                        <button
                          type="button"
                          onClick={() => onGoToStep(item.step, item.page)}
                          className="text-xs font-medium text-slate-400 hover:text-[#315CF5] shrink-0"
                        >
                          Lihat
                        </button>
                      </div>

                      {/* Step 3 Validation Hint */}
                      {item.step === 3 && !validation.isValid && (
                        <p className="text-xs text-[#9a6b10] mt-1">
                          Terdapat {validation.issues.length} kelengkapan data yang perlu
                          diperiksa sebelum evaluasi akhir.
                        </p>
                      )}

                      {/* Step 5 Conditional Branch Cards matching Desain C */}
                      {isStep5 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => onGoToStep(5, 'analisis')}
                            className={`text-left rounded-xl border p-3.5 transition-all ${
                              branchChosen === 'ya'
                                ? 'border-[#218653] bg-[#218653]/[0.05]'
                                : 'border-slate-200 hover:border-[#218653]/60'
                            }`}
                          >
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#218653]/15 text-[#218653]">
                              Ya
                            </span>
                            <p className="text-xs text-[#1B1B1B] font-medium mt-2 leading-relaxed">
                              Analisis faktor keberhasilan dan taktik terbaik
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => onGoToStep(5, 'analisis')}
                            className={`text-left rounded-xl border p-3.5 transition-all ${
                              branchChosen === 'tidak'
                                ? 'border-[#D94B4B] bg-[#D94B4B]/[0.05]'
                                : 'border-slate-200 hover:border-[#D94B4B]/60'
                            }`}
                          >
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#D94B4B]/15 text-[#D94B4B]">
                              Tidak
                            </span>
                            <p className="text-xs text-[#1B1B1B] font-medium mt-2 leading-relaxed">
                              Identifikasi akar masalah dan kekurangan kampanye
                            </p>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA matching Desain C */}
      <button
        type="button"
        onClick={() => onGoToStep(currentStepMeta.step, currentStepMeta.page)}
        className="w-full min-h-[50px] px-6 py-3 rounded-xl bg-[#1B1B1B] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1B1B1B]/90 active:scale-[0.99] transition-all"
      >
        <span>Lanjutkan langkah {activeStep}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
