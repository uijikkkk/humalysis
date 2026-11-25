import { ArrowRight, BarChart3, ChevronRight, FolderPlus, Layers } from 'lucide-react';
import { AppPage, Campaign, SavedReport, UserProfile } from '../types/campaign';
import { formatNumberId, summarizeCampaign, validateCampaignData } from '../utils/evaluationEngine';

interface DashboardViewProps {
  profile: UserProfile;
  campaigns: Campaign[];
  savedReports: SavedReport[];
  onCreateNew: () => void;
  onOpenCampaign: (campaignId: string, targetPage?: AppPage) => void;
  onNavigate: (page: AppPage) => void;
}

export function DashboardView({
  profile,
  campaigns,
  savedReports,
  onCreateNew,
  onOpenCampaign,
  onNavigate,
}: DashboardViewProps) {
  const summaries = campaigns.map((c) => ({
    campaign: c,
    summary: summarizeCampaign(c),
    validation: validateCampaignData(c),
  }));

  const totalCampaigns = campaigns.length;
  const avgOverallPct =
    summaries.length > 0
      ? Number(
          (
            summaries.reduce((acc, s) => acc + s.summary.overallAchievementPct, 0) /
            summaries.length
          ).toFixed(1)
        )
      : 0;

  const latestItem = [...summaries].sort(
    (a, b) =>
      new Date(b.campaign.updatedAt).getTime() - new Date(a.campaign.updatedAt).getTime()
  )[0];

  const categoryAverages = (['output', 'outtakes', 'outcomes'] as const).map((cat) => {
    const valid = summaries.filter((s) => s.summary.categories[cat].total > 0);
    const avg =
      valid.length > 0
        ? Number(
            (
              valid.reduce((sum, s) => sum + s.summary.categories[cat].avgPercentage, 0) /
              valid.length
            ).toFixed(1)
          )
        : 0;
    const label =
      cat === 'output' ? 'Output' : cat === 'outtakes' ? 'Outtakes' : 'Outcomes';
    return { cat, label, avg };
  });

  const latestStatusText = latestItem
    ? !latestItem.validation.isValid
      ? 'Perlu Data'
      : latestItem.summary.isAllTargetsMet
        ? 'Target Tercapai'
        : 'Belum Tercapai Penuh'
    : 'Belum Ada Evaluasi';

  const latestStatusColor = latestItem
    ? !latestItem.validation.isValid
      ? 'text-[#E5A72E]'
      : latestItem.summary.isAllTargetsMet
        ? 'text-[#218653]'
        : 'text-[#D94B4B]'
    : 'text-slate-500';

  return (
    <div className="space-y-6">
      {/* Greeting + Primary CTA */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {profile.organization} · {profile.role}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B] mt-1 tracking-tight">
            Halo, {profile.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Pantau efektivitas kampanye kehumasan berdasarkan capaian aktual Output,
            Outtakes, dan Outcomes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onCreateNew}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold flex items-center gap-2 hover:bg-[#274cd1] active:scale-[0.99] transition-all whitespace-nowrap"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Buat Evaluasi Kampanye</span>
          </button>
        </div>
      </section>

      {/* Summary KPI Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Total Kampanye</p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#1B1B1B] mt-2 tabular-nums">
            {totalCampaigns}
          </p>
          <p className="text-xs text-slate-500 mt-1">Proyek evaluasi tersimpan</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Rata-rata Capaian KPI</p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#315CF5] mt-2 tabular-nums">
            {formatNumberId(avgOverallPct)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Akumulasi semua indikator</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Status Evaluasi Terakhir</p>
          <p className={`font-display text-lg sm:text-xl font-bold mt-2 ${latestStatusColor}`}>
            {latestStatusText}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {latestItem ? latestItem.campaign.name : 'Belum ada data'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Laporan Tersimpan</p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#1B1B1B] mt-2 tabular-nums">
            {savedReports.length}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('riwayat')}
            className="text-xs font-medium text-[#315CF5] hover:underline mt-1 inline-flex items-center gap-1"
          >
            <span>Lihat riwayat</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Main Content Split: Chart + Active Campaign vs Campaign List */}
      {campaigns.length === 0 ? (
        <section className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] text-slate-500 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#1B1B1B] mt-4">
            Belum Ada Kampanye yang Dievaluasi
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
            Mulai buat proyek evaluasi pertama Anda dengan menyiapkan tujuan kampanye,
            target KPI, serta data Output, Outtakes, dan Outcomes.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#274cd1] transition-colors"
          >
            <span>Buat Evaluasi Kampanye</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 3-Pillar Visualization + Quick Resume */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="font-display text-base font-bold text-[#1B1B1B]">
                    Performa Rata-rata per Komponen
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perbandingan capaian Output, Outtakes, dan Outcomes
                  </p>
                </div>
                <BarChart3 className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              <div className="space-y-4">
                {categoryAverages.map((item) => {
                  const barWidth = Math.min(100, Math.max(0, item.avg));
                  const barColor =
                    item.avg >= 100
                      ? 'bg-[#218653]'
                      : item.avg >= 75
                        ? 'bg-[#315CF5]'
                        : 'bg-[#D94B4B]';
                  return (
                    <div key={item.cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1B1B1B]">{item.label}</span>
                        <span className="font-mono font-semibold text-[#1B1B1B] tabular-nums">
                          {formatNumberId(item.avg)}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-[#F4F5F7] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {latestItem && (
              <div className="bg-[#1B1B1B] text-white rounded-2xl p-5">
                <p className="text-xs text-slate-300">Evaluasi Terakhir Dibuka</p>
                <h3 className="font-display text-lg font-bold mt-1 leading-snug">
                  {latestItem.campaign.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {latestItem.campaign.client} · Langkah {latestItem.campaign.currentStep}{' '}
                  dari 7
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xl font-bold tabular-nums">
                      {latestItem.summary.achievedCount} dari {latestItem.summary.totalKpis}{' '}
                      KPI tercapai
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {latestItem.validation.isValid
                        ? 'Data lengkap dan valid'
                        : `${latestItem.validation.issues.length} catatan kelengkapan data`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenCampaign(latestItem.campaign.id, 'peta-langkah')}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#315CF5] text-white text-xs font-semibold hover:bg-[#274cd1] transition-colors whitespace-nowrap shrink-0"
                  >
                    Buka Peta
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Recent Evaluated Campaigns */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#1B1B1B]">
                  Daftar Kampanye Terbaru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih kampanye untuk melanjutkan evaluasi atau melihat laporan
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('kampanye')}
                className="text-xs font-semibold text-[#315CF5] hover:underline whitespace-nowrap shrink-0"
              >
                Lihat Semua
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {summaries.map(({ campaign, summary, validation }) => {
                const statusLabel = !validation.isValid
                  ? 'Perlu Data'
                  : summary.isAllTargetsMet
                    ? 'Tercapai'
                    : 'Belum Tercapai';
                const statusClass = !validation.isValid
                  ? 'text-[#9a6b10] bg-[#E5A72E]/15'
                  : summary.isAllTargetsMet
                    ? 'text-[#218653] bg-[#218653]/10'
                    : 'text-[#D94B4B] bg-[#D94B4B]/10';
                const barColor = !validation.isValid
                  ? 'bg-[#E5A72E]'
                  : summary.isAllTargetsMet
                    ? 'bg-[#218653]'
                    : 'bg-[#315CF5]';

                return (
                  <div
                    key={campaign.id}
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[#1B1B1B] truncate">
                          {campaign.name}
                        </h3>
                        {campaign.isDemo && (
                          <span className="text-[11px] font-mono font-semibold text-[#315CF5]">
                            · DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {campaign.client} · {campaign.period} · Langkah {campaign.currentStep}/7
                      </p>

                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="flex-1 max-w-xs h-1.5 rounded-full bg-[#F4F5F7] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{
                              width: `${Math.min(100, summary.overallAchievementPct)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs font-medium text-[#1B1B1B] tabular-nums">
                          {summary.achievedCount}/{summary.totalKpis} KPI (
                          {formatNumberId(summary.overallAchievementPct)}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenCampaign(campaign.id, 'peta-langkah')}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#1B1B1B] hover:bg-[#F4F5F7] transition-colors whitespace-nowrap"
                      >
                        Buka
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
