import { useState } from 'react';
import { Copy, Edit3, FolderPlus, Search, Trash2 } from 'lucide-react';
import { AppPage, Campaign } from '../types/campaign';
import { formatNumberId, summarizeCampaign, validateCampaignData } from '../utils/evaluationEngine';

interface CampaignListViewProps {
  campaigns: Campaign[];
  onCreateNew: () => void;
  onOpenCampaign: (campaignId: string, page?: AppPage) => void;
  onEditCampaign: (campaignId: string) => void;
  onDuplicateCampaign: (campaignId: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
}

type FilterState = 'semua' | 'tercapai' | 'belum' | 'perlu_data';

export function CampaignListView({
  campaigns,
  onCreateNew,
  onOpenCampaign,
  onEditCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
}: CampaignListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>('semua');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const enriched = campaigns.map((c) => ({
    campaign: c,
    summary: summarizeCampaign(c),
    validation: validateCampaignData(c),
  }));

  const filtered = enriched.filter(({ campaign, summary, validation }) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.period.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'semua') return true;
    if (filter === 'perlu_data') return !validation.isValid;
    if (filter === 'tercapai') return validation.isValid && summary.isAllTargetsMet;
    return validation.isValid && !summary.isAllTargetsMet;
  });

  const campaignToDelete = campaigns.find((c) => c.id === confirmDeleteId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1B1B1B]">
            Daftar Kampanye
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Kelola proyek evaluasi kampanye kehumasan Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#274cd1] transition-colors whitespace-nowrap"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Tambah Kampanye</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kampanye, klien, atau periode..."
            className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-[#1B1B1B] placeholder:text-slate-400 focus:outline-none focus:border-[#315CF5]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F4F5F7] rounded-xl overflow-x-auto">
          {(
            [
              { id: 'semua', label: 'Semua' },
              { id: 'tercapai', label: 'Tercapai' },
              { id: 'belum', label: 'Belum Tercapai' },
              { id: 'perlu_data', label: 'Perlu Data' },
            ] as { id: FilterState; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                filter === tab.id
                  ? 'bg-white text-[#1B1B1B] shadow-sm'
                  : 'text-slate-600 hover:text-[#1B1B1B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="font-display text-base font-bold text-[#1B1B1B]">
            Tidak ada kampanye yang sesuai
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Ubah kata kunci pencarian atau buat evaluasi kampanye baru.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-4 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Buat Evaluasi Kampanye</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(({ campaign, summary, validation }) => {
            const statusText = !validation.isValid
              ? 'Perlu Data'
              : summary.isAllTargetsMet
                ? 'Tercapai'
                : 'Belum Tercapai';
            const statusBadge = !validation.isValid
              ? 'text-[#9a6b10] bg-[#E5A72E]/15'
              : summary.isAllTargetsMet
                ? 'text-[#218653] bg-[#218653]/10'
                : 'text-[#D94B4B] bg-[#D94B4B]/10';

            return (
              <article
                key={campaign.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 truncate">
                        {campaign.client} · {campaign.period}
                        {campaign.isDemo ? ' · DEMO' : ''}
                      </p>
                      <h2 className="font-display text-lg font-bold text-[#1B1B1B] mt-1 leading-snug">
                        {campaign.name}
                      </h2>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${statusBadge}`}
                    >
                      {statusText}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {campaign.campaignGoal}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600">
                        Progres KPI ({summary.achievedCount} dari {summary.totalKpis}{' '}
                        tercapai)
                      </span>
                      <span className="font-mono font-semibold text-[#1B1B1B] tabular-nums">
                        {formatNumberId(summary.overallAchievementPct)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F4F5F7] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          !validation.isValid
                            ? 'bg-[#E5A72E]'
                            : summary.isAllTargetsMet
                              ? 'bg-[#218653]'
                              : 'bg-[#315CF5]'
                        }`}
                        style={{
                          width: `${Math.min(100, summary.overallAchievementPct)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditCampaign(campaign.id)}
                      aria-label={`Edit ${campaign.name}`}
                      className="min-h-[40px] min-w-[40px] px-2.5 rounded-lg text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B] inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateCampaign(campaign.id)}
                      aria-label={`Duplikat ${campaign.name}`}
                      className="min-h-[40px] min-w-[40px] px-2.5 rounded-lg text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B] inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Duplikat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(campaign.id)}
                      aria-label={`Hapus ${campaign.name}`}
                      className="min-h-[40px] min-w-[40px] px-2.5 rounded-lg text-slate-500 hover:bg-[#D94B4B]/10 hover:text-[#D94B4B] inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenCampaign(campaign.id, 'data-evaluasi')}
                      className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#1B1B1B] hover:bg-[#F4F5F7] transition-colors whitespace-nowrap"
                    >
                      Data KPI
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCampaign(campaign.id, 'peta-langkah')}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1B1B1B] text-white text-xs font-semibold hover:bg-[#1B1B1B]/90 transition-colors whitespace-nowrap"
                    >
                      Peta Langkah
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {campaignToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-[#1B1B1B]">
              Hapus Kampanye?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kampanye <strong className="text-[#1B1B1B]">{campaignToDelete.name}</strong>{' '}
              beserta seluruh data KPI dan rekomendasinya akan dihapus dari daftar aktif.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-[#F4F5F7]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCampaign(campaignToDelete.id);
                  setConfirmDeleteId(null);
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#D94B4B] text-white text-sm font-semibold hover:bg-[#c13c3c]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
