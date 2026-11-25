import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Campaign, KpiCategory, StrategicAction } from '../types/campaign';
import { analyzeCampaign, CATEGORY_LABELS } from '../utils/evaluationEngine';

interface RecommendationsViewProps {
  campaign: Campaign;
  onUpdateCampaign: (updated: Partial<Campaign>) => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, description?: string) => void;
  onBack: () => void;
  onProceedToReport: () => void;
}

export function RecommendationsView({
  campaign,
  onUpdateCampaign,
  onNotify,
  onBack,
  onProceedToReport,
}: RecommendationsViewProps) {
  const analysis = analyzeCampaign(campaign);
  const actions =
    campaign.strategicActions.length > 0
      ? campaign.strategicActions
      : analysis.recommendedActions;

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPillar, setNewPillar] = useState<KpiCategory | 'umum'>('umum');
  const [newPriority, setNewPriority] = useState<'Tinggi' | 'Sedang' | 'Rendah'>('Tinggi');
  const [newTimeline, setNewTimeline] = useState<
    'Segera' | 'Bulan Depan' | 'Kampanye Berikutnya'
  >('Kampanye Berikutnya');

  useEffect(() => {
    if (campaign.strategicActions.length === 0 && analysis.recommendedActions.length > 0) {
      onUpdateCampaign({ strategicActions: analysis.recommendedActions });
    }
  }, [campaign.id]);

  const handleToggleComplete = (id: string) => {
    const next = actions.map((a) =>
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    onUpdateCampaign({ strategicActions: next });
  };

  const handleDeleteAction = (id: string) => {
    const next = actions.filter((a) => a.id !== id);
    onUpdateCampaign({ strategicActions: next });
  };

  const handleResetFromAnalysis = () => {
    onUpdateCampaign({ strategicActions: analysis.recommendedActions });
    onNotify(
      'info',
      'Rekomendasi disinkronkan ulang',
      'Daftar rekomendasi diperbarui berdasarkan hasil analisis data terbaru.'
    );
  };

  const handleAddCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      onNotify('warning', 'Lengkapi rekomendasi', 'Judul dan deskripsi rencana aksi wajib diisi.');
      return;
    }

    const item: StrategicAction = {
      id: `act-${Date.now()}`,
      pillar: newPillar,
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      timeline: newTimeline,
      completed: false,
      isCustom: true,
    };

    onUpdateCampaign({ strategicActions: [...actions, item] });
    setNewTitle('');
    setNewDesc('');
    onNotify('success', 'Rekomendasi ditambahkan', item.title);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Evaluasi Kampanye · Pertemuan Jalur Evaluasi</span>
          <span className="font-mono">Langkah 6 dari 7</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full ${
                step <= 6 ? 'bg-[#315CF5]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B]">
            Rancang Rekomendasi Strategis
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {analysis.branch === 'tercapai'
              ? 'Disusun dari hasil analisis faktor keberhasilan untuk mempertahankan dan mengembangkan strategi efektif.'
              : 'Disusun dari identifikasi akar masalah untuk memperbaiki kekurangan pada kampanye berikutnya.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetFromAnalysis}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#1B1B1B] hover:bg-slate-50 inline-flex items-center gap-1.5 whitespace-nowrap self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sinkronkan dari Data</span>
        </button>
      </div>

      {/* Recommendations List */}
      <section className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {actions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Belum ada rekomendasi. Tambahkan rekomendasi strategis menggunakan formulir di
            bawah ini.
          </div>
        ) : (
          actions.map((act) => {
            const pillarLabel =
              act.pillar === 'umum'
                ? 'Strategi Umum'
                : CATEGORY_LABELS[act.pillar];
            const priorityClass =
              act.priority === 'Tinggi'
                ? 'text-[#D94B4B] bg-[#D94B4B]/10'
                : act.priority === 'Sedang'
                  ? 'text-[#9a6b10] bg-[#E5A72E]/15'
                  : 'text-slate-600 bg-slate-100';

            return (
              <div
                key={act.id}
                className="p-4 sm:p-5 flex items-start gap-3.5"
              >
                <button
                  type="button"
                  onClick={() => handleToggleComplete(act.id)}
                  aria-label={`Tandai ${act.title}`}
                  className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    act.completed
                      ? 'bg-[#218653] border-[#218653] text-white'
                      : 'border-slate-300 bg-white hover:border-[#315CF5]'
                  }`}
                >
                  {act.completed && <Check className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#315CF5]">{pillarLabel}</span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${priorityClass}`}
                    >
                      Prioritas {act.priority}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">{act.timeline}</span>
                  </div>
                  <h2
                    className={`text-sm sm:text-base font-bold mt-1 ${
                      act.completed ? 'line-through text-slate-400' : 'text-[#1B1B1B]'
                    }`}
                  >
                    {act.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAction(act.id)}
                  aria-label={`Hapus ${act.title}`}
                  className="min-h-[36px] min-w-[36px] rounded-lg text-slate-400 hover:bg-[#D94B4B]/10 hover:text-[#D94B4B] flex items-center justify-center shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </section>

      {/* Add Custom Strategic Recommendation */}
      <form
        onSubmit={handleAddCustomAction}
        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
      >
        <h3 className="font-display text-base font-bold text-[#1B1B1B]">
          Tambah Rekomendasi Strategis Tim
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#1B1B1B]">Pilar Fokus</span>
            <select
              value={newPillar}
              onChange={(e) => setNewPillar(e.target.value as KpiCategory | 'umum')}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 text-xs font-medium"
            >
              <option value="umum">Strategi Umum</option>
              <option value="output">Output</option>
              <option value="outtakes">Outtakes</option>
              <option value="outcomes">Outcomes</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#1B1B1B]">Prioritas</span>
            <select
              value={newPriority}
              onChange={(e) =>
                setNewPriority(e.target.value as 'Tinggi' | 'Sedang' | 'Rendah')
              }
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 text-xs font-medium"
            >
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#1B1B1B]">Target Waktu</span>
            <select
              value={newTimeline}
              onChange={(e) =>
                setNewTimeline(
                  e.target.value as 'Segera' | 'Bulan Depan' | 'Kampanye Berikutnya'
                )
              }
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 text-xs font-medium"
            >
              <option value="Segera">Segera</option>
              <option value="Bulan Depan">Bulan Depan</option>
              <option value="Kampanye Berikutnya">Kampanye Berikutnya</option>
            </select>
          </label>
        </div>

        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Judul langkah strategis (contoh: Kolaborasi dengan komunitas lokal)..."
          className="w-full min-h-[42px] px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
        />
        <textarea
          rows={2}
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Uraikan tindakan konkret yang perlu dilakukan tim humas..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
        />

        <button
          type="submit"
          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1B1B1B] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#1B1B1B]/90"
        >
          <Plus className="w-4 h-4" />
          <span>Tambahkan ke Rencana</span>
        </button>
      </form>

      {/* Executive Summary Note */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <label className="block space-y-1.5">
          <span className="font-display text-sm font-bold text-[#1B1B1B]">
            Catatan Ringkasan Pelaksanaan untuk Laporan Akhir
          </span>
          <textarea
            rows={3}
            value={campaign.customSummaryNote}
            onChange={(e) =>
              onUpdateCampaign({ customSummaryNote: e.target.value })
            }
            placeholder="Tambahkan konteks pelaksanaan lapangan, kendala anggaran, atau catatan pimpinan untuk dimuat di laporan..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
          />
        </label>
      </section>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-slate-50"
        >
          Kembali ke Analisis
        </button>
        <button
          type="button"
          onClick={onProceedToReport}
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold hover:bg-[#274cd1] inline-flex items-center justify-center gap-2"
        >
          <span>Susun Laporan Akhir (Langkah 7)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
