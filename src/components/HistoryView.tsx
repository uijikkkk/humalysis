import { useState } from 'react';
import { Download, Eye, FileText, Search, Trash2, X } from 'lucide-react';
import { SavedReport } from '../types/campaign';
import { formatNumberId } from '../utils/evaluationEngine';
import { exportCampaignReportPdf } from '../utils/pdfExporter';

interface HistoryViewProps {
  reports: SavedReport[];
  onDeleteReport: (id: string) => void;
  onOpenCampaignReport: (campaignId: string) => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, description?: string) => void;
}

export function HistoryView({
  reports,
  onDeleteReport,
  onOpenCampaignReport,
  onNotify,
}: HistoryViewProps) {
  const [query, setQuery] = useState('');
  const [previewReport, setPreviewReport] = useState<SavedReport | null>(null);

  const filtered = reports.filter(
    (r) =>
      r.campaignName.toLowerCase().includes(query.toLowerCase()) ||
      r.client.toLowerCase().includes(query.toLowerCase()) ||
      r.period.toLowerCase().includes(query.toLowerCase())
  );

  const handleDownload = (report: SavedReport) => {
    exportCampaignReportPdf(
      report.snapshot.campaign,
      report.snapshot.summary,
      report.snapshot.analysis
    );
    onNotify('success', 'Laporan PDF diunduh', report.campaignName);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#1B1B1B]">
          Riwayat Laporan Evaluasi
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Arsip laporan evaluasi kampanye yang telah disimpan dan siap diunduh kembali.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari laporan berdasarkan kampanye atau klien..."
            className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-display text-base font-bold text-[#1B1B1B] mt-3">
            Belum ada laporan tersimpan
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Selesaikan alur evaluasi hingga Langkah 7 dan klik &ldquo;Simpan Laporan&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rep) => (
            <article
              key={rep.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{rep.client}</span>
                  <span>·</span>
                  <span>{rep.period}</span>
                  <span>·</span>
                  <span>
                    Disimpan{' '}
                    {new Date(rep.generatedAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="font-display text-base sm:text-lg font-bold text-[#1B1B1B] mt-1">
                  {rep.campaignName}
                </h2>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {rep.summaryConclusion}
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span
                    className={`font-semibold ${
                      rep.isCampaignSuccess ? 'text-[#218653]' : 'text-[#D94B4B]'
                    }`}
                  >
                    {rep.isCampaignSuccess ? 'Target Tercapai' : 'Belum Tercapai Penuh'}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-[#1B1B1B]">
                    {rep.achievedCount}/{rep.totalCount} KPI (
                    {formatNumberId(rep.overallAchievementPct)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewReport(rep)}
                  className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#1B1B1B] hover:bg-[#F4F5F7] inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(rep)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#315CF5] text-white text-xs font-semibold hover:bg-[#274cd1] inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteReport(rep.id)}
                  aria-label={`Hapus laporan ${rep.campaignName}`}
                  className="min-h-[40px] min-w-[40px] rounded-xl text-slate-400 hover:bg-[#D94B4B]/10 hover:text-[#D94B4B] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Snapshot Preview Modal */}
      {previewReport && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{previewReport.client}</p>
                <h3 className="font-display text-lg font-bold text-[#1B1B1B]">
                  {previewReport.campaignName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                aria-label="Tutup"
                className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#F4F5F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="rounded-xl bg-[#F4F5F7] p-4">
                <p className="font-bold text-[#1B1B1B]">Kesimpulan Eksekutif</p>
                <p className="mt-1 leading-relaxed">{previewReport.summaryConclusion}</p>
              </div>

              <div>
                <p className="font-bold text-[#1B1B1B] mb-2">
                  Fakta KPI ({previewReport.achievedCount}/{previewReport.totalCount}{' '}
                  Tercapai)
                </p>
                <ul className="space-y-1">
                  {previewReport.snapshot.analysis.dataFacts.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-[#1B1B1B] mb-2">Rekomendasi Strategis</p>
                <ul className="space-y-1.5">
                  {previewReport.snapshot.analysis.recommendedActions.map((a) => (
                    <li key={a.id}>
                      <strong>{a.title}:</strong> {a.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onOpenCampaignReport(previewReport.campaignId);
                  setPreviewReport(null);
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#1B1B1B]"
              >
                Buka Kampanye Terkait
              </button>
              <button
                type="button"
                onClick={() => handleDownload(previewReport)}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#315CF5] text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
