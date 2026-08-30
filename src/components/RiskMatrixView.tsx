import React, { useState } from 'react';
import {
  Grid3X3,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  CheckCircle2,
  Filter,
  Users,
  Clock,
  Flame,
} from 'lucide-react';
import { Company, AssessmentCampaign, RiskInventoryItem, RiskLevel, ActionPriority, ActionDeadline } from '../types';
import { StorageService } from '../services/storageService';
import { COPSOQ_DIMENSIONS, calculateDimensionScore, COPSOQ_SHORT_QUESTIONS } from '../data/copsoqQuestions';
import { CompanyCampaignHeader } from './CompanyCampaignHeader';

interface RiskMatrixViewProps {
  company: Company;
  companies?: Company[];
  onSelectCompany?: (companyId: string) => void;
  campaigns: AssessmentCampaign[];
  onNavigateToActionPlan: () => void;
  onRefreshData: () => void;
}

export const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({
  company,
  companies = [],
  onSelectCompany,
  campaigns,
  onNavigateToActionPlan,
  onRefreshData,
}) => {
  const isAllCompanies = company.id === 'all';
  const companyCampaigns = isAllCompanies ? campaigns : campaigns.filter((c) => c.companyId === company.id);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [selectedCellFilter, setSelectedCellFilter] = useState<{ sev: number; prob: number } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RiskInventoryItem | null>(null);

  const currentCampaign =
    selectedCampaignId !== 'all'
      ? campaigns.find((c) => c.id === selectedCampaignId) || companyCampaigns[0]
      : companyCampaigns[0] || campaigns[0];

  const riskInventory =
    selectedCampaignId === 'all'
      ? (isAllCompanies
          ? StorageService.getRiskInventory()
          : StorageService.getRiskInventory().filter((r) => r.companyId === company.id))
      : StorageService.getRiskInventory(selectedCampaignId);

  // Form State
  const [formData, setFormData] = useState<Partial<RiskInventoryItem>>({
    sectorId: company.sectors[0]?.id || '',
    processOrActivity: 'Operação Geral',
    dangerName: '',
    dangerSource: '',
    possibleInjuries: [],
    exposedWorkersCount: 15,
    existingControls: [],
    exposureCharacteristics: {
      duration: 'Longa / Contínua',
      frequency: 'Frequente / Diária',
      intensity: 'Moderada',
    },
    severity: 3,
    probability: 3,
  });

  const [injuryInput, setInjuryInput] = useState('');
  const [controlInput, setControlInput] = useState('');

  // Helper para classificar risco pela matriz 5x5
  const calculateRiskClassification = (sev: number, prob: number) => {
    const score = sev * prob;
    let riskLevel: RiskLevel = 'BAIXO';
    let actionPriority: ActionPriority = 'BAIXA';
    let maxActionDeadline: ActionDeadline = 'Até 12 meses';

    if (score >= 20) {
      riskLevel = 'MUITO ALTO';
      actionPriority = 'ALTÍSSIMA';
      maxActionDeadline = 'IMEDIATO';
    } else if (score >= 10) {
      riskLevel = 'ALTO';
      actionPriority = 'ALTA';
      maxActionDeadline = 'Menor que 3 meses';
    } else if (score >= 5) {
      riskLevel = 'MÉDIO';
      actionPriority = 'MODERADA';
      maxActionDeadline = 'Menor que 9 meses';
    }

    return { score, riskLevel, actionPriority, maxActionDeadline };
  };

  const handleOpenAddModal = (template?: Partial<RiskInventoryItem>) => {
    setEditingItem(null);
    setInjuryInput('');
    setControlInput('');
    setFormData({
      sectorId: company.sectors[0]?.id || '',
      processOrActivity: 'Atividades Operacionais / Administrativas',
      dangerName: template?.dangerName || '',
      dangerSource: template?.dangerSource || '',
      possibleInjuries: template?.possibleInjuries || ['Estresse ocupacional', 'Fadiga mental'],
      exposedWorkersCount: 20,
      existingControls: template?.existingControls || ['Pausas regulares'],
      exposureCharacteristics: {
        duration: 'Longa / Contínua',
        frequency: 'Frequente / Diária',
        intensity: 'Moderada',
      },
      severity: template?.severity || 3,
      probability: template?.probability || 3,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: RiskInventoryItem) => {
    setEditingItem(item);
    setInjuryInput('');
    setControlInput('');
    setFormData(JSON.parse(JSON.stringify(item)));
    setShowModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dangerName || !formData.dangerSource) {
      alert('Preencha os campos obrigatórios do perigo.');
      return;
    }

    const sev = (formData.severity as any) || 3;
    const prob = (formData.probability as any) || 3;
    const calc = calculateRiskClassification(sev, prob);

    const itemToSave: RiskInventoryItem = {
      id: editingItem ? editingItem.id : `risk-${Date.now()}`,
      campaignId: currentCampaign?.id || companyCampaigns[0]?.id || `camp-${company.id}`,
      companyId: company.id,
      sectorId: formData.sectorId || company.sectors[0]?.id || 'sec-1',
      processOrActivity: formData.processOrActivity || 'Geral',
      dangerName: formData.dangerName!,
      dangerSource: formData.dangerSource!,
      possibleInjuries: formData.possibleInjuries || [],
      exposedWorkersCount: Number(formData.exposedWorkersCount) || 10,
      existingControls: formData.existingControls || [],
      exposureCharacteristics: formData.exposureCharacteristics || {
        duration: 'Longa / Contínua',
        frequency: 'Frequente / Diária',
        intensity: 'Moderada',
      },
      severity: sev,
      probability: prob,
      riskScore: calc.score,
      riskLevel: calc.riskLevel,
      actionPriority: calc.actionPriority,
      maxActionDeadline: calc.maxActionDeadline,
      needsActionPlan: calc.score >= 5,
    };

    StorageService.saveRiskInventoryItem(itemToSave);
    setShowModal(false);
    onRefreshData();
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Excluir o perigo "${name}" do Inventário de Riscos?`)) {
      StorageService.deleteRiskInventoryItem(id);
      onRefreshData();
    }
  };

  const handleAddInjury = () => {
    if (injuryInput.trim()) {
      const current = formData.possibleInjuries || [];
      setFormData({ ...formData, possibleInjuries: [...current, injuryInput.trim()] });
      setInjuryInput('');
    }
  };

  const handleAddControl = () => {
    if (controlInput.trim()) {
      const current = formData.existingControls || [];
      setFormData({ ...formData, existingControls: [...current, controlInput.trim()] });
      setControlInput('');
    }
  };

  // Gerar inventário automático baseado nas dimensões em risco do COPSOQ II
  const handleAutoGenerateFromSurvey = () => {
    const targetCampaignId = currentCampaign?.id || companyCampaigns[0]?.id;
    const responses =
      selectedCampaignId === 'all'
        ? StorageService.getResponses().filter((r) => r.companyId === company.id)
        : StorageService.getResponses(targetCampaignId);

    if (responses.length === 0) {
      alert('Nenhuma resposta de questionário encontrada para esta empresa/avaliação. Colete ou simule respostas para diagnosticar.');
      return;
    }

    let addedCount = 0;
    Object.keys(COPSOQ_DIMENSIONS).forEach((code) => {
      const dim = COPSOQ_DIMENSIONS[code];
      const calc = calculateDimensionScore(
        code,
        responses.map((r) => r.answers),
        COPSOQ_SHORT_QUESTIONS
      );

      if (calc.tercil === 'risk') {
        const sev = 4;
        const prob = 3;
        const riskCalc = calculateRiskClassification(sev, prob);

        const autoItem: RiskInventoryItem = {
          id: `risk-auto-${code}-${Date.now()}`,
          campaignId: targetCampaignId || 'camp-default',
          companyId: company.id,
          sectorId: company.sectors[0]?.id || 'sec-1',
          processOrActivity: 'Rotina de trabalho com demandas cognitivas e relacionais elevadas',
          dangerName: `Fator Psicossocial Crítico: ${dim.title}`,
          dangerSource: dim.riskFactorDescription,
          possibleInjuries: dim.possibleConsequences,
          exposedWorkersCount: company.totalEmployees,
          existingControls: ['Medidas pontuais / Em estruturação'],
          exposureCharacteristics: {
            duration: 'Longa / Contínua',
            frequency: 'Frequente / Diária',
            intensity: 'Elevada',
          },
          severity: sev as any,
          probability: prob as any,
          riskScore: riskCalc.score,
          riskLevel: riskCalc.riskLevel,
          actionPriority: riskCalc.actionPriority,
          maxActionDeadline: riskCalc.maxActionDeadline,
          needsActionPlan: true,
        };

        StorageService.saveRiskInventoryItem(autoItem);
        addedCount++;
      }
    });

    alert(`${addedCount} fatores de risco críticos identificados pelo COPSOQ II foram importados para o Inventário de Riscos (NR-1).`);
    onRefreshData();
  };

  // Filtros aplicados
  const filteredItems = riskInventory.filter((item) => {
    if (selectedSectorFilter !== 'all' && item.sectorId !== selectedSectorFilter) {
      return false;
    }
    if (selectedCellFilter) {
      if (item.severity !== selectedCellFilter.sev || item.probability !== selectedCellFilter.prob) {
        return false;
      }
    }
    return true;
  });

  // Matriz 5x5: contar itens por célula
  const matrixCells: Record<string, RiskInventoryItem[]> = {};
  for (let s = 1; s <= 5; s++) {
    for (let p = 1; p <= 5; p++) {
      matrixCells[`${s}-${p}`] = riskInventory.filter((r) => r.severity === s && r.probability === p);
    }
  }

  const getCellColor = (sev: number, prob: number) => {
    const score = sev * prob;
    if (score >= 20) return 'bg-red-500 hover:bg-red-600 text-white';
    if (score >= 10) return 'bg-amber-500 hover:bg-amber-600 text-white';
    if (score >= 5) return 'bg-amber-300 hover:bg-amber-400 text-slate-900';
    return 'bg-emerald-400 hover:bg-emerald-500 text-slate-900';
  };

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
          onClick={handleAutoGenerateFromSurvey}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shadow-2xs transition"
          title="Importa automaticamente dimensões em vermelho no COPSOQ II para a Matriz NR-1"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Sincronizar COPSOQ II</span>
        </button>

        <button
          id="add-risk-btn"
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Perigo NR-1</span>
        </button>
      </CompanyCampaignHeader>

      {/* Sub Header Informativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Matriz de Riscos & Inventário (NR-1)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Subitem 1.5.4.4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Classificação bidimensional de Severidade x Probabilidade conforme as diretrizes da Portaria MTE nº 1.419/2024 e GRO/PGR
          </p>
        </div>
      </div>

      {/* Grid: Matriz 5x5 Interativa (Esquerda) + Regras de Intervenção (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matriz 5x5 (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Matriz Bidimensional 5x5</h2>
              <p className="text-xs text-slate-500">Clique em qualquer célula para filtrar os perigos associados</p>
            </div>
            {selectedCellFilter && (
              <button
                onClick={() => setSelectedCellFilter(null)}
                className="text-xs text-blue-700 hover:underline font-semibold"
              >
                Limpar Filtro da Matriz
              </button>
            )}
          </div>

          {/* Grid Layout da Matriz */}
          <div className="flex items-center justify-center p-2">
            <div className="space-y-1.5">
              {/* Eixo Vertical: Severidade 5 -> 1 */}
              {[5, 4, 3, 2, 1].map((sev) => {
                const sevLabels: Record<number, string> = {
                  5: '5. Catastrófico / Incapacitante',
                  4: '4. Crítico / Severo',
                  3: '3. Moderado',
                  2: '2. Menor',
                  1: '1. Leve / Desprezível',
                };

                return (
                  <div key={sev} className="flex items-center gap-2">
                    <span className="w-36 text-[10px] text-right font-semibold text-slate-600 truncate">
                      {sevLabels[sev]}
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((prob) => {
                        const cellKey = `${sev}-${prob}`;
                        const count = (matrixCells[cellKey] || []).length;
                        const isSelected = selectedCellFilter?.sev === sev && selectedCellFilter?.prob === prob;

                        return (
                          <button
                            key={prob}
                            onClick={() => {
                              if (isSelected) setSelectedCellFilter(null);
                              else setSelectedCellFilter({ sev, prob });
                            }}
                            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition shadow-2xs relative ${getCellColor(
                              sev,
                              prob
                            )} ${isSelected ? 'ring-4 ring-blue-600 ring-offset-2' : ''}`}
                            title={`Severidade: ${sev} x Probabilidade: ${prob} = Escore ${sev * prob}`}
                          >
                            <span className="text-[10px] opacity-75">{sev * prob}</span>
                            {count > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Eixo Horizontal: Probabilidade 1 -> 5 */}
              <div className="flex items-center gap-2 pt-2">
                <span className="w-36 text-[10px] text-right font-bold text-slate-400">PROBABILIDADE →</span>
                <div className="flex gap-1.5 text-center">
                  {['1. Rara', '2. Improv.', '3. Possív.', '4. Prováv.', '5. Freq.'].map((label, idx) => (
                    <span key={idx} className="w-12 text-[9px] font-semibold text-slate-600 block">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legenda de Níveis */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span><strong>Baixo (1-4):</strong> Até 12m</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span><strong>Médio (5-9):</strong> &lt; 9m</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span><strong>Alto (10-16):</strong> &lt; 3m</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 text-red-800 border border-red-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span><strong>M. Alto (20-25):</strong> Imediato</span>
            </div>
          </div>
        </div>

        {/* Resumo de Diretrizes & Prazos NR-1.5.5 (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900">Diretrizes Legais de Mitigação</h3>
            </div>

            <div className="space-y-3 mt-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Subitem 1.5.4.4.2 da NR-1:</span>
                <p className="text-[11px] leading-relaxed">
                  Para cada perigo deve ser indicada a probabilidade de ocorrência das lesões ou agravos à saúde e a severidade dos possíveis danos, considerando os trabalhadores expostos e controles já existentes.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Subitem 1.5.5.2 (Hierarquia de Prevenção):</span>
                <p className="text-[11px] leading-relaxed">
                  1º Eliminar o perigo psicossocial (redesenho de processos) → 2º Medidas de proteção coletiva/organizacionais → 3º Medidas administrativas e treinamento → 4º Vigilância médica e suporte.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900">
                <span className="font-bold block mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-600" />
                  Alerta de Ação Imediata:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Perigos com nível <strong>MUITO ALTO</strong> ou <strong>ALTO</strong> exigem medidas corretivas urgentes incluídas no Plano de Ação 5W2H do PGR.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToActionPlan}
            className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <span>Acessar Plano de Ação 5W2H</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Setor Filter & Danger List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Inventário de Perigos & Riscos Cadastrados ({filteredItems.length})
            </h3>
            <p className="text-xs text-slate-500">Registro detalhado dos fatores de risco, fontes geradoras e danos à saúde</p>
          </div>

          {/* Filtro de Setor */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filtrar Setor:</span>
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="all">Todos os Setores ({riskInventory.length})</option>
              {company.sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Risk Items */}
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Grid3X3 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Nenhum risco encontrado para o filtro selecionado.</p>
            <p className="text-xs text-slate-400 mt-1">
              Cadastre um novo perigo ou sincronize com as respostas do COPSOQ II.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const sector = company.sectors.find((s) => s.id === item.sectorId);

              let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              if (item.riskLevel === 'MUITO ALTO') badgeColor = 'bg-red-600 text-white border-red-700';
              else if (item.riskLevel === 'ALTO') badgeColor = 'bg-orange-500 text-white border-orange-600';
              else if (item.riskLevel === 'MÉDIO') badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';

              return (
                <div key={item.id} className="py-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${badgeColor}`}>
                          {item.riskLevel} (Escore {item.riskScore})
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                          {sector?.name || 'Geral'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.exposedWorkersCount} trabalhadores expostos
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.dangerName}</h4>
                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-700">Fonte / Circunstância:</strong> {item.dangerSource}
                      </p>
                    </div>

                    {/* Matriz stats & Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          Sev: <strong className="text-slate-800">{item.severity}</strong> • Prob:{' '}
                          <strong className="text-slate-800">{item.probability}</strong>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-700">Prazo: {item.maxActionDeadline}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Editar Perigo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.dangerName)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir Perigo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danos e Controles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700 block mb-1">
                        Possíveis Danos e Agravos à Saúde:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.possibleInjuries.map((inj, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 text-[11px]">
                            {inj}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-1">
                        Controles Existentes / Prevenção Atual:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.existingControls.map((ctl, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 text-[11px]">
                            {ctl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição de Risco */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingItem ? 'Editar Perigo / Fator de Risco' : 'Cadastrar Perigo Psicossocial (NR-1.5.4)'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Setor / GHE *</label>
                  <select
                    value={formData.sectorId}
                    onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {company.sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.employeeCount} trabalhadores)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Processo ou Atividade Laboral</label>
                  <input
                    type="text"
                    value={formData.processOrActivity || ''}
                    onChange={(e) => setFormData({ ...formData, processOrActivity: e.target.value })}
                    placeholder="Ex: Atendimento ao público / Análise de crédito"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Identificação do Perigo / Fator Psicossocial *</label>
                <input
                  type="text"
                  required
                  value={formData.dangerName || ''}
                  onChange={(e) => setFormData({ ...formData, dangerName: e.target.value })}
                  placeholder="Ex: Sobrecarga mental por excesso de metas e ritmo acelerado"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Fonte Geradora ou Circunstância *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.dangerSource || ''}
                  onChange={(e) => setFormData({ ...formData, dangerSource: e.target.value })}
                  placeholder="Ex: Prazos exíguos, quadro de colaboradores reduzido e constante pressão por metas diárias"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Avaliação Quantitativa: Severidade x Probabilidade */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Avaliação de Risco (Matriz 5x5)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Severidade das Consequências (1 a 5)
                    </label>
                    <select
                      value={formData.severity || 3}
                      onChange={(e) => setFormData({ ...formData, severity: Number(e.target.value) as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    >
                      <option value={1}>1 - Leve (desconforto passageiro, sem afastamento)</option>
                      <option value={2}>2 - Menor (atendimento ambulatorial, afastamento &lt; 3 dias)</option>
                      <option value={3}>3 - Moderado (afastamento temporário, estresse evidente)</option>
                      <option value={4}>4 - Crítico / Severo (Burnout diagnosticado, CID F43/F32, afastamento &gt; 15 dias)</option>
                      <option value={5}>5 - Catastrófico / Incapacitante (incapacidade permanente / risco extremo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Probabilidade de Ocorrência (1 a 5)
                    </label>
                    <select
                      value={formData.probability || 3}
                      onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    >
                      <option value={1}>1 - Rara (evento excepcional ou altamente improvável)</option>
                      <option value={2}>2 - Improvável (pouco frequente, controles razoáveis)</option>
                      <option value={3}>3 - Possível (pode ocorrer ocasionalmente)</option>
                      <option value={4}>4 - Provável (frequente na rotina de trabalho)</option>
                      <option value={5}>5 - Frequente / Quase Certo (constatado reiteradamente)</option>
                    </select>
                  </div>
                </div>

                {/* Prévia do cálculo */}
                {(() => {
                  const s = Number(formData.severity) || 3;
                  const p = Number(formData.probability) || 3;
                  const res = calculateRiskClassification(s, p);
                  return (
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <span>Escore: <strong>{res.score}</strong> (Sev {s} x Prob {p})</span>
                      <span>Nível: <strong className="text-blue-700">{res.riskLevel}</strong></span>
                      <span>Prazo Máx. Ação: <strong className="text-slate-800">{res.maxActionDeadline}</strong></span>
                    </div>
                  );
                })()}
              </div>

              {/* Danos e Controles Tag Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Possíveis Danos / Agravos</label>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="text"
                      value={injuryInput}
                      onChange={(e) => setInjuryInput(e.target.value)}
                      placeholder="Ex: Transtorno de Ansiedade"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddInjury}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(formData.possibleInjuries || []).map((inj, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-[11px] flex items-center gap-1">
                        {inj}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(formData.possibleInjuries || [])];
                            updated.splice(idx, 1);
                            setFormData({ ...formData, possibleInjuries: updated });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Medidas de Prevenção Existentes</label>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="text"
                      value={controlInput}
                      onChange={(e) => setControlInput(e.target.value)}
                      placeholder="Ex: Canal de escuta anônimo"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddControl}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(formData.existingControls || []).map((ctl, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-[11px] flex items-center gap-1">
                        {ctl}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(formData.existingControls || [])];
                            updated.splice(idx, 1);
                            setFormData({ ...formData, existingControls: updated });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs"
                >
                  Salvar Perigo na Matriz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
