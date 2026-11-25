import React, { useState } from 'react';
import {
  ArrowRight,
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { KPI_TEMPLATES } from '../data/demoData';
import {
  Campaign,
  KpiCategory,
  KpiDirection,
  KpiIndicator,
} from '../types/campaign';
import { downloadKpiCsvTemplate, parseKpiCsv } from '../utils/csvHelper';
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  formatNumberId,
  summarizeCampaign,
  validateCampaignData,
} from '../utils/evaluationEngine';

interface DataCollectionViewProps {
  campaign: Campaign;
  initialCategory?: KpiCategory;
  onUpdateKpis: (kpis: KpiIndicator[]) => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, description?: string) => void;
  onBack: () => void;
  onNextToValidation: () => void;
}

export function DataCollectionView({
  campaign,
  initialCategory = 'output',
  onUpdateKpis,
  onNotify,
  onBack,
  onNextToValidation,
}: DataCollectionViewProps) {
  const [activeTab, setActiveTab] = useState<KpiCategory>(initialCategory);
  const [editingKpi, setEditingKpi] = useState<KpiIndicator | null>(null);
  const [isNewModal, setIsNewModal] = useState(false);
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);
  const [toolsMode, setToolsMode] = useState<'template' | 'csv' | 'custom'>('template');
  const [csvText, setCsvText] = useState('');

  const summary = summarizeCampaign(campaign);
  const validation = validateCampaignData(campaign);
  const categorySummary = summary.categories[activeTab];

  const handleQuickActualChange = (kpiId: string, rawVal: string) => {
    const updated = campaign.kpis.map((k) => {
      if (k.id !== kpiId) return k;
      if (rawVal.trim() === '') return { ...k, actual: null };
      const num = Number(rawVal);
      return { ...k, actual: Number.isNaN(num) ? k.actual : num };
    });
    onUpdateKpis(updated);
  };

  const handleSaveKpiModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi) return;
    if (!editingKpi.name.trim() || editingKpi.target <= 0 || !editingKpi.unit.trim()) {
      onNotify('error', 'Data KPI belum valid', 'Nama KPI, target (> 0), dan satuan wajib diisi.');
      return;
    }

    if (isNewModal) {
      onUpdateKpis([...campaign.kpis, editingKpi]);
      onNotify('success', 'Indikator KPI ditambahkan', `${editingKpi.name} masuk ke kategori ${CATEGORY_LABELS[editingKpi.category]}.`);
    } else {
      onUpdateKpis(
        campaign.kpis.map((k) => (k.id === editingKpi.id ? editingKpi : k))
      );
      onNotify('success', 'Indikator KPI diperbarui', editingKpi.name);
    }
    setActiveTab(editingKpi.category);
    setEditingKpi(null);
    setIsNewModal(false);
  };

  const handleDeleteKpi = (kpiId: string, kpiName: string) => {
    onUpdateKpis(campaign.kpis.filter((k) => k.id !== kpiId));
    onNotify('info', 'Indikator dihapus', kpiName);
  };

  const openNewKpiForm = (cat: KpiCategory = activeTab) => {
    setIsNewModal(true);
    setEditingKpi({
      id: `kpi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: cat,
      name: '',
      target: 10,
      actual: null,
      unit: cat === 'output' ? 'berita' : '%',
      direction: 'higher_better',
      source: '',
      notes: '',
    });
    setShowToolsDrawer(false);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const { kpis: imported, skippedRows } = parseKpiCsv(content);
      if (imported.length === 0) {
        onNotify(
          'error',
          'Gagal membaca berkas CSV',
          'Pastikan format kolom sesuai template (Kategori, Nama KPI, Target, Aktual, Satuan, Arah, Sumber).'
        );
        return;
      }
      onUpdateKpis([...campaign.kpis, ...imported]);
      onNotify(
        'success',
        `${imported.length} indikator berhasil diimpor`,
        skippedRows > 0
          ? `${skippedRows} baris dilewati karena tidak valid.`
          : 'Data CSV siap diperiksa dan divalidasi.'
      );
      setShowToolsDrawer(false);
    };
    reader.readAsText(file);
  };

  const handleImportCsvText = () => {
    const { kpis: imported, skippedRows } = parseKpiCsv(csvText);
    if (imported.length === 0) {
      onNotify(
        'error',
        'Tidak ada baris KPI valid',
        'Periksa pemisah koma/titik koma serta kolom Nama KPI dan Target.'
      );
      return;
    }
    onUpdateKpis([...campaign.kpis, ...imported]);
    setCsvText('');
    setShowToolsDrawer(false);
    onNotify(
      'success',
      `${imported.length} indikator ditambahkan dari CSV`,
      skippedRows > 0 ? `${skippedRows} baris dilewati.` : undefined
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header matching Desain B */}
      <div>
        <p className="text-xs font-medium text-slate-500">
          Kampanye · Langkah 2 dari 7
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B] mt-0.5">
          {campaign.name}
        </h1>
      </div>

      {/* Dark Status Hero Card matching Desain B */}
      <section className="bg-[#1B1B1B] text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-300">Status evaluasi</p>
          <p className="font-display text-2xl sm:text-3xl font-bold mt-1 tabular-nums">
            {summary.achievedCount} dari {summary.totalKpis} KPI tercapai
          </p>
          <p className="text-xs text-slate-300 mt-1.5">
            {validation.isValid
              ? 'Data lengkap dan valid'
              : `${validation.issues.length} kelengkapan data perlu diperiksa pada tahap validasi`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Rata-rata Capaian</p>
            <p className="font-mono text-2xl font-bold text-white tabular-nums">
              {formatNumberId(summary.overallAchievementPct)}%
            </p>
          </div>
          <button
            type="button"
            onClick={() => openNewKpiForm(activeTab)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#315CF5] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#274cd1] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah KPI</span>
          </button>
        </div>
      </section>

      {/* Segmented 3-Tab Switcher matching Desain B */}
      <div
        role="tablist"
        aria-label="Kategori Evaluasi KPI"
        className="grid grid-cols-3 gap-1 p-1.5 bg-white border border-slate-200 rounded-2xl"
      >
        {(['output', 'outtakes', 'outcomes'] as KpiCategory[]).map((cat) => {
          const catSum = summary.categories[cat];
          const isSelected = activeTab === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setActiveTab(cat)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-[#F4F5F7] text-[#1B1B1B]'
                  : 'text-slate-500 hover:text-[#1B1B1B]'
              }`}
            >
              <span>{CATEGORY_LABELS[cat]}</span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                ({catSum.total})
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <p className="text-xs text-slate-600">{CATEGORY_DESCRIPTIONS[activeTab]}</p>
        <p className="text-xs font-mono font-semibold text-[#1B1B1B] tabular-nums shrink-0">
          {categorySummary.achieved}/{categorySummary.total} tercapai · Rata-rata{' '}
          {formatNumberId(categorySummary.avgPercentage)}%
        </p>
      </div>

      {/* KPI Cards List matching Desain B */}
      <div className="space-y-3">
        {categorySummary.items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-sm font-semibold text-[#1B1B1B]">
              Belum ada indikator pada kategori {CATEGORY_LABELS[activeTab]}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan minimal 1 indikator agar evaluasi mencakup seluruh pilar
              kehumasan.
            </p>
            <button
              type="button"
              onClick={() => openNewKpiForm(activeTab)}
              className="mt-4 min-h-[42px] px-4 py-2 rounded-xl bg-[#315CF5] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Indikator {CATEGORY_LABELS[activeTab]}</span>
            </button>
          </div>
        ) : (
          categorySummary.items.map((kpi) => {
            const badgeText =
              kpi.status === 'tercapai'
                ? 'Tercapai'
                : kpi.status === 'belum_tercapai'
                  ? 'Belum'
                  : 'Perlu Data';
            const badgeStyle =
              kpi.status === 'tercapai'
                ? 'text-[#218653] bg-[#218653]/10'
                : kpi.status === 'belum_tercapai'
                  ? 'text-[#D94B4B] bg-[#D94B4B]/10'
                  : 'text-[#9a6b10] bg-[#E5A72E]/15';
            const barStyle =
              kpi.status === 'tercapai'
                ? 'bg-[#218653]'
                : kpi.status === 'belum_tercapai'
                  ? 'bg-[#D94B4B]'
                  : 'bg-[#E5A72E]';
            const barPct = kpi.percentage !== null ? Math.min(100, kpi.percentage) : 0;

            return (
              <div
                key={kpi.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-[#1B1B1B]">
                      {kpi.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sumber: {kpi.source || 'Belum diisi'}
                      {kpi.direction === 'lower_better'
                        ? ' · Semakin rendah semakin baik'
                        : ''}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${badgeStyle}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Progress Bar matching Desain B */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-[#F4F5F7] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barStyle}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-mono tabular-nums">
                      Target {formatNumberId(kpi.target)} {kpi.unit} · Aktual{' '}
                      {kpi.actual !== null
                        ? `${formatNumberId(kpi.actual)} ${kpi.unit}`
                        : '—'}
                    </span>
                    <span className="font-mono font-semibold text-[#1B1B1B] tabular-nums">
                      {kpi.percentage !== null ? `${formatNumberId(kpi.percentage)}%` : 'Belum dihitung'}
                    </span>
                  </div>
                </div>

                {/* Quick Actual Input + Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span>Input Hasil Aktual:</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={kpi.actual === null ? '' : kpi.actual}
                      onChange={(e) => handleQuickActualChange(kpi.id, e.target.value)}
                      placeholder="Masukkan angka"
                      className="w-32 min-h-[38px] px-3 py-1 rounded-xl border border-slate-200 font-mono text-xs text-[#1B1B1B] tabular-nums focus:outline-none focus:border-[#315CF5]"
                    />
                    <span className="text-slate-500">{kpi.unit}</span>
                  </label>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewModal(false);
                        setEditingKpi({ ...kpi });
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#1B1B1B] hover:bg-[#F4F5F7] inline-flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKpi(kpi.id, kpi.name)}
                      aria-label={`Hapus ${kpi.name}`}
                      className="min-h-[38px] min-w-[38px] rounded-lg text-slate-400 hover:bg-[#D94B4B]/10 hover:text-[#D94B4B] inline-flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dashed CTA Button matching Desain B */}
      <button
        type="button"
        onClick={() => setShowToolsDrawer(true)}
        className="w-full min-h-[50px] px-4 py-3 rounded-2xl border-2 border-dashed border-[#315CF5]/60 bg-white text-[#315CF5] text-sm font-semibold hover:bg-[#315CF5]/[0.04] transition-colors flex items-center justify-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>Tarik data baru dengan tools tambahan</span>
      </button>

      {/* Bottom Step Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-slate-50"
        >
          Kembali ke Peta Langkah
        </button>
        <button
          type="button"
          onClick={onNextToValidation}
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold hover:bg-[#274cd1] inline-flex items-center justify-center gap-2"
        >
          <span>Lanjut ke Validasi Data (Langkah 3)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal: Edit / Add Single KPI */}
      {editingKpi && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <form
            onSubmit={handleSaveKpiModal}
            className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#1B1B1B]">
                {isNewModal ? 'Tambah Indikator KPI' : 'Edit Detail Indikator KPI'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingKpi(null)}
                aria-label="Tutup"
                className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#F4F5F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#1B1B1B]">Kategori</span>
                <select
                  value={editingKpi.category}
                  onChange={(e) =>
                    setEditingKpi({
                      ...editingKpi,
                      category: e.target.value as KpiCategory,
                    })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="output">Output</option>
                  <option value="outtakes">Outtakes</option>
                  <option value="outcomes">Outcomes</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#1B1B1B]">
                  Arah Penilaian
                </span>
                <select
                  value={editingKpi.direction}
                  onChange={(e) =>
                    setEditingKpi({
                      ...editingKpi,
                      direction: e.target.value as KpiDirection,
                    })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="higher_better">Semakin tinggi semakin baik</option>
                  <option value="lower_better">
                    Semakin rendah semakin baik (biaya/keluhan)
                  </option>
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#1B1B1B]">Nama KPI</span>
              <input
                type="text"
                required
                value={editingKpi.name}
                onChange={(e) =>
                  setEditingKpi({ ...editingKpi, name: e.target.value })
                }
                placeholder="Contoh: Tingkat Pemahaman Pesan Utama"
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 text-sm"
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#1B1B1B]">Target KPI</span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={editingKpi.target}
                  onChange={(e) =>
                    setEditingKpi({
                      ...editingKpi,
                      target: Number(e.target.value),
                    })
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 font-mono text-sm tabular-nums"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#1B1B1B]">Hasil Aktual</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={editingKpi.actual === null ? '' : editingKpi.actual}
                  onChange={(e) =>
                    setEditingKpi({
                      ...editingKpi,
                      actual:
                        e.target.value.trim() === ''
                          ? null
                          : Number(e.target.value),
                    })
                  }
                  placeholder="Kosong"
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 font-mono text-sm tabular-nums"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#1B1B1B]">Satuan</span>
                <input
                  type="text"
                  required
                  value={editingKpi.unit}
                  onChange={(e) =>
                    setEditingKpi({ ...editingKpi, unit: e.target.value })
                  }
                  placeholder="%, berita"
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 text-sm"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#1B1B1B]">Sumber Data</span>
              <input
                type="text"
                value={editingKpi.source}
                onChange={(e) =>
                  setEditingKpi({ ...editingKpi, source: e.target.value })
                }
                placeholder="Contoh: Survei Audiens, Media Monitoring"
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[#1B1B1B]">
                Keterangan Tambahan
              </span>
              <textarea
                rows={2}
                value={editingKpi.notes}
                onChange={(e) =>
                  setEditingKpi({ ...editingKpi, notes: e.target.value })
                }
                placeholder="Catatan metode pengukuran atau konteks capaian..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingKpi(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-[#1B1B1B]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#315CF5] text-white text-sm font-semibold"
              >
                Simpan Indikator
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tools Tambahan Modal (Templates, CSV Import, Custom KPI) */}
      {showToolsDrawer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 w-full max-w-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[#1B1B1B]">
                  Tools Tambahan Pengumpulan Data
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tambahkan indikator dari template kehumasan, impor CSV/Excel, atau
                  input kustom.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowToolsDrawer(false)}
                aria-label="Tutup"
                className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#F4F5F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-[#F4F5F7] rounded-xl">
              <button
                type="button"
                onClick={() => setToolsMode('template')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  toolsMode === 'template'
                    ? 'bg-white text-[#1B1B1B] shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Template KPI
              </button>
              <button
                type="button"
                onClick={() => setToolsMode('csv')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  toolsMode === 'csv'
                    ? 'bg-white text-[#1B1B1B] shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Impor CSV / Excel
              </button>
              <button
                type="button"
                onClick={() => openNewKpiForm(activeTab)}
                className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#315CF5] hover:bg-white/70"
              >
                + Input Kustom
              </button>
            </div>

            {toolsMode === 'template' && (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {KPI_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.name}
                    className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#315CF5]">
                        {CATEGORY_LABELS[tpl.category]} · {tpl.defaultSource}
                      </p>
                      <p className="text-sm font-semibold text-[#1B1B1B] mt-0.5">
                        {tpl.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                        Saran target: {tpl.suggestedTarget} {tpl.defaultUnit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateKpis([
                          ...campaign.kpis,
                          {
                            id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                            category: tpl.category,
                            name: tpl.name,
                            target: tpl.suggestedTarget,
                            actual: null,
                            unit: tpl.defaultUnit,
                            direction: tpl.direction,
                            source: tpl.defaultSource,
                            notes: '',
                          },
                        ]);
                        setActiveTab(tpl.category);
                        onNotify('success', 'Template KPI ditambahkan', tpl.name);
                      }}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#1B1B1B] text-white text-xs font-semibold shrink-0 hover:bg-[#1B1B1B]/90"
                    >
                      Tambahkan
                    </button>
                  </div>
                ))}
              </div>
            )}

            {toolsMode === 'csv' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#F4F5F7] p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#1B1B1B]">
                      1. Unduh atau Unggah File CSV (Kompatibel Excel)
                    </p>
                    <button
                      type="button"
                      onClick={downloadKpiCsvTemplate}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#315CF5] inline-flex items-center gap-1.5 self-start"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Template CSV</span>
                    </button>
                  </div>
                  <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white p-5 text-center hover:border-[#315CF5] transition-colors">
                    <Upload className="w-5 h-5 text-[#315CF5] mx-auto" />
                    <span className="block text-xs font-semibold text-[#1B1B1B] mt-2">
                      Pilih berkas .csv dari perangkat Anda
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Kolom: Kategori, Nama KPI, Target, Aktual, Satuan, Arah, Sumber,
                      Keterangan
                    </span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCsvFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#1B1B1B]">
                    2. Atau Tempel Baris Data CSV Langsung
                  </p>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={`output,Jumlah Siaran Pers,15,18,rilis,higher_better,Media Monitoring,Distribusi nasional`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-[#315CF5]"
                  />
                  <button
                    type="button"
                    onClick={handleImportCsvText}
                    disabled={!csvText.trim()}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#315CF5] text-white text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Proses Data CSV</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
