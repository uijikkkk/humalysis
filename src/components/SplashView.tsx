import { ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, Layers } from 'lucide-react';

interface SplashViewProps {
  onEnterDashboard: () => void;
  onStartNewCampaign: () => void;
  demoCount: number;
}

export function SplashView({
  onEnterDashboard,
  onStartNewCampaign,
  demoCount,
}: SplashViewProps) {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1B1B1B] flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        <span className="font-display text-lg font-extrabold tracking-tight text-[#1B1B1B] whitespace-nowrap shrink-0">
          HUMALYSIS<span className="text-[#315CF5]">.AI</span>
        </span>
        <button
          type="button"
          onClick={onEnterDashboard}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1B1B1B] text-white text-sm font-medium hover:bg-[#1B1B1B]/90 transition-colors whitespace-nowrap shrink-0"
        >
          Masuk ke Beranda
        </button>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-14 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-wider text-[#315CF5] mb-3">
              Platform Evaluasi Kampanye Kehumasan
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1B] leading-[1.12] [text-wrap:balance]">
              Ukur Efektivitas Kampanye Humas Secara Objektif dan Terstruktur
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mt-5 leading-relaxed max-w-2xl">
              Melampaui sekadar jumlah publikasi. Evaluasi kampanye komunikasi Anda
              melalui tiga lapis pengukuran—Output, Outtakes, dan Outcomes—hingga
              menjadi rekomendasi strategis dan laporan PDF siap saji.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onStartNewCampaign}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-[#315CF5] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#274cd1] active:scale-[0.99] transition-all whitespace-nowrap"
              >
                <span>Buat Evaluasi Kampanye</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onEnterDashboard}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-white border border-slate-200 text-[#1B1B1B] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-[0.99] transition-all whitespace-nowrap"
              >
                <span>Lihat Dashboard &amp; {demoCount} Data Demo</span>
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
              <div>
                <p className="font-mono text-xl sm:text-2xl font-semibold text-[#1B1B1B] tabular-nums">
                  3 Lapis
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Output, Outtakes, Outcomes
                </p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-semibold text-[#1B1B1B] tabular-nums">
                  7 Tahap
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Alur evaluasi terstandar
                </p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-semibold text-[#1B1B1B] tabular-nums">
                  12 Bagian
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Laporan PDF otomatis
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Kerangka Kerja Terintegrasi
                </p>
                <h2 className="font-display text-lg font-bold text-[#1B1B1B] mt-1">
                  Dari Target KPI ke Keputusan Strategis
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#315CF5]/10 text-[#315CF5] flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1B1B1B]">
                      1. Pengumpulan Data Terstruktur
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Catat indikator Output, Outtakes, dan Outcomes secara manual atau
                      impor berkas CSV.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#218653]/10 text-[#218653] flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1B1B1B]">
                      2. Validasi &amp; Perbandingan Akurat
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Validasi kelengkapan data sebelum membandingkan target vs aktual
                      dengan rumus yang tepat.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1B1B1B]/10 text-[#1B1B1B] flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1B1B1B]">
                      3. Analisis Dua Jalur &amp; Rekomendasi
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Membedakan fakta data dan interpretasi analitis untuk jalur target
                      tercapai maupun belum tercapai.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E5A72E]/15 text-[#9a6b10] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1B1B1B]">
                      4. Laporan Akhir &amp; Ekspor PDF
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Simpan riwayat evaluasi dan unduh laporan eksekutif lengkap dalam
                      format PDF.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
