import {
  Company,
  AssessmentCampaign,
  SurveyResponse,
  RiskInventoryItem,
  ActionPlanItem,
  TechnicalInCharge,
  AssessmentEvidence,
  QuestionnaireTemplate,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_CAMPAIGNS,
  INITIAL_RESPONSES,
  INITIAL_RISK_INVENTORY,
  INITIAL_ACTION_PLANS,
  INITIAL_EVIDENCES,
  DEFAULT_TECHNICAL_IN_CHARGE,
  generateRealisticResponses,
} from '../data/initialMockData';
import { COPSOQ_DIMENSIONS, COPSOQ_SHORT_QUESTIONS, calculateDimensionScore } from '../data/copsoqQuestions';
import {
  INITIAL_QUESTIONNAIRE_TEMPLATES,
  COPSOQ_SHORT_TEMPLATE,
  COPSOQ_MEDIUM_TEMPLATE,
  COPSOQ_LONG_TEMPLATE,
} from '../data/questionnairesLibrary';

const STORAGE_KEYS = {
  COMPANIES: 'mindguard_companies_v1',
  CAMPAIGNS: 'mindguard_campaigns_v1',
  RESPONSES: 'mindguard_responses_v1',
  RISK_INVENTORY: 'mindguard_risk_inventory_v1',
  ACTION_PLANS: 'mindguard_action_plans_v1',
  EVIDENCES: 'mindguard_evidences_v1',
  TECHNICAL_PROFILE: 'mindguard_tech_profile_v1',
  SELECTED_COMPANY_ID: 'mindguard_selected_company_id_v1',
  CUSTOM_QUESTIONNAIRES: 'mindguard_custom_questionnaires_v1',
};

// Safe JSON get helper
function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

// Safe JSON set helper
function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Inicializa dados no primeiro acesso
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
      setStoredItem(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
      setStoredItem(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESPONSES)) {
      setStoredItem(STORAGE_KEYS.RESPONSES, INITIAL_RESPONSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RISK_INVENTORY)) {
      setStoredItem(STORAGE_KEYS.RISK_INVENTORY, INITIAL_RISK_INVENTORY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTION_PLANS)) {
      setStoredItem(STORAGE_KEYS.ACTION_PLANS, INITIAL_ACTION_PLANS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVIDENCES)) {
      setStoredItem(STORAGE_KEYS.EVIDENCES, INITIAL_EVIDENCES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TECHNICAL_PROFILE)) {
      setStoredItem(STORAGE_KEYS.TECHNICAL_PROFILE, DEFAULT_TECHNICAL_IN_CHARGE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELECTED_COMPANY_ID)) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_COMPANY_ID, 'comp-1');
    }
  },

  // Reset para dados originais
  resetToDefaults() {
    setStoredItem(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    setStoredItem(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    setStoredItem(STORAGE_KEYS.RESPONSES, INITIAL_RESPONSES);
    setStoredItem(STORAGE_KEYS.RISK_INVENTORY, INITIAL_RISK_INVENTORY);
    setStoredItem(STORAGE_KEYS.ACTION_PLANS, INITIAL_ACTION_PLANS);
    setStoredItem(STORAGE_KEYS.EVIDENCES, INITIAL_EVIDENCES);
    setStoredItem(STORAGE_KEYS.TECHNICAL_PROFILE, DEFAULT_TECHNICAL_IN_CHARGE);
    localStorage.setItem(STORAGE_KEYS.SELECTED_COMPANY_ID, 'comp-1');
  },

  // Empresas
  getCompanies(): Company[] {
    return getStoredItem<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  },
  saveCompany(company: Company): void {
    const companies = this.getCompanies();
    const index = companies.findIndex((c) => c.id === company.id);
    if (index >= 0) {
      companies[index] = { ...company, updatedAt: new Date().toISOString() };
    } else {
      companies.push({
        ...company,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setStoredItem(STORAGE_KEYS.COMPANIES, companies);
  },
  deleteCompany(companyId: string): void {
    const companies = this.getCompanies().filter((c) => c.id !== companyId);
    setStoredItem(STORAGE_KEYS.COMPANIES, companies);
    if (this.getSelectedCompanyId() === companyId && companies.length > 0) {
      this.setSelectedCompanyId(companies[0].id);
    }
  },

  // Empresa selecionada no contexto do SaaS
  getSelectedCompanyId(): string {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_COMPANY_ID) || 'comp-1';
  },
  setSelectedCompanyId(companyId: string): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_COMPANY_ID, companyId);
  },

  // Perfil do Responsável Técnico
  getTechnicalProfile(): TechnicalInCharge {
    return getStoredItem<TechnicalInCharge>(
      STORAGE_KEYS.TECHNICAL_PROFILE,
      DEFAULT_TECHNICAL_IN_CHARGE
    );
  },
  saveTechnicalProfile(profile: TechnicalInCharge): void {
    setStoredItem(STORAGE_KEYS.TECHNICAL_PROFILE, profile);
  },

  // Campanhas / Avaliações
  getCampaigns(companyId?: string): AssessmentCampaign[] {
    const all = getStoredItem<AssessmentCampaign[]>(
      STORAGE_KEYS.CAMPAIGNS,
      INITIAL_CAMPAIGNS
    );
    if (companyId) {
      return all.filter((c) => c.companyId === companyId);
    }
    return all;
  },
  getCampaignByToken(token: string): AssessmentCampaign | undefined {
    const all = getStoredItem<AssessmentCampaign[]>(
      STORAGE_KEYS.CAMPAIGNS,
      INITIAL_CAMPAIGNS
    );
    return all.find((c) => c.anonymousToken === token);
  },
  saveCampaign(campaign: AssessmentCampaign): void {
    const campaigns = getStoredItem<AssessmentCampaign[]>(
      STORAGE_KEYS.CAMPAIGNS,
      INITIAL_CAMPAIGNS
    );
    const index = campaigns.findIndex((c) => c.id === campaign.id);
    if (index >= 0) {
      campaigns[index] = { ...campaign, updatedAt: new Date().toISOString() };
    } else {
      campaigns.push({
        ...campaign,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setStoredItem(STORAGE_KEYS.CAMPAIGNS, campaigns);
  },
  deleteCampaign(campaignId: string): void {
    const campaigns = getStoredItem<AssessmentCampaign[]>(
      STORAGE_KEYS.CAMPAIGNS,
      INITIAL_CAMPAIGNS
    ).filter((c) => c.id !== campaignId);
    setStoredItem(STORAGE_KEYS.CAMPAIGNS, campaigns);
  },

  // Respostas de Questionários Anônimos
  getResponses(campaignId?: string): SurveyResponse[] {
    const all = getStoredItem<SurveyResponse[]>(
      STORAGE_KEYS.RESPONSES,
      INITIAL_RESPONSES
    );
    if (campaignId) {
      return all.filter((r) => r.campaignId === campaignId);
    }
    return all;
  },
  addResponse(response: SurveyResponse): void {
    const all = this.getResponses();
    all.push(response);
    setStoredItem(STORAGE_KEYS.RESPONSES, all);

    // Incrementa contagem na campanha correspondente
    const campaigns = getStoredItem<AssessmentCampaign[]>(
      STORAGE_KEYS.CAMPAIGNS,
      INITIAL_CAMPAIGNS
    );
    const campaignIndex = campaigns.findIndex((c) => c.id === response.campaignId);
    if (campaignIndex >= 0) {
      campaigns[campaignIndex].responseCount = (campaigns[campaignIndex].responseCount || 0) + 1;
      campaigns[campaignIndex].updatedAt = new Date().toISOString();
      setStoredItem(STORAGE_KEYS.CAMPAIGNS, campaigns);
    }

    // Atualiza automaticamente as sugestões de plano de ação com base nos novos escores
    this.syncAutoActionPlanSuggestions(response.campaignId, response.companyId);
  },

  // Simular lote de respostas para testes
  simulateBatchResponses(campaignId: string, companyId: string, count: number = 20): void {
    const campaigns = getStoredItem<AssessmentCampaign[]>(
      STORAGE_KEYS.CAMPAIGNS,
      INITIAL_CAMPAIGNS
    );
    const camp = campaigns.find((c) => c.id === campaignId);
    const qTemplate = camp ? this.getQuestionnaireById(camp.questionnaireType) : undefined;

    const companies = this.getCompanies();
    const company = companies.find((c) => c.id === companyId);
    const sectors = company?.sectors || [{ id: 'sec-1', name: 'Geral' }];

    const questions = qTemplate?.questions && qTemplate.questions.length > 0
      ? qTemplate.questions
      : COPSOQ_SHORT_QUESTIONS;

    const newResponses: SurveyResponse[] = [];

    for (let i = 1; i <= count; i++) {
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const answers: Record<number, any> = {};

      for (const q of questions) {
        if (q.responseType === 'yes_no') {
          answers[q.id] = Math.random() > 0.4 ? 'Sim' : 'Não';
        } else if (q.responseType === 'text') {
          answers[q.id] = 'Rotina operacional com demandas adequadas e bom clima de trabalho.';
        } else if (q.responseType === 'numeric_scale') {
          answers[q.id] = Math.floor(Math.random() * 4) + 6;
        } else if (q.responseType === 'multiple_choice' && q.options && q.options.length > 0) {
          answers[q.id] = q.options[Math.floor(Math.random() * q.options.length)];
        } else {
          // Likert 1..5
          answers[q.id] = Math.floor(Math.random() * 5) + 1;
        }
      }

      newResponses.push({
        id: `resp-sim-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        campaignId,
        companyId,
        sectorId: sector.id,
        submittedAt: new Date(Date.now() - Math.floor(Math.random() * 15 * 86400000)).toISOString(),
        demographics: {
          gender: i % 2 === 0 ? 'Feminino' : 'Masculino',
          ageGroup: i % 3 === 0 ? '< 30 anos' : (i % 3 === 1 ? '30 a 45 anos' : '> 45 anos'),
          tenureYears: i % 2 === 0 ? '1 a 3 anos' : '> 5 anos',
          shift: 'Diurno',
        },
        answers,
      });
    }

    const all = this.getResponses();
    all.push(...newResponses);
    setStoredItem(STORAGE_KEYS.RESPONSES, all);

    const campaignIndex = campaigns.findIndex((c) => c.id === campaignId);
    if (campaignIndex >= 0) {
      campaigns[campaignIndex].responseCount = (campaigns[campaignIndex].responseCount || 0) + count;
      setStoredItem(STORAGE_KEYS.CAMPAIGNS, campaigns);
    }

    // Atualiza automaticamente as sugestões de plano de ação com base nos novos escores
    this.syncAutoActionPlanSuggestions(campaignId, companyId);
  },

  // Evidências Documentais (NR-1 e NR-17)
  getEvidences(campaignId?: string): AssessmentEvidence[] {
    const all = getStoredItem<AssessmentEvidence[]>(
      STORAGE_KEYS.EVIDENCES,
      INITIAL_EVIDENCES
    );
    if (campaignId) {
      return all.filter((e) => e.campaignId === campaignId);
    }
    return all;
  },
  saveEvidence(evidence: AssessmentEvidence): void {
    const all = this.getEvidences();
    const index = all.findIndex((e) => e.id === evidence.id);
    if (index >= 0) {
      all[index] = evidence;
    } else {
      all.push({
        ...evidence,
        createdAt: evidence.createdAt || new Date().toISOString(),
      });
    }
    setStoredItem(STORAGE_KEYS.EVIDENCES, all);
  },
  deleteEvidence(id: string): void {
    const all = this.getEvidences().filter((e) => e.id !== id);
    setStoredItem(STORAGE_KEYS.EVIDENCES, all);
  },

  // Inventário de Riscos Ocupacionais (NR-1)
  getRiskInventory(campaignId?: string): RiskInventoryItem[] {
    const all = getStoredItem<RiskInventoryItem[]>(
      STORAGE_KEYS.RISK_INVENTORY,
      INITIAL_RISK_INVENTORY
    );
    if (campaignId) {
      return all.filter((r) => r.campaignId === campaignId);
    }
    return all;
  },
  saveRiskInventoryItem(item: RiskInventoryItem): void {
    const all = this.getRiskInventory();
    const index = all.findIndex((r) => r.id === item.id);
    if (index >= 0) {
      all[index] = item;
    } else {
      all.push(item);
    }
    setStoredItem(STORAGE_KEYS.RISK_INVENTORY, all);
  },
  deleteRiskInventoryItem(id: string): void {
    const all = this.getRiskInventory().filter((r) => r.id !== id);
    setStoredItem(STORAGE_KEYS.RISK_INVENTORY, all);
  },

  // Planos de Ação (5W2H)
  getActionPlans(campaignId?: string): ActionPlanItem[] {
    const all = getStoredItem<ActionPlanItem[]>(
      STORAGE_KEYS.ACTION_PLANS,
      INITIAL_ACTION_PLANS
    );
    if (campaignId) {
      return all.filter((a) => a.campaignId === campaignId);
    }
    return all;
  },
  saveActionPlanItem(item: ActionPlanItem): void {
    const all = this.getActionPlans();
    const index = all.findIndex((a) => a.id === item.id);
    if (index >= 0) {
      all[index] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      all.push({
        ...item,
        approvalStatus: item.approvalStatus || 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setStoredItem(STORAGE_KEYS.ACTION_PLANS, all);
  },
  acceptActionPlanSuggestion(actionId: string): void {
    const all = this.getActionPlans();
    const index = all.findIndex((a) => a.id === actionId);
    if (index >= 0) {
      all[index] = {
        ...all[index],
        approvalStatus: 'approved',
        status: all[index].status === 'Não Iniciado' ? 'Não Iniciado' : all[index].status,
        updatedAt: new Date().toISOString(),
      };
      setStoredItem(STORAGE_KEYS.ACTION_PLANS, all);
    }
  },
  rejectActionPlanSuggestion(actionId: string, reason?: string): void {
    const all = this.getActionPlans();
    const index = all.findIndex((a) => a.id === actionId);
    if (index >= 0) {
      all[index] = {
        ...all[index],
        approvalStatus: 'rejected',
        rejectionReason: reason || 'Recusada pelo gestor após análise técnica.',
        updatedAt: new Date().toISOString(),
      };
      setStoredItem(STORAGE_KEYS.ACTION_PLANS, all);
    }
  },
  deleteActionPlanItem(id: string): void {
    const all = this.getActionPlans().filter((a) => a.id !== id);
    setStoredItem(STORAGE_KEYS.ACTION_PLANS, all);
  },

  // Sincronização e geração automática de ações quando respondentes enviam respostas
  syncAutoActionPlanSuggestions(campaignId: string, companyId: string): void {
    const responses = this.getResponses(campaignId);
    if (responses.length === 0) return;

    const currentActions = this.getActionPlans(campaignId);
    const companies = this.getCompanies();
    const company = companies.find((c) => c.id === companyId);
    const sectors = company?.sectors || [];
    const campaigns = this.getCampaigns();
    const camp = campaigns.find((c) => c.id === campaignId);
    const qTemplate = camp ? this.getQuestionnaireById(camp.questionnaireType) : undefined;
    const questions = qTemplate?.questions && qTemplate.questions.length > 0 ? qTemplate.questions : COPSOQ_SHORT_QUESTIONS;

    const answersList = responses.map((r) => r.answers);

    if (qTemplate?.dimensions && qTemplate.dimensions.length > 0) {
      qTemplate.dimensions.forEach((dim) => {
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

        let isRisk = false;
        if (dim.isFavorableHigh) {
          if (score < 2.33) isRisk = true;
        } else {
          if (score >= 3.67) isRisk = true;
        }

        if (isRisk) {
          const existing = currentActions.find(
            (a) => a.associatedDimensionCode === dim.code && a.campaignId === campaignId
          );

          if (!existing) {
            const recommended =
              (dim.recommendedActions && dim.recommendedActions[0]) ||
              `Plano de intervenção e mitigação para ${dim.title}`;
            const targetSector = sectors[0]?.id || 'sec-1';
            const targetSectorName = sectors[0]?.name || 'Geral';

            const newSuggestedAction: ActionPlanItem = {
              id: `act-auto-${dim.code.toLowerCase()}-${Date.now().toString().slice(-4)}`,
              campaignId,
              companyId,
              sectorId: targetSector,
              dangerTarget: `${dim.title} (${score.toFixed(2)} - Nível de Atenção / Risco)`,
              hierarchyCategory: 'Proteção Coletiva / Organização do Trabalho',
              what: recommended,
              why: `Identificado índice crítico na dimensão ${dim.title} (${score.toFixed(2)} vs referência ${benchmark}).`,
              where: targetSectorName,
              who: 'Comitê de SST / Gestão de Pessoas',
              whenDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              how: `Elaborar plano de trabalho com envolvimento dos trabalhadores e acompanhar reavaliação de indicadores no PCMSO.`,
              costEstimate: 'A definir após aprovação',
              pdcaCycle: 'Plan',
              status: 'Não Iniciado',
              source: 'automatic_diagnosis',
              approvalStatus: 'suggested',
              associatedDimensionCode: dim.code,
              verificationMethod: `Reaplicação de amostragem na dimensão ${dim.title} em 60 dias.`,
              notes: 'Ação sugerida automaticamente pelos resultados medidos da campanha.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            currentActions.push(newSuggestedAction);
          }
        }
      });
    } else {
      // Avalia as dimensões COPSOQ padrão
      Object.entries(COPSOQ_DIMENSIONS).forEach(([dimCode, dimMeta]) => {
        const res = calculateDimensionScore(dimCode, answersList, questions);
        
        // Se a dimensão está em nível de risco (tercil risk ou escore muito alto desfavorável)
        if (res.tercil === 'risk') {
          const existing = currentActions.find(
            (a) => a.associatedDimensionCode === dimCode && a.campaignId === campaignId
          );

          if (!existing) {
            // Cria sugestão automática
            const recommended = dimMeta.recommendedMitigations[0] || `Plano de intervenção para ${dimMeta.title}`;
            const targetSector = sectors[0]?.id || 'sec-1';
            const targetSectorName = sectors[0]?.name || 'Geral';

            const newSuggestedAction: ActionPlanItem = {
              id: `act-auto-${dimCode.toLowerCase()}-${Date.now().toString().slice(-4)}`,
              campaignId,
              companyId,
              sectorId: targetSector,
              dangerTarget: `${dimMeta.title} (${res.score.toFixed(2)} - Tercil de Risco)`,
              hierarchyCategory: 'Proteção Coletiva / Organização do Trabalho',
              what: recommended,
              why: `Identificado índice crítico de risco na dimensão ${dimMeta.title} (${res.score.toFixed(2)} vs benchmark normativo ${dimMeta.nationalBenchmark}).`,
              where: targetSectorName,
              who: 'Comitê de SST / Gestão de Pessoas',
              whenDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              how: `Elaborar plano de trabalho com envolvimento dos trabalhadores e acompanhar reavaliação de indicadores no PCMSO.`,
              costEstimate: 'A definir após aprovação',
              pdcaCycle: 'Plan',
              status: 'Não Iniciado',
              source: 'automatic_diagnosis',
              approvalStatus: 'suggested',
              associatedDimensionCode: dimCode,
              verificationMethod: `Reaplicação de amostragem COPSOQ na dimensão ${dimMeta.title} em 60 dias.`,
              notes: 'Ação sugerida automaticamente pelos resultados medidos da campanha.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            currentActions.push(newSuggestedAction);
          }
        }
      });
    }

    setStoredItem(STORAGE_KEYS.ACTION_PLANS, currentActions);
  },

  // Questionários e Testes
  getQuestionnaires(): QuestionnaireTemplate[] {
    const customList = getStoredItem<QuestionnaireTemplate[]>(STORAGE_KEYS.CUSTOM_QUESTIONNAIRES, []);
    return [...INITIAL_QUESTIONNAIRE_TEMPLATES, ...customList];
  },

  getQuestionnaireById(id: string): QuestionnaireTemplate | undefined {
    const all = this.getQuestionnaires();
    return (
      all.find((q) => q.id === id || q.standardType === id) ||
      all.find((q) => q.id === 'copsoq-short')
    );
  },

  saveCustomQuestionnaire(questionnaire: QuestionnaireTemplate): void {
    const customList = getStoredItem<QuestionnaireTemplate[]>(STORAGE_KEYS.CUSTOM_QUESTIONNAIRES, []);
    const idx = customList.findIndex((q) => q.id === questionnaire.id);
    if (idx >= 0) {
      customList[idx] = {
        ...questionnaire,
        updatedAt: new Date().toISOString(),
      };
    } else {
      customList.push({
        ...questionnaire,
        createdAt: questionnaire.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setStoredItem(STORAGE_KEYS.CUSTOM_QUESTIONNAIRES, customList);
  },

  deleteCustomQuestionnaire(id: string): boolean {
    const customList = getStoredItem<QuestionnaireTemplate[]>(STORAGE_KEYS.CUSTOM_QUESTIONNAIRES, []);
    const filtered = customList.filter((q) => q.id !== id);
    if (filtered.length !== customList.length) {
      setStoredItem(STORAGE_KEYS.CUSTOM_QUESTIONNAIRES, filtered);
      return true;
    }
    return false;
  },

  duplicateQuestionnaire(id: string): QuestionnaireTemplate {
    const original = this.getQuestionnaireById(id);
    if (!original) {
      throw new Error('Questionário não encontrado.');
    }

    const newId = `custom-${Date.now()}`;
    const cloned: QuestionnaireTemplate = {
      ...original,
      id: newId,
      code: `${original.code}-COPIA`,
      title: `${original.title} (Cópia Personalizada)`,
      type: 'custom',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: original.questions.map((q) => ({ ...q })),
      dimensions: original.dimensions.map((d) => ({ ...d })),
    };

    this.saveCustomQuestionnaire(cloned);
    return cloned;
  },

  // Exportar backup completo do SaaS em JSON
  exportBackupJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      companies: this.getCompanies(),
      campaigns: this.getCampaigns(),
      responses: this.getResponses(),
      riskInventory: this.getRiskInventory(),
      actionPlans: this.getActionPlans(),
      evidences: this.getEvidences(),
      technicalProfile: this.getTechnicalProfile(),
      customQuestionnaires: getStoredItem<QuestionnaireTemplate[]>(STORAGE_KEYS.CUSTOM_QUESTIONNAIRES, []),
    };
    return JSON.stringify(data, null, 2);
  },

  // Importar backup JSON
  importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.companies) setStoredItem(STORAGE_KEYS.COMPANIES, data.companies);
      if (data.campaigns) setStoredItem(STORAGE_KEYS.CAMPAIGNS, data.campaigns);
      if (data.responses) setStoredItem(STORAGE_KEYS.RESPONSES, data.responses);
      if (data.riskInventory) setStoredItem(STORAGE_KEYS.RISK_INVENTORY, data.riskInventory);
      if (data.actionPlans) setStoredItem(STORAGE_KEYS.ACTION_PLANS, data.actionPlans);
      if (data.evidences) setStoredItem(STORAGE_KEYS.EVIDENCES, data.evidences);
      if (data.technicalProfile) setStoredItem(STORAGE_KEYS.TECHNICAL_PROFILE, data.technicalProfile);
      if (data.customQuestionnaires) setStoredItem(STORAGE_KEYS.CUSTOM_QUESTIONNAIRES, data.customQuestionnaires);
      return true;
    } catch (e) {
      console.error('Falha ao importar JSON:', e);
      return false;
    }
  },
};

// Executa inicialização segura
StorageService.init();
