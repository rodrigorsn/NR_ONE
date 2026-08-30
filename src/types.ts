export type RiskLevel = 'BAIXO' | 'MÉDIO' | 'ALTO' | 'MUITO ALTO';
export type ActionPriority = 'BAIXA' | 'MODERADA' | 'ALTA' | 'ALTÍSSIMA';
export type ActionDeadline = 'Até 12 meses' | 'Menor que 9 meses' | 'Menor que 3 meses' | 'IMEDIATO';
export type TercilStatus = 'favorable' | 'intermediate' | 'risk';

export type QuestionnaireType = 'copsoq-short' | 'copsoq-medium' | 'copsoq-long' | string;
export type AssessmentType = 'AEP' | 'AET'; // Avaliação Ergonômica Preliminar vs Análise Ergonômica do Trabalho

export type QuestionResponseType =
  | 'likert_copsoq' // Escala padrão COPSOQ (1 a 5)
  | 'yes_no' // Resposta Sim / Não / Não se aplica
  | 'text_description' // Descritiva / Texto aberto
  | 'multiple_choice' // Múltipla escolha customizada com opções e pesos
  | 'numeric_scale' // Escala 0 a 10
  | 'frequency'
  | 'intensity'
  | 'health_quality'
  | 'agreement_5';

export interface QuestionnaireOption {
  value: number | string;
  label: string;
  isRisk?: boolean; // Se assinalar esta opção representa indício de risco
  weight?: number; // Peso para cálculo de score (1..5 ou customizado)
}

export interface QuestionnaireDimension {
  code: string;
  title: string;
  category: string;
  isFavorableHigh: boolean; // Se true, nota alta é positivo/fator de proteção. Se false, nota alta é risco.
  nationalBenchmark?: number; // Referência normativa (ex: 3.18)
  riskFactorDescription?: string;
  possibleConsequences?: string[];
  recommendedMitigations?: string[];
  nr1Category?: 'Organização do Trabalho' | 'Relações Interpessoais' | 'Condições Ergonômicas' | 'Vigilância em Saúde' | 'Valores e Ética' | string;
}

export interface QuestionnaireQuestion {
  id: number;
  code: string;
  text: string;
  description?: string;
  dimensionCode: string;
  dimensionTitle: string;
  category: string;
  responseType: QuestionResponseType;
  scaleType?: 'frequency' | 'intensity' | 'health_quality' | 'satisfaction_4' | 'agreement_5' | 'yes_no' | 'custom';
  options?: QuestionnaireOption[];
  inverted?: boolean; // Se invertido na contagem (item reverso)
  isOffensiveBehavior?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface QuestionnaireTemplate {
  id: string; // 'copsoq-short' | 'copsoq-medium' | 'copsoq-long' | id customizado
  code: string;
  title: string;
  subtitle: string;
  description: string;
  version: string;
  author: string;
  type: 'standard' | 'custom' | 'imported';
  standardType?: 'copsoq-short' | 'copsoq-medium' | 'copsoq-long';
  itemCount: number;
  dimensionsCount: number;
  estimatedMinutes: number;
  targetApplication: string; // Ex: 'Triagem Rápida / AEP (NR-1)', 'Aprofundamento / AET', 'Auditoria Completa & Pesquisa'
  tags: string[];
  dimensions: QuestionnaireDimension[];
  questions: QuestionnaireQuestion[];
  scoringMethod: 'copsoq_tercils' | 'percentage' | 'custom_rules' | 'yes_no_count';
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SectorGHE {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
  workRegime: 'Presencial' | 'Híbrido' | 'Remoto' | 'Turnos/Escala';
  hazardsSummary?: string[];
}

export interface Company {
  id: string;
  corporateName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  cnae: string;
  cnaeDescription: string;
  riskGrade: 1 | 2 | 3 | 4; // Grau de Risco NR-4
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  totalEmployees: number;
  sectors: SectorGHE[];
  cipaEstablished: boolean;
  hasSESMT: boolean;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalInCharge {
  name: string;
  title: string; // Ex: Médico do Trabalho, Eng. de Segurança do Trabalho, Ergonomista, Psicólogo Organizacional
  professionalCouncil: string; // Ex: CRM/SP 123456, CREA-RJ 987654, CRP-06 54321
  companyConsultancy?: string;
  email: string;
  phone: string;
}

export interface AssessmentCampaign {
  id: string;
  companyId: string;
  title: string;
  assessmentType: AssessmentType; // AEP ou AET
  questionnaireType: QuestionnaireType;
  targetSectorIds: string[]; // Setores inclusos
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
  anonymousToken: string; // Token único para o link de resposta
  sampleGoal: number; // Meta de respondentes
  responseCount: number;
  technicalInCharge: TechnicalInCharge;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: number;
  code: string;
  text: string;
  dimensionCode: string;
  dimensionTitle: string;
  category: 'EXIGÊNCIAS LABORAIS' | 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO' | 'RELAÇÕES SOCIAIS E LIDERANÇA' | 'INTERFACE TRABALHO-INDIVÍDUO' | 'VALORES NO LOCAL DE TRABALHO' | 'PERSONALIDADE' | 'SAÚDE E BEM-ESTAR' | 'COMPORTAMENTOS OFENSIVOS';
  scaleType: 'frequency' | 'intensity' | 'health_quality' | 'satisfaction_4' | 'agreement_5';
  inverted?: boolean; // Itens 42 e 45 na versão média do COPSOQ II
  isOffensiveBehavior?: boolean;
}

export interface SurveyResponse {
  id: string;
  campaignId: string;
  companyId: string;
  sectorId: string;
  submittedAt: string;
  // Dados sociodemográficos opcionais (agrupados para manter anonimato)
  demographics?: {
    gender?: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar';
    ageGroup?: '< 30 anos' | '30 a 45 anos' | '> 45 anos' | 'Prefiro não informar';
    tenureYears?: '< 1 ano' | '1 a 3 anos' | '3 a 5 anos' | '> 5 anos';
    shift?: 'Diurno' | 'Noturno' | 'Revezamento';
  };
  answers: Record<number, number>; // questionId -> rating 1..5
}

export interface DimensionResult {
  code: string;
  title: string;
  category: string;
  score: number; // Média de 1 a 5
  tercil: TercilStatus;
  isFavorableHigh: boolean; // Se true, escore alto é positivo (ex: Apoio Social). Se false, escore alto é risco (ex: Burnout, Exigências)
  nationalBenchmark: number; // Benchmark normativo populacional
  deltaFromBenchmark: number;
  questionIds: number[];
  riskFactorDescription: string;
  possibleConsequences: string[];
}

export interface RiskInventoryItem {
  id: string;
  campaignId: string;
  companyId: string;
  sectorId: string;
  processOrActivity: string;
  dangerName: string; // Ex: "Excesso de demandas no trabalho (sobrecarga)"
  dangerSource: string; // Fonte ou circunstância geradora
  possibleInjuries: string[]; // Consequências / agravos à saúde (ex: Transtorno mental, Burnout, DORT)
  exposedWorkersCount: number;
  existingControls: string[]; // Medidas de prevenção já implementadas
  exposureCharacteristics: {
    duration: 'Curta' | 'Média' | 'Longa / Contínua';
    frequency: 'Ocasional' | 'Intermitente' | 'Frequente / Diária';
    intensity: 'Baixa' | 'Moderada' | 'Elevada';
  };
  severity: 1 | 2 | 3 | 4 | 5; // 1: Leve, 2: Menor, 3: Moderada, 4: Maior, 5: Morte/Incapacitante
  probability: 1 | 2 | 3 | 4 | 5; // 1: Muito Improvável ... 5: Muito Provável
  riskScore: number; // severity * probability (1..25)
  riskLevel: RiskLevel;
  actionPriority: ActionPriority;
  maxActionDeadline: ActionDeadline;
  needsActionPlan: boolean;
}

export type ActionApprovalStatus = 'suggested' | 'pending_technical' | 'pending_management' | 'approved' | 'rejected';

export interface ActionApprovalLog {
  stage: 'technical_validation' | 'management_approval' | 'rejection';
  stageLabel: string;
  approverName: string;
  approverRole: string;
  date: string;
  notes?: string;
}

export interface ActionPlanItem {
  id: string;
  campaignId: string;
  companyId: string;
  sectorId: string;
  riskInventoryId?: string;
  dangerTarget: string;
  hierarchyCategory: 'Evitar/Eliminar' | 'Proteção Coletiva / Organização do Trabalho' | 'Medidas Administrativas / Capacitação' | 'EPI / Proteção Individual' | 'Vigilância em Saúde';
  what: string; // O que será feito
  why: string; // Por que será feito (justificativa de controle do risco)
  where: string; // Onde (setor/postos)
  who: string; // Responsável (cargo/área)
  whenDate: string; // Prazo limite (AAAA-MM-DD)
  how: string; // Como será executado
  costEstimate?: string; // Quanto custa / Recursos
  pdcaCycle: 'Plan' | 'Do' | 'Check' | 'Act';
  status: 'Não Iniciado' | 'Em Andamento' | 'Concluído' | 'Em Revisão';
  source?: 'automatic_diagnosis' | 'manual' | 'ai_assistant'; // Origem da ação
  approvalStatus?: ActionApprovalStatus; // Status de aprovação pelo gestor
  approvalHistory?: ActionApprovalLog[]; // Histórico de aprovação
  rejectionReason?: string; // Motivo de recusa se cancelada
  associatedDimensionCode?: string; // Dimensão COPSOQ correspondente
  verificationMethod: string; // Forma de acompanhamento e aferição de eficácia (subitem 1.5.5.3.2)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentEvidence {
  id: string;
  campaignId: string;
  companyId: string;
  sectorId: string;
  title: string;
  category: 'foto_posto' | 'ata_cipa' | 'relatorio_absenteismo' | 'parecer_medico' | 'ouvidoria_denuncia' | 'pop_norma' | 'outro';
  categoryLabel: string;
  date: string;
  authorName: string;
  authorRole: string;
  description: string;
  findingsSummary: string;
  impactOnRisk: 'Aumenta Risco' | 'Mitiga Risco' | 'Evidência Neutra/Diagnóstica';
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  createdAt: string;
}

export interface AlertIndicatorData {
  absenteeismRatePercent: number;
  turnoverRatePercent: number;
  mentalHealthLeaveCases: number;
  cipaComplaintsCount: number;
  catRegistrations: number;
}
