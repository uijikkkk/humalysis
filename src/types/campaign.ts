export type KpiCategory = 'output' | 'outtakes' | 'outcomes';

export type KpiDirection = 'higher_better' | 'lower_better';

export type KpiStatus = 'tercapai' | 'belum_tercapai' | 'perlu_data';

export type WorkflowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type AppPage =
  | 'splash'
  | 'beranda'
  | 'kampanye'
  | 'form-kampanye'
  | 'peta-langkah'
  | 'data-evaluasi'
  | 'validasi'
  | 'perbandingan'
  | 'analisis'
  | 'rekomendasi'
  | 'laporan'
  | 'riwayat'
  | 'profil';

export interface KpiIndicator {
  id: string;
  category: KpiCategory;
  name: string;
  target: number;
  actual: number | null;
  unit: string;
  direction: KpiDirection;
  source: string;
  notes: string;
}

export interface StrategicAction {
  id: string;
  pillar: KpiCategory | 'umum';
  title: string;
  description: string;
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  timeline: 'Segera' | 'Bulan Depan' | 'Kampanye Berikutnya';
  completed: boolean;
  isCustom?: boolean;
}

export interface Campaign {
  id: string;
  isDemo?: boolean;
  name: string;
  client: string;
  campaignGoal: string;
  communicationGoal: string;
  targetAudience: string;
  period: string;
  currentStep: WorkflowStep;
  kpis: KpiIndicator[];
  decisionOverride: 'tercapai' | 'belum_tercapai' | null;
  customSummaryNote: string;
  strategicActions: StrategicAction[];
  createdAt: string;
  updatedAt: string;
}

export interface EvaluatedKpi extends KpiIndicator {
  percentage: number | null;
  status: KpiStatus;
  gapText: string;
}

export interface CategorySummary {
  category: KpiCategory;
  label: string;
  total: number;
  achieved: number;
  notAchieved: number;
  needsData: number;
  avgPercentage: number;
  status: KpiStatus;
  items: EvaluatedKpi[];
}

export interface CampaignSummary {
  categories: Record<KpiCategory, CategorySummary>;
  totalKpis: number;
  achievedCount: number;
  notAchievedCount: number;
  needsDataCount: number;
  overallAchievementPct: number;
  isAllTargetsMet: boolean;
  hasPartialSuccessOnly: boolean;
  evaluatedKpis: EvaluatedKpi[];
}

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning';
  fieldLabel: string;
  message: string;
  category?: KpiCategory;
}

export interface ValidationResult {
  isValid: boolean;
  hasWarningsOnly: boolean;
  issues: ValidationIssue[];
  missingCategories: KpiCategory[];
}

export interface AnalysisPoint {
  title: string;
  detail: string;
  evidence?: string;
}

export interface CampaignAnalysisResult {
  branch: 'tercapai' | 'tidak_tercapai';
  headlineVerdict: string;
  dataFacts: string[];
  achievedHighlights: AnalysisPoint[];
  unachievedGaps: AnalysisPoint[];
  analyticalInterpretations: AnalysisPoint[];
  successFactorsOrRootCauses: AnalysisPoint[];
  communicationWeaknessesOrBestTactics: AnalysisPoint[];
  dataLimitations: string[];
  recommendedActions: StrategicAction[];
  executiveConclusion: string;
}

export interface SavedReport {
  id: string;
  campaignId: string;
  campaignName: string;
  client: string;
  period: string;
  generatedAt: string;
  overallAchievementPct: number;
  achievedCount: number;
  totalCount: number;
  isCampaignSuccess: boolean;
  summaryConclusion: string;
  snapshot: {
    campaign: Campaign;
    summary: CampaignSummary;
    analysis: CampaignAnalysisResult;
  };
}

export interface UserProfile {
  name: string;
  role: string;
  organization: string;
  email: string;
  defaultUnitNote: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}
