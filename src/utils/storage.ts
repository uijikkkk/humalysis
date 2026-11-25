import { DEMO_CAMPAIGNS, DEFAULT_USER_PROFILE } from '../data/demoData';
import { Campaign, SavedReport, UserProfile } from '../types/campaign';
import { analyzeCampaign, summarizeCampaign } from './evaluationEngine';

const KEYS = {
  CAMPAIGNS: 'humalysis_campaigns_v1',
  REPORTS: 'humalysis_reports_v1',
  PROFILE: 'humalysis_profile_v1',
  ENTERED: 'humalysis_entered_v1',
};

function createInitialDemoReports(): SavedReport[] {
  const completedDemo = DEMO_CAMPAIGNS[1];
  const summary = summarizeCampaign(completedDemo);
  const analysis = analyzeCampaign(completedDemo);

  return [
    {
      id: 'rep-demo-trans-2026',
      campaignId: completedDemo.id,
      campaignName: completedDemo.name,
      client: completedDemo.client,
      period: completedDemo.period,
      generatedAt: completedDemo.updatedAt,
      overallAchievementPct: summary.overallAchievementPct,
      achievedCount: summary.achievedCount,
      totalCount: summary.totalKpis,
      isCampaignSuccess: summary.isAllTargetsMet,
      summaryConclusion: analysis.executiveConclusion,
      snapshot: {
        campaign: completedDemo,
        summary,
        analysis,
      },
    },
  ];
}

export function loadCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(KEYS.CAMPAIGNS);
    if (!raw) {
      localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(DEMO_CAMPAIGNS));
      return DEMO_CAMPAIGNS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEMO_CAMPAIGNS;
  } catch {
    return DEMO_CAMPAIGNS;
  }
}

export function saveCampaigns(campaigns: Campaign[]): void {
  try {
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function loadSavedReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(KEYS.REPORTS);
    if (!raw) {
      const initial = createInitialDemoReports();
      localStorage.setItem(KEYS.REPORTS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : createInitialDemoReports();
  } catch {
    return createInitialDemoReports();
  }
}

export function saveSavedReports(reports: SavedReport[]): void {
  try {
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function hasEnteredWorkspace(): boolean {
  try {
    return localStorage.getItem(KEYS.ENTERED) === 'true';
  } catch {
    return false;
  }
}

export function markWorkspaceEntered(entered: boolean): void {
  try {
    localStorage.setItem(KEYS.ENTERED, entered ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

export function resetAllDemoData(): {
  campaigns: Campaign[];
  reports: SavedReport[];
  profile: UserProfile;
} {
  const reports = createInitialDemoReports();
  saveCampaigns(DEMO_CAMPAIGNS);
  saveSavedReports(reports);
  saveUserProfile(DEFAULT_USER_PROFILE);
  return {
    campaigns: DEMO_CAMPAIGNS,
    reports,
    profile: DEFAULT_USER_PROFILE,
  };
}
