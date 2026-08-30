import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Flame,
  ClipboardCheck,
  FolderArchive,
  ListTodo,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Camera,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
  Activity,
  UserCheck,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  CheckSquare,
  ArrowRight,
  Info,
  Pencil,
  Edit3,
  SlidersHorizontal,
  Search,
  User,
  CalendarDays,
  Stethoscope,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Company,
  AssessmentCampaign,
  SurveyResponse,
  ActionPlanItem,
  AssessmentEvidence,
} from '../types';
import { StorageService } from '../services/storageService';
import { ActionPlanScheduleView } from './ActionPlanScheduleView';
import {
  COPSOQ_DIMENSIONS,
  COPSOQ_SHORT_QUESTIONS,
  calculateDimensionScore,
} from '../data/copsoqQuestions';

interface AssessmentDetailViewProps {
  campaign: AssessmentCampaign;
  company: Company;
  onBack: () => void;
  onOpenAnonymousSurvey: (token?: string) => void;
  onRefreshData: () => void;
}

export const AssessmentDetailView: React.FC<AssessmentDetailViewProps> = ({
  campaign,
  company,
  onBack,
  onOpenAnonymousSurvey,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'questions' | 'evidences' | 'action_plan'>('heatmap');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [inspectResponse, setInspectResponse] = useState<SurveyResponse | null>(null);

  // Modais de Ação e Evidência
  const [showNewActionModal, setShowNewActionModal] = useState(false);
  const [showNewEvidenceModal, setShowNewEvidenceModal] = useState(false);
  const [showEditActionModal, setShowEditActionModal] = useState(false);
  const [editingActionItem, setEditingActionItem] = useState<ActionPlanItem | null>(null);
  const [editActionForm, setEditActionForm] = useState<Partial<ActionPlanItem>>({});
  const [evidenceFilterCategory, setEvidenceFilterCategory] = useState<string>('all');
  const [actionStatusFilter, setActionStatusFilter] = useState<string>('all');

  // Recupera dados sincronizados do Storage
  const allResponses = StorageService.getResponses(campaign.id);
  const filteredResponses = useMemo(() => {
    if (selectedSectorFilter === 'all') return allResponses;
    return allResponses.filter((r) => r.sectorId === selectedSectorFilter);
  }, [allResponses, selectedSectorFilter]);

  const actionPlans = StorageService.getActionPlans(campaign.id);
  const evidences = StorageService.getEvidences(campaign.id);

  // Cálculos de métricas gerais
  const sampleGoal = campaign.sampleGoal || Math.max(10, Math.round(company.totalEmployees * 0.6));
  const participationPercent = Math.min(100, Math.round((allResponses.length / sampleGoal) * 100));

  // Template do Questionário da Campanha
  const currentTemplate = useMemo(() => {
    return (
      StorageService.getQuestionnaireById(campaign.questionnaireType) ||
      StorageService.getQuestionnaires()[0]
    );
  }, [campaign.questionnaireType]);

  // Questões do instrumento da campanha (COPSOQ Oficial ou Customizado)
  const questions = useMemo(() => {
    if (currentTemplate?.questions && currentTemplate.questions.length > 0) {
      return currentTemplate.questions;
    }
    return COPSOQ_SHORT_QUESTIONS;
  }, [currentTemplate]);

  // Cálculo das Dimensões do Instrumento
  const dimensionResults = useMemo(() => {
    const answersList = filteredResponses.map((r) => r.answers);

    if (currentTemplate?.dimensions && currentTemplate.dimensions.length > 0) {
      return currentTemplate.dimensions.map((dim) => {
        const relatedQuestions = questions.filter(
          (q) =>
            q.dimensionCode === dim.code ||
            (q.dimensionTitle && q.dimensionTitle.toLowerCase() === dim.title.toLowerCase())
        );

        let totalScore = 0;
        let count = 0;
        for (const resp of answersList) {
          for (const q of relatedQuestions) {
            const rawVal = resp[q.id];
            if (rawVal !== undefined && rawVal !== null) {
              let val = 3;
              if (typeof rawVal === 'number') {
                val = rawVal;
              } else if (rawVal === true || rawVal === 'true' || rawVal === 'sim' || rawVal === 'Sim') {
                val = 5;
              } else if (rawVal === false || rawVal === 'false' || rawVal === 'nao' || rawVal === 'não' || rawVal === 'Não') {
                val = 1;
              }
              if (q.inverted) {
                val = 6 - val;
              }
              totalScore += val;
              count++;
            }
          }
        }

        const benchmark = dim.nationalBenchmark || 3.0;
        const score = count > 0 ? Number((totalScore / count).toFixed(2)) : benchmark;
        const delta = Number((score - benchmark).toFixed(2));

        let tercil: 'favorable' | 'intermediate' | 'risk' = 'intermediate';
        if (dim.isFavorableHigh) {
          if (score >= 3.67) tercil = 'favorable';
          else if (score >= 2.33) tercil = 'intermediate';
          else tercil = 'risk';
        } else {
          if (dim.code === 'COMPORTAMENTOS_OFENSIVOS') {
            if (score <= 1.3) tercil = 'favorable';
            else if (score <= 2.0) tercil = 'intermediate';
            else tercil = 'risk';
          } else {
            if (score <= 2.33) tercil = 'favorable';
            else if (score < 3.67) tercil = 'intermediate';
            else tercil = 'risk';
          }
        }

        return {
          code: dim.code,
          title: dim.title,
          category: dim.category || 'FATORES PSICOSSOCIAIS',
          score,
          tercil,
          benchmark,
          delta,
          isFavorableHigh: dim.isFavorableHigh,
          riskFactorDescription: dim.riskFactorDescription || 'Fator avaliado no instrumento psicométrico.',
          possibleConsequences: dim.possibleConsequences || ['Estresse', 'Fadiga mental'],
          recommendedMitigations: dim.recommendedActions || ['Aprimoramento das rotinas e escuta ativa'],
          nr1Category: dim.nr1Category || 'Organização do Trabalho',
        };
      });
    }

    return Object.entries(COPSOQ_DIMENSIONS).map(([dimCode, meta]) => {
      const res = calculateDimensionScore(dimCode, answersList, questions);
      return {
        ...meta,
        ...res,
      };
    });
  }, [filteredResponses, currentTemplate, questions]);

  // Contagem de risco
  const criticalDimensionsCount = dimensionResults.filter((d) => d.tercil === 'risk').length;
  const intermediateDimensionsCount = dimensionResults.filter((d) => d.tercil === 'intermediate').length;
  const favorableDimensionsCount = dimensionResults.filter((d) => d.tercil === 'favorable').length;

  const overallRiskStatus =
    criticalDimensionsCount >= 3
      ? { label: 'Crítico', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-600' }
      : criticalDimensionsCount >= 1 || intermediateDimensionsCount >= 6
      ? { label: 'Moderado', color: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' }
      : { label: 'Controlado', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };

  // Separação de Ações: Pendentes de Aprovação vs Homologadas no PGR
  const pendingActions = actionPlans.filter(
    (a) =>
      a.approvalStatus === 'suggested' ||
      a.approvalStatus === 'pending_technical' ||
      a.approvalStatus === 'pending_management' ||
      (a.source === 'automatic_diagnosis' && !a.approvalStatus)
  );
  const approvedActions = actionPlans.filter((a) => a.approvalStatus === 'approved' || (!a.approvalStatus && a.source !== 'automatic_diagnosis'));
  const rejectedActions = actionPlans.filter((a) => a.approvalStatus === 'rejected');

  // Sub-Aba do Plano de Ação: 1. Governança & Aprovações vs 2. Cronograma & Execução Visual
  const [actionPlanSubTab, setActionPlanSubTab] = useState<'governance' | 'schedule'>('governance');

  // Filtros Avançados do Plano de Ação (Sincronizados com o escopo desta campanha)
  const [actionApprovalFilter, setActionApprovalFilter] = useState<'all' | 'approved' | 'pending_technical' | 'pending_management' | 'suggested' | 'rejected'>('all');
  const [actionSectorFilter, setActionSectorFilter] = useState<string>('all');
  const [actionResponsibleFilter, setActionResponsibleFilter] = useState<string>('all');
  const [actionDeadlineFilter, setActionDeadlineFilter] = useState<string>('all');
  const [actionSearchQuery, setActionSearchQuery] = useState<string>('');

  // Cálculos de Prazos e Responsáveis para Filtros da Avaliação
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const getDeadlineInfo = (whenDateStr?: string, status?: string) => {
    if (!whenDateStr) return { isOverdue: false, diffDays: 999, label: 'Sem prazo definido' };
    const parts = whenDateStr.split('-');
    if (parts.length < 3) return { isOverdue: false, diffDays: 999, label: whenDateStr };
    const [year, month, day] = parts.map(Number);
    const targetDate = new Date(year, month - 1, day);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays < 0 && status !== 'Concluído';
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return { isOverdue, diffDays, formattedDate };
  };

  // Lista de Responsáveis únicos cadastrados nas ações desta avaliação
  const uniqueActionResponsibles = useMemo(() => {
    return Array.from(
      new Set(actionPlans.map((a) => a.who?.trim()).filter(Boolean))
    ).sort();
  }, [actionPlans]);

  // Contagens do pipeline de aprovação desta avaliação
  const countCampaignSuggested = actionPlans.filter((a) => a.approvalStatus === 'suggested' || (a.source === 'automatic_diagnosis' && !a.approvalStatus)).length;
  const countCampaignPendingTech = actionPlans.filter((a) => a.approvalStatus === 'pending_technical').length;
  const countCampaignPendingMgmt = actionPlans.filter((a) => a.approvalStatus === 'pending_management').length;
  const countCampaignApproved = actionPlans.filter((a) => a.approvalStatus === 'approved' || (!a.approvalStatus && a.source !== 'automatic_diagnosis')).length;
  const countCampaignRejected = actionPlans.filter((a) => a.approvalStatus === 'rejected').length;

  // Ações filtradas dentro desta campanha
  const filteredActionPlans = useMemo(() => {
    return actionPlans.filter((act) => {
      // 1. Filtro por esteira de aprovação
      const actApproval = act.approvalStatus || (act.source === 'automatic_diagnosis' ? 'suggested' : 'approved');
      if (actionApprovalFilter !== 'all') {
        if (actionApprovalFilter === 'approved' && actApproval !== 'approved') return false;
        if (actionApprovalFilter === 'pending_technical' && actApproval !== 'pending_technical') return false;
        if (actionApprovalFilter === 'pending_management' && actApproval !== 'pending_management') return false;
        if (actionApprovalFilter === 'suggested' && actApproval !== 'suggested') return false;
        if (actionApprovalFilter === 'rejected' && actApproval !== 'rejected') return false;
      }
      // 2. Filtro por status de execução (PDCA)
      if (actionStatusFilter !== 'all' && act.status !== actionStatusFilter) return false;
      // 3. Filtro por setor
      if (actionSectorFilter !== 'all' && act.sectorId !== actionSectorFilter) return false;
      // 4. Filtro por responsável
      if (actionResponsibleFilter !== 'all' && act.who?.trim() !== actionResponsibleFilter) return false;
      // 5. Filtro por prazo / urgência
      const deadline = getDeadlineInfo(act.whenDate, act.status);
      if (actionDeadlineFilter === 'overdue') {
        if (!deadline.isOverdue) return false;
      } else if (actionDeadlineFilter === 'this_month') {
        if (deadline.diffDays < 0 || deadline.diffDays > 30) return false;
      } else if (actionDeadlineFilter === 'next_60') {
        if (deadline.diffDays <= 30 || deadline.diffDays > 60) return false;
      } else if (actionDeadlineFilter === 'future') {
        if (deadline.diffDays <= 60) return false;
      }
      // 6. Busca livre
      if (actionSearchQuery.trim()) {
        const q = actionSearchQuery.toLowerCase();
        const secName = company.sectors.find((s) => s.id === act.sectorId)?.name || '';
        const match =
          act.what?.toLowerCase().includes(q) ||
          act.who?.toLowerCase().includes(q) ||
          act.why?.toLowerCase().includes(q) ||
          act.how?.toLowerCase().includes(q) ||
          act.where?.toLowerCase().includes(q) ||
          act.dangerTarget?.toLowerCase().includes(q) ||
          secName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [
    actionPlans,
    actionApprovalFilter,
    actionStatusFilter,
    actionSectorFilter,
    actionResponsibleFilter,
    actionDeadlineFilter,
    actionSearchQuery,
    company.sectors,
  ]);

  // Exportar Lista Filtrada desta Avaliação para CSV
  const handleExportAssessmentActionsCSV = () => {
    if (filteredActionPlans.length === 0) {
      alert('Nenhuma ação para exportar com os filtros atuais.');
      return;
    }

    const headers = [
      'ID',
      'O que fazer (What)',
      'Por que (Why)',
      'Onde (Where / Setor)',
      'Quem (Who / Responsavel)',
      'Quando (When / Prazo)',
      'Como (How)',
      'Custo Estimado (How Much)',
      'Status PDCA',
      'Hierarquia NR-1',
      'Status de Aprovacao / PGR',
      'Afericao de Eficacia',
    ];

    const rows = filteredActionPlans.map((act) => {
      const sec = company.sectors.find((s) => s.id === act.sectorId)?.name || act.where || 'Geral';
      return [
        `"${act.id}"`,
        `"${(act.what || '').replace(/"/g, '""')}"`,
        `"${(act.why || '').replace(/"/g, '""')}"`,
        `"${sec.replace(/"/g, '""')}"`,
        `"${(act.who || '').replace(/"/g, '""')}"`,
        `"${act.whenDate || ''}"`,
        `"${(act.how || '').replace(/"/g, '""')}"`,
        `"${act.costEstimate || ''}"`,
        `"${act.status}"`,
        `"${act.hierarchyCategory}"`,
        `"${act.approvalStatus === 'approved' ? 'Oficial no PGR' : act.approvalStatus || 'Em Validacao'}"`,
        `"${(act.verificationMethod || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plano_de_acao_${campaign.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // State para Formulário de Nova Ação Manual
  const [newActionForm, setNewActionForm] = useState({
    dangerTarget: '',
    hierarchyCategory: 'Proteção Coletiva / Organização do Trabalho' as ActionPlanItem['hierarchyCategory'],
    what: '',
    why: '',
    where: company.sectors[0]?.name || 'Geral',
    who: 'Coordenação de SST / RH',
    whenDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    how: '',
    costEstimate: 'R$ 0,00',
    pdcaCycle: 'Plan' as ActionPlanItem['pdcaCycle'],
    verificationMethod: 'Verificação periódica de eficácia (NR-1.5.5.3.2)',
    sectorId: company.sectors[0]?.id || 'sec-1',
  });

  // State para Formulário de Nova Evidência
  const [newEvidenceForm, setNewEvidenceForm] = useState({
    title: '',
    category: 'foto_posto' as AssessmentEvidence['category'],
    date: new Date().toISOString().slice(0, 10),
    authorName: campaign.technicalInCharge?.name || 'Consultor SST',
    authorRole: campaign.technicalInCharge?.title || 'Especialista em SST / Ergonomia',
    description: '',
    findingsSummary: '',
    impactOnRisk: 'Aumenta Risco' as AssessmentEvidence['impactOnRisk'],
    fileName: '',
    sectorId: company.sectors[0]?.id || 'sec-1',
  });

  // Handlers
  const handleCopyLink = () => {
    const url = `${window.location.origin}/#survey=${campaign.anonymousToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulateResponses = () => {
    StorageService.simulateBatchResponses(campaign.id, company.id, 15);
    onRefreshData();
  };

  const handleAcceptAction = (actionId: string) => {
    StorageService.acceptActionPlanSuggestion(actionId);
    onRefreshData();
  };

  const handleRejectAction = (actionId: string) => {
    const reason = prompt('Informe a justificativa técnica para recusar/cancelar esta sugestão:', 'Ação desnecessária após adequações recentes.');
    if (reason !== null) {
      StorageService.rejectActionPlanSuggestion(actionId, reason);
      onRefreshData();
    }
  };

  const handleCreateManualAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionForm.what.trim()) {
      alert('Informe o que será feito (5W2H).');
      return;
    }

    const newItem: ActionPlanItem = {
      id: `act-man-${Date.now()}`,
      campaignId: campaign.id,
      companyId: company.id,
      sectorId: newActionForm.sectorId,
      dangerTarget: newActionForm.dangerTarget || 'Medida Preventiva Geral',
      hierarchyCategory: newActionForm.hierarchyCategory,
      what: newActionForm.what,
      why: newActionForm.why,
      where: newActionForm.where,
      who: newActionForm.who,
      whenDate: newActionForm.whenDate,
      how: newActionForm.how,
      costEstimate: newActionForm.costEstimate,
      pdcaCycle: newActionForm.pdcaCycle,
      status: 'Não Iniciado',
      source: 'manual',
      approvalStatus: 'approved',
      verificationMethod: newActionForm.verificationMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveActionPlanItem(newItem);
    setShowNewActionModal(false);
    onRefreshData();
  };

  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceForm.title.trim()) {
      alert('Informe o título da evidência documental.');
      return;
    }

    const categoryLabels: Record<AssessmentEvidence['category'], string> = {
      foto_posto: 'Registro Fotográfico / Posto',
      ata_cipa: 'Ata de Reunião CIPA',
      relatorio_absenteismo: 'Relatório de Absenteísmo / PCMSO',
      parecer_medico: 'Parecer Médico Ocupacional',
      ouvidoria_denuncia: 'Ouvidoria / Canal de Denúncias',
      pop_norma: 'POP / Procedimento Operacional',
      outro: 'Documento Técnico Diversos',
    };

    const newEv: AssessmentEvidence = {
      id: `ev-${Date.now()}`,
      campaignId: campaign.id,
      companyId: company.id,
      sectorId: newEvidenceForm.sectorId,
      title: newEvidenceForm.title,
      category: newEvidenceForm.category,
      categoryLabel: categoryLabels[newEvidenceForm.category],
      date: newEvidenceForm.date,
      authorName: newEvidenceForm.authorName,
      authorRole: newEvidenceForm.authorRole,
      description: newEvidenceForm.description,
      findingsSummary: newEvidenceForm.findingsSummary,
      impactOnRisk: newEvidenceForm.impactOnRisk,
      fileName: newEvidenceForm.fileName || `${newEvidenceForm.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
      fileSize: '1.8 MB',
      fileType: 'Documento Anexado',
      createdAt: new Date().toISOString(),
    };

    StorageService.saveEvidence(newEv);
    setShowNewEvidenceModal(false);
    onRefreshData();
  };

  const handleDeleteEvidence = (id: string) => {
    if (confirm('Deseja excluir este registro de evidência documental?')) {
      StorageService.deleteEvidence(id);
      onRefreshData();
    }
  };

  const handleDeleteAction = (id: string) => {
    if (confirm('Deseja remover esta ação do plano?')) {
      StorageService.deleteActionPlanItem(id);
      onRefreshData();
    }
  };

  const handleOpenEditAction = (action: ActionPlanItem) => {
    setEditingActionItem(action);
    setEditActionForm(JSON.parse(JSON.stringify(action)));
    setShowEditActionModal(true);
  };

  const handleSaveEditAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editActionForm.what?.trim() || !editActionForm.who?.trim() || !editActionForm.whenDate) {
      alert('Preencha os campos obrigatórios da ação (O que, Quem, Quando).');
      return;
    }
    if (!editingActionItem) return;

    const updatedItem: ActionPlanItem = {
      ...editingActionItem,
      what: editActionForm.what.trim(),
      why: editActionForm.why || '',
      where: editActionForm.where || '',
      who: editActionForm.who.trim(),
      whenDate: editActionForm.whenDate,
      how: editActionForm.how || '',
      costEstimate: editActionForm.costEstimate || 'R$ 0,00',
      hierarchyCategory: (editActionForm.hierarchyCategory as any) || editingActionItem.hierarchyCategory,
      pdcaCycle: (editActionForm.pdcaCycle as any) || editingActionItem.pdcaCycle,
      status: (editActionForm.status as any) || editingActionItem.status,
      verificationMethod: editActionForm.verificationMethod || '',
      sectorId: editActionForm.sectorId || editingActionItem.sectorId,
      dangerTarget: editActionForm.dangerTarget || editingActionItem.dangerTarget,
      approvalStatus: editActionForm.approvalStatus || editingActionItem.approvalStatus || 'approved',
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveActionPlanItem(updatedItem);
    setShowEditActionModal(false);
    setEditingActionItem(null);
    onRefreshData();
  };

  const handleQuickChangeStatus = (actionId: string, newStatus: ActionPlanItem['status']) => {
    const item = actionPlans.find((a) => a.id === actionId);
    if (!item) return;
    let pdca: ActionPlanItem['pdcaCycle'] = item.pdcaCycle;
    if (newStatus === 'Não Iniciado') pdca = 'Plan';
    else if (newStatus === 'Em Andamento') pdca = 'Do';
    else if (newStatus === 'Em Revisão') pdca = 'Check';
    else if (newStatus === 'Concluído') pdca = 'Act';

    const updated: ActionPlanItem = {
      ...item,
      status: newStatus,
      pdcaCycle: pdca,
      approvalStatus: item.approvalStatus === 'suggested' ? 'approved' : item.approvalStatus || 'approved',
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveActionPlanItem(updated);
    onRefreshData();
  };

  // Formatação de Setores
  const sectorsSummary = campaign.targetSectorIds
    .map((sId) => company.sectors.find((s) => s.id === sId)?.name || sId)
    .join(' · ');

  return (
    <div className="space-y-6 pb-16">
      {/* Botão de Retorno */}
      <div>
        <button
          id="back-to-assessments-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para avaliações</span>
        </button>
      </div>

      {/* Header da Avaliação Conforme Imagem do Usuário */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        {/* Título Principal, Empresa e Badge de Risco */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {campaign.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {company.corporateName} · {company.tradeName} · {sectorsSummary || 'Todos os setores'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${overallRiskStatus.color}`}
            >
              <span className={`w-2 h-2 rounded-full ${overallRiskStatus.dot} animate-pulse`} />
              {overallRiskStatus.label}
            </span>
          </div>
        </div>

        {/* Bloco de Métricas de Coleta (Adesão, Respondentes, Período, Consultor) */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Adesão */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Adesão
            </span>
            <div className="text-xl font-bold text-slate-900">
              {participationPercent}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-slate-900 h-2 rounded-full transition-all duration-500"
                style={{ width: `${participationPercent}%` }}
              />
            </div>
          </div>

          {/* Respondentes */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Respondentes
            </span>
            <div className="text-xl font-bold text-slate-900">
              {allResponses.length}
              <span className="text-sm font-normal text-slate-500">/{sampleGoal}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {allResponses.length >= sampleGoal ? 'Meta amostral concluída' : `Faltam ${Math.max(0, sampleGoal - allResponses.length)} respostas`}
            </p>
          </div>

          {/* Período de Coleta */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Período de coleta
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{campaign.startDate}</span>
              <span className="text-slate-400">→</span>
              <span>{campaign.endDate}</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Coleta ativa no portal
            </p>
          </div>

          {/* Consultor Responsável */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Consultor responsável
            </span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {campaign.technicalInCharge?.name || company.contactPerson || 'Dra. Carolina Ramos Mendes'}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {campaign.technicalInCharge?.professionalCouncil || 'CRM/SP 148.920'}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Abas (Tabs) Internas da Avaliação - Exatamente como na imagem */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {/* Aba 1 */}
        <button
          id="tab-heatmap-btn"
          onClick={() => setActiveTab('heatmap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-xs ${
            activeTab === 'heatmap'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Flame className={`w-4 h-4 ${activeTab === 'heatmap' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Mapa de calor & Dimensões</span>
        </button>

        {/* Aba 2 */}
        <button
          id="tab-questions-btn"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-xs ${
            activeTab === 'questions'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 text-blue-500" />
          <span>Questionário interativo</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
            {allResponses.length}
          </span>
        </button>

        {/* Aba 3 */}
        <button
          id="tab-evidences-btn"
          onClick={() => setActiveTab('evidences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-xs ${
            activeTab === 'evidences'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FolderArchive className="w-4 h-4 text-amber-500" />
          <span>Evidências documentais</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {evidences.length}
          </span>
        </button>

        {/* Aba 4 */}
        <button
          id="tab-action-plan-btn"
          onClick={() => setActiveTab('action_plan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-xs ${
            activeTab === 'action_plan'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4 text-emerald-500" />
          <span>Plano de ação 5W2H</span>
          {pendingActions.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse">
              {pendingActions.length} em aprovação
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: MAPA DE CALOR & DIMENSÕES                                          */}
      {/* ========================================================================= */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          {/* Barra de Filtro e Resumo */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Diagnóstico Psicossocial por Dimensões (COPSOQ II)</span>
                <span className="text-xs font-normal text-slate-500">
                  • Calculado com {filteredResponses.length} respostas coletadas
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Classificação em Tercis normativos conforme Portaria MTE nº 1.419/2024 e NR-17
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Filtrar por Setor:</span>
                <select
                  value={selectedSectorFilter}
                  onChange={(e) => setSelectedSectorFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">Todos os Setores ({allResponses.length} respostas)</option>
                  {company.sectors.map((s) => {
                    const count = allResponses.filter((r) => r.sectorId === s.id).length;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({count} resp.)
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={handleSimulateResponses}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition"
                title="Gera 15 respostas simuladas de colaboradores para recalcular o mapa e sugestões"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>+15 Respostas Teste</span>
              </button>
            </div>
          </div>

          {/* Legenda Semafórica */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-950">Favorável (Sob Controle)</span>
                  <p className="text-[11px] text-emerald-700">Condições satisfatórias ou fatores protetores</p>
                </div>
              </div>
              <span className="text-base font-bold text-emerald-900">{favorableDimensionsCount}</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <div>
                  <span className="text-xs font-bold text-amber-950">Intermédio (Alerta Preventivo)</span>
                  <p className="text-[11px] text-amber-700">Requer monitoramento contínuo no GRO</p>
                </div>
              </div>
              <span className="text-base font-bold text-amber-900">{intermediateDimensionsCount}</span>
            </div>

            <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-red-950">Risco à Saúde (Crítico)</span>
                  <p className="text-[11px] text-red-700">Gera proposta automática no Plano de Ação</p>
                </div>
              </div>
              <span className="text-base font-bold text-red-900">{criticalDimensionsCount}</span>
            </div>
          </div>

          {/* Grid de Dimensões / Mapa de Calor */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dimensionResults.map((dim) => {
              const isRisk = dim.tercil === 'risk';
              const isIntermediate = dim.tercil === 'intermediate';
              const badgeColor = isRisk
                ? 'bg-red-100 text-red-800 border-red-300'
                : isIntermediate
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300';

              const barColor = isRisk ? 'bg-red-600' : isIntermediate ? 'bg-amber-500' : 'bg-emerald-600';
              const barWidth = Math.min(100, Math.round((dim.score / 5) * 100));

              return (
                <div
                  key={dim.code}
                  className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                    isRisk ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {dim.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                        {dim.tercil === 'risk' ? 'Risco' : dim.tercil === 'intermediate' ? 'Intermédio' : 'Favorável'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{dim.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{dim.riskFactorDescription}</p>
                    </div>

                    {/* Barra de Escore */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600">Escore Médio</span>
                        <span className="text-slate-900">
                          {dim.score.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/ 5.00</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${barWidth}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Ref. Nacional: {dim.nationalBenchmark.toFixed(2)}</span>
                        <span className={dim.delta > 0 ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
                          Delta: {dim.delta > 0 ? `+${dim.delta.toFixed(2)}` : dim.delta.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card com Agravos e Ação */}
                  <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] space-y-2">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-700">Possíveis Agravos:</span>{' '}
                      {dim.possibleConsequences.slice(0, 2).join(', ')}
                    </div>
                    {isRisk && (
                      <div className="bg-red-50 p-2 rounded-lg text-red-800 text-[10px] font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Ação preventiva sugerida automaticamente no plano</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: QUESTIONÁRIO INTERATIVO & RESPOSTAS                                  */}
      {/* ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Card de Compartilhamento & Acesso ao Questionário */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {currentTemplate?.type === 'standard'
                    ? 'COPSOQ II Validado • NR-17'
                    : currentTemplate?.type === 'imported'
                    ? 'Instrumento Importado'
                    : 'Instrumento Customizado'}
                </span>
                <span className="text-xs text-amber-300 font-medium">
                  {currentTemplate?.title} ({currentTemplate?.code})
                </span>
                <span className="text-xs text-slate-300">Token: #{campaign.anonymousToken}</span>
              </div>
              <h2 className="text-lg font-bold text-white">Canal de Resposta Anônima do Trabalhador</h2>
              <p className="text-xs text-slate-300">
                Os trabalhadores respondem de forma 100% anônima e confidencial, garantindo conformidade com a LGPD e a NR-1.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
              >
                <QrCode className="w-4 h-4 text-blue-400" />
                <span>Exibir QR Code</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <button
                onClick={() => onOpenAnonymousSurvey(campaign.anonymousToken)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Tela do Trabalhador</span>
              </button>

              <button
                onClick={handleSimulateResponses}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>+15 Respostas Teste</span>
              </button>
            </div>
          </div>

          {/* Navegador das Questões com Distribuição das Respostas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Itens do Instrumento: {currentTemplate?.title} ({questions.length} Questões)
                </h3>
                <p className="text-xs text-slate-500">Distribuição estatística acumulada das opções assinaladas</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                Total de Respostas: {allResponses.length}
              </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 divide-y divide-slate-100">
              {questions.map((q) => {
                const isYesNo = q.responseType === 'yes_no';
                const isNumeric = q.responseType === 'numeric_scale';
                const isText = q.responseType === 'text';
                const isMC = q.responseType === 'multiple_choice';

                // Calcula contagens para cada formato
                if (isYesNo) {
                  let yesCount = 0;
                  let noCount = 0;
                  let totalForQ = 0;
                  allResponses.forEach((r) => {
                    const rawVal = (r.answers as Record<number, any>)[q.id];
                    if (
                      rawVal === 5 ||
                      rawVal === 1 ||
                      rawVal === true ||
                      rawVal === false ||
                      rawVal === 'sim' ||
                      rawVal === 'Sim' ||
                      rawVal === 'nao' ||
                      rawVal === 'Não' ||
                      rawVal === 'nao'
                    ) {
                      if (rawVal === 5 || rawVal === true || rawVal === 'sim' || rawVal === 'Sim') {
                        yesCount++;
                      } else {
                        noCount++;
                      }
                      totalForQ++;
                    }
                  });

                  const yesPct = totalForQ > 0 ? Math.round((yesCount / totalForQ) * 100) : 0;
                  const noPct = totalForQ > 0 ? Math.round((noCount / totalForQ) * 100) : 0;

                  return (
                    <div key={q.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              #{q.id} {q.code}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">{q.dimensionTitle}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">Sim / Não</span>
                          </div>
                          <p className="text-xs font-medium text-slate-800">{q.text}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-900 block">{totalForQ} respostas</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
                          <span className="font-semibold text-emerald-900">Sim: {yesCount}</span>
                          <strong className="text-emerald-700">{yesPct}%</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                          <span className="font-semibold text-slate-800">Não: {noCount}</span>
                          <strong className="text-slate-700">{noPct}%</strong>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isText) {
                  const textAnswersCount = allResponses.filter((r) => r.answers[q.id] && String(r.answers[q.id]).trim().length > 0).length;
                  return (
                    <div key={q.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                              #{q.id} {q.code}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">{q.dimensionTitle}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">Texto / Dissertativa</span>
                          </div>
                          <p className="text-xs font-medium text-slate-800">{q.text}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-purple-900 block">{textAnswersCount} respostas de texto</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Padrão Likert 1-5 / Múltipla Escolha
                const counts = [0, 0, 0, 0, 0];
                let totalForQ = 0;
                allResponses.forEach((r) => {
                  const val = r.answers[q.id];
                  if (typeof val === 'number' && val >= 1 && val <= 5) {
                    counts[val - 1]++;
                    totalForQ++;
                  }
                });

                const avgScore =
                  totalForQ > 0
                    ? counts.reduce((acc, count, i) => acc + count * (i + 1), 0) / totalForQ
                    : 0;

                return (
                  <div key={q.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            #{q.id} {q.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">{q.dimensionTitle}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-800">{q.text}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 block">
                          Média: {avgScore > 0 ? avgScore.toFixed(2) : '-'}
                        </span>
                        <span className="text-[10px] text-slate-400">{totalForQ} respostas</span>
                      </div>
                    </div>

                    {/* Barras de Distribuição das Opções 1 a 5 */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1 text-[10px]">
                      {counts.map((cnt, idx) => {
                        const pct = totalForQ > 0 ? Math.round((cnt / totalForQ) * 100) : 0;
                        const label =
                          q.scaleType === 'intensity'
                            ? ['Nada', 'Um pouco', 'Moderado', 'Muito', 'Extremo'][idx]
                            : q.scaleType === 'health_quality'
                            ? ['Deficitária', 'Razoável', 'Boa', 'Muito boa', 'Excelente'][idx]
                            : q.scaleType === 'agreement'
                            ? ['Discordo Total', 'Discordo', 'Neutro', 'Concordo', 'Concordo Total'][idx]
                            : ['Nunca', 'Raramente', 'Às vezes', 'Frequente', 'Sempre'][idx];

                        return (
                          <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                            <div className="flex justify-between text-slate-500 font-medium mb-1">
                              <span>{idx + 1}</span>
                              <span className="font-bold text-slate-800">{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mb-1">
                              <div
                                className={`h-1 rounded-full ${
                                  idx >= 3 ? 'bg-amber-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-slate-400 truncate block text-[9px]">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabela de Respostas Anônimas Individuais */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Histórico de Envios Anônimos ({allResponses.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Dados agregados e desidentificados para preservação estrita do sigilo
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Identificador</th>
                    <th className="py-2.5 px-4">Setor / GHE</th>
                    <th className="py-2.5 px-4">Data/Hora</th>
                    <th className="py-2.5 px-4">Demografia (Agregada)</th>
                    <th className="py-2.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allResponses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Nenhuma resposta registrada até o momento. Compartilhe o link com a equipe.
                      </td>
                    </tr>
                  ) : (
                    allResponses.map((resp, idx) => {
                      const sec = company.sectors.find((s) => s.id === resp.sectorId);
                      return (
                        <tr key={resp.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-800">
                            Respondente #{idx + 1}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {sec?.name || resp.sectorId}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(resp.submittedAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {resp.demographics?.gender || 'N/A'} • {resp.demographics?.ageGroup || 'N/A'} • {resp.demographics?.shift || 'Turno Geral'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectResponse(resp)}
                              className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Itens</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: EVIDÊNCIAS DOCUMENTAIS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'evidences' && (
        <div className="space-y-6">
          {/* Header da Aba de Evidências */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Evidências Documentais da Avaliação</span>
                <span className="text-xs font-normal text-slate-500">
                  (Obrigatório conforme NR-1.5.3.3 e NR-1.5.4)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Anexe fotos de postos de trabalho, atas de reuniões da CIPA, relatórios de absenteísmo (PCMSO) e pareceres técnicos ergonômicos.
              </p>
            </div>

            <button
              id="add-evidence-btn"
              onClick={() => setShowNewEvidenceModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Anexar Nova Evidência</span>
            </button>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-medium">Filtrar:</span>
            {[
              { key: 'all', label: 'Todas as Evidências' },
              { key: 'foto_posto', label: '📸 Fotos dos Postos' },
              { key: 'ata_cipa', label: '📝 Atas da CIPA' },
              { key: 'relatorio_absenteismo', label: '📊 Relatórios PCMSO' },
              { key: 'pop_norma', label: '📋 POPs e Normas' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setEvidenceFilterCategory(f.key)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  evidenceFilterCategory === f.key
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid de Evidências */}
          {evidences.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Nenhuma evidência documental anexada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Registre inspeções fotográficas, atas da CIPA ou relatórios de afastamentos para fundamentar a avaliação pericial.
              </p>
              <button
                onClick={() => setShowNewEvidenceModal(true)}
                className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Anexar Primeira Evidência
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidences
                .filter((ev) => evidenceFilterCategory === 'all' || ev.category === evidenceFilterCategory)
                .map((ev) => {
                  const sec = company.sectors.find((s) => s.id === ev.sectorId);
                  const impactColor =
                    ev.impactOnRisk === 'Aumenta Risco'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : ev.impactOnRisk === 'Mitiga Risco'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <div
                      key={ev.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {ev.categoryLabel}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${impactColor}`}>
                            {ev.impactOnRisk}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{ev.description}</p>
                        </div>

                        {/* Achados Técnicos */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                          <span className="font-semibold text-slate-700 block">Achados / Constatação Pericial:</span>
                          <p className="text-slate-600">{ev.findingsSummary}</p>
                        </div>
                      </div>

                      {/* Metadados e Ações */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-700 block truncate">
                            {ev.authorName} • {sec?.name || 'Geral'}
                          </span>
                          <span className="text-[11px] text-slate-400">{ev.date} • {ev.fileName || 'documento.pdf'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => alert(`Visualizando documento: ${ev.fileName || ev.title}\n\nResumo:\n${ev.findingsSummary}`)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Visualizar Anexo"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvidence(ev.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-700 transition"
                            title="Excluir Evidência"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: PLANO DE AÇÃO 5W2H (COM SUGESTÕES AUTOMÁTICAS E APROVAÇÃO)         */}
      {/* ========================================================================= */}
      {activeTab === 'action_plan' && (
        <div className="space-y-6">
          {/* Seletor de Sub-Abas do Plano de Ação Desta Avaliação */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActionPlanSubTab('governance')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
                  actionPlanSubTab === 'governance'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>1. Governança & Aprovações</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  actionPlanSubTab === 'governance' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {actionPlans.length}
                </span>
              </button>

              <button
                onClick={() => setActionPlanSubTab('schedule')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
                  actionPlanSubTab === 'schedule'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-emerald-500" />
                <span>2. Cronograma & Execução Visual</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  actionPlanSubTab === 'schedule' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {countCampaignApproved} Oficiais
                </span>
              </button>
            </div>

            <button
              id="new-manual-action-btn"
              onClick={() => setShowNewActionModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Ação 5W2H</span>
            </button>
          </div>

          {actionPlanSubTab === 'schedule' ? (
            <ActionPlanScheduleView
              company={company}
              campaigns={[campaign]}
              currentCampaign={campaign}
              actionPlans={actionPlans}
              sectors={company.sectors}
              onRefreshData={onRefreshData}
              onOpenEditModal={(item) => handleOpenEditAction(item)}
            />
          ) : (
            <>
              {/* Banner de Geração Automática Conforme Requisito do Usuário */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Ciclo PDCA & 5W2H • NR-1.5.5.2
                    </span>
                    <span className="text-xs text-blue-200">Alimentado pelos Resultados</span>
                  </div>
                  <h2 className="text-base font-bold text-white">
                    Gestão e Aprovação de Ações Preventivas desta Avaliação
                  </h2>
                  <p className="text-xs text-blue-100/90 leading-relaxed">
                    À medida que os colaboradores respondem o questionário, as dimensões críticas geram propostas automáticas de intervenção ergonômica. Aceite as propostas para integrá-las oficialmente ao PGR ou recuse/cancele se julgar inaplicável.
                  </p>
                </div>
              </div>

          {/* PAINEL DE FILTROS DO PLANO DE AÇÃO DA AVALIAÇÃO (Restrito a esta Avaliação) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
            {/* Linha 1: Pipeline / Esteira de Botões de Filtro por Estágio de Governança */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActionApprovalFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    actionApprovalFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todas ({actionPlans.length})
                </button>

                <button
                  onClick={() => setActionApprovalFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    actionApprovalFilter === 'approved'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Oficial no PGR ({countCampaignApproved})</span>
                </button>

                <button
                  onClick={() => setActionApprovalFilter('pending_technical')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    actionApprovalFilter === 'pending_technical'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Validação Técnica ({countCampaignPendingTech})</span>
                </button>

                <button
                  onClick={() => setActionApprovalFilter('pending_management')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    actionApprovalFilter === 'pending_management'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Aprovação Diretoria ({countCampaignPendingMgmt})</span>
                </button>

                {countCampaignSuggested > 0 && (
                  <button
                    onClick={() => setActionApprovalFilter('suggested')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      actionApprovalFilter === 'suggested'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sugestões ({countCampaignSuggested})</span>
                  </button>
                )}

                {countCampaignRejected > 0 && (
                  <button
                    onClick={() => setActionApprovalFilter('rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      actionApprovalFilter === 'rejected'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-red-50 text-red-800 hover:bg-red-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Recusadas ({countCampaignRejected})</span>
                  </button>
                )}
              </div>

              {/* Botão de Exportar Planilha desta Avaliação */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportAssessmentActionsCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  title="Exportar planilha de ações filtradas desta avaliação"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Exportar Planilha ({filteredActionPlans.length})</span>
                </button>
              </div>
            </div>

            {/* Linha 2: Barra de Filtros Operacionais do Gestor (Busca, Responsável, Prazo, Setor, Status PDCA) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
              {/* Campo de Busca Rápida */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar ação, responsável ou risco..."
                  value={actionSearchQuery}
                  onChange={(e) => setActionSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                />
                {actionSearchQuery && (
                  <button
                    onClick={() => setActionSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Controles de Filtros Dropdowns */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filtro por Responsável (Who) */}
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <select
                    value={actionResponsibleFilter}
                    onChange={(e) => setActionResponsibleFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[150px] truncate text-xs"
                    title="Filtrar por Responsável (Who)"
                  >
                    <option value="all">Todos Responsáveis</option>
                    {uniqueActionResponsibles.map((resp) => (
                      <option key={resp} value={resp}>
                        {resp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Prazo & Urgência (When) */}
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <select
                    value={actionDeadlineFilter}
                    onChange={(e) => setActionDeadlineFilter(e.target.value)}
                    className={`px-2.5 py-1.5 bg-white border rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs ${
                      actionDeadlineFilter === 'overdue'
                        ? 'border-red-300 text-red-700 font-bold bg-red-50'
                        : actionDeadlineFilter === 'this_month'
                        ? 'border-amber-300 text-amber-800 font-bold bg-amber-50'
                        : 'border-slate-200 text-slate-800'
                    }`}
                    title="Filtrar por Prazo de Execução"
                  >
                    <option value="all">Todos os Prazos</option>
                    <option value="overdue">🚨 Atrasadas</option>
                    <option value="this_month">📅 Vencem este mês (30d)</option>
                    <option value="next_60">⏳ Próximos 60 dias</option>
                    <option value="future">📆 Prazos futuros (+60d)</option>
                  </select>
                </div>

                {/* Filtro por Setor */}
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <select
                    value={actionSectorFilter}
                    onChange={(e) => setActionSectorFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[140px] truncate text-xs"
                    title="Filtrar por Setor"
                  >
                    <option value="all">Todos Setores</option>
                    {company.sectors.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Status de Execução PDCA */}
                <div className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <select
                    value={actionStatusFilter}
                    onChange={(e) => setActionStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    title="Filtrar por Status de Execução PDCA"
                  >
                    <option value="all">Todos Status PDCA</option>
                    <option value="Não Iniciado">Não Iniciado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Em Revisão">Em Revisão</option>
                  </select>
                </div>

                {/* Limpar Filtros */}
                {(actionApprovalFilter !== 'all' ||
                  actionStatusFilter !== 'all' ||
                  actionSectorFilter !== 'all' ||
                  actionResponsibleFilter !== 'all' ||
                  actionDeadlineFilter !== 'all' ||
                  actionSearchQuery !== '') && (
                  <button
                    onClick={() => {
                      setActionApprovalFilter('all');
                      setActionStatusFilter('all');
                      setActionSectorFilter('all');
                      setActionResponsibleFilter('all');
                      setActionDeadlineFilter('all');
                      setActionSearchQuery('');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                    title="Limpar todos os filtros da avaliação"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 1. SEÇÃO DE MEDIDAS EM FLUXO DE APROVAÇÃO (SESMT / DIRETORIA / SUGESTÕES) */}
          {pendingActions.length > 0 && actionApprovalFilter !== 'approved' && (
            <div className="bg-amber-50/60 border-2 border-amber-300/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <h3 className="text-sm font-bold text-amber-950">
                    Medidas em Fluxo de Aprovação ({pendingActions.length} Aguardando Validação / Homologação)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  Ação Necessária antes de integrar ao PGR
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingActions.map((action) => {
                  const sec = company.sectors.find((s) => s.id === action.sectorId);
                  const approval = action.approvalStatus || 'pending_technical';
                  
                  let stageInfo = {
                    label: 'Validação Técnica (SESMT)',
                    classes: 'bg-amber-100 text-amber-900 border-amber-300',
                    nextButtonText: 'Validar Técnica e Avançar',
                  };
                  if (approval === 'pending_management') {
                    stageInfo = {
                      label: 'Aprovação da Diretoria / RH',
                      classes: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                      nextButtonText: 'Aprovar e Homologar no PGR',
                    };
                  } else if (approval === 'suggested') {
                    stageInfo = {
                      label: 'Sugestão do Diagnóstico COPSOQ',
                      classes: 'bg-purple-100 text-purple-900 border-purple-300',
                      nextButtonText: 'Validar e Encaminhar',
                    };
                  }

                  return (
                    <div
                      key={action.id}
                      className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stageInfo.classes}`}>
                              {stageInfo.label}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                              {action.hierarchyCategory}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 font-mono">
                            Prazo: {action.whenDate}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{action.what}</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            <strong className="text-slate-700">Por que (Justificativa):</strong> {action.why}
                          </p>
                        </div>

                        {/* Detalhes 5W2H */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Onde / Setor:</span>
                            <span className="font-semibold text-slate-700">{action.where || sec?.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Quem / Responsável:</span>
                            <span className="font-semibold text-slate-700">{action.who}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block text-[10px]">Como será feito:</span>
                            <span className="text-slate-700">{action.how}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação do Gestor: Aceitar vs Editar vs Recusar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => handleRejectAction(action.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 text-xs font-semibold transition"
                          title="Recusar proposta técnica com justificativa"
                        >
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Recusar</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditAction(action)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                          title="Editar prazos, responsáveis e metodologia"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          <span>Editar 5W2H</span>
                        </button>

                        <button
                          onClick={() => handleAcceptAction(action.id)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                          title="Homologar ação e incluir no PGR Oficial"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{stageInfo.nextButtonText}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. TABELA DO PLANO DE AÇÃO OFICIAL APROVADO / FILTRADO */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {actionApprovalFilter === 'all'
                    ? `Plano de Ação Integrado (${filteredActionPlans.length} Medidas Registradas)`
                    : actionApprovalFilter === 'approved'
                    ? `Plano de Ação Oficial do PGR (${filteredActionPlans.length} Medidas Homologadas)`
                    : actionApprovalFilter === 'pending_technical'
                    ? `Ações em Validação Técnica SESMT (${filteredActionPlans.length})`
                    : actionApprovalFilter === 'pending_management'
                    ? `Ações em Aprovação da Diretoria / RH (${filteredActionPlans.length})`
                    : actionApprovalFilter === 'suggested'
                    ? `Sugestões de Intervenção (${filteredActionPlans.length})`
                    : `Ações Recusadas (${filteredActionPlans.length})`}
                </h3>
                <p className="text-xs text-slate-500">
                  Acompanhamento 5W2H restrito a esta avaliação • Clique no botão editar ou no card para alterar dados e eficácia (NR-1.5.5.3.2)
                </p>
              </div>

              {/* Indicador do filtro ativo */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Exibindo {filteredActionPlans.length} de {actionPlans.length} ações
                </span>
              </div>
            </div>

            {filteredActionPlans.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ListTodo className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Nenhuma ação encontrada com os filtros selecionados.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tente limpar os filtros acima ou adicione uma nova ação manual 5W2H para esta avaliação.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-4">
                {filteredActionPlans.map((action) => {
                    const statusColor =
                      action.status === 'Concluído'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : action.status === 'Em Andamento'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : action.status === 'Em Revisão'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-slate-100 text-slate-800 border-slate-300';

                    return (
                      <div
                        key={action.id}
                        className="pt-4 first:pt-0 space-y-3 group hover:bg-slate-50/50 p-3 rounded-xl transition border border-transparent hover:border-slate-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                Ciclo PDCA: {action.pdcaCycle}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {action.hierarchyCategory}
                              </span>

                              {/* Selo de Governança / PGR */}
                              {action.approvalStatus === 'approved' || (!action.approvalStatus && action.source !== 'automatic_diagnosis') ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Oficial no PGR</span>
                                </span>
                              ) : action.approvalStatus === 'pending_technical' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <Stethoscope className="w-3 h-3 text-amber-600" />
                                  <span>Validação Técnica</span>
                                </span>
                              ) : action.approvalStatus === 'pending_management' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-indigo-600" />
                                  <span>Aprovação Diretoria</span>
                                </span>
                              ) : action.approvalStatus === 'rejected' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-300 flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  <span>Recusada</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-300 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-purple-600" />
                                  <span>Sugestão COPSOQ</span>
                                </span>
                              )}
                              
                              {/* Seletor rápido de Status direto no Card */}
                              <div className="relative inline-flex items-center">
                                <select
                                  value={action.status}
                                  onChange={(e) => handleQuickChangeStatus(action.id, e.target.value as ActionPlanItem['status'])}
                                  className={`text-[10px] font-bold py-0.5 px-2 rounded-full border cursor-pointer ${statusColor} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                  title="Clique para alterar o status da ação rapidamente"
                                >
                                  <option value="Não Iniciado">⚪ Não Iniciado</option>
                                  <option value="Em Andamento">🔵 Em Andamento</option>
                                  <option value="Em Revisão">🟣 Em Revisão</option>
                                  <option value="Concluído">🟢 Concluído</option>
                                </select>
                              </div>
                            </div>
                            
                            <h4
                              onClick={() => handleOpenEditAction(action)}
                              className="text-sm font-bold text-slate-900 cursor-pointer hover:text-blue-700 transition flex items-center gap-1.5"
                              title="Clique para editar detalhes desta ação"
                            >
                              <span>{action.what}</span>
                              <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              Prazo: {action.whenDate}
                            </span>

                            {/* Botão de Edição Principal */}
                            <button
                              onClick={() => handleOpenEditAction(action)}
                              className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold shadow-2xs transition"
                              title="Editar Detalhes da Ação 5W2H"
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600" />
                              <span>Editar</span>
                            </button>

                            {/* Botão de Exclusão */}
                            <button
                              onClick={() => handleDeleteAction(action.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Remover Ação do Plano"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Grid 5W2H */}
                        <div
                          onClick={() => handleOpenEditAction(action)}
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs cursor-pointer hover:border-slate-300 transition"
                          title="Clique para editar qualquer campo 5W2H"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">POR QUE (Why)</span>
                            <span className="text-slate-700 line-clamp-2">{action.why || 'Conformidade e controle ergonômico'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">ONDE / QUEM (Where / Who)</span>
                            <span className="text-slate-700 font-medium">{action.where || 'Geral'} • {action.who}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">COMO (How)</span>
                            <span className="text-slate-700 line-clamp-2">{action.how}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">AFERIÇÃO DE EFICÁCIA</span>
                            <span className="text-slate-700 line-clamp-2">{action.verificationMethod || 'Monitoramento contínuo'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL QR CODE                                                             */}
      {/* ========================================================================= */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">QR Code da Avaliação</h3>
              <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl inline-block border border-slate-200">
              <QRCodeSVG
                value={`${window.location.origin}/#survey=${campaign.anonymousToken}`}
                size={200}
                level="M"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{campaign.title}</p>
              <p className="text-[11px] text-slate-500">
                Aponte a câmera do celular para responder o questionário anônimo.
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL NOVA AÇÃO 5W2H MANUAL                                               */}
      {/* ========================================================================= */}
      {showNewActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Nova Ação 5W2H - Plano de Ação PGR</h3>
              <button onClick={() => setShowNewActionModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">O que será feito (What) *</label>
                <input
                  type="text"
                  required
                  value={newActionForm.what}
                  onChange={(e) => setNewActionForm({ ...newActionForm, what: e.target.value })}
                  placeholder="Ex: Instalação de pausas ergonômicas obrigatórias de 10 minutos"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Hierarquia de Controle (NR-1)</label>
                  <select
                    value={newActionForm.hierarchyCategory}
                    onChange={(e) => setNewActionForm({ ...newActionForm, hierarchyCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Evitar/Eliminar">1. Evitar / Eliminar o Perigo</option>
                    <option value="Proteção Coletiva / Organização do Trabalho">2. Proteção Coletiva / Organização do Trabalho</option>
                    <option value="Medidas Administrativas / Capacitação">3. Medidas Administrativas / Treinamento</option>
                    <option value="Vigilância em Saúde">4. Vigilância em Saúde (PCMSO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ciclo PDCA</label>
                  <select
                    value={newActionForm.pdcaCycle}
                    onChange={(e) => setNewActionForm({ ...newActionForm, pdcaCycle: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Plan">Plan (Planejar)</option>
                    <option value="Do">Do (Executar)</option>
                    <option value="Check">Check (Verificar / Checar)</option>
                    <option value="Act">Act (Agir Corretivamente)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Por que será feito (Why - Justificativa Técnica)</label>
                <textarea
                  rows={2}
                  value={newActionForm.why}
                  onChange={(e) => setNewActionForm({ ...newActionForm, why: e.target.value })}
                  placeholder="Justificativa com base nas queixas de sobrecarga ou resultados da dimensão..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Onde (Where)</label>
                  <input
                    type="text"
                    value={newActionForm.where}
                    onChange={(e) => setNewActionForm({ ...newActionForm, where: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Quem (Who - Responsável)</label>
                  <input
                    type="text"
                    value={newActionForm.who}
                    onChange={(e) => setNewActionForm({ ...newActionForm, who: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Quando (When - Prazo)</label>
                  <input
                    type="date"
                    value={newActionForm.whenDate}
                    onChange={(e) => setNewActionForm({ ...newActionForm, whenDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Como será executado (How)</label>
                <textarea
                  rows={3}
                  value={newActionForm.how}
                  onChange={(e) => setNewActionForm({ ...newActionForm, how: e.target.value })}
                  placeholder="Passo a passo da implementação operacional..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Forma de Aferição de Eficácia (NR-1.5.5.3.2)</label>
                <textarea
                  rows={3}
                  value={newActionForm.verificationMethod}
                  onChange={(e) => setNewActionForm({ ...newActionForm, verificationMethod: e.target.value })}
                  placeholder="Indicadores de sucesso, reavaliação COPSOQ ou inspeção..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewActionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs"
                >
                  Salvar e Integrar ao Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDITAR AÇÃO 5W2H (GESTOR / TÉCNICO)                                 */}
      {/* ========================================================================= */}
      {showEditActionModal && editingActionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl my-8 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Editar Ação 5W2H - Plano de Ação PGR</h3>
                  <p className="text-xs text-slate-500">
                    Ajuste parâmetros metodológicos, responsáveis, prazos e métricas de aferição
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditActionModal(false);
                  setEditingActionItem(null);
                }}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">O que será feito (What) *</label>
                <input
                  type="text"
                  required
                  value={editActionForm.what || ''}
                  onChange={(e) => setEditActionForm({ ...editActionForm, what: e.target.value })}
                  placeholder="Ex: Instalação de pausas ergonômicas obrigatórias..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status da Ação</label>
                  <select
                    value={editActionForm.status || 'Não Iniciado'}
                    onChange={(e) => setEditActionForm({ ...editActionForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Não Iniciado">⚪ Não Iniciado</option>
                    <option value="Em Andamento">🔵 Em Andamento</option>
                    <option value="Em Revisão">🟣 Em Revisão</option>
                    <option value="Concluído">🟢 Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ciclo PDCA</label>
                  <select
                    value={editActionForm.pdcaCycle || 'Plan'}
                    onChange={(e) => setEditActionForm({ ...editActionForm, pdcaCycle: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Plan">Plan (Planejar)</option>
                    <option value="Do">Do (Executar)</option>
                    <option value="Check">Check (Verificar / Checar)</option>
                    <option value="Act">Act (Agir Corretivamente)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hierarquia (NR-1)</label>
                  <select
                    value={editActionForm.hierarchyCategory || 'Proteção Coletiva / Organização do Trabalho'}
                    onChange={(e) => setEditActionForm({ ...editActionForm, hierarchyCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Evitar/Eliminar">1. Evitar / Eliminar</option>
                    <option value="Proteção Coletiva / Organização do Trabalho">2. Proteção Coletiva / Org. Trabalho</option>
                    <option value="Medidas Administrativas / Capacitação">3. Medidas Adm. / Capacitação</option>
                    <option value="Vigilância em Saúde">4. Vigilância em Saúde</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Por que será feito (Why - Justificativa Técnica)</label>
                <textarea
                  rows={2}
                  value={editActionForm.why || ''}
                  onChange={(e) => setEditActionForm({ ...editActionForm, why: e.target.value })}
                  placeholder="Justificativa com base na NR-17 e na prevenção de agravos ocupacionais..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Onde / Setor (Where)</label>
                  <input
                    type="text"
                    value={editActionForm.where || ''}
                    onChange={(e) => setEditActionForm({ ...editActionForm, where: e.target.value })}
                    placeholder="Ex: Central de Atendimento (SAC)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quem / Responsável (Who) *</label>
                  <input
                    type="text"
                    required
                    value={editActionForm.who || ''}
                    onChange={(e) => setEditActionForm({ ...editActionForm, who: e.target.value })}
                    placeholder="Ex: Coordenação de Operações / Médico SST"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quando / Prazo (When) *</label>
                  <input
                    type="date"
                    required
                    value={editActionForm.whenDate || ''}
                    onChange={(e) => setEditActionForm({ ...editActionForm, whenDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Como será executado (How)</label>
                <textarea
                  rows={3}
                  value={editActionForm.how || ''}
                  onChange={(e) => setEditActionForm({ ...editActionForm, how: e.target.value })}
                  placeholder="Procedimento detalhado de implantação..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Aferição de Eficácia (NR-1.5.5.3.2)</label>
                <textarea
                  rows={3}
                  value={editActionForm.verificationMethod || ''}
                  onChange={(e) => setEditActionForm({ ...editActionForm, verificationMethod: e.target.value })}
                  placeholder="Indicadores, reavaliação COPSOQ ou inspeção..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Custo Estimado (How Much)</label>
                  <input
                    type="text"
                    value={editActionForm.costEstimate || ''}
                    onChange={(e) => setEditActionForm({ ...editActionForm, costEstimate: e.target.value })}
                    placeholder="Ex: R$ 2.500,00 ou Sem custo direto"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status de Aprovação</label>
                  <select
                    value={editActionForm.approvalStatus || 'approved'}
                    onChange={(e) => setEditActionForm({ ...editActionForm, approvalStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="approved">✅ Aprovado (Oficial no PGR)</option>
                    <option value="suggested">🟡 Sugestão / Em Análise</option>
                    <option value="rejected">❌ Recusado / Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditActionModal(false);
                    setEditingActionItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL NOVA EVIDÊNCIA DOCUMENTAL                                           */}
      {/* ========================================================================= */}
      {showNewEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 text-slate-900 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Anexar Evidência Documental</h3>
              <button onClick={() => setShowNewEvidenceModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvidence} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Título do Registro / Evidência *</label>
                <input
                  type="text"
                  required
                  value={newEvidenceForm.title}
                  onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, title: e.target.value })}
                  placeholder="Ex: Inspeção Ergonômica dos Postos de Atendimento SAC"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tipo de Evidência</label>
                  <select
                    value={newEvidenceForm.category}
                    onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="foto_posto">📸 Registro Fotográfico / Posto</option>
                    <option value="ata_cipa">📝 Ata de Reunião da CIPA</option>
                    <option value="relatorio_absenteismo">📊 Relatório de Absenteísmo / PCMSO</option>
                    <option value="parecer_medico">📑 Parecer Médico Ocupacional</option>
                    <option value="ouvidoria_denuncia">⚖️ Ouvidoria / Canal de Denúncias</option>
                    <option value="pop_norma">📋 POP / Procedimento Operacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Impacto no Risco</label>
                  <select
                    value={newEvidenceForm.impactOnRisk}
                    onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, impactOnRisk: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Aumenta Risco">Aumenta Risco (Fator Agravante)</option>
                    <option value="Mitiga Risco">Mitiga Risco (Fator de Controle)</option>
                    <option value="Evidência Neutra/Diagnóstica">Evidência Neutra / Diagnóstica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Setor / GHE Vinculado</label>
                  <select
                    value={newEvidenceForm.sectorId}
                    onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, sectorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {company.sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Data do Registro</label>
                  <input
                    type="date"
                    value={newEvidenceForm.date}
                    onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Descrição / Contexto</label>
                <textarea
                  rows={2}
                  value={newEvidenceForm.description}
                  onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, description: e.target.value })}
                  placeholder="Explique onde e em que circunstâncias a evidência foi levantada..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Achados e Constatação Pericial</label>
                <textarea
                  rows={2}
                  value={newEvidenceForm.findingsSummary}
                  onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, findingsSummary: e.target.value })}
                  placeholder="Descreva as constatações técnicas observadas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nome do Arquivo / Anexo (Simulação)</label>
                <input
                  type="text"
                  value={newEvidenceForm.fileName}
                  onChange={(e) => setNewEvidenceForm({ ...newEvidenceForm, fileName: e.target.value })}
                  placeholder="Ex: relatorio_ergonomia_sac_2026.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewEvidenceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs"
                >
                  Salvar Evidência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE INSPEÇÃO INDIVIDUAL DE RESPOSTA ANÔNIMA                          */}
      {/* ========================================================================= */}
      {inspectResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Respostas do Respondente Anônimo
                </h3>
                <p className="text-xs text-slate-500">
                  Envio em {new Date(inspectResponse.submittedAt).toLocaleString('pt-BR')} • {company.sectors.find((s) => s.id === inspectResponse.sectorId)?.name}
                </p>
              </div>
              <button
                onClick={() => setInspectResponse(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 text-xs pr-1">
              {questions.map((q) => {
                const val = inspectResponse.answers[q.id];
                return (
                  <div key={q.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 block">{q.dimensionTitle}</span>
                      <p className="text-slate-800 font-medium">{q.text}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-900 shrink-0">
                      {val !== undefined ? `Nota ${val}` : 'Não respondida'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
