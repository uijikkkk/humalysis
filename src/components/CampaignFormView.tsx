import React, { useState } from 'react';
import { ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import { KPI_TEMPLATES } from '../data/demoData';
import { Campaign, KpiCategory, KpiDirection, KpiIndicator } from '../types/campaign';
import { CATEGORY_LABELS } from '../utils/evaluationEngine';

interface CampaignFormViewProps {
  existingCampaign?: Campaign | null;
  onSave: (campaign: Campaign, goToNextStep: boolean) => void;
  onCancel: () => void;
}

export function CampaignFormView({
  existingCampaign,
  onSave,
  onCancel,
}: CampaignFormViewProps) {
  const isEditing = Boolean(existingCampaign);

  const [name, setName] = useState(existingCampaign?.name ?? '');
  const [client, setClient] = useState(existingCampaign?.client ?? '');
  const [period, setPeriod] = useState(existingCampaign?.period ?? '');
  const [targetAudience, setTargetAudience] = useState(
    existingCampaign?.targetAudience ?? ''
  );
  const [campaignGoal, setCampaignGoal] = useState(
    existingCampaign?.campaignGoal ?? ''
  );
  const [communicationGoal, setCommunicationGoal] = useState(
    existingCampaign?.communicationGoal ?? ''
  );

  const [kpis, setKpis] = useState<KpiIndicator[]>(
    existingCampaign?.kpis ?? [
      {
        id: `kpi-${Date.now()}-1`,
        category: 'output',
        name: 'Jumlah Publikasi Media Massa',
        target: 20,
        actual: null,
        unit: 'berita',
        direction: 'higher_better',
        source: 'Media Monitoring',
        notes: '',
      },
      {
        id: `kpi-${Date.now()}-2`,
        category: 'outtakes',
        name: 'Tingkat Pemahaman Pesan Utama',
        target: 75,
        actual: null,
        unit: '%',
        direction: 'higher_better',
        source: 'Survei Audiens',
        notes: '',
      },
      {
        id: `kpi-${Date.now()}-3`,
        category: 'outcomes',
        name: 'Peningkatan Partisipasi / Perubahan Perilaku',
        target: 30,
        actual: null,
        unit: '%',
        direction: 'higher_better',
        source: 'Laporan Partisipasi Program',
        notes: '',
      },
    ]
  );

  const [newKpiCat, setNewKpiCat] = useState<KpiCategory>('output');
  const [newKpiName, setNewKpiName] = useState('');
  const [newKpiTarget, setNewKpiTarget] = useState('10');
  const [newKpiUnit, setNewKpiUnit] = useState('berita');
  const [newKpiDirection, setNewKpiDirection] =
    useState<KpiDirection>('higher_better');
  const [newKpiSource, setNewKpiSource] = useState('Media Monitoring');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddTemplate = (tplIndex: number) => {
    const tpl = KPI_TEMPLATES[tplIndex];
    if (!tpl) return;
    setKpis((prev) => [
      ...prev,
      {
        id: `kpi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
  };

  const handleAddCustomKpi = () => {
    const parsedTarget = Number(newKpiTarget);
    if (!newKpiName.trim() || Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorMessage('Nama target KPI dan angka target (> 0) harus diisi.');
      return;
    }
    setErrorMessage('');
    setKpis((prev) => [
      ...prev,
      {
        id: `kpi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        category: newKpiCat,
        name: newKpiName.trim(),
        target: parsedTarget,
        actual: null,
        unit: newKpiUnit.trim() || 'poin',
        direction: newKpiDirection,
        source: newKpiSource.trim() || 'Dokumen Internal',
        notes: '',
      },
    ]);
    setNewKpiName('');
  };

  const handleSubmit = (e: React.FormEvent, goToNextStep: boolean) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !client.trim() ||
      !period.trim() ||
      !targetAudience.trim() ||
      !campaignGoal.trim() ||
      !communicationGoal.trim()
    ) {
      setErrorMessage(
        'Mohon lengkapi seluruh identitas kampanye, tujuan kampanye, target audiens, periode, dan tujuan komunikasi.'
      );
      return;
    }
    setErrorMessage('');

    const now = new Date().toISOString();
    const campaign: Campaign = {
      id: existingCampaign?.id ?? `cmp-${Date.now()}`,
      isDemo: existingCampaign?.isDemo ?? false,
      name: name.trim(),
      client: client.trim(),
      period: period.trim(),
      targetAudience: targetAudience.trim(),
      campaignGoal: campaignGoal.trim(),
      communicationGoal: communicationGoal.trim(),
      currentStep: existingCampaign
        ? existingCampaign.currentStep
        : goToNextStep
          ? 2
          : 1,
      kpis,
      decisionOverride: existingCampaign?.decisionOverride ?? null,
      customSummaryNote: existingCampaign?.customSummaryNote ?? '',
      strategicActions: existingCampaign?.strategicActions ?? [],
      createdAt: existingCampaign?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(campaign, goToNextStep);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Langkah 1 dari 7 · Dokumen Tujuan &amp; Target KPI</span>
          <span className="font-mono">Tahap Persiapan</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full ${
                step === 1 ? 'bg-[#315CF5]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1B1B1B]">
          {isEditing ? 'Edit Data Kampanye' : 'Siapkan Dokumen Tujuan & Target KPI'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Lengkapi identitas kampanye, tujuan komunikasi, dan indikator target KPI yang
          akan dievaluasi.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-[#D94B4B]/10 border border-[#D94B4B]/30 px-4 py-3 text-sm text-[#D94B4B] font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
        {/* Identity Section */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-[#1B1B1B]">
            1. Identitas &amp; Tujuan Kampanye
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#1B1B1B]">
                Nama Kampanye
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kampanye Literasi Keuangan Digital"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#1B1B1B]">
                Nama Organisasi atau Klien
              </span>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Contoh: Bank Daerah / Kementerian X"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#1B1B1B]">
                Target Audiens
              </span>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Contoh: Pelaku UMKM usia 22–45 tahun"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#1B1B1B]">
                Periode Pelaksanaan
              </span>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Contoh: Agustus – Oktober 2026"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#1B1B1B]">
              Tujuan Kampanye
            </span>
            <textarea
              rows={2}
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              placeholder="Jelaskan hasil utama organisasi yang ingin dicapai melalui kampanye ini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#1B1B1B]">
              Tujuan Komunikasi
            </span>
            <textarea
              rows={2}
              value={communicationGoal}
              onChange={(e) => setCommunicationGoal(e.target.value)}
              placeholder="Jelaskan pesan kunci dan respons komunikasi yang ingin dibangun pada target audiens..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
            />
          </label>
        </section>

        {/* Initial KPI Target Builder */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="font-display text-base font-bold text-[#1B1B1B]">
              2. Target KPI Kampanye ({kpis.length} Indikator)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Susun target KPI awal di kategori Output, Outtakes, dan Outcomes. Anda
              tetap dapat menambah atau mengubah KPI pada tahap pengumpulan data.
            </p>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">
              Tambah Cepat dari Template Kehumasan:
            </p>
            <div className="flex flex-wrap gap-2">
              {KPI_TEMPLATES.slice(0, 6).map((tpl, idx) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => handleAddTemplate(idx)}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-[#1B1B1B] hover:border-[#315CF5] hover:text-[#315CF5] transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {CATEGORY_LABELS[tpl.category]}: {tpl.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Current KPIs List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {kpis.length === 0 ? (
              <p className="p-4 text-xs text-slate-500 text-center">
                Belum ada target KPI. Tambahkan dari template atau form di bawah ini.
              </p>
            ) : (
              kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#315CF5]">
                        {CATEGORY_LABELS[kpi.category]}
                      </span>
                      <span>·</span>
                      <span>{kpi.source}</span>
                      {kpi.direction === 'lower_better' && (
                        <>
                          <span>·</span>
                          <span className="text-[#9a6b10]">Semakin rendah semakin baik</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#1B1B1B] mt-0.5">
                      {kpi.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span>Target:</span>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={kpi.target}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setKpis((prev) =>
                            prev.map((item) =>
                              item.id === kpi.id
                                ? { ...item, target: Number.isNaN(val) ? 0 : val }
                                : item
                            )
                          );
                        }}
                        className="w-24 min-h-[38px] px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-xs text-right tabular-nums focus:outline-none focus:border-[#315CF5]"
                      />
                      <span className="font-medium text-[#1B1B1B] min-w-[44px]">
                        {kpi.unit}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setKpis((prev) => prev.filter((item) => item.id !== kpi.id))
                      }
                      aria-label={`Hapus ${kpi.name}`}
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#D94B4B]/10 hover:text-[#D94B4B] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Custom KPI Inline */}
          <div className="bg-[#F4F5F7] rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-[#1B1B1B]">
              Tambah Indikator KPI Kustom
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <select
                value={newKpiCat}
                onChange={(e) => setNewKpiCat(e.target.value as KpiCategory)}
                className="sm:col-span-3 min-h-[42px] px-3 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#315CF5]"
              >
                <option value="output">Output</option>
                <option value="outtakes">Outtakes</option>
                <option value="outcomes">Outcomes</option>
              </select>
              <input
                type="text"
                value={newKpiName}
                onChange={(e) => setNewKpiName(e.target.value)}
                placeholder="Nama indikator KPI..."
                className="sm:col-span-5 min-h-[42px] px-3 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#315CF5]"
              />
              <input
                type="number"
                min="0.01"
                step="any"
                value={newKpiTarget}
                onChange={(e) => setNewKpiTarget(e.target.value)}
                placeholder="Target"
                className="sm:col-span-2 min-h-[42px] px-3 rounded-xl bg-white border border-slate-200 font-mono text-xs tabular-nums focus:outline-none focus:border-[#315CF5]"
              />
              <input
                type="text"
                value={newKpiUnit}
                onChange={(e) => setNewKpiUnit(e.target.value)}
                placeholder="Satuan (%, berita)"
                className="sm:col-span-2 min-h-[42px] px-3 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#315CF5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              <select
                value={newKpiDirection}
                onChange={(e) => setNewKpiDirection(e.target.value as KpiDirection)}
                className="sm:col-span-5 min-h-[42px] px-3 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#315CF5]"
              >
                <option value="higher_better">Semakin tinggi semakin baik</option>
                <option value="lower_better">
                  Semakin rendah semakin baik (keluhan/biaya)
                </option>
              </select>
              <input
                type="text"
                value={newKpiSource}
                onChange={(e) => setNewKpiSource(e.target.value)}
                placeholder="Sumber data (mis. Survei Audiens)"
                className="sm:col-span-4 min-h-[42px] px-3 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#315CF5]"
              />
              <button
                type="button"
                onClick={handleAddCustomKpi}
                className="sm:col-span-3 min-h-[42px] px-4 py-2 rounded-xl bg-[#1B1B1B] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-[#1B1B1B]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah KPI</span>
              </button>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#1B1B1B] hover:bg-slate-50 inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Saja</span>
            </button>
            <button
              type="submit"
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold hover:bg-[#274cd1] inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>Simpan &amp; Input Data Aktual</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
