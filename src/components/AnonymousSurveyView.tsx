import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  HeartHandshake,
  Sparkles,
  HelpCircle,
  Building2,
  Users,
  Smile,
  Meh,
  Frown,
  Send,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssessmentCampaign, Company, SurveyResponse } from '../types';
import { StorageService } from '../services/storageService';
import { COPSOQ_SHORT_QUESTIONS, COPSOQ_DIMENSIONS } from '../data/copsoqQuestions';

interface AnonymousSurveyViewProps {
  token?: string;
  campaignId?: string;
  onFinish?: () => void;
  onBackToDashboard?: () => void;
}

export const AnonymousSurveyView: React.FC<AnonymousSurveyViewProps> = ({
  token,
  campaignId,
  onFinish,
  onBackToDashboard,
}) => {
  const [campaign, setCampaign] = useState<AssessmentCampaign | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentStep, setCurrentStep] = useState<'intro' | 'questions' | 'completed'>('intro');
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 6;

  useEffect(() => {
    let foundCampaign: AssessmentCampaign | undefined;
    if (token) {
      foundCampaign = StorageService.getCampaignByToken(token);
    } else if (campaignId) {
      foundCampaign = StorageService.getCampaigns().find((c) => c.id === campaignId);
    } else {
      const allCampaigns = StorageService.getCampaigns();
      foundCampaign = allCampaigns[0];
    }

    if (foundCampaign) {
      setCampaign(foundCampaign);
      const comp = StorageService.getCompanies().find((c) => c.id === foundCampaign.companyId);
      if (comp) {
        setCompany(comp);
        if (comp.sectors.length > 0) {
          setSelectedSectorId(comp.sectors[0].id);
        }
      }
    }
  }, [token, campaignId]);

  const currentTemplate = useMemo(() => {
    if (!campaign) return null;
    return StorageService.getQuestionnaireById(campaign.questionnaireType);
  }, [campaign]);

  const questions = useMemo(() => {
    if (currentTemplate && currentTemplate.questions && currentTemplate.questions.length > 0) {
      return currentTemplate.questions;
    }
    return COPSOQ_SHORT_QUESTIONS.map((q) => ({
      id: q.id,
      code: `Q${q.id < 10 ? '0' + q.id : q.id}`,
      text: q.text,
      dimensionCode: q.dimensionCode,
      dimensionTitle: q.dimensionCode,
      category: 'Organização do Trabalho',
      responseType: 'likert_copsoq' as const,
      scaleType: q.scaleType,
      inverted: q.inverted,
    }));
  }, [currentTemplate]);

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const handleSelectOption = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextPage = () => {
    // Valida se as questões obrigatórias da página atual foram respondidas
    const unAnsweredOnPage = currentQuestions.filter(
      (q) => (q.isRequired !== false && answers[q.id] === undefined) || answers[q.id] === ''
    );
    if (unAnsweredOnPage.length > 0) {
      alert(`Por favor, responda todas as questões obrigatórias desta etapa antes de prosseguir (${unAnsweredOnPage.length} pendente(s)).`);
      return;
    }

    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmitSurvey();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitSurvey = () => {
    if (!campaign || !company) return;

    const responseObj: SurveyResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      campaignId: campaign.id,
      companyId: company.id,
      sectorId: selectedSectorId || company.sectors[0]?.id || 'sec-1',
      submittedAt: new Date().toISOString(),
      answers,
    };

    StorageService.addResponse(responseObj);
    setCurrentStep('completed');

    // Dispara celebração
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  if (!campaign || !company) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Campanha Não Encontrada</h2>
          <p className="text-xs text-slate-600">
            O link de avaliação fornecido pode ter expirado ou não é válido. Entre em contato com a equipe de SST da sua empresa.
          </p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold"
            >
              Voltar ao Início
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              MG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{company.tradeName}</span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  NR-1 / NR-17
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate max-w-xs sm:max-w-md">
                {campaign.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">100% Anônimo & Sigiloso</span>
              <span className="sm:hidden">Anônimo</span>
            </div>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Sair
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar (se estiver nas perguntas) */}
        {currentStep === 'questions' && (
          <div className="w-full bg-slate-100 h-1.5">
            <div
              className="bg-blue-600 h-1.5 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl w-full mx-auto px-4 py-6 sm:py-10 flex-1">
        {/* STEP 1: INTRODUÇÃO */}
        {currentStep === 'intro' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-inner">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Pesquisa de Clima & Riscos Psicossociais
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                Sua opinião sincera é indispensável para aprimorarmos a organização do trabalho, prevenir o estresse ocupacional e promover a saúde física e mental de todos os colaboradores.
              </p>
            </div>

            {/* Garantias de Anonimato e LGPD */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Garantia de Sigilo Absoluto (LGPD e NR-1 subitem 1.5.3.3)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px] leading-relaxed">
                <li>Nenhum dado nominal, endereço de IP, e-mail ou identificador individual é registrado.</li>
                <li>Os dados são tabulados de forma agrupada por setor, sem possibilidade de rastreamento.</li>
                <li>O objetivo exclusivo é gerar melhorias ergonômicas e organizacionais no ambiente laboral.</li>
              </ul>
            </div>

            {/* Seleção do Setor / Unidade */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Selecione o seu Setor / Unidade de Trabalho:
              </label>
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {company.sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 block">
                Tempo estimado para preenchimento: cerca de 3 a 5 minutos ({questions.length} questões rápidas).
              </span>
            </div>

            <button
              id="start-survey-btn"
              onClick={() => setCurrentStep('questions')}
              className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Iniciar Questionário Anônimo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2: QUESTÕES COPSOQ II */}
        {currentStep === 'questions' && (
          <div className="space-y-6">
            {/* Header de Etapa */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Etapa <strong>{currentPage + 1}</strong> de <strong>{totalPages}</strong>
              </span>
              <span>
                <strong>{answeredCount}</strong> de <strong>{questions.length}</strong> respondidas ({progressPercent}%)
              </span>
            </div>

            {/* Lista de Perguntas desta página */}
            <div className="space-y-4">
              {currentQuestions.map((q, idx) => {
                const questionNumber = currentPage * questionsPerPage + idx + 1;
                const currentValue = answers[q.id];
                const dim = COPSOQ_DIMENSIONS[q.dimensionCode];

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl bg-white border transition shadow-2xs space-y-3 ${
                      currentValue !== undefined
                        ? 'border-blue-300 ring-1 ring-blue-100'
                        : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {questionNumber}
                      </span>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                          {dim?.category || 'Organização do Trabalho'}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug">{q.text}</h3>
                      </div>
                    </div>

                    {/* Tipos de Resposta */}
                    {q.responseType === 'yes_no' ? (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSelectOption(q.id, 'sim')}
                          className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                            currentValue === 'sim'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectOption(q.id, 'nao')}
                          className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                            currentValue === 'nao'
                              ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Não
                        </button>
                      </div>
                    ) : q.responseType === 'text_description' ? (
                      <div className="pt-2">
                        <textarea
                          rows={3}
                          value={currentValue || ''}
                          onChange={(e) => handleSelectOption(q.id, e.target.value)}
                          placeholder={q.placeholder || 'Digite sua resposta ou observação...'}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    ) : q.responseType === 'numeric_scale' ? (
                      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 pt-2">
                        {Array.from({ length: 11 }).map((_, n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => handleSelectOption(q.id, n)}
                            className={`p-2.5 rounded-lg border text-center font-bold text-xs transition ${
                              currentValue === n
                                ? 'bg-blue-700 border-blue-700 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* Escala Likert de 5 pontos (COPSOQ Padrão) */
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                        {[
                          { val: 1, label: q.scaleType === 'intensity' ? '1 - Nada / quase nada' : q.scaleType === 'health_quality' ? '1 - Deficitária' : '1 - Nunca / quase nunca' },
                          { val: 2, label: q.scaleType === 'intensity' ? '2 - Um pouco' : q.scaleType === 'health_quality' ? '2 - Razoável' : '2 - Raramente' },
                          { val: 3, label: q.scaleType === 'intensity' ? '3 - Moderadamente' : q.scaleType === 'health_quality' ? '3 - Boa' : '3 - Às vezes' },
                          { val: 4, label: q.scaleType === 'intensity' ? '4 - Muito' : q.scaleType === 'health_quality' ? '4 - Muito boa' : '4 - Frequentemente' },
                          { val: 5, label: q.scaleType === 'intensity' ? '5 - Extremamente' : q.scaleType === 'health_quality' ? '5 - Excelente' : '5 - Sempre' },
                        ].map((opt) => {
                          const isSelected = currentValue === opt.val;
                          return (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt.val)}
                              className={`p-2.5 rounded-xl border text-left sm:text-center transition flex sm:flex-col items-center justify-between sm:justify-center gap-1 text-xs ${
                                isSelected
                                  ? 'bg-blue-700 border-blue-700 text-white font-bold shadow-xs'
                                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-[11px] leading-tight">{opt.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 sm:hidden" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <span>{currentPage === totalPages - 1 ? 'Finalizar e Enviar' : 'Próxima Etapa'}</span>
                {currentPage === totalPages - 1 ? <Send className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMAÇÃO DE CONCLUSÃO */}
        {currentStep === 'completed' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-md text-center space-y-6 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Muito Obrigado!</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sua resposta foi transmitida e gravada com segurança e 100% de anonimato. Seus apontamentos serão utilizados para promover um ambiente de trabalho mais saudável e seguro.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <span className="font-semibold text-slate-700 block">Protocolo de Confirmação Anônimo:</span>
              <span className="font-mono text-[10px] text-slate-400">
                NR1-ANON-{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </span>
            </div>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition shadow-xs"
              >
                Voltar ao Painel do Gestor
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        MindGuard NR-1 • Plataforma Especializada em Gestão de Riscos Psicossociais & GRO
      </footer>
    </div>
  );
};
