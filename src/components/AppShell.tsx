import React from 'react';
import {
  BarChart3,
  FileText,
  FolderKanban,
  History,
  Home,
  Plus,
  User,
  GitBranch,
  ArrowLeft,
} from 'lucide-react';
import { AppPage, Campaign, UserProfile } from '../types/campaign';

interface AppShellProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  activeCampaign: Campaign | null;
  profile: UserProfile;
  onNewCampaign: () => void;
  children: React.ReactNode;
}

const PAGE_TITLES: Record<AppPage, string> = {
  splash: 'Selamat Datang',
  beranda: 'Beranda',
  kampanye: 'Daftar Kampanye',
  'form-kampanye': 'Data Kampanye',
  'peta-langkah': 'Peta Langkah Evaluasi',
  'data-evaluasi': 'Pengumpulan Data KPI',
  validasi: 'Validasi Data',
  perbandingan: 'Perbandingan KPI',
  analisis: 'Analisis Kampanye',
  rekomendasi: 'Rekomendasi Strategis',
  laporan: 'Laporan Evaluasi',
  riwayat: 'Riwayat Laporan',
  profil: 'Pengaturan Profil',
};

export function AppShell({
  currentPage,
  onNavigate,
  activeCampaign,
  profile,
  onNewCampaign,
  children,
}: AppShellProps) {
  const isWorkflowPage = [
    'peta-langkah',
    'data-evaluasi',
    'validasi',
    'perbandingan',
    'analisis',
    'rekomendasi',
    'laporan',
  ].includes(currentPage);

  const navItems: {
    id: AppPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    matchPages: AppPage[];
  }[] = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: Home,
      matchPages: ['beranda'],
    },
    {
      id: 'kampanye',
      label: 'Kampanye',
      icon: FolderKanban,
      matchPages: ['kampanye', 'form-kampanye', 'peta-langkah', 'data-evaluasi', 'validasi'],
    },
    {
      id: activeCampaign ? 'perbandingan' : 'kampanye',
      label: 'Analisis',
      icon: BarChart3,
      matchPages: ['perbandingan', 'analisis', 'rekomendasi'],
    },
    {
      id: activeCampaign && currentPage === 'laporan' ? 'laporan' : 'riwayat',
      label: 'Laporan',
      icon: FileText,
      matchPages: ['laporan', 'riwayat'],
    },
  ];

  const isNavActive = (matchPages: AppPage[]) => matchPages.includes(currentPage);

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1B1B1B] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-slate-200 z-30">
        <div className="h-16 px-6 flex items-center border-b border-slate-100">
          <button
            type="button"
            onClick={() => onNavigate('beranda')}
            className="font-display text-lg font-extrabold tracking-tight text-[#1B1B1B] whitespace-nowrap"
          >
            HUMALYSIS<span className="text-[#315CF5]">.AI</span>
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
          <button
            type="button"
            onClick={onNewCampaign}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#274cd1] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Evaluasi</span>
          </button>

          <nav className="space-y-1" aria-label="Navigasi Utama">
            <p className="px-3 pb-1 text-xs font-medium text-slate-400">Menu Utama</p>
            <button
              type="button"
              onClick={() => onNavigate('beranda')}
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                currentPage === 'beranda'
                  ? 'bg-[#315CF5]/10 text-[#315CF5] font-semibold'
                  : 'text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B]'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Beranda</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('kampanye')}
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                currentPage === 'kampanye' || currentPage === 'form-kampanye'
                  ? 'bg-[#315CF5]/10 text-[#315CF5] font-semibold'
                  : 'text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B]'
              }`}
            >
              <FolderKanban className="w-4 h-4 shrink-0" />
              <span>Kampanye</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onNavigate(activeCampaign ? 'perbandingan' : 'kampanye')
              }
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                ['perbandingan', 'analisis', 'rekomendasi'].includes(currentPage)
                  ? 'bg-[#315CF5]/10 text-[#315CF5] font-semibold'
                  : 'text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B]'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Analisis</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('riwayat')}
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                currentPage === 'riwayat'
                  ? 'bg-[#315CF5]/10 text-[#315CF5] font-semibold'
                  : 'text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B]'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Riwayat Laporan</span>
            </button>
          </nav>

          {activeCampaign && (
            <div className="pt-4 border-t border-slate-100 space-y-1">
              <p className="px-3 pb-1 text-xs font-medium text-slate-400">
                Kampanye Aktif
              </p>
              <div className="px-3 py-2 rounded-xl bg-[#F4F5F7]">
                <p className="text-xs font-semibold text-[#1B1B1B] truncate">
                  {activeCampaign.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Langkah {activeCampaign.currentStep} dari 7
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('peta-langkah')}
                className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  currentPage === 'peta-langkah'
                    ? 'bg-[#1B1B1B] text-white'
                    : 'text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B]'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 shrink-0" />
                <span>Peta 7 Langkah</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('data-evaluasi')}
                className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  currentPage === 'data-evaluasi'
                    ? 'bg-[#1B1B1B] text-white'
                    : 'text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B]'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                <span>Data Output–Outcomes</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('laporan')}
                className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                  currentPage === 'laporan'
                    ? 'bg-[#1B1B1B] text-white'
                    : 'text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Laporan Akhir</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onNavigate('profil')}
            className={`w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center gap-3 text-left transition-colors ${
              currentPage === 'profil'
                ? 'bg-[#315CF5]/10 text-[#315CF5]'
                : 'hover:bg-[#F4F5F7]'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#1B1B1B] text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1B1B1B] truncate">
                {profile.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{profile.role}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Compact Sticky Top Bar (<=56px for mobile sticky cap) */}
        <header className="no-print sticky top-0 z-20 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {isWorkflowPage ? (
              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    currentPage === 'peta-langkah' ? 'kampanye' : 'peta-langkah'
                  )
                }
                aria-label="Kembali"
                className="min-h-[40px] min-w-[40px] -ml-2 flex items-center justify-center rounded-lg text-slate-600 hover:bg-[#F4F5F7] hover:text-[#1B1B1B] transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('beranda')}
                className="lg:hidden font-display text-base font-extrabold tracking-tight text-[#1B1B1B] whitespace-nowrap shrink-0"
              >
                HUMALYSIS<span className="text-[#315CF5]">.AI</span>
              </button>
            )}
            <div className="hidden lg:flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400">HUMALYSIS.AI</span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-[#1B1B1B] truncate">
                {PAGE_TITLES[currentPage]}
              </span>
              {activeCampaign && isWorkflowPage && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-600 truncate max-w-xs">
                    {activeCampaign.name}
                  </span>
                </>
              )}
            </div>
            {isWorkflowPage && (
              <span className="lg:hidden text-sm font-semibold text-[#1B1B1B] truncate">
                {PAGE_TITLES[currentPage]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeCampaign && isWorkflowPage && (
              <button
                type="button"
                onClick={() => onNavigate('peta-langkah')}
                className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-[#1B1B1B] hover:bg-[#F4F5F7] transition-colors whitespace-nowrap hidden sm:flex items-center gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#315CF5]" />
                <span>Peta Langkah</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('profil')}
              aria-label="Pengaturan Profil"
              className="lg:hidden min-h-[40px] min-w-[40px] rounded-full bg-[#F4F5F7] text-[#1B1B1B] flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNewCampaign}
              className="hidden sm:flex lg:hidden min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#315CF5] text-white text-xs font-semibold items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Evaluasi Baru</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (4 tabs, height 60px <= 15% cap with top bar) */}
      <nav
        aria-label="Navigasi Bawah"
        className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-30 h-15 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-4 items-center px-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item.matchPages);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
                active ? 'text-[#315CF5]' : 'text-slate-500 hover:text-[#1B1B1B]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[11px] tracking-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
