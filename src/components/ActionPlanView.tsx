import React, { useState } from 'react';
import {
  CheckSquare2,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  Layers,
  ChevronDown,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  Building2,
  Stethoscope,
  XCircle,
  HelpCircle,
  History,
  Check,
  ArrowRight,
  Info,
  DollarSign,
  Briefcase,
  ChevronRight,
  FileText,
  AlertTriangle,
  Search,
  Copy,
  AlertOctagon,
  CalendarDays,
  RotateCcw,
  Share2,
  Download,
} from 'lucide-react';
import {
  Company,
  AssessmentCampaign,
  ActionPlanItem,
  RiskInventoryItem,
  ActionApprovalStatus,
  ActionApprovalLog,
} from '../types';
import { StorageService } from '../services/storageService';
import { CompanyCampaignHeader } from './CompanyCampaignHeader';
import { ActionPlanScheduleView } from './ActionPlanScheduleView';

interface ActionPlanViewProps {
  company: Company;
  companies?: Company[];
  onSelectCompany?: (companyId: string) => void;
  campaigns: AssessmentCampaign[];
  onRefreshData: () => void;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({
  company,
  companies = [],
  onSelectCompany,
  campaigns,
  onRefreshData,
}) => {
  const isAllCompanies = company.id === 'all';
  const companyCampaigns = isAllCompanies ? campaigns : campaigns.filter((c) => c.companyId === company.id);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  
  // Aba Principal do Módulo: Governança/Aprovações vs Cronograma Visual
  const [mainSectionTab, setMainSectionTab] = useState<'governance' | 'schedule'>('governance');

  // Filtro por estágio do fluxo de aprovação
  const [approvalTab, setApprovalTab] = useState<'all' | 'approved' | 'pending_technical' | 'pending_management' | 'suggested' | 'rejected'>('approved');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);
  
  // Modais de Gestão
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionPlanItem | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showHelpBanner, setShowHelpBanner] = useState(false);

  // Modal de Aprovação / Avanço de Etapa
  const [approvingItem, setApprovingItem] = useState<{
    item: ActionPlanItem;
    targetStage: 'pending_management' | 'approved';
  } | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    approverName: '',
    approverRole: '',
    notes: '',
  });

  // Modal de Recusa
  const [rejectingItem, setRejectingItem] = useState<ActionPlanItem | null>(null);
  const [rejectionForm, setRejectionForm] = useState({
    approverName: '',
    approverRole: '',
    reason: '',
  });

  const technicalProfile = StorageService.getTechnicalProfile();

  const currentCampaign =
    selectedCampaignId !== 'all'
      ? campaigns.find((c) => c.id === selectedCampaignId) || companyCampaigns[0]
      : companyCampaigns[0] || campaigns[0];

  const actionPlans =
    selectedCampaignId === 'all'
      ? (isAllCompanies
          ? StorageService.getActionPlans()
          : StorageService.getActionPlans().filter((a) => a.companyId === company.id))
      : StorageService.getActionPlans(selectedCampaignId);

  const riskInventory =
    selectedCampaignId === 'all'
      ? (isAllCompanies
          ? StorageService.getRiskInventory()
          : StorageService.getRiskInventory().filter((r) => r.companyId === company.id))
      : StorageService.getRiskInventory(selectedCampaignId);

  // Form State para Nova / Edição 5W2H
  const [formData, setFormData] = useState<Partial<ActionPlanItem>>({
    sectorId: company.sectors[0]?.id || '',
    dangerTarget: 'Sobrecarga de Trabalho e Ritmo Intenso',
    hierarchyCategory: 'Proteção Coletiva / Organização do Trabalho',
    what: '',
    why: '',
    where: 'Setores Operacionais e Administrativos',
    who: 'Coordenação de Operações / RH',
    whenDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    how: '',
    costEstimate: 'Baixo / Recursos Internos',
    pdcaCycle: 'Plan',
    status: 'Não Iniciado',
    approvalStatus: 'approved',
    verificationMethod: 'Reavaliação semestral via questionário anônimo e redução de horas extras.',
  });

  const handleOpenAddModal = (preset?: Partial<ActionPlanItem>) => {
    setEditingItem(null);
    setFormData({
      sectorId: company.sectors[0]?.id || '',
      dangerTarget: preset?.dangerTarget || 'Sobrecarga de Trabalho / Exigências Emocionais',
      hierarchyCategory: preset?.hierarchyCategory || 'Proteção Coletiva / Organização do Trabalho',
      what: preset?.what || '',
      why: preset?.why || 'Mitigar risco psicossocial conforme exigência da NR-1 subitem 1.5.5.2',
      where: preset?.where || 'Todos os setores operacionais',
      who: preset?.who || 'SESMT / RH / Gestão de Pessoas',
      whenDate: preset?.whenDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      how: preset?.how || '',
      costEstimate: preset?.costEstimate || 'Recursos Internos',
      pdcaCycle: preset?.pdcaCycle || 'Plan',
      status: preset?.status || 'Não Iniciado',
      approvalStatus: preset?.approvalStatus || 'approved',
      verificationMethod: preset?.verificationMethod || 'Auditoria trimestral e acompanhamento de afastamentos pelo PCMSO.',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: ActionPlanItem) => {
    setEditingItem(item);
    setFormData(JSON.parse(JSON.stringify(item)));
    setShowModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.what || !formData.who || !formData.whenDate) {
      alert('Preencha os campos obrigatórios do Plano de Ação.');
      return;
    }

    const itemToSave: ActionPlanItem = {
      id: editingItem ? editingItem.id : `act-${Date.now()}`,
      campaignId: currentCampaign?.id || campaigns[0]?.id || 'camp-1',
      companyId: company.id === 'all' ? (formData.companyId || companies[0]?.id || 'comp-1') : company.id,
      sectorId: formData.sectorId || company.sectors[0]?.id || 'sec-1',
      riskInventoryId: formData.riskInventoryId,
      dangerTarget: formData.dangerTarget || 'Fatores Psicossociais Gerais',
      hierarchyCategory: formData.hierarchyCategory as any || 'Proteção Coletiva / Organização do Trabalho',
      what: formData.what!,
      why: formData.why || 'Conformidade com a NR-1.5.5.2 e promoção da saúde do trabalhador',
      where: formData.where || 'Estabelecimento Geral',
      who: formData.who!,
      whenDate: formData.whenDate!,
      how: formData.how || 'Implementação de rotinas e acompanhamento',
      costEstimate: formData.costEstimate || 'Recursos Internos',
      pdcaCycle: (formData.pdcaCycle as any) || 'Plan',
      status: (formData.status as any) || 'Não Iniciado',
      approvalStatus: formData.approvalStatus || (editingItem ? editingItem.approvalStatus : 'approved'),
      approvalHistory: editingItem ? editingItem.approvalHistory : [],
      verificationMethod: formData.verificationMethod || 'Monitoramento contínuo',
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveActionPlanItem(itemToSave);
    setShowModal(false);
    onRefreshData();
  };

  const handleDeleteItem = (id: string, what: string) => {
    if (confirm(`Excluir permanentemente a ação "${what}"?`)) {
      StorageService.deleteActionPlanItem(id);
      onRefreshData();
    }
  };

  const handleQuickStatusChange = (item: ActionPlanItem, nextStatus: ActionPlanItem['status']) => {
    let pdca: ActionPlanItem['pdcaCycle'] = 'Plan';
    if (nextStatus === 'Em Andamento') pdca = 'Do';
    else if (nextStatus === 'Em Revisão') pdca = 'Check';
    else if (nextStatus === 'Concluído') pdca = 'Act';

    const updated: ActionPlanItem = {
      ...item,
      status: nextStatus,
      pdcaCycle: pdca,
      approvalStatus: item.approvalStatus === 'suggested' ? 'approved' : item.approvalStatus || 'approved',
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveActionPlanItem(updated);
    onRefreshData();
  };

  // Iniciar fluxo de aprovação
  const handleOpenApproveModal = (item: ActionPlanItem, targetStage: 'pending_management' | 'approved') => {
    setApprovingItem({ item, targetStage });
    if (targetStage === 'pending_management') {
      setApprovalForm({
        approverName: technicalProfile.name || 'Dra. Carolina Ramos Mendes',
        approverRole: `${technicalProfile.title} (${technicalProfile.professionalCouncil})`,
        notes: 'Validado tecnicamente quanto à viabilidade e conformidade com NR-1 e NR-17.',
      });
    } else {
      setApprovalForm({
        approverName: company.contactPerson || 'Diretoria de Recursos Humanos',
        approverRole: 'Gerência / Diretoria Executiva',
        notes: 'Recursos orçamentários aprovados e inclusão oficial homologada no PGR.',
      });
    }
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingItem) return;

    const { item, targetStage } = approvingItem;
    const history = item.approvalHistory ? [...item.approvalHistory] : [];

    const newLog: ActionApprovalLog = {
      stage: targetStage === 'pending_management' ? 'technical_validation' : 'management_approval',
      stageLabel:
        targetStage === 'pending_management'
          ? 'Validação Técnica (SESMT / Médico / Ergonomia)'
          : 'Aprovação de Gestão & Homologação PGR',
      approverName: approvalForm.approverName.trim() || 'Gestor Responsável',
      approverRole: approvalForm.approverRole.trim() || 'SESMT / Diretoria',
      date: new Date().toISOString(),
      notes: approvalForm.notes.trim() || undefined,
    };

    history.push(newLog);

    const updated: ActionPlanItem = {
      ...item,
      approvalStatus: targetStage,
      approvalHistory: history,
      rejectionReason: undefined,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveActionPlanItem(updated);
    setApprovingItem(null);
    onRefreshData();
  };

  // Abrir Modal de Recusa
  const handleOpenRejectModal = (item: ActionPlanItem) => {
    setRejectingItem(item);
    setRejectionForm({
      approverName: technicalProfile.name || 'Gestor Técnico',
      approverRole: `${technicalProfile.title} / SESMT`,
      reason: 'Inviabilidade técnica no formato atual ou duplicidade com medida já implementada.',
    });
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;

    const history = rejectingItem.approvalHistory ? [...rejectingItem.approvalHistory] : [];
    history.push({
      stage: 'rejection',
      stageLabel: 'Recusa Justificada da Proposta',
      approverName: rejectionForm.approverName.trim() || 'Gestor Responsável',
      approverRole: rejectionForm.approverRole.trim() || 'SESMT / Diretoria',
      date: new Date().toISOString(),
      notes: rejectionForm.reason.trim(),
    });

    const updated: ActionPlanItem = {
      ...rejectingItem,
      approvalStatus: 'rejected',
      rejectionReason: rejectionForm.reason.trim(),
      approvalHistory: history,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveActionPlanItem(updated);
    setRejectingItem(null);
    onRefreshData();
  };

  // Reabrir proposta recusada
  const handleReopenAction = (item: ActionPlanItem) => {
    const updated: ActionPlanItem = {
      ...item,
      approvalStatus: 'pending_technical',
      rejectionReason: undefined,
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveActionPlanItem(updated);
    onRefreshData();
  };

  // Sugestões de IA conectadas à rota /api/ai/generate-action-plan
  const handleGenerateAIActions = async () => {
    setIsGeneratingAI(true);
    try {
      const highRisks = riskInventory.filter((r) => r.riskLevel === 'ALTO' || r.riskLevel === 'MUITO ALTO');
      const criticalDimensions = highRisks.map((r) => r.dangerName);

      const response = await fetch('/api/ai/generate-action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.tradeName,
          sector: company.sectors[0]?.name,
          riskLevel: highRisks.length > 0 ? 'Alto' : 'Médio',
          respondentCount: company.totalEmployees,
          criticalDimensions: criticalDimensions.length > 0 ? criticalDimensions : ['Exigências Quantitativas e Ritmo', 'Baixo Suporte Social'],
        }),
      });

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        data.suggestions.forEach((sug: any, idx: number) => {
          let cat: ActionPlanItem['hierarchyCategory'] = 'Proteção Coletiva / Organização do Trabalho';
          if (sug.category === 'Administrativa') cat = 'Medidas Administrativas / Capacitação';
          if (sug.category === 'Ergonômica') cat = 'Proteção Coletiva / Organização do Trabalho';
          if (sug.category === 'Apoio e Vigilância') cat = 'Vigilância em Saúde';

          const newAction: ActionPlanItem = {
            id: `act-ai-${Date.now()}-${idx}`,
            campaignId: currentCampaign?.id || 'camp-1',
            companyId: company.id === 'all' ? (companies[0]?.id || 'comp-1') : company.id,
            sectorId: company.sectors[0]?.id || 'sec-1',
            dangerTarget: sug.title,
            hierarchyCategory: cat,
            what: sug.title + ': ' + sug.description,
            why: 'Controle de riscos psicossociais priorizados na AEP conforme NR-1.5.5.2',
            where: 'Setores avaliados',
            who: sug.responsible || 'SESMT / Gestão de RH',
            whenDate: new Date(Date.now() + (sug.termMonths || 2) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            how: sug.description,
            costEstimate: 'Recursos Operacionais',
            pdcaCycle: 'Plan',
            status: 'Não Iniciado',
            source: 'ai_assistant',
            approvalStatus: 'pending_technical',
            approvalHistory: [
              {
                stage: 'technical_validation',
                stageLabel: 'Sugestão Inteligente por IA',
                approverName: 'MindGuard AI (Gemini 2.5)',
                approverRole: 'Assistente Técnico de Ergonomia',
                date: new Date().toISOString(),
                notes: 'Proposta gerada a partir dos pontos críticos levantados na avaliação psicossocial.',
              },
            ],
            verificationMethod: sug.measurement || 'Aferição semestral via indicadores de absenteísmo e clima.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          StorageService.saveActionPlanItem(newAction);
        });

        alert(`${data.suggestions.length} ações inteligentes foram propostas e enviadas para Validação Técnica!`);
        setApprovalTab('pending_technical');
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com a IA. Adicione ações manualmente.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Cálculos de Prazos e Responsáveis para Filtros do Gestor
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Lista de Responsáveis únicos cadastrados nas ações
  const uniqueResponsibles = Array.from(
    new Set(actionPlans.map((a) => a.who?.trim()).filter(Boolean))
  ).sort();

  // Contagem de Atrasadas e A Vencer no Mês
  const countOverdue = actionPlans.filter((a) => {
    if (a.status === 'Concluído' || a.approvalStatus === 'rejected') return false;
    const { isOverdue } = getDeadlineInfo(a.whenDate, a.status);
    return isOverdue;
  }).length;

  const countThisMonth = actionPlans.filter((a) => {
    if (a.status === 'Concluído' || a.approvalStatus === 'rejected') return false;
    const { diffDays } = getDeadlineInfo(a.whenDate, a.status);
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  // Copiar Ficha 5W2H / Ordem de Serviço da Ação
  const handleCopy5W2H = (action: ActionPlanItem) => {
    const sec = company.sectors.find((s) => s.id === action.sectorId)?.name || 'Setor Geral';
    const text = `📋 *ORDEM DE SERVIÇO / DELEGAÇÃO DE AÇÃO 5W2H (NR-1)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Empresa:* ${company.name}
📍 *Setor (Where):* ${sec}
🎯 *Risco / Perigo Identificado:* ${action.dangerTarget}

👤 *RESPONSÁVEL (Who):* ${action.who}
📅 *PRAZO LIMITE (When):* ${action.whenDate}
🔄 *STATUS PDCA:* ${action.status} (${action.pdcaCycle})

📌 *O QUE FAZER (What):*
${action.what}

💡 *POR QUE FAZER (Why):*
${action.why}

⚙️ *COMO EXECUTAR (How):*
${action.how}

💰 *RECURSOS / CUSTO (How Much):*
${action.costEstimate || 'Recursos Internos'}

🔍 *MÉTODO DE AFERIÇÃO DE EFICÁCIA (NR-1.5.5.3.2):*
${action.verificationMethod}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Status da Medida:* ${action.approvalStatus === 'approved' ? '✅ Homologada no PGR Oficial' : '⏳ Em Fluxo de Aprovação'}`;

    navigator.clipboard.writeText(text);
    setCopiedActionId(action.id);
    setTimeout(() => setCopiedActionId(null), 3000);
  };

  // Exportar Lista Filtrada para CSV
  const handleExportFilteredCSV = () => {
    if (filteredActions.length === 0) {
      alert('Nenhuma ação para exportar com os filtros atuais.');
      return;
    }
    const headers = [
      'ID',
      'Setor',
      'Perigo / Risco',
      'O que fazer (What)',
      'Por que fazer (Why)',
      'Responsável (Who)',
      'Prazo (When)',
      'Como fazer (How)',
      'Recursos (How Much)',
      'Status PDCA',
      'Ciclo PDCA',
      'Status Homologação',
      'Aferição de Eficácia',
    ];
    const rows = filteredActions.map((a) => {
      const sec = company.sectors.find((s) => s.id === a.sectorId)?.name || 'Geral';
      return [
        `"${a.id}"`,
        `"${sec}"`,
        `"${a.dangerTarget?.replace(/"/g, '""') || ''}"`,
        `"${a.what?.replace(/"/g, '""') || ''}"`,
        `"${a.why?.replace(/"/g, '""') || ''}"`,
        `"${a.who?.replace(/"/g, '""') || ''}"`,
        `"${a.whenDate || ''}"`,
        `"${a.how?.replace(/"/g, '""') || ''}"`,
        `"${a.costEstimate?.replace(/"/g, '""') || ''}"`,
        `"${a.status}"`,
        `"${a.pdcaCycle}"`,
        `"${a.approvalStatus || 'approved'}"`,
        `"${a.verificationMethod?.replace(/"/g, '""') || ''}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Plano_de_Acao_5W2H_${company.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setApprovalTab('all');
    setStatusFilter('all');
    setSectorFilter('all');
    setResponsibleFilter('all');
    setDeadlineFilter('all');
    setSearchQuery('');
  };

  const isAnyFilterActive =
    statusFilter !== 'all' ||
    sectorFilter !== 'all' ||
    responsibleFilter !== 'all' ||
    deadlineFilter !== 'all' ||
    searchQuery.trim() !== '';

  // Contadores do Fluxo de Aprovação
  const countApproved = actionPlans.filter((a) => a.approvalStatus === 'approved' || !a.approvalStatus).length;
  const countPendingTech = actionPlans.filter((a) => a.approvalStatus === 'pending_technical').length;
  const countPendingMgmt = actionPlans.filter((a) => a.approvalStatus === 'pending_management').length;
  const countSuggested = actionPlans.filter((a) => a.approvalStatus === 'suggested').length;
  const countRejected = actionPlans.filter((a) => a.approvalStatus === 'rejected').length;
  const totalAll = actionPlans.length;

  // Filtros combinados completos
  const filteredActions = actionPlans.filter((act) => {
    // 1. Filtro por aba de aprovação
    const actApproval = act.approvalStatus || 'approved';
    if (approvalTab !== 'all') {
      if (approvalTab === 'approved' && actApproval !== 'approved') return false;
      if (approvalTab === 'pending_technical' && actApproval !== 'pending_technical') return false;
      if (approvalTab === 'pending_management' && actApproval !== 'pending_management') return false;
      if (approvalTab === 'suggested' && actApproval !== 'suggested') return false;
      if (approvalTab === 'rejected' && actApproval !== 'rejected') return false;
    }
    // 2. Filtro por status de execução PDCA
    if (statusFilter !== 'all' && act.status !== statusFilter) return false;
    // 3. Filtro por setor
    if (sectorFilter !== 'all' && act.sectorId !== sectorFilter) return false;
    // 4. Filtro por Responsável (Who)
    if (responsibleFilter !== 'all' && act.who?.trim() !== responsibleFilter) return false;
    // 5. Filtro por Prazo / Urgência
    const deadline = getDeadlineInfo(act.whenDate, act.status);
    if (deadlineFilter === 'overdue') {
      if (!deadline.isOverdue) return false;
    } else if (deadlineFilter === 'this_month') {
      if (deadline.diffDays < 0 || deadline.diffDays > 30) return false;
    } else if (deadlineFilter === 'next_60') {
      if (deadline.diffDays <= 30 || deadline.diffDays > 60) return false;
    } else if (deadlineFilter === 'future') {
      if (deadline.diffDays <= 60) return false;
    }
    // 6. Busca por texto livre
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
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

  const completedActions = actionPlans.filter((a) => (a.approvalStatus === 'approved' || !a.approvalStatus) && a.status === 'Concluído').length;
  const inProgressActions = actionPlans.filter((a) => (a.approvalStatus === 'approved' || !a.approvalStatus) && a.status === 'Em Andamento').length;
  const notStartedActions = actionPlans.filter((a) => (a.approvalStatus === 'approved' || !a.approvalStatus) && a.status === 'Não Iniciado').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Quadro Evidente da Empresa & Filtro de Avaliações */}
      <CompanyCampaignHeader
        company={company}
        companies={companies}
        onSelectCompany={onSelectCompany}
        campaigns={campaigns}
        selectedCampaignId={selectedCampaignId}
        onSelectCampaign={setSelectedCampaignId}
        allowAllCampaigns={true}
        allowAllCompanies={true}
        allCompaniesLabel="Todas as Empresas"
        allCampaignsLabel={isAllCompanies ? 'Todas as avaliações consolidadas' : 'Todas as avaliações da empresa'}
      >
        <button
          onClick={handleGenerateAIActions}
          disabled={isGeneratingAI}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold shadow-2xs transition disabled:opacity-50"
          title="Gera propostas de intervenção ergonômica com IA baseadas nos riscos levantados"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>{isGeneratingAI ? 'Gerando IA...' : 'Sugerir Ações com IA'}</span>
        </button>

        <button
          id="add-action-plan-btn"
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Ação 5W2H</span>
        </button>
      </CompanyCampaignHeader>

      {/* Seletor Principal de Abas: 1. Governança & Aprovações vs 2. Cronograma & Execução Visual */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMainSectionTab('governance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
              mainSectionTab === 'governance'
                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <CheckSquare2 className="w-4 h-4" />
            <span>1. Governança & Aprovações</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              mainSectionTab === 'governance' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalAll}
            </span>
          </button>

          <button
            onClick={() => setMainSectionTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
              mainSectionTab === 'schedule'
                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            <span>2. Cronograma & Execução Visual</span>
            {countOverdue > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                {countOverdue} Atrasadas
              </span>
            ) : (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                mainSectionTab === 'schedule' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {countApproved} Ativas
              </span>
            )}
          </button>
        </div>

        {mainSectionTab === 'governance' && (
          <button
            onClick={() => setShowHelpBanner(!showHelpBanner)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>{showHelpBanner ? 'Ocultar Explicação' : 'Como funciona a Aprovação?'}</span>
          </button>
        )}
      </div>

      {mainSectionTab === 'schedule' ? (
        <ActionPlanScheduleView
          company={company}
          campaigns={campaigns}
          currentCampaign={currentCampaign}
          actionPlans={actionPlans}
          sectors={company.sectors}
          onRefreshData={onRefreshData}
          onOpenEditModal={(item) => handleOpenEditModal(item)}
        />
      ) : (
        <>
          {/* Sub Header Informativo & Botão de Ajuda Didática */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Plano de Ação 5W2H & Fluxo de Aprovação</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  NR-1.5.5.2 • Ciclo PDCA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Governança completa para validação técnica, aprovação de orçamento e execução oficial no PGR
              </p>
            </div>
          </div>

          {/* Banner Didático Explicativo (Acessível para quem tem pouca experiência técnica) */}
          {showHelpBanner && (
            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/80 rounded-2xl p-5 text-slate-800 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Info className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Por que existe o Fluxo de Aprovação de Ações?</span>
                </div>
                <button
                  onClick={() => setShowHelpBanner(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                Toda medida registrada no <strong>Plano de Ação do PGR</strong> torna-se um <strong>compromisso legal fiscalizado pelo Ministério do Trabalho (NR-1)</strong>. Para garantir segurança jurídica e viabilidade financeira, as ações percorrem etapas simples antes de virarem lei na empresa:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[11px]">1</span>
                    <span>Sugestão / IA</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    O questionário ou a IA identificam um risco crítico e sugerem uma medida preventiva preliminar.
                  </p>
                </div>

                <div className="bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[11px]">2</span>
                    <span>Validação Técnica</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    O Médico, Ergonomista ou SESMT confere se a medida atende às NRs e tem embasamento.
                  </p>
                </div>

                <div className="bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[11px]">3</span>
                    <span>Aprovação de Gestão</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    A Diretoria ou RH aprova os prazos, define o responsável nominal e libera o orçamento.
                  </p>
                </div>

                <div className="bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[11px]">4</span>
                    <span>Oficial no PGR</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Ação homologada com força oficial, monitorada no ciclo PDCA até sua conclusão e eficácia.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Interativo Visual - Stepper de Estágios */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Esteira de Governança e Aprovação
              </span>
              <span className="text-[11px] text-slate-500">
                Clique em qualquer etapa para filtrar as ações
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Etapa 1: Sugestões */}
              <button
                onClick={() => setApprovalTab('suggested')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  approvalTab === 'suggested'
                    ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded bg-purple-100 text-purple-700">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-bold text-purple-900">{countSuggested}</span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-900 leading-tight">1. Sugestões</div>
                  <div className="text-[10px] text-slate-500">Diagnóstico preliminar</div>
                </div>
              </button>

              {/* Etapa 2: Pendente Técnico */}
              <button
                onClick={() => setApprovalTab('pending_technical')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  approvalTab === 'pending_technical'
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded bg-amber-100 text-amber-700">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-bold text-amber-900">{countPendingTech}</span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-900 leading-tight">2. Análise SESMT</div>
                  <div className="text-[10px] text-slate-500">Validação Técnica</div>
                </div>
              </button>

              {/* Etapa 3: Pendente Gestão */}
              <button
                onClick={() => setApprovalTab('pending_management')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  approvalTab === 'pending_management'
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded bg-indigo-100 text-indigo-700">
                    <Building2 className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-bold text-indigo-900">{countPendingMgmt}</span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-900 leading-tight">3. Diretoria / RH</div>
                  <div className="text-[10px] text-slate-500">Aprovação de verba</div>
                </div>
              </button>

              {/* Etapa 4: Oficial PGR (Aprovadas) */}
              <button
                onClick={() => setApprovalTab('approved')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  approvalTab === 'approved'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-bold text-emerald-900">{countApproved}</span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-900 leading-tight">4. Oficial no PGR</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Homologadas ({completedActions} concluídas)</div>
                </div>
              </button>

              {/* Etapa 5: Recusadas */}
              <button
                onClick={() => setApprovalTab('rejected')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  approvalTab === 'rejected'
                    ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded bg-red-100 text-red-700">
                    <XCircle className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-bold text-red-900">{countRejected}</span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-900 leading-tight">Recusadas</div>
                  <div className="text-[10px] text-slate-500">Descartadas com motivo</div>
                </div>
              </button>
            </div>
          </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        {/* Abas e Filtros Superiores */}
        <div className="space-y-4 border-b border-slate-100 pb-5">
          {/* Linha 1: Abas do Fluxo de Aprovação e Ações de Exportação */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setApprovalTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  approvalTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({totalAll})
              </button>
              <button
                onClick={() => setApprovalTab('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  approvalTab === 'approved'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Oficial no PGR ({countApproved})</span>
              </button>
              <button
                onClick={() => setApprovalTab('pending_technical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  approvalTab === 'pending_technical'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Validação Técnica ({countPendingTech})</span>
              </button>
              <button
                onClick={() => setApprovalTab('pending_management')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  approvalTab === 'pending_management'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Aprovação Diretoria ({countPendingMgmt})</span>
              </button>
              {countSuggested > 0 && (
                <button
                  onClick={() => setApprovalTab('suggested')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    approvalTab === 'suggested'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sugestões ({countSuggested})</span>
                </button>
              )}
              {countRejected > 0 && (
                <button
                  onClick={() => setApprovalTab('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    approvalTab === 'rejected'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-red-50 text-red-800 hover:bg-red-100'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Recusadas ({countRejected})</span>
                </button>
              )}
            </div>

            {/* Ações Rápidas: Exportar Planilha / CSV */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportFilteredCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                title="Exportar planilha de ações filtradas para Excel / CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Exportar Planilha ({filteredActions.length})</span>
              </button>
            </div>
          </div>

          {/* Linha 2: BARRA DE GESTÃO DO GESTOR (Busca, Responsável, Prazo/Urgência, Setor, PDCA) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Campo de Busca Rápida */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por ação, responsável, risco ou setor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grupo de Filtros Dropdown */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filtro por Responsável (Who) */}
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <select
                  value={responsibleFilter}
                  onChange={(e) => setResponsibleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px] truncate"
                  title="Filtrar por Responsável (Who)"
                >
                  <option value="all">Todos Responsáveis</option>
                  {uniqueResponsibles.map((resp) => {
                    const count = actionPlans.filter((a) => a.who?.trim() === resp).length;
                    return (
                      <option key={resp} value={resp}>
                        {resp} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Filtro por Prazo & Urgência (When) */}
              <div className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={deadlineFilter}
                  onChange={(e) => setDeadlineFilter(e.target.value)}
                  className={`px-2.5 py-1.5 bg-white border rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    deadlineFilter === 'overdue'
                      ? 'border-red-300 text-red-700 font-bold bg-red-50'
                      : deadlineFilter === 'this_month'
                      ? 'border-amber-300 text-amber-800 font-bold bg-amber-50'
                      : 'border-slate-200 text-slate-800'
                  }`}
                  title="Filtrar por Prazo e Urgência de Execução"
                >
                  <option value="all">Todos os Prazos</option>
                  <option value="overdue">🚨 Atrasadas / Vencidas ({countOverdue})</option>
                  <option value="this_month">📅 Vence este Mês / 30d ({countThisMonth})</option>
                  <option value="next_60">🗓️ Próximos 60 dias</option>
                  <option value="future">⏳ Prazos Posteriores</option>
                </select>
              </div>

              {/* Filtro por Setor */}
              <div className="flex items-center gap-1">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[140px] truncate"
                  title="Filtrar por Setor"
                >
                  <option value="all">Todos Setores</option>
                  {company.sectors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Status PDCA */}
              {approvalTab === 'approved' && (
                <div className="flex items-center gap-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    title="Filtrar por Status PDCA"
                  >
                    <option value="all">Todos Status PDCA</option>
                    <option value="Não Iniciado">⚪ Não Iniciado</option>
                    <option value="Em Andamento">🔵 Em Andamento</option>
                    <option value="Em Revisão">🟣 Em Revisão</option>
                    <option value="Concluído">🟢 Concluído</option>
                  </select>
                </div>
              )}

              {/* Botão de Limpar Filtros */}
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200 transition"
                  title="Limpar todos os filtros ativos"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Resumo da Contagem Filtrada */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Exibindo <strong>{filteredActions.length}</strong> de <strong>{totalAll}</strong> ações
              {isAnyFilterActive && ' (filtros aplicados)'}
            </span>
            {countOverdue > 0 && (
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                {countOverdue} {countOverdue === 1 ? 'ação atrasada requer atenção' : 'ações atrasadas requerem atenção'}
              </span>
            )}
          </div>
        </div>

        {/* Lista de Ações 5W2H */}
        {filteredActions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <CheckSquare2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Nenhuma ação encontrada com os filtros selecionados.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Tente redefinir os filtros de responsável, prazo ou texto clicando em "Limpar", ou adicione uma nova ação no botão superior.
            </p>
            {isAnyFilterActive && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                Limpar Todos os Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActions.map((action) => {
              const sector = company.sectors.find((s) => s.id === action.sectorId);
              const approval = action.approvalStatus || 'approved';
              const deadline = getDeadlineInfo(action.whenDate, action.status);

              let approvalBadge = {
                label: 'Oficial no PGR',
                classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                icon: ShieldCheck,
              };
              if (approval === 'pending_technical') {
                approvalBadge = {
                  label: 'Aguardando Validação Técnica (SESMT)',
                  classes: 'bg-amber-100 text-amber-800 border-amber-300',
                  icon: Stethoscope,
                };
              } else if (approval === 'pending_management') {
                approvalBadge = {
                  label: 'Aguardando Aprovação Diretoria/RH',
                  classes: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                  icon: Building2,
                };
              } else if (approval === 'suggested') {
                approvalBadge = {
                  label: 'Sugestão do Diagnóstico COPSOQ',
                  classes: 'bg-purple-100 text-purple-800 border-purple-300',
                  icon: Sparkles,
                };
              } else if (approval === 'rejected') {
                approvalBadge = {
                  label: 'Proposta Recusada',
                  classes: 'bg-red-100 text-red-800 border-red-300',
                  icon: XCircle,
                };
              }

              const StatusIcon = approvalBadge.icon;

              return (
                <div
                  key={action.id}
                  className={`p-5 rounded-2xl border transition shadow-2xs space-y-3.5 ${
                    approval === 'approved'
                      ? 'bg-white border-slate-200/90 hover:border-slate-300'
                      : approval === 'pending_technical'
                      ? 'bg-amber-50/30 border-amber-200/80 hover:border-amber-300'
                      : approval === 'pending_management'
                      ? 'bg-indigo-50/30 border-indigo-200/80 hover:border-indigo-300'
                      : approval === 'rejected'
                      ? 'bg-red-50/20 border-red-200/70'
                      : 'bg-purple-50/30 border-purple-200/80'
                  }`}
                >
                  {/* Top Bar: Badges + Botões de Ação do Workflow */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Selo do Fluxo de Aprovação */}
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${approvalBadge.classes}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{approvalBadge.label}</span>
                        </span>

                        {/* Selo de Prazo / Urgência */}
                        {action.status === 'Concluído' ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Concluída</span>
                          </span>
                        ) : deadline.isOverdue ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 flex items-center gap-1 animate-pulse">
                            <AlertOctagon className="w-3 h-3 text-red-600" />
                            <span>Atrasada há {Math.abs(deadline.diffDays)} {Math.abs(deadline.diffDays) === 1 ? 'dia' : 'dias'}</span>
                          </span>
                        ) : deadline.diffDays >= 0 && deadline.diffDays <= 7 ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Vence em {deadline.diffDays === 0 ? 'hoje' : `${deadline.diffDays}d`}</span>
                          </span>
                        ) : deadline.diffDays > 7 && deadline.diffDays <= 30 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3 text-blue-600" />
                            <span>Vence este mês ({deadline.diffDays}d)</span>
                          </span>
                        ) : null}

                        {/* Selo da Hierarquia NR-1 */}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {action.hierarchyCategory}
                        </span>

                        <span className="text-xs text-slate-500 font-medium">
                          Setor: {sector?.name || 'Geral'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>{action.what}</span>
                      </h3>
                    </div>

                    {/* Ações Rápidas do Workflow */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {/* Se Pendente Técnico ou Sugestão -> Botão para Validar Técnica */}
                      {(approval === 'pending_technical' || approval === 'suggested') && (
                        <>
                          <button
                            onClick={() => handleOpenApproveModal(action, 'pending_management')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
                            title="Validar tecnicamente e encaminhar para aprovação da Diretoria"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Validar Técnica</span>
                          </button>

                          <button
                            onClick={() => handleOpenRejectModal(action)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold transition"
                            title="Recusar proposta com justificativa"
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            <span>Recusar</span>
                          </button>
                        </>
                      )}

                      {/* Se Pendente Diretoria -> Botão para Homologar no PGR */}
                      {approval === 'pending_management' && (
                        <>
                          <button
                            onClick={() => handleOpenApproveModal(action, 'approved')}
                            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                            title="Aprovar orçamento e homologar oficialmente no PGR"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Aprovar & Homologar PGR</span>
                          </button>

                          <button
                            onClick={() => handleOpenRejectModal(action)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold transition"
                            title="Recusar com justificativa"
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            <span>Recusar</span>
                          </button>
                        </>
                      )}

                      {/* Se Aprovada -> Seletor Dropdown de Status PDCA */}
                      {approval === 'approved' && (
                        <div className="flex items-center gap-1.5 bg-slate-100/90 px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PDCA:</span>
                          <select
                            value={action.status}
                            onChange={(e) => handleQuickStatusChange(action, e.target.value as ActionPlanItem['status'])}
                            className={`text-xs font-bold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                              action.status === 'Concluído'
                                ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                                : action.status === 'Em Andamento'
                                ? 'bg-blue-600 text-white border-blue-700 font-bold'
                                : action.status === 'Em Revisão'
                                ? 'bg-purple-600 text-white border-purple-700 font-bold'
                                : 'bg-white text-slate-800 border-slate-300 font-bold'
                            }`}
                            title="Selecione o status diretamente"
                          >
                            <option value="Não Iniciado" className="bg-white text-slate-800 font-medium">⚪ Não Iniciado (Plan)</option>
                            <option value="Em Andamento" className="bg-white text-slate-800 font-medium">🔵 Em Andamento (Do)</option>
                            <option value="Em Revisão" className="bg-white text-slate-800 font-medium">🟣 Em Revisão (Check)</option>
                            <option value="Concluído" className="bg-white text-slate-800 font-medium">🟢 Concluído (Act)</option>
                          </select>
                        </div>
                      )}

                      {/* Se Recusada -> Botão de Reabrir */}
                      {approval === 'rejected' && (
                        <button
                          onClick={() => handleReopenAction(action)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                          title="Reabrir proposta para reavaliação técnica"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reabrir Proposta</span>
                        </button>
                      )}

                      {/* Botão de Copiar Ficha de Delegação 5W2H para Envio ao Responsável */}
                      <button
                        onClick={() => handleCopy5W2H(action)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                          copiedActionId === action.id
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                        }`}
                        title="Copiar Ficha 5W2H formatada para delegar por WhatsApp ou E-mail ao responsável"
                      >
                        {copiedActionId === action.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Copiar Ordem 5W2H</span>
                          </>
                        )}
                      </button>

                      {/* Botão de Edição 5W2H */}
                      <button
                        onClick={() => handleOpenEditModal(action)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg transition"
                        title="Editar Detalhes 5W2H"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Botão de Excluir */}
                      <button
                        onClick={() => handleDeleteItem(action.id, action.what)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Ação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Alerta de Motivo de Recusa (se recusada) */}
                  {approval === 'rejected' && action.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[11px] text-red-800">Motivo do Cancelamento / Recusa:</strong>
                        <p>{action.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {/* 5W2H Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs bg-slate-50/90 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Why (Justificativa)</span>
                      <p className="text-slate-700 font-medium text-[11px] line-clamp-2">{action.why || 'Prevenção de riscos ergonômicos e psicossociais'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Who (Responsável)</span>
                      <p className="text-slate-800 font-semibold text-[11px] flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{action.who}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">When (Prazo Limite)</span>
                      <p className="text-slate-800 font-semibold text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{action.whenDate}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">How Much (Recursos)</span>
                      <p className="text-slate-700 font-medium text-[11px]">{action.costEstimate || 'Recursos Internos'}</p>
                    </div>
                  </div>

                  {/* Detalhe do How & Aferição de Eficácia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <strong className="text-slate-700 block mb-0.5">How (Como será executado):</strong>
                      <p className="text-slate-600 text-[11px]">{action.how || 'Conforme cronograma operacional'}</p>
                    </div>
                    <div>
                      <strong className="text-slate-700 block mb-0.5">
                        Aferição de Eficácia (NR-1.5.5.3.2):
                      </strong>
                      <p className="text-slate-600 text-[11px]">{action.verificationMethod || 'Monitoramento trimestral'}</p>
                    </div>
                  </div>

                  {/* Trilha de Auditoria / Histórico de Aprovação (Se houver) */}
                  {action.approvalHistory && action.approvalHistory.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase mb-1.5">
                        <History className="w-3 h-3 text-slate-400" />
                        <span>Trilha de Auditoria & Assinaturas de Aprovação</span>
                      </div>
                      <div className="space-y-1.5">
                        {action.approvalHistory.map((log, lIdx) => (
                          <div
                            key={lIdx}
                            className="flex items-start justify-between gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-slate-700"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span className="font-semibold">{log.stageLabel}:</span>
                              <span>{log.approverName} ({log.approverRole})</span>
                              {log.notes && <span className="text-slate-500 italic">— "{log.notes}"</span>}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {new Date(log.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE APROVAÇÃO / AVANÇO DE ETAPA NO WORKFLOW                          */}
      {/* ========================================================================= */}
      {approvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {approvingItem.targetStage === 'pending_management'
                      ? 'Validar Técnica (SESMT / Ergonomia)'
                      : 'Homologar Ação no PGR Oficial'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {approvingItem.targetStage === 'pending_management'
                      ? 'Encaminha a proposta para aprovação orçamentária da Diretoria'
                      : 'Incorpora a ação como compromisso legal com prazo no PGR'}
                  </p>
                </div>
              </div>
              <button onClick={() => setApprovingItem(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <strong className="text-slate-900 block mb-0.5">{approvingItem.item.what}</strong>
              <span className="text-slate-500">Responsável: {approvingItem.item.who} • Prazo: {approvingItem.item.whenDate}</span>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Profissional / Aprovador *</label>
                <input
                  type="text"
                  required
                  value={approvalForm.approverName}
                  onChange={(e) => setApprovalForm({ ...approvalForm, approverName: e.target.value })}
                  placeholder="Ex: Dra. Carolina Ramos Mendes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cargo / Conselho de Classe *</label>
                <input
                  type="text"
                  required
                  value={approvalForm.approverRole}
                  onChange={(e) => setApprovalForm({ ...approvalForm, approverRole: e.target.value })}
                  placeholder="Ex: Médica do Trabalho (CRM/SP 148.920)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Parecer Técnico / Observações</label>
                <textarea
                  rows={2}
                  value={approvalForm.notes}
                  onChange={(e) => setApprovalForm({ ...approvalForm, notes: e.target.value })}
                  placeholder="Parecer sobre conformidade e viabilidade..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setApprovingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Aprovação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE RECUSA / CANCELAMENTO DE PROPOSTA                                */}
      {/* ========================================================================= */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Recusar Proposta Técnica</h3>
                  <p className="text-xs text-slate-500">
                    Registre a justificativa técnica para rastreabilidade de auditoria
                  </p>
                </div>
              </div>
              <button onClick={() => setRejectingItem(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <strong className="text-slate-900 block mb-0.5">{rejectingItem.what}</strong>
              <span className="text-slate-500">Setor: {company.sectors.find((s) => s.id === rejectingItem.sectorId)?.name || 'Geral'}</span>
            </div>

            <form onSubmit={handleConfirmRejection} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Motivos Frequentes (Clique para preencher rápido):</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    'Já atendido por reforma/medida anterior',
                    'Inviabilidade técnica comprovada',
                    'Custo orçamentário desproporcional',
                    'Substituído por outra medida ergonômica',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionForm({ ...rejectionForm, reason: preset })}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Justificativa da Recusa *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionForm.reason}
                  onChange={(e) => setRejectionForm({ ...rejectionForm, reason: e.target.value })}
                  placeholder="Descreva por que a medida não será adotada no PGR..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Profissional / Avaliador *</label>
                  <input
                    type="text"
                    required
                    value={rejectionForm.approverName}
                    onChange={(e) => setRejectionForm({ ...rejectionForm, approverName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cargo / SESMT *</label>
                  <input
                    type="text"
                    required
                    value={rejectionForm.approverRole}
                    onChange={(e) => setRejectionForm({ ...rejectionForm, approverRole: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirmar Recusa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO / EDIÇÃO 5W2H                                           */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl my-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingItem ? 'Editar Ação 5W2H' : 'Cadastrar Nova Medida Preventiva (5W2H)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Planejamento conforme subitem 1.5.5.2 e acompanhamento de eficácia 1.5.5.3.2 da NR-1
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Setor / GHE *</label>
                  <select
                    value={formData.sectorId}
                    onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {company.sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hierarquia de Prevenção (NR-1.5.5.2)</label>
                  <select
                    value={formData.hierarchyCategory}
                    onChange={(e) => setFormData({ ...formData, hierarchyCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Evitar/Eliminar">1. Evitar / Eliminar o Perigo (Redesenho)</option>
                    <option value="Proteção Coletiva / Organização do Trabalho">
                      2. Proteção Coletiva / Organização do Trabalho
                    </option>
                    <option value="Medidas Administrativas / Capacitação">
                      3. Medidas Administrativas / Capacitação de Liderança
                    </option>
                    <option value="EPI / Proteção Individual">4. Proteção Individual / Suporte Psicológico</option>
                    <option value="Vigilância em Saúde">5. Vigilância Epidemiológica (PCMSO)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">What (O que será feito) *</label>
                <input
                  type="text"
                  required
                  value={formData.what || ''}
                  onChange={(e) => setFormData({ ...formData, what: e.target.value })}
                  placeholder="Ex: Reestruturação dos fluxos de trabalho e implantação de pausas ergonômicas regulares"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Why (Por que será feito / Justificativa)</label>
                <textarea
                  rows={2}
                  value={formData.why || ''}
                  onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                  placeholder="Ex: Reduzir a sobrecarga quantitativa e prevenir afastamentos por esgotamento profissional (Burnout)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Who (Responsável) *</label>
                  <input
                    type="text"
                    required
                    value={formData.who || ''}
                    onChange={(e) => setFormData({ ...formData, who: e.target.value })}
                    placeholder="Ex: Gerente de Operações / RH"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">When (Data Limite / Prazo) *</label>
                  <input
                    type="date"
                    required
                    value={formData.whenDate || ''}
                    onChange={(e) => setFormData({ ...formData, whenDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Where (Onde / Local)</label>
                  <input
                    type="text"
                    value={formData.where || ''}
                    onChange={(e) => setFormData({ ...formData, where: e.target.value })}
                    placeholder="Ex: Setor de Atendimento SAC"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">How (Como será executado)</label>
                <textarea
                  rows={3}
                  value={formData.how || ''}
                  onChange={(e) => setFormData({ ...formData, how: e.target.value })}
                  placeholder="Detalhamento das etapas de implantação..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Aferição de Eficácia (Subitem 1.5.5.3.2 da NR-1)
                </label>
                <textarea
                  rows={3}
                  value={formData.verificationMethod || ''}
                  onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
                  placeholder="Indicador mensurável: Redução do índice de sobrecarga em 30% em 90 dias, reavaliação ou inspeção periódica..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estágio de Aprovação</label>
                  <select
                    value={formData.approvalStatus || 'approved'}
                    onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="approved">✅ Oficial no PGR (Aprovada)</option>
                    <option value="pending_technical">🟡 Aguardando Validação Técnica</option>
                    <option value="pending_management">🟠 Aguardando Aprovação Diretoria</option>
                    <option value="suggested">🟣 Sugestão do Sistema</option>
                    <option value="rejected">❌ Recusada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status de Execução (PDCA)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const st = e.target.value as any;
                      let pdca: ActionPlanItem['pdcaCycle'] = 'Plan';
                      if (st === 'Em Andamento') pdca = 'Do';
                      else if (st === 'Em Revisão') pdca = 'Check';
                      else if (st === 'Concluído') pdca = 'Act';
                      setFormData({ ...formData, status: st, pdcaCycle: pdca });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Não Iniciado">Não Iniciado (Plan)</option>
                    <option value="Em Andamento">Em Andamento (Do)</option>
                    <option value="Em Revisão">Em Revisão (Check)</option>
                    <option value="Concluído">Concluído e Validado (Act)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimativa de Custo</label>
                  <input
                    type="text"
                    value={formData.costEstimate || ''}
                    onChange={(e) => setFormData({ ...formData, costEstimate: e.target.value })}
                    placeholder="Ex: R$ 5.000,00 ou Interno"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Ação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
