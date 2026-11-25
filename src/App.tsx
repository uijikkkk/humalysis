import { useCallback, useEffect, useState } from 'react';
import { AnalysisView } from './components/AnalysisView';
import { AppShell } from './components/AppShell';
import { CampaignFormView } from './components/CampaignFormView';
import { CampaignListView } from './components/CampaignListView';
import { ComparisonView } from './components/ComparisonView';
import { DashboardView } from './components/DashboardView';
import { DataCollectionView } from './components/DataCollectionView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { RecommendationsView } from './components/RecommendationsView';
import { ReportView } from './components/ReportView';
import { SplashView } from './components/SplashView';
import { StepMapView } from './components/StepMapView';
import { ToastNotification } from './components/ToastNotification';
import { ValidationView } from './components/ValidationView';
import {
  AppPage,
  Campaign,
  KpiCategory,
  KpiIndicator,
  SavedReport,
  ToastMessage,
  UserProfile,
  WorkflowStep,
} from './types/campaign';
import {
  analyzeCampaign,
  summarizeCampaign,
  validateCampaignData,
} from './utils/evaluationEngine';
import {
  hasEnteredWorkspace,
  loadCampaigns,
  loadSavedReports,
  loadUserProfile,
  markWorkspaceEntered,
  resetAllDemoData,
  saveCampaigns,
  saveSavedReports,
  saveUserProfile,
} from './utils/storage';

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadCampaigns());
  const [savedReports, setSavedReports] = useState<SavedReport[]>(() =>
    loadSavedReports()
  );
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [currentPage, setCurrentPage] = useState<AppPage>(() =>
    hasEnteredWorkspace() ? 'beranda' : 'splash'
  );
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(() => {
    const initial = loadCampaigns();
    return initial[0]?.id ?? null;
  });
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [dataCategoryFocus, setDataCategoryFocus] = useState<KpiCategory>('output');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    saveCampaigns(campaigns);
  }, [campaigns]);

  useEffect(() => {
    saveSavedReports(savedReports);
  }, [savedReports]);

  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  const notify = useCallback(
    (
      type: ToastMessage['type'],
      title: string,
      description?: string
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, type, title, description }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) ?? campaigns[0] ?? null;

  const updateCampaignById = useCallback(
    (id: string, patch: Partial<Campaign>) => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...patch, updatedAt: new Date().toISOString() }
            : c
        )
      );
    },
    []
  );

  const handleNavigate = (page: AppPage) => {
    if (
      [
        'peta-langkah',
        'data-evaluasi',
        'validasi',
        'perbandingan',
        'analisis',
        'rekomendasi',
        'laporan',
      ].includes(page) &&
      !activeCampaign
    ) {
      notify('info', 'Pilih atau buat kampanye terlebih dahulu');
      setCurrentPage('kampanye');
      return;
    }

    if (
      activeCampaign &&
      ['perbandingan', 'analisis', 'rekomendasi', 'laporan'].includes(page)
    ) {
      const validation = validateCampaignData(activeCampaign);
      if (!validation.isValid) {
        notify(
          'warning',
          'Data belum lengkap untuk dievaluasi',
          'Lengkapi data pada tahap validasi terlebih dahulu.'
        );
        setCurrentPage('validasi');
        return;
      }
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterDashboard = () => {
    markWorkspaceEntered(true);
    setCurrentPage('beranda');
  };

  const handleCreateNew = () => {
    markWorkspaceEntered(true);
    setEditingCampaignId(null);
    setCurrentPage('form-kampanye');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCampaign = (campaignId: string, page: AppPage = 'peta-langkah') => {
    setActiveCampaignId(campaignId);
    const target = campaigns.find((c) => c.id === campaignId);
    if (
      target &&
      ['perbandingan', 'analisis', 'rekomendasi', 'laporan'].includes(page)
    ) {
      const validation = validateCampaignData(target);
      if (!validation.isValid) {
        notify(
          'warning',
          'Validasi data diperlukan',
          'Lengkapi data kampanye sebelum membuka hasil evaluasi.'
        );
        setCurrentPage('validasi');
        return;
      }
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditCampaign = (campaignId: string) => {
    setActiveCampaignId(campaignId);
    setEditingCampaignId(campaignId);
    setCurrentPage('form-kampanye');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateCampaign = (campaignId: string) => {
    const src = campaigns.find((c) => c.id === campaignId);
    if (!src) return;
    const now = new Date().toISOString();
    const copy: Campaign = {
      ...src,
      id: `cmp-${Date.now()}`,
      isDemo: false,
      name: `${src.name} (Salinan)`,
      kpis: src.kpis.map((k, idx) => ({
        ...k,
        id: `kpi-${Date.now()}-${idx}`,
      })),
      createdAt: now,
      updatedAt: now,
    };
    setCampaigns((prev) => [copy, ...prev]);
    setActiveCampaignId(copy.id);
    notify('success', 'Kampanye diduplikasi', copy.name);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    const target = campaigns.find((c) => c.id === campaignId);
    const remaining = campaigns.filter((c) => c.id !== campaignId);
    setCampaigns(remaining);
    if (activeCampaignId === campaignId) {
      setActiveCampaignId(remaining[0]?.id ?? null);
    }
    notify('info', 'Kampanye dihapus', target?.name);
  };

  const handleSaveCampaignForm = (saved: Campaign, goToNextStep: boolean) => {
    const exists = campaigns.some((c) => c.id === saved.id);
    if (exists) {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === saved.id ? saved : c))
      );
      notify('success', 'Data kampanye diperbarui', saved.name);
    } else {
      setCampaigns((prev) => [saved, ...prev]);
      notify('success', 'Kampanye baru dibuat', saved.name);
    }

    setActiveCampaignId(saved.id);
    setEditingCampaignId(null);

    if (goToNextStep) {
      setDataCategoryFocus('output');
      setCurrentPage('data-evaluasi');
    } else {
      setCurrentPage('peta-langkah');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepNavigation = (step: WorkflowStep, page: AppPage) => {
    if (!activeCampaign) return;
    if (step === 1) {
      setEditingCampaignId(activeCampaign.id);
      setCurrentPage('form-kampanye');
      return;
    }

    if (step >= 4) {
      const validation = validateCampaignData(activeCampaign);
      if (!validation.isValid) {
        notify(
          'warning',
          'Data belum lengkap',
          'Selesaikan validasi data pada Langkah 3 sebelum melanjutkan.'
        );
        updateCampaignById(activeCampaign.id, { currentStep: 3 });
        setCurrentPage('validasi');
        return;
      }
    }

    updateCampaignById(activeCampaign.id, {
      currentStep: Math.max(activeCampaign.currentStep, step) as WorkflowStep,
    });
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveReportToHistory = () => {
    if (!activeCampaign) return;
    const summary = summarizeCampaign(activeCampaign);
    const analysis = analyzeCampaign(activeCampaign);
    const newReport: SavedReport = {
      id: `rep-${Date.now()}`,
      campaignId: activeCampaign.id,
      campaignName: activeCampaign.name,
      client: activeCampaign.client,
      period: activeCampaign.period,
      generatedAt: new Date().toISOString(),
      overallAchievementPct: summary.overallAchievementPct,
      achievedCount: summary.achievedCount,
      totalCount: summary.totalKpis,
      isCampaignSuccess: summary.isAllTargetsMet,
      summaryConclusion: analysis.executiveConclusion,
      snapshot: {
        campaign: activeCampaign,
        summary,
        analysis,
      },
    };
    setSavedReports((prev) => [newReport, ...prev]);
    updateCampaignById(activeCampaign.id, { currentStep: 7 });
    notify(
      'success',
      'Laporan disimpan ke riwayat',
      'Anda dapat membuka atau mengunduh ulang PDF kapan saja di menu Laporan.'
    );
  };

  if (currentPage === 'splash') {
    return (
      <>
        <SplashView
          onEnterDashboard={handleEnterDashboard}
          onStartNewCampaign={handleCreateNew}
          demoCount={campaigns.filter((c) => c.isDemo).length}
        />
        <ToastNotification toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const editingCampaign = editingCampaignId
    ? campaigns.find((c) => c.id === editingCampaignId) ?? null
    : null;

  return (
    <>
      <AppShell
        currentPage={currentPage}
        onNavigate={handleNavigate}
        activeCampaign={activeCampaign}
        profile={profile}
        onNewCampaign={handleCreateNew}
      >
        {currentPage === 'beranda' && (
          <DashboardView
            profile={profile}
            campaigns={campaigns}
            savedReports={savedReports}
            onCreateNew={handleCreateNew}
            onOpenCampaign={handleOpenCampaign}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'kampanye' && (
          <CampaignListView
            campaigns={campaigns}
            onCreateNew={handleCreateNew}
            onOpenCampaign={handleOpenCampaign}
            onEditCampaign={handleEditCampaign}
            onDuplicateCampaign={handleDuplicateCampaign}
            onDeleteCampaign={handleDeleteCampaign}
          />
        )}

        {currentPage === 'form-kampanye' && (
          <CampaignFormView
            existingCampaign={editingCampaign}
            onSave={handleSaveCampaignForm}
            onCancel={() =>
              setCurrentPage(activeCampaign ? 'kampanye' : 'beranda')
            }
          />
        )}

        {currentPage === 'peta-langkah' && activeCampaign && (
          <StepMapView
            campaign={activeCampaign}
            onGoToStep={handleStepNavigation}
          />
        )}

        {currentPage === 'data-evaluasi' && activeCampaign && (
          <DataCollectionView
            campaign={activeCampaign}
            initialCategory={dataCategoryFocus}
            onUpdateKpis={(kpis: KpiIndicator[]) =>
              updateCampaignById(activeCampaign.id, { kpis })
            }
            onNotify={notify}
            onBack={() => setCurrentPage('peta-langkah')}
            onNextToValidation={() => {
              updateCampaignById(activeCampaign.id, {
                currentStep: Math.max(activeCampaign.currentStep, 3) as WorkflowStep,
              });
              setCurrentPage('validasi');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'validasi' && activeCampaign && (
          <ValidationView
            campaign={activeCampaign}
            onFixCategory={(cat) => {
              setDataCategoryFocus(cat ?? 'output');
              setCurrentPage('data-evaluasi');
            }}
            onEditIdentity={() => {
              setEditingCampaignId(activeCampaign.id);
              setCurrentPage('form-kampanye');
            }}
            onProceedToComparison={() => {
              updateCampaignById(activeCampaign.id, {
                currentStep: Math.max(activeCampaign.currentStep, 4) as WorkflowStep,
              });
              notify(
                'success',
                'Data tervalidasi',
                'Melanjutkan ke tahap perbandingan KPI.'
              );
              setCurrentPage('perbandingan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'perbandingan' && activeCampaign && (
          <ComparisonView
            campaign={activeCampaign}
            onSelectDecision={(decision) => {
              updateCampaignById(activeCampaign.id, { decisionOverride: decision });
              notify(
                'info',
                decision === 'tercapai'
                  ? 'Jalur evaluasi: Target Tercapai'
                  : 'Jalur evaluasi: Target Belum Tercapai'
              );
            }}
            onBack={() => setCurrentPage('validasi')}
            onContinueToAnalysis={() => {
              updateCampaignById(activeCampaign.id, {
                currentStep: Math.max(activeCampaign.currentStep, 5) as WorkflowStep,
              });
              setCurrentPage('analisis');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'analisis' && activeCampaign && (
          <AnalysisView
            campaign={activeCampaign}
            onBack={() => setCurrentPage('perbandingan')}
            onProceedToRecommendations={() => {
              updateCampaignById(activeCampaign.id, {
                currentStep: Math.max(activeCampaign.currentStep, 6) as WorkflowStep,
              });
              setCurrentPage('rekomendasi');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'rekomendasi' && activeCampaign && (
          <RecommendationsView
            campaign={activeCampaign}
            onUpdateCampaign={(patch) =>
              updateCampaignById(activeCampaign.id, patch)
            }
            onNotify={notify}
            onBack={() => setCurrentPage('analisis')}
            onProceedToReport={() => {
              updateCampaignById(activeCampaign.id, { currentStep: 7 });
              setCurrentPage('laporan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'laporan' && activeCampaign && (
          <ReportView
            campaign={activeCampaign}
            profile={profile}
            onSaveReportToHistory={handleSaveReportToHistory}
            onBack={() => setCurrentPage('rekomendasi')}
            onNotify={notify}
          />
        )}

        {currentPage === 'riwayat' && (
          <HistoryView
            reports={savedReports}
            onDeleteReport={(id) => {
              setSavedReports((prev) => prev.filter((r) => r.id !== id));
              notify('info', 'Laporan dihapus dari riwayat');
            }}
            onOpenCampaignReport={(campaignId) => {
              const found = campaigns.find((c) => c.id === campaignId);
              if (found) {
                handleOpenCampaign(found.id, 'laporan');
              } else {
                notify(
                  'warning',
                  'Kampanye asal sudah dihapus',
                  'Anda tetap dapat melihat pratinjau atau mengunduh PDF dari riwayat.'
                );
              }
            }}
            onNotify={notify}
          />
        )}

        {currentPage === 'profil' && (
          <ProfileView
            profile={profile}
            campaigns={campaigns}
            reports={savedReports}
            onSaveProfile={setProfile}
            onResetDemo={() => {
              const reset = resetAllDemoData();
              setCampaigns(reset.campaigns);
              setSavedReports(reset.reports);
              setProfile(reset.profile);
              setActiveCampaignId(reset.campaigns[0]?.id ?? null);
            }}
            onNotify={notify}
          />
        )}
      </AppShell>

      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
