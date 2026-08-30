import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Building2,
  FileDown,
  CalendarDays,
  Activity,
  Layers,
  Clock,
  Sparkles,
  Link2,
  Stethoscope,
  ChevronRight,
  Download,
  FileText,
  AlertOctagon,
  Check,
  Eye,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { Company, AssessmentCampaign, DimensionResult, RiskInventoryItem, ActionPlanItem } from '../types';
import { COPSOQ_DIMENSIONS, calculateDimensionScore, COPSOQ_SHORT_QUESTIONS } from '../data/copsoqQuestions';
import { StorageService } from '../services/storageService';
import { generateNR1CompliancePDF } from '../services/pdfService';

interface DashboardViewProps {
  company: Company;
  companies?: Company[];
  onSelectCompany?: (companyId: string) => void;
  campaigns: AssessmentCampaign[];
  onNavigateToTab: (tab: string) => void;
  onOpenAnonymousSurvey: (token?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  companies = [],
  onSelectCompany,
  campaigns,
  onNavigateToTab,
  onOpenAnonymousSurvey,
}) => {
  const isAllCompanies = company.id === 'all';
  const companyCampaigns = isAllCompanies ? campaigns : campaigns.filter((c) => c.companyId === company.id);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [selectedRiskCell, setSelectedRiskCell] = useState<{ prob: number; sev: number } | null>(null);

  const currentCampaign =
    selectedCampaignId !== 'all'
      ? campaigns.find((c) => c.id === selectedCampaignId) || companyCampaigns[0]
      : companyCampaigns[0] || campaigns[0];

  const allResponses =
    selectedCampaignId === 'all'
      ? (isAllCompanies
          ? StorageService.getResponses()
          : StorageService.getResponses().filter((r) => r.companyId === company.id))
      : StorageService.getResponses(selectedCampaignId);

  const filteredResponses =
    filterSector === 'all'
      ? allResponses
      : allResponses.filter((r) => r.sectorId === filterSector);

  const riskInventory =
    selectedCampaignId === 'all'
      ? (isAllCompanies
          ? StorageService.getRiskInventory()
          : StorageService.getRiskInventory().filter((r) => r.companyId === company.id))
      : StorageService.getRiskInventory(selectedCampaignId);

  const actionPlans =
    selectedCampaignId === 'all'
      ? (isAllCompanies
          ? StorageService.getActionPlans()
          : StorageService.getActionPlans().filter((a) => a.companyId === company.id))
      : StorageService.getActionPlans(selectedCampaignId);

  const techProfile = StorageService.getTechnicalProfile();

  const availableSectors = isAllCompanies
    ? companies.flatMap((c) => c.sectors.map((s) => ({ ...s, companyName: c.tradeName })))
    : company.sectors.map((s) => ({ ...s, companyName: company.tradeName }));

  const totalEmployeesCount = isAllCompanies
    ? companies.reduce((acc, c) => acc + (c.totalEmployees || 0), 0)
    : company.totalEmployees;

  const totalSampleGoal = isAllCompanies
    ? (selectedCampaignId === 'all' ? Math.max(550, totalEmployeesCount) : (currentCampaign?.sampleGoal || 550))
    : (selectedCampaignId === 'all' ? (company.totalEmployees || 550) : (currentCampaign?.sampleGoal || 550));

  // Dimensões COPSOQ II
  const dimensionResults: DimensionResult[] = Object.keys(COPSOQ_DIMENSIONS).map((code) => {
    const dim = COPSOQ_DIMENSIONS[code];
    const calc = calculateDimensionScore(
      code,
      filteredResponses.map((r) => r.answers),
      COPSOQ_SHORT_QUESTIONS
    );
    return {
      code,
      title: dim.title,
      category: dim.category,
      score: calc.score,
      tercil: calc.tercil,
      isFavorableHigh: dim.isFavorableHigh,
      nationalBenchmark: dim.nationalBenchmark,
      deltaFromBenchmark: calc.delta,
      questionIds: [],
      riskFactorDescription: dim.riskFactorDescription,
      possibleConsequences: dim.possibleConsequences,
    };
  });

  const favorableCount = dimensionResults.filter((d) => d.tercil === 'favorable').length;
  const intermediateCount = dimensionResults.filter((d) => d.tercil === 'intermediate').length;
  const riskCount = dimensionResults.filter((d) => d.tercil === 'risk').length;
  const totalDims = dimensionResults.length;

  const favorablePercentage = totalDims > 0 ? Math.round((favorableCount / totalDims) * 100) : 52;
  const unfavorablePercentage = 100 - favorablePercentage;

  // Contagens do Fluxo de Ações
  const pendingApprovalCount = actionPlans.filter(
    (a) => a.approvalStatus === 'suggested' || a.approvalStatus === 'pending_management' || a.approvalStatus === 'pending_technical' || !a.approvalStatus
  ).length;
  const inExecutionCount = actionPlans.filter((a) => a.status === 'Em Andamento').length;
  const inTechValidationCount = actionPlans.filter((a) => a.approvalStatus === 'pending_technical' || a.status === 'Em Revisão').length;
  const completedCount = actionPlans.filter((a) => a.status === 'Concluído').length;

  // Total de ações atrasadas (comparando whenDate com hoje)
  const overdueCount = actionPlans.filter((a) => {
    if (!a.whenDate || a.status === 'Concluído') return false;
    return new Date(a.whenDate) < new Date();
  }).length;

  // Investimento total e executado (parseando costEstimate que pode ser string como 'R$ 15.000' ou número)
  const parseCost = (costStr?: string): number => {
    if (!costStr) return 0;
    const num = parseFloat(costStr.replace(/[^\d,.-]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const totalInvestment = actionPlans.reduce((sum, a) => sum + parseCost(a.costEstimate), 0);
  const executedInvestment = actionPlans
    .filter((a) => a.status === 'Concluído' || a.status === 'Em Andamento')
    .reduce((sum, a) => {
      const cost = parseCost(a.costEstimate);
      return sum + (a.status === 'Concluído' ? cost : cost * 0.4);
    }, 0);
  const investmentExecutionPct = totalInvestment > 0 ? Math.min(100, Math.round((executedInvestment / totalInvestment) * 100)) : 0;

  // Total de perigos críticos (Matriz de risco >= 15 ou tercil de risco)
  const criticalRiskInventoryCount = riskInventory.filter((r) => (r.probability * r.severity) >= 15 || r.riskLevel === 'MUITO ALTO').length || riskCount;

  // Total de GHEs / postos mapeados
  const totalGheCount = isAllCompanies ? 7 : Math.max(1, availableSectors.length * 2);

  // Campanhas por status
  const inProgressCampaignsCount = companyCampaigns.filter((c) => c.status === 'Em Andamento' || c.status === 'in_progress').length;
  const completedCampaignsCount = companyCampaigns.filter((c) => c.status === 'Concluído' || c.status === 'completed').length;
  const plannedCampaignsCount = companyCampaigns.filter((c) => c.status === 'Planejada' || c.status === 'draft').length;

  // Ações de alta prioridade / críticas para exibição dinâmica
  const priorityActionItems = actionPlans.length > 0
    ? actionPlans.slice(0, 3).map((a) => {
        const sector = availableSectors.find((s) => s.id === a.sectorId);
        return {
          id: a.id,
          actionTitle: a.what,
          sectorName: sector?.name || a.where || 'Geral',
          gheName: a.where || 'Postos Operacionais',
          responsible: a.who,
        };
      })
    : [
        {
          id: 'act-sample-1',
          actionTitle: 'Treinamento de Liderança Empática e Gestão de Metas',
          sectorName: availableSectors[0]?.name || 'Operações e Logística',
          gheName: 'GHE-01',
          responsible: 'RH & Lideranças',
        },
        {
          id: 'act-sample-2',
          actionTitle: 'Adequação do Sistema de Escalas e Turnos',
          sectorName: availableSectors[1]?.name || availableSectors[0]?.name || 'Atendimento / Operacional',
          gheName: 'GHE-02',
          responsible: 'Coordenação Operacional',
        },
      ];

  // Radar Data
  const radarDimensionsCodes = [
    'EXIG_QUANT',
    'EXIG_EMOC',
    'INFLUENCIA',
    'TRANSPARENCIA_PAPEL',
    'APOIO_SUPERIORES',
    'SATISFACAO_TRAB',
    'BURNOUT_ESTRESSE',
    'COMPORTAMENTOS_OFENSIVOS',
  ];

  const radarData = radarDimensionsCodes.map((code) => {
    const dim = dimensionResults.find((d) => d.code === code);
    return {
      subject: dim ? dim.title.split(' ')[0] + ' ' + (dim.title.split(' ')[1] || '') : code,
      fullTitle: dim?.title || '',
      Escore: dim ? Number(dim.score.toFixed(2)) : 0,
      Benchmark: dim ? dim.nationalBenchmark : 3,
    };
  });

  const handleDownloadPDF = () => {
    if (currentCampaign) {
      generateNR1CompliancePDF(company, currentCampaign, techProfile);
    } else if (campaigns.length > 0) {
      generateNR1CompliancePDF(company, campaigns[0], techProfile);
    }
  };

  // Cobertura amostral real ou padrão 36%
  const coveragePercent = allResponses.length > 0
    ? Math.min(100, Math.round((allResponses.length / Math.max(1, totalSampleGoal)) * 100))
    : 36;

  return (
    <div className="space-y-6 pb-12 w-full animate-fade-in">
      {/* 1. TOP HERO STATUS BANNER (Dark Navy Executive Card) */}
      <div className="bg-[#0b1b36] rounded-2xl p-6 lg:p-8 text-white border border-[#1b345f] shadow-xl relative overflow-hidden">
        {/* Subtle decorative background gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ciclo GRO / NR-01 vigente</span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Inventário de Riscos Psicossociais em conformidade
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-300 leading-relaxed">
              Programa de Gerenciamento de Riscos atualizado com metodologia COPSOQ II. Inventário válido até{' '}
              <strong className="text-white font-semibold">12/03/2027</strong> · revisão bienal obrigatória conforme Portaria MTE nº 1.419/2024.
            </p>

            {/* Progress Bar: Cobertura de colaboradores avaliados */}
            <div className="pt-2 max-w-xl">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>Cobertura de colaboradores avaliados</span>
                <span className="font-bold text-white">{coveragePercent}%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-700 shadow-sm shadow-cyan-500/50"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              id="export-pgr-consolidated-btn"
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition shadow-md hover:scale-[1.02]"
              title="Gerar e Baixar Laudo PGR Consolidado em PDF"
            >
              <Download className="w-4 h-4 text-slate-800" />
              <span>Exportar PGR consolidado (PDF)</span>
            </button>

            <button
              onClick={() => onNavigateToTab('assessments')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#14284b] hover:bg-[#1a3461] border border-blue-400/30 text-white text-xs font-semibold transition"
              title="Ver e Gerenciar Diagnósticos COPSOQ II"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Ver diagnósticos ativos</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE BENTO METRICS GRID (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Empresas & Unidades */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                {isAllCompanies ? 'Empresas & Unidades' : 'Empresa & Planta'}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isAllCompanies ? companies.length : 1}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate" title={isAllCompanies ? `${companies.length} plantas ativas monitoradas` : company.tradeName}>
              {isAllCompanies ? `${companies.length} empresas monitoradas` : company.tradeName}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Setores mapeados</span>
              <span className="font-bold text-slate-800">{availableSectors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">GHE cadastrados</span>
              <span className="font-bold text-slate-800">{totalGheCount}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Colaboradores */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Colaboradores</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {totalEmployeesCount}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Adesão amostral de {coveragePercent}% (meta &gt; 70%)
            </p>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, coveragePercent)}%` }}
            />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Respondentes</span>
              <span className="font-bold text-slate-800">{allResponses.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Amostra-alvo</span>
              <span className="font-bold text-slate-800">{totalSampleGoal}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Ciclos de Coleta */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Ciclos de Coleta</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {companyCampaigns.length}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {companyCampaigns.length === 1 ? '1 diagnóstico COPSOQ II' : `${companyCampaigns.length} diagnósticos COPSOQ II`}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Em andamento</span>
              <span className="font-bold text-slate-800">{inProgressCampaignsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Concluídas</span>
              <span className="font-bold text-slate-800">{completedCampaignsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Planejadas</span>
              <span className="font-bold text-slate-800">{plannedCampaignsCount}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Riscos & Planos 5W2H */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Riscos & Planos 5W2H</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {actionPlans.length}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Planos ativos no inventário de riscos
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Perigos críticos</span>
              <span className="font-bold text-red-600">{criticalRiskInventoryCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ações atrasadas</span>
              <span className={`font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {overdueCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE EXECUTIVE ROW (FLUXO DAS AÇÕES PREVENTIVAS & ÍNDICE GERAL DE CLIMA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols / 2/3 width): Fluxo das Ações Preventivas */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 lg:p-7 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Fluxo das Ações Preventivas</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('action_plan')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
            >
              <span>Ver todas as ações</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Mini Metric Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Box 1: Pendentes */}
            <div
              onClick={() => onNavigateToTab('action_plan')}
              className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 cursor-pointer hover:bg-amber-100/60 transition"
            >
              <Clock className="w-4 h-4 text-amber-600 mb-2" />
              <div className="text-2xl font-black text-slate-900 leading-none">
                {pendingApprovalCount}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">Pendentes de aprovação</div>
            </div>

            {/* Box 2: Em execução */}
            <div
              onClick={() => onNavigateToTab('action_plan')}
              className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 cursor-pointer hover:bg-blue-100/60 transition"
            >
              <Activity className="w-4 h-4 text-blue-600 mb-2" />
              <div className="text-2xl font-black text-slate-900 leading-none">
                {inExecutionCount}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">Em execução</div>
            </div>

            {/* Box 3: Em validação técnica */}
            <div
              onClick={() => onNavigateToTab('action_plan')}
              className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/70 cursor-pointer hover:bg-purple-100/60 transition"
            >
              <Stethoscope className="w-4 h-4 text-purple-600 mb-2" />
              <div className="text-2xl font-black text-slate-900 leading-none">
                {inTechValidationCount}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">Em validação técnica</div>
            </div>

            {/* Box 4: Concluídas com eficácia */}
            <div
              onClick={() => onNavigateToTab('action_plan')}
              className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 cursor-pointer hover:bg-emerald-100/60 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-2" />
              <div className="text-2xl font-black text-slate-900 leading-none">
                {completedCount}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">Concluídas com eficácia</div>
            </div>
          </div>

          {/* Critical Danger Actions List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>Medidas Preventivas Prioritárias</span>
              <span className="text-red-600">Nível Crítico / Alto</span>
            </div>

            {priorityActionItems.map((action, idx) => (
              <div
                key={action.id || idx}
                onClick={() => onNavigateToTab('action_plan')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 flex items-center justify-between gap-4 cursor-pointer transition"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900">
                    {action.actionTitle}
                  </div>
                  <div className="text-xs text-slate-500">
                    {action.sectorName || 'Geral'} • {action.gheName || 'Todos os GHEs'} {action.responsible ? `• Resp: ${action.responsible}` : ''}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>Crítico</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols / 1/3 width): Índice Geral de Clima & Saúde */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 lg:p-7 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold text-slate-900">Índice Geral de Clima & Saúde</h2>
            </div>

            {/* Big % Highlight */}
            <div className="text-center pt-2">
              <div className="text-5xl font-black text-red-600 tracking-tight leading-none">
                {unfavorablePercentage}%
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">
                das dimensões avaliadas em faixa desfavorável ({riskCount + intermediateCount} de {totalDims})
              </p>
            </div>

            {/* Split Progress Bar (Favorável / Desfavorável) */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${favorablePercentage}%` }}
                />
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${unfavorablePercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-0.5">
                <span className="text-emerald-700">Favorável {favorablePercentage}%</span>
                <span className="text-red-700">Desfavorável {unfavorablePercentage}%</span>
              </div>
            </div>

            {/* Secondary Stats List */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              {/* Ações atrasadas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className={`w-4 h-4 ${overdueCount > 0 ? 'text-red-500' : 'text-slate-400'}`} />
                  <span>Ações atrasadas</span>
                </div>
                <span className={`font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {overdueCount}
                </span>
              </div>

              {/* Investimento previsto */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>Investimento previsto</span>
                </div>
                <span className="font-bold text-slate-900">
                  {totalInvestment > 0 ? `R$ ${totalInvestment.toLocaleString('pt-BR')}` : 'R$ 85.000'}
                </span>
              </div>

              {/* Execução orçamentária */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Execução orçamentária</span>
                  <span className="font-bold text-slate-800">
                    {executedInvestment > 0 ? `R$ ${Math.round(executedInvestment).toLocaleString('pt-BR')}` : 'R$ 32.000'} ({investmentExecutionPct || 38}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${investmentExecutionPct || 38}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <button
            onClick={() => onNavigateToTab('reports')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>Ver relatório de clima completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. FULL-WIDTH MATRIZ DE RISCO OCUPACIONAL GRO / NR-01 (5X5) & RADAR */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Matriz de Risco Ocupacional GRO / NR-01 (5x5)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Classificação por Severidade x Probabilidade conforme subitem 1.5.4.4.2 da NR-1
            </p>
          </div>
          <span className="text-xs text-slate-400 italic">Clique num quadrante para filtrar</span>
        </div>

        {/* 5x5 Matrix Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Matriz 5x5 Grid */}
          <div className="lg:col-span-7 space-y-2">
            <div className="text-xs font-bold text-slate-700 text-center uppercase tracking-wider mb-2">
              Probabilidade (1 a 5) →
            </div>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((sev) => (
                <div key={sev} className="flex items-center gap-2">
                  <span className="w-16 text-right text-xs font-bold text-slate-600 shrink-0">
                    Sev. {sev}
                  </span>
                  <div className="grid grid-cols-5 gap-2 flex-1">
                    {[1, 2, 3, 4, 5].map((prob) => {
                      const score = prob * sev;
                      let bg = 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300';
                      let level = 'MUITO BAIXO';

                      if (score >= 15) {
                        bg = 'bg-red-500 hover:bg-red-600 text-white border-red-600';
                        level = 'MUITO ALTO';
                      } else if (score >= 10) {
                        bg = 'bg-orange-400 hover:bg-orange-500 text-white border-orange-500';
                        level = 'ALTO';
                      } else if (score >= 6) {
                        bg = 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400';
                        level = 'MÉDIO';
                      } else if (score >= 3) {
                        bg = 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950 border-emerald-400';
                        level = 'BAIXO';
                      }

                      const isSelected =
                        selectedRiskCell?.prob === prob && selectedRiskCell?.sev === sev;

                      // Count matching items
                      const countInCell = riskInventory.filter(
                        (r) => r.probability === prob && r.severity === sev
                      ).length;

                      return (
                        <button
                          key={prob}
                          onClick={() => {
                            if (isSelected) setSelectedRiskCell(null);
                            else setSelectedRiskCell({ prob, sev });
                          }}
                          className={`h-12 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition relative ${bg} ${
                            isSelected ? 'ring-3 ring-blue-600 shadow-md scale-105 z-10' : ''
                          }`}
                          title={`Probabilidade ${prob} × Severidade ${sev} = Nível ${score} (${level})`}
                        >
                          <span className="text-xs">{score}</span>
                          {countInCell > 0 && (
                            <span className="text-[10px] bg-black/30 text-white px-1.5 rounded-full mt-0.5 leading-none">
                              {countInCell} {countInCell === 1 ? 'risco' : 'riscos'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                <span>Muito Baixo / Baixo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />
                <span>Médio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-400 border border-orange-500" />
                <span>Alto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500 border border-red-600" />
                <span>Muito Alto</span>
              </div>
            </div>
          </div>

          {/* Radar Chart COPSOQ (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">
                  Radar Comparativo COPSOQ II
                </span>
                <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                  Benchmark Nacional
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Comparativo de estressores da empresa com a média brasileira.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar
                      name="Empresa"
                      dataKey="Escore"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.45}
                    />
                    <Radar
                      name="Benchmark"
                      dataKey="Benchmark"
                      stroke="#64748b"
                      fill="#94a3b8"
                      fillOpacity={0.15}
                      strokeDasharray="4 4"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-600">
              <span className="text-slate-500">Dimensões Críticas Identificadas:</span>
              <span className="font-bold text-red-600">{riskCount} fatores em risco</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
