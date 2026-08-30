import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  QrCode,
  Link,
  Users,
  Calendar,
  CheckCircle2,
  PlayCircle,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Trash2,
  Eye,
  Filter,
  ArrowRight,
  Flame,
  FolderArchive,
  ListTodo,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Company, AssessmentCampaign, SurveyResponse, QuestionnaireType, AssessmentType } from '../types';
import { StorageService } from '../services/storageService';
import { AssessmentDetailView } from './AssessmentDetailView';
import { Building2, ChevronRight } from 'lucide-react';

interface AssessmentsViewProps {
  company: Company;
  companies?: Company[];
  onSelectCompany?: (companyId: string) => void;
  campaigns: AssessmentCampaign[];
  onOpenAnonymousSurvey: (token?: string) => void;
  onRefreshData: () => void;
  initialCampaignId?: string | null;
  preselectedQuestionnaireId?: string | null;
  onClearPreselectedQuestionnaire?: () => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  company,
  companies = [],
  onSelectCompany,
  campaigns,
  onOpenAnonymousSurvey,
  onRefreshData,
  initialCampaignId,
  preselectedQuestionnaireId,
  onClearPreselectedQuestionnaire,
}) => {
  const companyCampaigns = company.id === 'all' 
    ? campaigns 
    : campaigns.filter((c) => c.companyId === company.id);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    initialCampaignId || null
  );

  useEffect(() => {
    setSelectedCampaignId(initialCampaignId || null);
  }, [initialCampaignId]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState<AssessmentCampaign | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCampaignForResponses, setSelectedCampaignForResponses] = useState<string | null>(null);

  // Form State para Nova Avaliação
  const defaultTargetCompany = company.id !== 'all' ? company : (companies[0] || company);
  const [modalCompanyId, setModalCompanyId] = useState<string>(defaultTargetCompany.id);
  const [title, setTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('AEP');
  const [questionnaireType, setQuestionnaireType] = useState<QuestionnaireType>('copsoq-short');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(defaultTargetCompany.sectors.map((s) => s.id));
  const [sampleGoal, setSampleGoal] = useState<number>(Math.max(10, Math.round((defaultTargetCompany.totalEmployees || 50) * 0.6)));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');

  // Ao receber um questionário pré-selecionado vindo da Biblioteca de Testes, abre o modal de criação automaticamente
  useEffect(() => {
    if (preselectedQuestionnaireId) {
      setQuestionnaireType(preselectedQuestionnaireId as QuestionnaireType);
      const initialComp = company.id !== 'all' ? company : (companies[0] || company);
      setModalCompanyId(initialComp.id);
      setSelectedSectors(initialComp.sectors.map((s) => s.id));
      setSampleGoal(Math.max(10, Math.round((initialComp.totalEmployees || 50) * 0.6)));
      
      const qTemplate = StorageService.getQuestionnaireById(preselectedQuestionnaireId);
      if (qTemplate) {
        setTitle(`AEP ${new Date().getFullYear()} - ${qTemplate.title}`);
      } else {
        setTitle(`AEP ${new Date().getFullYear()} - Avaliação de Riscos Psicossociais`);
      }
      setShowCreateModal(true);
      if (onClearPreselectedQuestionnaire) {
        onClearPreselectedQuestionnaire();
      }
    }
  }, [preselectedQuestionnaireId]);

  // Sincroniza setores e metas quando a empresa selecionada no modal muda
  const activeModalCompany = companies.find((c) => c.id === modalCompanyId) || defaultTargetCompany;

  const handleModalCompanyChange = (newCompanyId: string) => {
    setModalCompanyId(newCompanyId);
    const targetComp = companies.find((c) => c.id === newCompanyId);
    if (targetComp) {
      setSelectedSectors(targetComp.sectors.map((s) => s.id));
      setSampleGoal(Math.max(10, Math.round((targetComp.totalEmployees || 50) * 0.6)));
    }
  };

  const handleOpenCreateModal = () => {
    const initialComp = company.id !== 'all' ? company : (companies[0] || company);
    setModalCompanyId(initialComp.id);
    setSelectedSectors(initialComp.sectors.map((s) => s.id));
    setSampleGoal(Math.max(10, Math.round((initialComp.totalEmployees || 50) * 0.6)));
    setTitle(`AEP ${new Date().getFullYear()} - Avaliação de Riscos Psicossociais`);
    setShowCreateModal(true);
  };

  // Se uma campanha estiver selecionada para detalhamento, renderiza a visão unificada (Visão Geral, Questionários, Evidências, Plano de Ação)
  const currentSelectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  if (currentSelectedCampaign) {
    // Determina a empresa exata dona da campanha para que setores e dados da empresa fiquem 100% corretos
    const targetCompanyForCampaign = company.id !== 'all' && company.id === currentSelectedCampaign.companyId
      ? company
      : (companies.find((c) => c.id === currentSelectedCampaign.companyId) || company);

    return (
      <AssessmentDetailView
        campaign={currentSelectedCampaign}
        company={targetCompanyForCampaign}
        onBack={() => setSelectedCampaignId(null)}
        onOpenAnonymousSurvey={onOpenAnonymousSurvey}
        onRefreshData={onRefreshData}
      />
    );
  }

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCompanyId || modalCompanyId === 'all') {
      alert('Selecione obrigatoriamente a empresa para vincular esta avaliação.');
      return;
    }

    if (!title.trim()) {
      alert('Informe o título da avaliação.');
      return;
    }

    const targetCompany = companies.find((c) => c.id === modalCompanyId) || company;
    const token = `${targetCompany.tradeName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

    const newCampaign: AssessmentCampaign = {
      id: `camp-${Date.now()}`,
      companyId: targetCompany.id,
      title,
      assessmentType,
      questionnaireType,
      targetSectorIds: selectedSectors,
      startDate,
      endDate,
      status: 'active',
      anonymousToken: token,
      sampleGoal,
      responseCount: 0,
      technicalInCharge: StorageService.getTechnicalProfile(),
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveCampaign(newCampaign);
    setShowCreateModal(false);
    
    // Se estava visualizando uma empresa individual diferente da criada, atualiza a empresa ativa
    if (onSelectCompany && company.id !== 'all' && company.id !== targetCompany.id) {
      onSelectCompany(targetCompany.id);
    }
    
    setSelectedCampaignId(newCampaign.id);
    onRefreshData();
  };

  const handleSimulateResponses = (campaign: AssessmentCampaign) => {
    StorageService.simulateBatchResponses(campaign.id, company.id, 15);
    onRefreshData();
  };

  const handleDeleteCampaign = (id: string, name: string) => {
    if (confirm(`Excluir a campanha "${name}" e todas as suas respostas?`)) {
      StorageService.deleteCampaign(id);
      onRefreshData();
    }
  };

  const getSurveyUrl = (token: string) => {
    return `${window.location.origin}/#survey=${token}`;
  };

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(getSurveyUrl(token));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Indicador de Empresa Ativa */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">Empresa Ativa:</span>
              {companies.length > 0 && onSelectCompany ? (
                <select
                  value={company.id}
                  onChange={(e) => onSelectCompany(e.target.value)}
                  className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">🏢 Todas as Empresas ({companies.length})</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradeName} ({c.cnpj})
                    </option>
                  ))}
                </select>
              ) : (
                <h2 className="text-sm font-bold text-slate-900">{company.tradeName}</h2>
              )}
              {company.id === 'all' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Visão Consolidada Multi-Empresas
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Grau de Risco {company.riskGrade} (NR-4)
                </span>
              )}
            </div>
            {company.id === 'all' ? (
              <p className="text-xs text-slate-500 mt-0.5">
                Visão Geral Consolidada • Todas as organizações ({companies.length} empresas) • {company.totalEmployees} trabalhadores somados
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">
                CNPJ: {company.cnpj} • CNAE: {company.cnae} ({company.cnaeDescription || 'Atividades Gerais'}) • {company.totalEmployees} trabalhadores
              </p>
            )}
          </div>
        </div>

        <button
          id="create-assessment-btn"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Avaliação</span>
        </button>
      </div>

      {/* Header Informativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ciclos de Avaliação & Questionários Anônimos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão dos ciclos de coleta para AEP / AET conforme NR-1 e NR-17 com instrumentos padronizados e validados (COPSOQ II)
          </p>
        </div>
      </div>

      {/* Campaigns List */}
      {companyCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhuma campanha cadastrada para esta empresa</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Inicie uma nova Avaliação Ergonômica Preliminar (AEP) para gerar links anônimos de questionários aos trabalhadores.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800"
          >
            Criar Primeira Avaliação
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {companyCampaigns.map((camp) => {
            const responses = StorageService.getResponses(camp.id);
            const evidences = StorageService.getEvidences(camp.id);
            const actionPlans = StorageService.getActionPlans(camp.id);
            const progressPercent = Math.min(100, Math.round((responses.length / (camp.sampleGoal || 1)) * 100));

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                {/* Header da Campanha */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {camp.assessmentType} (NR-17)
                      </span>
                      {(() => {
                        const template = StorageService.getQuestionnaireById(camp.questionnaireType);
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {template?.title || `Instrumento (${camp.questionnaireType})`}
                          </span>
                        );
                      })()}
                      <span className="text-xs text-slate-400 font-mono">Token: #{camp.anonymousToken}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{camp.title}</h3>
                  </div>

                  {/* Badges de Status e Botão de Acesso Principal */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCampaignId(camp.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
                    >
                      <span>Abrir Detalhes da Avaliação</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>

                {/* Progress bar e métricas */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">Adesão Amostral</span>
                      <strong className="text-slate-900">{progressPercent}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <span className="text-[11px] text-slate-500 block">Questionários Respondidos</span>
                    <span className="text-lg font-bold text-slate-900">
                      {responses.length} <span className="text-xs font-normal text-slate-500">/{camp.sampleGoal}</span>
                    </span>
                  </div>

                  <div className="text-center sm:text-left">
                    <span className="text-[11px] text-slate-500 block">Evidências Anexadas</span>
                    <span className="text-lg font-bold text-slate-900">
                      {evidences.length} <span className="text-xs font-normal text-slate-500">docs/fotos</span>
                    </span>
                  </div>

                  <div className="text-center sm:text-left">
                    <span className="text-[11px] text-slate-500 block">Plano de Ação 5W2H</span>
                    <span className="text-lg font-bold text-slate-900">
                      {actionPlans.length} <span className="text-xs font-normal text-slate-500">medidas</span>
                    </span>
                  </div>
                </div>

                {/* Ações da Campanha */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Botão QR Code */}
                    <button
                      onClick={() => setShowQRModal(camp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>QR Code</span>
                    </button>

                    {/* Copiar Link */}
                    <button
                      onClick={() => handleCopyLink(camp.anonymousToken)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>Copiar Link</span>
                    </button>

                    {/* Abrir Formulário Anônimo */}
                    <button
                      onClick={() => onOpenAnonymousSurvey(camp.anonymousToken)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Modo Trabalhador</span>
                    </button>

                    {/* Simular Lote de Respostas (Para Testes) */}
                    <button
                      onClick={() => handleSimulateResponses(camp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium transition"
                      title="Gera 15 respostas estatisticamente representativas para simulação"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>+15 Respostas Teste</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCampaignId(camp.id)}
                      className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Dimensões, Questionários, Evidências e Ações →</span>
                    </button>
                    {companyCampaigns.length > 1 && (
                      <button
                        onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition"
                        title="Excluir Campanha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal QR Code */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">QR Code da Campanha</h3>
              <button onClick={() => setShowQRModal(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl inline-block border border-slate-200">
              <QRCodeSVG value={getSurveyUrl(showQRModal.anonymousToken)} size={200} level="M" />
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{showQRModal.title}</p>
              <p className="text-[11px] text-slate-500">
                Aponte a câmera do celular para responder o questionário anônimo.
              </p>
            </div>

            <button
              onClick={() => handleCopyLink(showQRModal.anonymousToken)}
              className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Criar Campanha */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Criar Nova Avaliação Psicossocial (AEP / AET)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              {/* Vínculo Obrigatório de Empresa */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                  <span>Empresa da Avaliação * (Vínculo Obrigatório)</span>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/80 px-2 py-0.5 rounded-md">
                    Obrigatório
                  </span>
                </label>
                <select
                  required
                  value={modalCompanyId}
                  onChange={(e) => handleModalCompanyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                >
                  <option value="" disabled>-- Selecione a Empresa Destino --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradeName} • CNPJ: {c.cnpj} (Grau {c.riskGrade})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {activeModalCompany.corporateName} • {activeModalCompany.totalEmployees} trabalhadores • CNAE {activeModalCompany.cnae}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Título da Avaliação *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  placeholder="Ex: AEP 2026 - Avaliação de Riscos Psicossociais"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tipo de Avaliação</label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="AEP">AEP - Avaliação Ergonômica Preliminar (NR-17)</option>
                    <option value="AET">AET - Análise Ergonômica do Trabalho (NR-17)</option>
                    <option value="Periódica">Periódica / Monitoramento Contínuo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Instrumento Psicométrico / Teste *</label>
                  <select
                    value={questionnaireType}
                    onChange={(e) => setQuestionnaireType(e.target.value as QuestionnaireType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-600"
                  >
                    <optgroup label="🛡️ Instrumentos Oficiais COPSOQ II (Validados)">
                      {StorageService.getQuestionnaires()
                        .filter((q) => q.type === 'standard')
                        .map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title} ({q.itemCount} questões · {q.estimatedMinutes} min)
                          </option>
                        ))}
                    </optgroup>
                    {StorageService.getQuestionnaires().filter((q) => q.type === 'custom').length > 0 && (
                      <optgroup label="✨ Questionários Customizados Criados">
                        {StorageService.getQuestionnaires()
                          .filter((q) => q.type === 'custom')
                          .map((q) => (
                            <option key={q.id} value={q.id}>
                              {q.title} ({q.itemCount} questões · {q.dimensionsCount || q.dimensions?.length || 1} dimensões)
                            </option>
                          ))}
                      </optgroup>
                    )}
                    {StorageService.getQuestionnaires().filter((q) => q.type === 'imported').length > 0 && (
                      <optgroup label="📥 Questionários Importados (Upload / Planilhas)">
                        {StorageService.getQuestionnaires()
                          .filter((q) => q.type === 'imported')
                          .map((q) => (
                            <option key={q.id} value={q.id}>
                              {q.title} ({q.itemCount} questões · Importado)
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Card de Detalhes do Instrumento Selecionado */}
              {(() => {
                const selectedTemplate = StorageService.getQuestionnaireById(questionnaireType);
                if (!selectedTemplate) return null;
                const isStd = selectedTemplate.type === 'standard';
                const isImp = selectedTemplate.type === 'imported';
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isStd
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : isImp
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {isStd ? 'Oficial COPSOQ II' : isImp ? 'Importado via Upload' : 'Customizado'}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {selectedTemplate.code}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {selectedTemplate.itemCount} perguntas · {selectedTemplate.dimensionsCount || selectedTemplate.dimensions?.length || 1} dimensões · ~{selectedTemplate.estimatedMinutes} min
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedTemplate.description}
                    </p>
                  </div>
                );
              })()}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-medium">Setores / GHEs Incluídos ({activeModalCompany.tradeName})</label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSectors(activeModalCompany.sectors.map((s) => s.id))}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Marcar Todos
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSectors([])}
                      className="text-slate-500 hover:underline"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                  {activeModalCompany.sectors.map((sec) => (
                    <label key={sec.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white rounded transition">
                      <input
                        type="checkbox"
                        checked={selectedSectors.includes(sec.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSectors([...selectedSectors, sec.id]);
                          } else {
                            setSelectedSectors(selectedSectors.filter((id) => id !== sec.id));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium text-[11px] leading-tight">
                        {sec.name} <span className="text-slate-400 font-normal">({sec.employeeCount} trab.)</span>
                      </span>
                    </label>
                  ))}
                  {activeModalCompany.sectors.length === 0 && (
                    <p className="text-xs text-slate-400 col-span-3 py-2 text-center">
                      Nenhum setor cadastrado para esta empresa.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Meta Amostral (Respondentes)</label>
                  <input
                    type="number"
                    min={1}
                    value={sampleGoal}
                    onChange={(e) => setSampleGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Data de Término</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Justificativa da amostragem, alinhamento com CIPA ou comitê de ergonomia..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-sm"
                >
                  Salvar e Iniciar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
