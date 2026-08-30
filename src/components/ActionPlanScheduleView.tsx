import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Kanban,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Briefcase,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Download,
  XCircle,
  Info,
  CheckSquare2,
  GripVertical,
  Move,
} from 'lucide-react';
import { Company, AssessmentCampaign, ActionPlanItem, SectorGHE } from '../types';
import { StorageService } from '../services/storageService';

interface ActionPlanScheduleViewProps {
  company: Company;
  campaigns?: AssessmentCampaign[];
  currentCampaign?: AssessmentCampaign;
  actionPlans: ActionPlanItem[];
  sectors?: SectorGHE[];
  onRefreshData: () => void;
  onOpenEditModal?: (item: ActionPlanItem) => void;
}

type ScheduleSubView = 'gantt' | 'kanban' | 'workload' | 'calendar';

export const ActionPlanScheduleView: React.FC<ActionPlanScheduleViewProps> = ({
  company,
  campaigns = [],
  currentCampaign,
  actionPlans,
  sectors = company.sectors || [],
  onRefreshData,
  onOpenEditModal,
}) => {
  const [subView, setSubView] = useState<ScheduleSubView>('gantt');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);

  // Estados de Drag & Drop para o Kanban PDCA
  const [draggedActionId, setDraggedActionId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ActionPlanItem['status'] | null>(null);

  // Ano de referência para visualização Gantt e Calendário
  const [activeYear, setActiveYear] = useState<number>(() => new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(() => new Date().getMonth()); // 0-11

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Função auxiliar para cálculo de prazos
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
    return { isOverdue, diffDays, formattedDate, targetDate, year, month: month - 1, day };
  };

  // Filtragem de ações apenas oficiais/homologadas no PGR ou todas em execução
  // Apenas exclui explicitamente as rejeitadas do cronograma de execução
  const scheduleActions = useMemo(() => {
    return actionPlans.filter((a) => a.approvalStatus !== 'rejected');
  }, [actionPlans]);

  // Lista de Responsáveis únicos
  const uniqueResponsibles = useMemo(() => {
    return Array.from(
      new Set(scheduleActions.map((a) => a.who?.trim()).filter(Boolean))
    ).sort();
  }, [scheduleActions]);

  // Ações filtradas pelos controles da barra de pesquisa e filtros
  const filteredActions = useMemo(() => {
    return scheduleActions.filter((act) => {
      // 1. Status PDCA
      if (statusFilter !== 'all' && act.status !== statusFilter) return false;
      // 2. Setor
      if (sectorFilter !== 'all' && act.sectorId !== sectorFilter) return false;
      // 3. Responsável (Who)
      if (responsibleFilter !== 'all' && act.who?.trim() !== responsibleFilter) return false;
      // 4. Urgência de Prazo
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
      // 5. Busca livre
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const secName = sectors.find((s) => s.id === act.sectorId)?.name || '';
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
  }, [scheduleActions, statusFilter, sectorFilter, responsibleFilter, deadlineFilter, searchQuery, sectors]);

  // Estatísticas e Métricas do Cronograma
  const totalCount = scheduleActions.length;
  const completedCount = scheduleActions.filter((a) => a.status === 'Concluído').length;
  const inProgressCount = scheduleActions.filter((a) => a.status === 'Em Andamento').length;
  const notStartedCount = scheduleActions.filter((a) => a.status === 'Não Iniciado').length;
  const inReviewCount = scheduleActions.filter((a) => a.status === 'Em Revisão').length;

  const overdueCount = scheduleActions.filter((a) => {
    const { isOverdue } = getDeadlineInfo(a.whenDate, a.status);
    return isOverdue;
  }).length;

  const thisMonthCount = scheduleActions.filter((a) => {
    if (a.status === 'Concluído') return false;
    const { diffDays } = getDeadlineInfo(a.whenDate, a.status);
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Atualização rápida de status PDCA
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

  // Funções de Drag & Drop para o Kanban
  const handleDragStart = (e: React.DragEvent, action: ActionPlanItem) => {
    e.dataTransfer.setData('text/plain', action.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedActionId(action.id);
  };

  const handleDragEnd = () => {
    setDraggedActionId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: ActionPlanItem['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnStatus: ActionPlanItem['status']) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      if (dragOverColumn === columnStatus) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ActionPlanItem['status']) => {
    e.preventDefault();
    const actionId = e.dataTransfer.getData('text/plain') || draggedActionId;
    setDraggedActionId(null);
    setDragOverColumn(null);

    if (!actionId) return;
    const action = actionPlans.find((a) => a.id === actionId) || scheduleActions.find((a) => a.id === actionId);
    if (action && action.status !== targetStatus) {
      handleQuickStatusChange(action, targetStatus);
    }
  };

  // Copiar 5W2H para o responsável
  const handleCopy5W2H = (action: ActionPlanItem) => {
    const sec = sectors.find((s) => s.id === action.sectorId)?.name || action.where || 'Setor Geral';
    const text = `📋 *ORDEM DE SERVIÇO / DELEGAÇÃO DE AÇÃO 5W2H (NR-1)*\n` +
      `🏢 Empresa: ${company.tradeName || company.corporateName}\n` +
      `📍 Setor (Where): ${sec}\n` +
      `🎯 Perigo/Risco: ${action.dangerTarget}\n\n` +
      `👤 RESPONSÁVEL (Who): ${action.who}\n` +
      `📅 PRAZO LIMITE (When): ${action.whenDate || 'A definir'}\n` +
      `📌 O QUE FAZER (What): ${action.what}\n` +
      `💡 POR QUE FAZER (Why): ${action.why}\n` +
      `🛠️ COMO FAZER (How): ${action.how}\n` +
      `💰 RECURSOS / CUSTO (How much): ${action.costEstimate || 'Interno'}\n` +
      `🩺 EFICÁCIA (NR-1.5.5.3.2): ${action.verificationMethod}`;

    navigator.clipboard.writeText(text);
    setCopiedActionId(action.id);
    setTimeout(() => setCopiedActionId(null), 3000);
  };

  // Exportar Cronograma para CSV
  const handleExportScheduleCSV = () => {
    if (filteredActions.length === 0) {
      alert('Nenhuma ação no cronograma para exportar com os filtros atuais.');
      return;
    }
    const headers = [
      'ID',
      'O Que Fazer (What)',
      'Responsavel (Who)',
      'Prazo Limite (When)',
      'Setor / Local (Where)',
      'Status PDCA',
      'Fase PDCA',
      'Custo Estimado (How Much)',
      'Categoria Hierarquia NR-1',
      'Afericao de Eficacia (NR-1.5.5.3.2)',
      'Status de Aprovacao',
    ];

    const rows = filteredActions.map((act) => {
      const sec = sectors.find((s) => s.id === act.sectorId)?.name || act.where || 'Geral';
      return [
        `"${act.id}"`,
        `"${(act.what || '').replace(/"/g, '""')}"`,
        `"${(act.who || '').replace(/"/g, '""')}"`,
        `"${act.whenDate || ''}"`,
        `"${sec.replace(/"/g, '""')}"`,
        `"${act.status}"`,
        `"${act.pdcaCycle}"`,
        `"${act.costEstimate || ''}"`,
        `"${act.hierarchyCategory}"`,
        `"${(act.verificationMethod || '').replace(/"/g, '""')}"`,
        `"${act.approvalStatus === 'approved' ? 'Oficial no PGR' : act.approvalStatus || 'Em Execução'}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cronograma_execucao_${company.tradeName?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'pgr'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Configuração dos 12 meses para o Gantt
  const monthsList = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  return (
    <div className="space-y-6">
      {/* 1. CARDS DE KPIS & MÉTRICAS MACRO DO CRONOGRAMA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total no Cronograma */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Total em Execução</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">{totalCount}</span>
            <span className="text-[10px] font-semibold text-slate-400">ações</span>
          </div>
        </div>

        {/* 🚨 Atrasadas (Crítico) */}
        <div className={`p-3.5 rounded-2xl border shadow-xs flex flex-col justify-between ${
          overdueCount > 0 ? 'bg-red-50/80 border-red-200 text-red-900' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-red-700">🚨 Atrasadas</span>
            <AlertCircle className={`w-4 h-4 ${overdueCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-300'}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl font-bold ${overdueCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>{overdueCount}</span>
            <span className="text-[10px] font-semibold text-red-600">críticas</span>
          </div>
        </div>

        {/* 📅 Vencem no Mês */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-amber-700">📅 Vencem em 30d</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-700">{thisMonthCount}</span>
            <span className="text-[10px] font-semibold text-amber-600">atenção</span>
          </div>
        </div>

        {/* 🔵 Em Andamento */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-blue-700">🔵 Em Andamento</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-blue-700">{inProgressCount}</span>
            <span className="text-[10px] font-semibold text-blue-600">ativas</span>
          </div>
        </div>

        {/* ⚪ Não Iniciado / Em Revisão */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-600">⚪ Planejadas</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-800">{notStartedCount + inReviewCount}</span>
            <span className="text-[10px] font-semibold text-slate-400">a iniciar</span>
          </div>
        </div>

        {/* 🟢 Concluídas / Eficácia */}
        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-semibold">Progresso Global</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xl font-bold text-emerald-900">{completedCount}</span>
              <span className="text-xs font-bold text-emerald-700">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-emerald-200/70 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CONTROLE: SELETOR DE VISÕES (GANTT, KANBAN, RESPONSÁVEIS, CALENDÁRIO) + FILTROS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Seletor de Visões do Cronograma */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-fit">
            <button
              onClick={() => setSubView('gantt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subView === 'gantt'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Linha do Tempo (Gantt)</span>
            </button>

            <button
              onClick={() => setSubView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subView === 'kanban'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quadro Kanban (PDCA)</span>
            </button>

            <button
              onClick={() => setSubView('workload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subView === 'workload'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Por Responsável ({uniqueResponsibles.length})</span>
            </button>

            <button
              onClick={() => setSubView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subView === 'calendar'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
              <span>Calendário Mensal</span>
            </button>
          </div>

          {/* Navegação de Ano/Mês & Botão Exportar */}
          <div className="flex items-center gap-2">
            {(subView === 'gantt' || subView === 'calendar') && (
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                <button
                  onClick={() => setActiveYear((y) => y - 1)}
                  className="p-1 hover:bg-white rounded transition text-slate-500 hover:text-slate-900"
                  title="Ano anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-slate-900 font-bold">{activeYear}</span>
                <button
                  onClick={() => setActiveYear((y) => y + 1)}
                  className="p-1 hover:bg-white rounded transition text-slate-500 hover:text-slate-900"
                  title="Próximo ano"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleExportScheduleCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              title="Exportar dados do cronograma em CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar Cronograma ({filteredActions.length})</span>
            </button>
          </div>
        </div>

        {/* Linha de Filtros Rápidos (Busca, Setor, Responsável, Prazo, Status) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          {/* Busca Rápida */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar no cronograma por ação, responsável ou risco..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Responsável (Who) */}
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                value={responsibleFilter}
                onChange={(e) => setResponsibleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[150px] truncate text-xs"
                title="Filtrar por Responsável"
              >
                <option value="all">Todos Responsáveis</option>
                {uniqueResponsibles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Prazo / Urgência */}
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                value={deadlineFilter}
                onChange={(e) => setDeadlineFilter(e.target.value)}
                className={`px-2.5 py-1.5 bg-white border rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs ${
                  deadlineFilter === 'overdue'
                    ? 'border-red-300 text-red-700 font-bold bg-red-50'
                    : deadlineFilter === 'this_month'
                    ? 'border-amber-300 text-amber-800 font-bold bg-amber-50'
                    : 'border-slate-200 text-slate-800'
                }`}
                title="Filtrar por Urgência do Prazo"
              >
                <option value="all">Todos os Prazos</option>
                <option value="overdue">🚨 Atrasadas ({overdueCount})</option>
                <option value="this_month">📅 Vencem em 30d ({thisMonthCount})</option>
                <option value="next_60">⏳ Próximos 60 dias</option>
                <option value="future">📆 Futuras (+60d)</option>
              </select>
            </div>

            {/* Setor */}
            <div className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[140px] truncate text-xs"
                title="Filtrar por Setor"
              >
                <option value="all">Todos Setores</option>
                {sectors.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status PDCA */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                title="Filtrar por Status PDCA"
              >
                <option value="all">Todos Status</option>
                <option value="Não Iniciado">Não Iniciado ({notStartedCount})</option>
                <option value="Em Andamento">Em Andamento ({inProgressCount})</option>
                <option value="Em Revisão">Em Revisão ({inReviewCount})</option>
                <option value="Concluído">Concluído ({completedCount})</option>
              </select>
            </div>

            {/* Reset */}
            {(statusFilter !== 'all' ||
              sectorFilter !== 'all' ||
              responsibleFilter !== 'all' ||
              deadlineFilter !== 'all' ||
              searchQuery !== '') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSectorFilter('all');
                  setResponsibleFilter('all');
                  setDeadlineFilter('all');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                title="Limpar filtros"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. CONTEÚDO DA SUB-VISÃO SELECIONADA */}

      {/* 📊 A. VISÃO GANTT / LINHA DO TEMPO HORIZONTAL */}
      {subView === 'gantt' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Linha do Tempo Visual do Cronograma ({activeYear})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visão macro de prazos e distribuição de entregas por mês • A barra destaca a duração e o prazo de conclusão
              </p>
            </div>

            {/* Legenda */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Não Iniciado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Em Andamento</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Em Revisão</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>Concluído</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>Atrasado</span>
              </div>
            </div>
          </div>

          {filteredActions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Nenhuma ação encontrada para os filtros selecionados.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tente limpar os filtros acima para visualizar a linha do tempo completa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Cabeçalho da Grade de Meses */}
                <div className="grid grid-cols-12 gap-1 border-b border-slate-200 pb-2 mb-3 text-center">
                  <div className="col-span-4 text-left text-xs font-bold text-slate-700 pl-2">
                    Ação & Responsável
                  </div>
                  <div className="col-span-8 grid grid-cols-12 gap-0.5 text-center text-[11px] font-bold text-slate-600">
                    {monthsList.map((m, idx) => {
                      const isCurrentMonth = activeYear === today.getFullYear() && idx === today.getMonth();
                      return (
                        <div
                          key={m}
                          className={`py-1 rounded text-center transition ${
                            isCurrentMonth ? 'bg-blue-100 text-blue-900 font-bold border border-blue-200' : 'text-slate-500'
                          }`}
                        >
                          {m}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lista de Ações em Barras de Gantt */}
                <div className="space-y-3">
                  {filteredActions.map((action) => {
                    const sec = sectors.find((s) => s.id === action.sectorId)?.name || action.where || 'Setor Geral';
                    const deadline = getDeadlineInfo(action.whenDate, action.status);
                    
                    // Cálculo da posição no Gantt
                    // Padrão: início no mês de criação ou início do ano, término no mês de deadline
                    const createdDate = action.createdAt ? new Date(action.createdAt) : today;
                    const createdMonth = createdDate.getFullYear() === activeYear ? createdDate.getMonth() : 0;
                    
                    let endMonth = deadline.month !== undefined && deadline.year === activeYear ? deadline.month : 11;
                    if (deadline.year && deadline.year < activeYear) endMonth = 0;
                    if (deadline.year && deadline.year > activeYear) endMonth = 11;

                    // Garante que o span tenha no mínimo 1 mês e respeite a ordem
                    const startMonth = Math.min(createdMonth, endMonth);
                    const colSpan = Math.max(1, endMonth - startMonth + 1);

                    // Cores da Barra Gantt
                    let barBg = 'bg-slate-200 border-slate-300 text-slate-800';
                    if (deadline.isOverdue) {
                      barBg = 'bg-red-500 border-red-600 text-white shadow-xs';
                    } else if (action.status === 'Concluído') {
                      barBg = 'bg-emerald-600 border-emerald-700 text-white shadow-xs';
                    } else if (action.status === 'Em Andamento') {
                      barBg = 'bg-blue-600 border-blue-700 text-white shadow-xs';
                    } else if (action.status === 'Em Revisão') {
                      barBg = 'bg-amber-500 border-amber-600 text-white shadow-xs';
                    }

                    return (
                      <div
                        key={action.id}
                        className="grid grid-cols-12 gap-1 items-center p-2 rounded-xl hover:bg-slate-50 transition border border-slate-100"
                      >
                        {/* Coluna Esquerda: Detalhes da Ação */}
                        <div className="col-span-4 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              deadline.isOverdue ? 'bg-red-600 ring-2 ring-red-200' :
                              action.status === 'Concluído' ? 'bg-emerald-500' :
                              action.status === 'Em Andamento' ? 'bg-blue-500' : 'bg-slate-400'
                            }`} />
                            <h4
                              onClick={() => onOpenEditModal?.(action)}
                              className="text-xs font-bold text-slate-800 truncate hover:text-blue-700 cursor-pointer"
                              title={action.what}
                            >
                              {action.what}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700 flex items-center gap-1 truncate max-w-[130px]" title={action.who}>
                              <User className="w-3 h-3 text-slate-400" />
                              {action.who}
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[110px]" title={sec}>{sec}</span>
                          </div>
                        </div>

                        {/* Coluna Direita: Barra do Gantt nos 12 Meses */}
                        <div className="col-span-8 grid grid-cols-12 gap-0.5 relative py-1 items-center">
                          {/* Grade de fundo sutil */}
                          <div className="absolute inset-0 grid grid-cols-12 gap-0.5 pointer-events-none opacity-40">
                            {monthsList.map((m, idx) => (
                              <div
                                key={m}
                                className={`h-full border-r border-slate-100 ${
                                  activeYear === today.getFullYear() && idx === today.getMonth() ? 'bg-blue-50/50' : ''
                                }`}
                              />
                            ))}
                          </div>

                          {/* Barra Horizontal Dinâmica */}
                          <div
                            style={{
                              gridColumnStart: startMonth + 1,
                              gridColumnEnd: startMonth + 1 + colSpan,
                            }}
                            className={`relative z-10 py-1.5 px-2 rounded-lg border text-xs flex items-center justify-between transition hover:brightness-95 cursor-pointer ${barBg}`}
                            onClick={() => onOpenEditModal?.(action)}
                            title={`Prazo: ${deadline.formattedDate || action.whenDate} | Responsável: ${action.who} | Status: ${action.status}`}
                          >
                            <span className="truncate font-bold text-[11px] pr-1">
                              {deadline.isOverdue ? '🚨 Atrasado' : action.status}
                            </span>
                            <span className="text-[10px] font-semibold opacity-90 shrink-0">
                              {deadline.formattedDate || action.whenDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📌 B. QUADRO KANBAN (FASES PDCA) COM DRAG & DROP */}
      {subView === 'kanban' && (
        <div className="space-y-3">
          {/* Banner explicativo de Drag & Drop */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-xl px-4 py-2.5 text-xs text-blue-900 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Move className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  Quadro Interativo PDCA • <span className="text-blue-700 font-semibold">Arraste e Solte (Drag & Drop)</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Arraste os cartões 5W2H diretamente entre as colunas para atualizar a fase do ciclo e o status no PGR em tempo real.
                </p>
              </div>
            </div>
            {draggedActionId && (
              <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold animate-pulse shrink-0">
                Movendo Ação...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* COLUNA 1: NÃO INICIADO (PLAN) */}
            <div
              onDragOver={(e) => handleDragOver(e, 'Não Iniciado')}
              onDragLeave={(e) => handleDragLeave(e, 'Não Iniciado')}
              onDrop={(e) => handleDrop(e, 'Não Iniciado')}
              className={`rounded-2xl p-4 border flex flex-col min-h-[520px] transition-all duration-200 ${
                dragOverColumn === 'Não Iniciado'
                  ? 'bg-blue-100/70 border-blue-500 ring-2 ring-blue-400/50 shadow-md scale-[1.01]'
                  : 'bg-slate-50/90 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Não Iniciado (Plan)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  {filteredActions.filter((a) => a.status === 'Não Iniciado').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {filteredActions
                  .filter((a) => a.status === 'Não Iniciado')
                  .map((action) => {
                    const deadline = getDeadlineInfo(action.whenDate, action.status);
                    const sec = sectors.find((s) => s.id === action.sectorId)?.name || action.where || 'Geral';
                    const isBeingDragged = draggedActionId === action.id;

                    return (
                      <div
                        key={action.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, action)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl p-3.5 border shadow-2xs transition duration-150 space-y-2.5 cursor-grab active:cursor-grabbing group select-none hover:shadow-xs hover:border-slate-300 ${
                          isBeingDragged
                            ? 'opacity-30 scale-95 border-dashed border-blue-400 shadow-none'
                            : 'border-slate-200 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition" />
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 truncate max-w-[140px]">
                              {sec}
                            </span>
                          </div>
                          {action.approvalStatus === 'approved' && (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5 shrink-0" title="Homologado no PGR">
                              <ShieldCheck className="w-3 h-3" />
                              <span>PGR</span>
                            </span>
                          )}
                        </div>

                        <h5
                          onClick={() => onOpenEditModal?.(action)}
                          className="text-xs font-bold text-slate-900 leading-snug hover:text-blue-600 cursor-pointer"
                        >
                          {action.what}
                        </h5>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <User className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">{action.who}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-1 font-semibold ${deadline.isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                              <CalendarDays className="w-3 h-3" />
                              <span>{deadline.formattedDate || action.whenDate}</span>
                            </div>
                            {action.costEstimate && (
                              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90px]">
                                {action.costEstimate}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handleCopy5W2H(action)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                            title="Copiar Ordem 5W2H"
                          >
                            {copiedActionId === action.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedActionId === action.id ? 'Copiado!' : '5W2H'}</span>
                          </button>

                          <button
                            onClick={() => handleQuickStatusChange(action, 'Em Andamento')}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 transition"
                          >
                            <span>Iniciar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {/* Drop Zone Feedback quando arrastando para cá */}
                {dragOverColumn === 'Não Iniciado' && (
                  <div className="border-2 border-dashed border-blue-400 bg-blue-50/90 rounded-xl p-4 text-center text-xs font-bold text-blue-700 animate-pulse flex items-center justify-center gap-2">
                    <Move className="w-4 h-4" />
                    <span>Solte para definir como Não Iniciado (Plan)</span>
                  </div>
                )}

                {filteredActions.filter((a) => a.status === 'Não Iniciado').length === 0 && dragOverColumn !== 'Não Iniciado' && (
                  <div className="h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                    <p className="font-semibold text-slate-500">Nenhuma ação nesta fase</p>
                    <p className="text-[11px] text-slate-400 mt-1">Arraste uma ação para cá para planejar</p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA 2: EM ANDAMENTO (DO) */}
            <div
              onDragOver={(e) => handleDragOver(e, 'Em Andamento')}
              onDragLeave={(e) => handleDragLeave(e, 'Em Andamento')}
              onDrop={(e) => handleDrop(e, 'Em Andamento')}
              className={`rounded-2xl p-4 border flex flex-col min-h-[520px] transition-all duration-200 ${
                dragOverColumn === 'Em Andamento'
                  ? 'bg-blue-100/80 border-blue-600 ring-2 ring-blue-500/50 shadow-md scale-[1.01]'
                  : 'bg-blue-50/50 border-blue-200/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-blue-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Em Andamento (Do)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-200/80 text-blue-900">
                  {filteredActions.filter((a) => a.status === 'Em Andamento').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {filteredActions
                  .filter((a) => a.status === 'Em Andamento')
                  .map((action) => {
                    const deadline = getDeadlineInfo(action.whenDate, action.status);
                    const sec = sectors.find((s) => s.id === action.sectorId)?.name || action.where || 'Geral';
                    const isBeingDragged = draggedActionId === action.id;

                    return (
                      <div
                        key={action.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, action)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl p-3.5 border shadow-2xs transition duration-150 space-y-2.5 cursor-grab active:cursor-grabbing group select-none hover:shadow-xs ${
                          isBeingDragged
                            ? 'opacity-30 scale-95 border-dashed border-blue-400 shadow-none'
                            : deadline.isOverdue
                            ? 'border-red-300 ring-1 ring-red-200 hover:-translate-y-0.5'
                            : 'border-blue-200 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 transition" />
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 truncate max-w-[140px]">
                              {sec}
                            </span>
                          </div>
                          {deadline.isOverdue ? (
                            <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5">
                              <AlertCircle className="w-3 h-3" />
                              <span>Atrasado</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-blue-700 flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3" />
                              <span>Ativa</span>
                            </span>
                          )}
                        </div>

                        <h5
                          onClick={() => onOpenEditModal?.(action)}
                          className="text-xs font-bold text-slate-900 leading-snug hover:text-blue-600 cursor-pointer"
                        >
                          {action.what}
                        </h5>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <User className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">{action.who}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-1 font-semibold ${deadline.isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                              <CalendarDays className="w-3 h-3" />
                              <span>{deadline.formattedDate || action.whenDate}</span>
                            </div>
                            {deadline.diffDays >= 0 && deadline.diffDays <= 30 && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                {deadline.diffDays} dias
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handleQuickStatusChange(action, 'Não Iniciado')}
                            className="text-[11px] text-slate-400 hover:text-slate-700"
                            title="Voltar para Não Iniciado"
                          >
                            Voltar
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickStatusChange(action, 'Em Revisão')}
                              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition"
                              title="Mover para Revisão"
                            >
                              Revisar
                            </button>
                            <button
                              onClick={() => handleQuickStatusChange(action, 'Concluído')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition"
                            >
                              <Check className="w-3 h-3" />
                              <span>Concluir</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Drop Zone Feedback quando arrastando para cá */}
                {dragOverColumn === 'Em Andamento' && (
                  <div className="border-2 border-dashed border-blue-500 bg-blue-100/90 rounded-xl p-4 text-center text-xs font-bold text-blue-900 animate-pulse flex items-center justify-center gap-2">
                    <Move className="w-4 h-4" />
                    <span>Solte para mover para Em Andamento (Do)</span>
                  </div>
                )}

                {filteredActions.filter((a) => a.status === 'Em Andamento').length === 0 && dragOverColumn !== 'Em Andamento' && (
                  <div className="h-40 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center p-4 text-center text-blue-400 text-xs">
                    <p className="font-semibold text-blue-600">Nenhuma ação em execução</p>
                    <p className="text-[11px] text-blue-400 mt-1">Arraste uma ação para cá para iniciar</p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA 3: EM REVISÃO (CHECK) */}
            <div
              onDragOver={(e) => handleDragOver(e, 'Em Revisão')}
              onDragLeave={(e) => handleDragLeave(e, 'Em Revisão')}
              onDrop={(e) => handleDrop(e, 'Em Revisão')}
              className={`rounded-2xl p-4 border flex flex-col min-h-[520px] transition-all duration-200 ${
                dragOverColumn === 'Em Revisão'
                  ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-400/50 shadow-md scale-[1.01]'
                  : 'bg-amber-50/50 border-amber-200/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Em Revisão (Check)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900">
                  {filteredActions.filter((a) => a.status === 'Em Revisão').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {filteredActions
                  .filter((a) => a.status === 'Em Revisão')
                  .map((action) => {
                    const deadline = getDeadlineInfo(action.whenDate, action.status);
                    const sec = sectors.find((s) => s.id === action.sectorId)?.name || action.where || 'Geral';
                    const isBeingDragged = draggedActionId === action.id;

                    return (
                      <div
                        key={action.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, action)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl p-3.5 border shadow-2xs transition duration-150 space-y-2.5 cursor-grab active:cursor-grabbing group select-none hover:shadow-xs ${
                          isBeingDragged
                            ? 'opacity-30 scale-95 border-dashed border-amber-400 shadow-none'
                            : 'border-amber-200 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 shrink-0 transition" />
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 truncate max-w-[140px]">
                              {sec}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Auditoria</span>
                          </span>
                        </div>

                        <h5
                          onClick={() => onOpenEditModal?.(action)}
                          className="text-xs font-bold text-slate-900 leading-snug hover:text-amber-700 cursor-pointer"
                        >
                          {action.what}
                        </h5>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <User className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{action.who}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-slate-600 font-semibold">
                              <CalendarDays className="w-3 h-3" />
                              <span>{deadline.formattedDate || action.whenDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handleQuickStatusChange(action, 'Em Andamento')}
                            className="text-[11px] text-slate-500 hover:text-slate-800"
                          >
                            Voltar
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(action, 'Concluído')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition"
                          >
                            <Check className="w-3 h-3" />
                            <span>Concluir</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {/* Drop Zone Feedback quando arrastando para cá */}
                {dragOverColumn === 'Em Revisão' && (
                  <div className="border-2 border-dashed border-amber-500 bg-amber-100/90 rounded-xl p-4 text-center text-xs font-bold text-amber-900 animate-pulse flex items-center justify-center gap-2">
                    <Move className="w-4 h-4" />
                    <span>Solte para mover para Em Revisão (Check)</span>
                  </div>
                )}

                {filteredActions.filter((a) => a.status === 'Em Revisão').length === 0 && dragOverColumn !== 'Em Revisão' && (
                  <div className="h-40 border-2 border-dashed border-amber-200 rounded-xl flex flex-col items-center justify-center p-4 text-center text-amber-400 text-xs">
                    <p className="font-semibold text-amber-600">Nenhuma ação em auditoria</p>
                    <p className="text-[11px] text-amber-400 mt-1">Arraste uma ação para cá para checar eficácia</p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA 4: CONCLUÍDO (ACT / EFICÁCIA) */}
            <div
              onDragOver={(e) => handleDragOver(e, 'Concluído')}
              onDragLeave={(e) => handleDragLeave(e, 'Concluído')}
              onDrop={(e) => handleDrop(e, 'Concluído')}
              className={`rounded-2xl p-4 border flex flex-col min-h-[520px] transition-all duration-200 ${
                dragOverColumn === 'Concluído'
                  ? 'bg-emerald-100/80 border-emerald-600 ring-2 ring-emerald-500/50 shadow-md scale-[1.01]'
                  : 'bg-emerald-50/50 border-emerald-200/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Concluído (Act / Eficácia)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-200/80 text-emerald-900">
                  {filteredActions.filter((a) => a.status === 'Concluído').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {filteredActions
                  .filter((a) => a.status === 'Concluído')
                  .map((action) => {
                    const sec = sectors.find((s) => s.id === action.sectorId)?.name || action.where || 'Geral';
                    const isBeingDragged = draggedActionId === action.id;

                    return (
                      <div
                        key={action.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, action)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl p-3.5 border shadow-2xs transition duration-150 space-y-2.5 cursor-grab active:cursor-grabbing group select-none hover:shadow-xs opacity-95 ${
                          isBeingDragged
                            ? 'opacity-30 scale-95 border-dashed border-emerald-400 shadow-none'
                            : 'border-emerald-200 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 shrink-0 transition" />
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 truncate max-w-[140px]">
                              {sec}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>100% Entregue</span>
                          </span>
                        </div>

                        <h5
                          onClick={() => onOpenEditModal?.(action)}
                          className="text-xs font-bold text-slate-900 leading-snug line-through text-slate-500 cursor-pointer"
                        >
                          {action.what}
                        </h5>

                        <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 text-[10px] text-emerald-800 space-y-0.5">
                          <div className="font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Aferição de Eficácia (NR-1):</span>
                          </div>
                          <p className="line-clamp-2 text-slate-600">{action.verificationMethod}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <button
                            onClick={() => handleCopy5W2H(action)}
                            className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copiar Ficha</span>
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(action, 'Em Andamento')}
                            className="text-slate-400 hover:text-blue-600 text-[11px]"
                            title="Reabrir ação"
                          >
                            Reabrir
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {/* Drop Zone Feedback quando arrastando para cá */}
                {dragOverColumn === 'Concluído' && (
                  <div className="border-2 border-dashed border-emerald-500 bg-emerald-100/90 rounded-xl p-4 text-center text-xs font-bold text-emerald-900 animate-pulse flex items-center justify-center gap-2">
                    <Move className="w-4 h-4" />
                    <span>Solte para marcar como Concluído (Act)</span>
                  </div>
                )}

                {filteredActions.filter((a) => a.status === 'Concluído').length === 0 && dragOverColumn !== 'Concluído' && (
                  <div className="h-40 border-2 border-dashed border-emerald-200 rounded-xl flex flex-col items-center justify-center p-4 text-center text-emerald-400 text-xs">
                    <p className="font-semibold text-emerald-600">Nenhuma ação finalizada</p>
                    <p className="text-[11px] text-emerald-400 mt-1">Arraste uma ação para cá após comprovar a eficácia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👤 C. VISÃO POR RESPONSÁVEL & CARGA DE TRABALHO (WORKLOAD) */}
      {subView === 'workload' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Matriz de Carga de Trabalho e Delegações por Responsável (Who)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controle macro de volume de ações, entregas e pendências atribuídas a cada líder ou departamento
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueResponsibles.map((responsibleName) => {
                const respActions = scheduleActions.filter((a) => a.who?.trim() === responsibleName);
                const respCompleted = respActions.filter((a) => a.status === 'Concluído').length;
                const respInProgress = respActions.filter((a) => a.status === 'Em Andamento').length;
                const respOverdue = respActions.filter((a) => {
                  const { isOverdue } = getDeadlineInfo(a.whenDate, a.status);
                  return isOverdue;
                }).length;
                const respPct = respActions.length > 0 ? Math.round((respCompleted / respActions.length) * 100) : 0;

                return (
                  <div
                    key={responsibleName}
                    className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {responsibleName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{responsibleName}</h4>
                          <span className="text-[10px] text-slate-500">{respActions.length} ações sob custódia</span>
                        </div>
                      </div>

                      {respOverdue > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>{respOverdue} Atrasadas</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {respPct}% Concluído
                        </span>
                      )}
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Entregas ({respCompleted}/{respActions.length})</span>
                        <span className="font-bold">{respPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${respPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Lista das ações do Responsável */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60 max-h-[220px] overflow-y-auto pr-1">
                      {respActions.map((act) => {
                        const deadline = getDeadlineInfo(act.whenDate, act.status);
                        return (
                          <div
                            key={act.id}
                            onClick={() => onOpenEditModal?.(act)}
                            className="p-2 rounded-lg bg-white border border-slate-200/80 text-xs hover:border-blue-300 cursor-pointer space-y-1 transition"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[11px] font-bold truncate ${act.status === 'Concluído' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {act.what}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                deadline.isOverdue ? 'bg-red-100 text-red-700' :
                                act.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {deadline.isOverdue ? 'Atrasado' : act.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Prazo: {deadline.formattedDate || act.whenDate}</span>
                              <span>{act.costEstimate || 'Interno'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 📅 D. VISÃO CALENDÁRIO MENSAL */}
      {subView === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-purple-600" />
                <span>Grade Calendária de Vencimentos ({monthsList[activeMonth]} / {activeYear})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique nos meses abaixo para navegar pelos prazos e entregas diárias do PGR
              </p>
            </div>

            {/* Seletor Rápido de Mês */}
            <div className="flex items-center gap-1 flex-wrap">
              {monthsList.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => setActiveMonth(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    activeMonth === idx
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Dias do Mês */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
              const dayStr = `${activeYear}-${(activeMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const dayActions = filteredActions.filter((a) => a.whenDate === dayStr);
              const isToday =
                today.getFullYear() === activeYear &&
                today.getMonth() === activeMonth &&
                today.getDate() === dayNum;

              return (
                <div
                  key={dayNum}
                  className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition ${
                    isToday
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                      : dayActions.length > 0
                      ? 'bg-purple-50/40 border-purple-200'
                      : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                      {dayNum}
                    </span>
                    {dayActions.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold flex items-center justify-center">
                        {dayActions.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[80px]">
                    {dayActions.map((act) => {
                      const deadline = getDeadlineInfo(act.whenDate, act.status);
                      return (
                        <div
                          key={act.id}
                          onClick={() => onOpenEditModal?.(act)}
                          className={`p-1.5 rounded text-[10px] font-semibold truncate cursor-pointer transition ${
                            deadline.isOverdue
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : act.status === 'Concluído'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-white border border-slate-200 text-slate-800 hover:border-purple-300'
                          }`}
                          title={`${act.what} | Responsável: ${act.who}`}
                        >
                          {act.what}
                        </div>
                      );
                    })}
                  </div>

                  {isToday && (
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                      Hoje
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
