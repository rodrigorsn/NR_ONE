import { Company, AssessmentCampaign, SurveyResponse, TechnicalInCharge, ActionPlanItem, RiskInventoryItem } from '../types';

export const DEFAULT_TECHNICAL_IN_CHARGE: TechnicalInCharge = {
  name: 'Dra. Carolina Ramos Mendes',
  title: 'Médica do Trabalho & Especialista em Ergonomia',
  professionalCouncil: 'CRM/SP 148.920 - RQE 45.102',
  companyConsultancy: 'MindGuard SST & Consultoria em Saúde Ocupacional',
  email: 'carolina.mendes@mindguardsst.com.br',
  phone: '(11) 98765-4321',
};

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    corporateName: 'TechLog Soluções em Logística e Distribuição S.A.',
    tradeName: 'TechLog Express',
    cnpj: '33.123.456/0001-89',
    cnae: '52.29-0-99',
    cnaeDescription: 'Outras atividades auxiliares dos transportes terrestres',
    riskGrade: 3,
    address: {
      street: 'Av. das Nações Unidas',
      number: '14.261',
      neighborhood: 'Vila Gertrudes',
      city: 'São Paulo',
      state: 'SP',
      cep: '04794-000',
    },
    totalEmployees: 185,
    sectors: [
      {
        id: 'sec-1',
        name: 'Operações e Logística / Carga e Descarga',
        description: 'Auxiliares e operadores de movimentação de cargas, esteiras e triagem de encomendas.',
        employeeCount: 75,
        workRegime: 'Turnos/Escala',
        hazardsSummary: ['Sobrecarga física e de tempo', 'Pressão de prazos de entrega'],
      },
      {
        id: 'sec-2',
        name: 'Central de Atendimento ao Cliente (SAC)',
        description: 'Operadores de atendimento telefônico e chat multicanal para resolução de extravios e atrasos.',
        employeeCount: 42,
        workRegime: 'Presencial',
        hazardsSummary: ['Exigências emocionais intensas', 'Pressão de tempo', 'Clientes agressivos'],
      },
      {
        id: 'sec-3',
        name: 'Tecnologia da Informação & Rastreamento',
        description: 'Desenvolvedores, analistas de infraestrutura e suporte a sistemas em tempo real.',
        employeeCount: 38,
        workRegime: 'Híbrido',
        hazardsSummary: ['Exigências cognitivas elevadas', 'Jornada estendida / plantões'],
      },
      {
        id: 'sec-4',
        name: 'Administrativo, RH e Financeiro',
        description: 'Setores de suporte corporativo, contabilidade, gestão de pessoas e compras.',
        employeeCount: 30,
        workRegime: 'Presencial',
        hazardsSummary: ['Conflitos de papéis', 'Prazos de fechamento'],
      },
    ],
    cipaEstablished: true,
    hasSESMT: true,
    contactPerson: 'Roberto Albuquerque - Coordenador de SST',
    contactEmail: 'roberto.sst@techlog.com.br',
    contactPhone: '(11) 3210-9000',
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-05-10T14:30:00Z',
  },
  {
    id: 'comp-2',
    corporateName: 'Hospital e Maternidade Santa Maria Ltda.',
    tradeName: 'Hospital Santa Maria',
    cnpj: '61.456.789/0001-12',
    cnae: '86.10-1-01',
    cnaeDescription: 'Atividades de atendimento hospitalar',
    riskGrade: 3,
    address: {
      street: 'Rua Dr. Enéas de Carvalho',
      number: '450',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      cep: '05403-000',
    },
    totalEmployees: 420,
    sectors: [
      {
        id: 'sec-201',
        name: 'Pronto Socorro & Emergência Adulto',
        description: 'Equipe multidisciplinar de triagem e atendimento a emergências de alta complexidade.',
        employeeCount: 110,
        workRegime: 'Turnos/Escala',
        hazardsSummary: ['Exigências emocionais extremas', 'Sobrecarga de pacientes', 'Ambiente de alta tensão'],
      },
      {
        id: 'sec-202',
        name: 'UTI Geral e Pós-Operatória',
        description: 'Médicos, enfermeiros e técnicos de suporte intensivo.',
        employeeCount: 85,
        workRegime: 'Turnos/Escala',
        hazardsSummary: ['Fadiga por plantões noturnos', 'Perdas e luto de pacientes'],
      },
      {
        id: 'sec-203',
        name: 'Recepção e Faturamento Hospitalar',
        description: 'Atendimento presencial a familiares e convênios médicos.',
        employeeCount: 45,
        workRegime: 'Presencial',
        hazardsSummary: ['Reclamações frequentes', 'Conflito de papéis com convênios'],
      },
    ],
    cipaEstablished: true,
    hasSESMT: true,
    contactPerson: 'Dra. Mariana Vasconcelos - Gerente de Enfermagem e SST',
    contactEmail: 'mariana.sst@santamaria.med.br',
    contactPhone: '(11) 3344-5500',
    createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-05-18T10:00:00Z',
  },
  {
    id: 'comp-3',
    corporateName: 'Indústria Metalúrgica Progresso Nacional S.A.',
    tradeName: 'Metalúrgica Progresso',
    cnpj: '12.345.678/0001-90',
    cnae: '25.11-0-00',
    cnaeDescription: 'Fabricação de estruturas metálicas',
    riskGrade: 4,
    address: {
      street: 'Rodovia dos Bandeirantes, km 48',
      number: 'S/N',
      neighborhood: 'Distrito Industrial',
      city: 'Jundiaí',
      state: 'SP',
      cep: '13213-000',
    },
    totalEmployees: 95,
    sectors: [
      {
        id: 'sec-301',
        name: 'Usinagem e Soldagem Pesada',
        description: 'Operadores de tornos CNC, prensas e soldadores MIG.',
        employeeCount: 52,
        workRegime: 'Turnos/Escala',
        hazardsSummary: ['Ruído contínuo', 'Pressão por metas de produção sem pausas'],
      },
      {
        id: 'sec-302',
        name: 'Engenharia de Projetos e Vendas Técnicas',
        description: 'Engenheiros desenhistas e orçamentistas.',
        employeeCount: 22,
        workRegime: 'Híbrido',
        hazardsSummary: ['Prazos exíguos de licitações', 'Exigências cognitivas'],
      },
    ],
    cipaEstablished: true,
    hasSESMT: true,
    contactPerson: 'Eng. Carlos Eduardo Prado',
    contactEmail: 'carlos.prado@metalurgicaprogresso.com.br',
    contactPhone: '(11) 4589-1000',
    createdAt: '2025-03-10T11:00:00Z',
    updatedAt: '2025-05-12T16:00:00Z',
  },
];

export const INITIAL_CAMPAIGNS: AssessmentCampaign[] = [
  {
    id: 'camp-1',
    companyId: 'comp-1',
    title: 'AEP 2025 - Gestão de Riscos Psicossociais no Trabalho (NR-1 / NR-17)',
    assessmentType: 'AEP',
    questionnaireType: 'copsoq-short',
    targetSectorIds: ['sec-1', 'sec-2', 'sec-3', 'sec-4'],
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    status: 'active',
    anonymousToken: 'techlog-nr1-2025',
    sampleGoal: 100,
    responseCount: 68,
    technicalInCharge: DEFAULT_TECHNICAL_IN_CHARGE,
    notes: 'Avaliação Ergonômica Preliminar (AEP) com foco na vigência da Portaria MTE nº 1.419/2024. Questionário anônimo COPSOQ II aplicado aos 4 setores com participação paritária da CIPA.',
    createdAt: '2025-04-01T09:00:00Z',
    updatedAt: '2025-05-20T17:00:00Z',
  },
  {
    id: 'camp-2',
    companyId: 'comp-2',
    title: 'Avaliação de Estresse e Saúde Mental Hospitalar - AEP/AET 2025',
    assessmentType: 'AET',
    questionnaireType: 'copsoq-short',
    targetSectorIds: ['sec-201', 'sec-202', 'sec-203'],
    startDate: '2025-03-15',
    endDate: '2025-05-30',
    status: 'active',
    anonymousToken: 'santamaria-aet-2025',
    sampleGoal: 150,
    responseCount: 92,
    technicalInCharge: DEFAULT_TECHNICAL_IN_CHARGE,
    notes: 'Análise aprofundada das condições de trabalho no Pronto Socorro e UTI após pico de afastamentos por CID F41/F43.',
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2025-05-19T11:00:00Z',
  },
];

// Gerador de respostas simuladas realistas para popular TechLog
export function generateRealisticResponses(campaignId: string, companyId: string): SurveyResponse[] {
  const responses: SurveyResponse[] = [];
  const sectors = ['sec-1', 'sec-2', 'sec-3', 'sec-4'];
  const now = new Date();

  // 68 respostas com distribuição estatística representativa
  for (let i = 1; i <= 68; i++) {
    // Escolhe setor
    const sectorId = i <= 28 ? 'sec-2' : (i <= 48 ? 'sec-1' : (i <= 60 ? 'sec-3' : 'sec-4'));
    
    // Configura viés dependendo do setor
    const isSAC = sectorId === 'sec-2'; // SAC: alta sobrecarga emocional, tempo
    const isOper = sectorId === 'sec-1'; // Operação: ritmo acelerado, fadiga
    const isTI = sectorId === 'sec-3'; // TI: cognitivo alto, conflito familia

    const answers: Record<number, number> = {};

    // Q1..Q2 (Excesso de demanda): Mais alto no SAC e Operação
    answers[1] = isSAC ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 3;
    answers[2] = isSAC || isOper ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 2;

    // Q3 (Ritmo): Alto na operação e SAC
    answers[3] = isOper || isSAC ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 2;

    // Q4..Q5 (Cognitivo): Alto em TI e SAC
    answers[4] = isTI || isSAC ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 3;
    answers[5] = isTI ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 2;

    // Q6 (Emocional): Alto no SAC
    answers[6] = isSAC ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 2;

    // Q7 (Influência/Autonomia): Baixo no SAC e Operação
    answers[7] = isSAC || isOper ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 2) + 3;

    // Q8..Q9 (Desenvolvimento)
    answers[8] = Math.floor(Math.random() * 3) + 3;
    answers[9] = Math.floor(Math.random() * 3) + 3;

    // Q10..Q11 (Previsibilidade)
    answers[10] = Math.floor(Math.random() * 3) + 2;
    answers[11] = Math.floor(Math.random() * 3) + 3;

    // Q12 (Transparência Papel)
    answers[12] = Math.floor(Math.random() * 2) + 4;

    // Q13 (Reconhecimento)
    answers[13] = Math.floor(Math.random() * 3) + 2;

    // Q14 (Justiça)
    answers[14] = Math.floor(Math.random() * 3) + 3;

    // Q15 (Apoio Chefia)
    answers[15] = Math.floor(Math.random() * 3) + 3;

    // Q16 (Apoio Colegas)
    answers[16] = Math.floor(Math.random() * 2) + 4; // Colegas costumam ser positivo

    // Q17..Q18 (Liderança)
    answers[17] = Math.floor(Math.random() * 3) + 3;
    answers[18] = Math.floor(Math.random() * 3) + 3;

    // Q19..Q22 (Confiança e Equilíbrio)
    answers[19] = Math.floor(Math.random() * 3) + 3;
    answers[20] = Math.floor(Math.random() * 3) + 3;
    answers[21] = Math.floor(Math.random() * 3) + 3;
    answers[22] = isSAC ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 3) + 3;

    // Q23 (Autoeficácia)
    answers[23] = Math.floor(Math.random() * 2) + 4;

    // Q24..Q27 (Significado e Satisfação)
    answers[24] = Math.floor(Math.random() * 2) + 4;
    answers[25] = Math.floor(Math.random() * 2) + 4;
    answers[26] = Math.floor(Math.random() * 3) + 3;
    answers[27] = isSAC ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 3;

    // Q28 (Insegurança Emprego)
    answers[28] = Math.floor(Math.random() * 3) + 2;

    // Q29 (Saúde Geral): 1..5
    answers[29] = isSAC ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2) + 3;

    // Q30..Q31 (Conflito Trabalho Familia)
    answers[30] = isSAC || isTI ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 2;
    answers[31] = isSAC || isTI ? Math.min(5, Math.floor(Math.random() * 2) + 3) : Math.floor(Math.random() * 3) + 2;

    // Q32 (Sono)
    answers[32] = isSAC ? Math.min(5, Math.floor(Math.random() * 2) + 3) : Math.floor(Math.random() * 3) + 2;

    // Q33..Q36 (Burnout & Estresse): Elevado no SAC
    answers[33] = isSAC || isOper ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 2;
    answers[34] = isSAC ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 2;
    answers[35] = isSAC ? Math.min(5, Math.floor(Math.random() * 2) + 3) : Math.floor(Math.random() * 3) + 2;
    answers[36] = isSAC ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 3) + 2;

    // Q37 (Tristeza)
    answers[37] = isSAC ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;

    // Q38..Q41 (Ofensas / Assédio / Violência): Maioria 1, alguns relatos no SAC
    answers[38] = isSAC ? (Math.random() > 0.6 ? 3 : 1) : 1; // Insultos verbais de clientes
    answers[39] = Math.random() > 0.9 ? 2 : 1; // Assédio
    answers[40] = isSAC ? (Math.random() > 0.7 ? 2 : 1) : 1; // Ameaças de clientes
    answers[41] = 1; // Violência física rara

    const dateOffset = Math.floor(Math.random() * 30);
    const subDate = new Date(now.getTime() - dateOffset * 24 * 60 * 60 * 1000);

    responses.push({
      id: `resp-${campaignId}-${i}`,
      campaignId,
      companyId,
      sectorId,
      submittedAt: subDate.toISOString(),
      demographics: {
        gender: i % 2 === 0 ? 'Feminino' : 'Masculino',
        ageGroup: i % 3 === 0 ? '< 30 anos' : (i % 3 === 1 ? '30 a 45 anos' : '> 45 anos'),
        tenureYears: i % 2 === 0 ? '1 a 3 anos' : '> 5 anos',
        shift: isOper ? 'Revezamento' : 'Diurno',
      },
      answers,
    });
  }

  return responses;
}

export const INITIAL_RESPONSES: SurveyResponse[] = generateRealisticResponses('camp-1', 'comp-1');

export const INITIAL_RISK_INVENTORY: RiskInventoryItem[] = [
  {
    id: 'risk-1',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-2',
    processOrActivity: 'Atendimento ao Cliente e Resolução de Reclamações (SAC)',
    dangerName: 'Excesso de demandas emocionais e conflitos com clientes (Sobrecarga Emocional)',
    dangerSource: 'Contato telefônico contínuo com clientes insatisfeitos, cobrança por tempo médio de atendimento (TMA) e falta de autonomia para resolver queixas.',
    possibleInjuries: ['Síndrome de Burnout (CID-10 Z73.0)', 'Transtornos de Ansiedade (CID F41)', 'Esgotamento e Fadiga Psíquica', 'DORT por postura mantida sob estresse'],
    exposedWorkersCount: 42,
    existingControls: ['Headsets individuais', 'Treinamento de atendimento ao cliente'],
    exposureCharacteristics: {
      duration: 'Longa / Contínua',
      frequency: 'Frequente / Diária',
      intensity: 'Elevada',
    },
    severity: 4, // Maior (lesão severa / adoecimento incapacitante temporário)
    probability: 4, // Provável (exposição contínua sem controle ergonômico suficiente)
    riskScore: 16,
    riskLevel: 'ALTO',
    actionPriority: 'ALTA',
    maxActionDeadline: 'Menor que 3 meses',
    needsActionPlan: true,
  },
  {
    id: 'risk-2',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-1',
    processOrActivity: 'Separação, Triagem e Movimentação Manual de Cargas',
    dangerName: 'Ritmo acelerado de trabalho e pausas insuficientes na triagem',
    dangerSource: 'Picos de encomendas com esteiras rápidas e metas de bipagem por minuto sem pausas programadas de recuperação.',
    possibleInjuries: ['DORT / Lesões por Esforço Repetitivo (CID M54, M75)', 'Fadiga Muscular e Mental', 'Ansiedade por metas inatingíveis'],
    exposedWorkersCount: 75,
    existingControls: ['EPIs básicos (luvas, calçados com biqueira)', 'Ginástica laboral 2x por semana'],
    exposureCharacteristics: {
      duration: 'Longa / Contínua',
      frequency: 'Frequente / Diária',
      intensity: 'Elevada',
    },
    severity: 3, // Moderada
    probability: 4, // Provável
    riskScore: 12,
    riskLevel: 'ALTO',
    actionPriority: 'ALTA',
    maxActionDeadline: 'Menor que 3 meses',
    needsActionPlan: true,
  },
  {
    id: 'risk-3',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-3',
    processOrActivity: 'Desenvolvimento e Manutenção de Sistemas de Rastreamento',
    dangerName: 'Conflito Trabalho-Família e Demandas de Alta Complexidade Cognitiva',
    dangerSource: 'Plantões frequentes fora de horário para incidentes em servidores e chamadas em finais de semana sem compensação clara.',
    possibleInjuries: ['Insônia crônica', 'Transtorno do ciclo circadiano', 'Ansiedade e estresse acumulado'],
    exposedWorkersCount: 38,
    existingControls: ['Trabalho remoto híbrido (3x presencial, 2x remoto)'],
    exposureCharacteristics: {
      duration: 'Média',
      frequency: 'Intermitente',
      intensity: 'Moderada',
    },
    severity: 3, // Moderada
    probability: 3, // Possível
    riskScore: 9,
    riskLevel: 'MÉDIO',
    actionPriority: 'MODERADA',
    maxActionDeadline: 'Menor que 9 meses',
    needsActionPlan: true,
  },
  {
    id: 'risk-4',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-2',
    processOrActivity: 'Central de Atendimento ao Cliente (SAC)',
    dangerName: 'Exposição a insultos e ofensas verbais de usuários externos',
    dangerSource: 'Clientes agressivos em linha sem procedimento claro para o atendente encerrar a ligação após desacato.',
    possibleInjuries: ['Abalo psicológico agudo', 'Crise de choro e pânico', 'Sensação de desamparo institucional'],
    exposedWorkersCount: 42,
    existingControls: ['Gravação de ligações'],
    exposureCharacteristics: {
      duration: 'Curta',
      frequency: 'Intermitente',
      intensity: 'Elevada',
    },
    severity: 4, // Maior
    probability: 3, // Possível
    riskScore: 12,
    riskLevel: 'ALTO',
    actionPriority: 'ALTA',
    maxActionDeadline: 'Menor que 3 meses',
    needsActionPlan: true,
  },
];

export const INITIAL_ACTION_PLANS: ActionPlanItem[] = [
  {
    id: 'act-1',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-2',
    riskInventoryId: 'risk-1',
    dangerTarget: 'Sobrecarga Emocional e TMA Rígido no SAC',
    hierarchyCategory: 'Proteção Coletiva / Organização do Trabalho',
    what: 'Implementar Pausas Psicofisiológicas Obrigatórias e Flexibilização do TMA (NR-17 Anexo II)',
    why: 'Reduzir a exposição contínua ao estresse emocional e diminuir queixas de esgotamento e ansiedade nos operadores.',
    where: 'Central de Atendimento ao Cliente (SAC)',
    who: 'Coordenação de Operações SAC em conjunto com Médico do Trabalho',
    whenDate: '2025-06-15',
    how: 'Programar no sistema de telefonia pausas automáticas de 10 min a cada 90 min de atendimento e instituir área de descompressão silenciosa.',
    costEstimate: 'R$ 6.500,00 (adequação de sala de descanso e software de fila)',
    pdcaCycle: 'Do',
    status: 'Em Andamento',
    verificationMethod: 'Relatório quinzenal de adesão às pausas e avaliação de escore COPSOQ na dimensão Exigências Emocionais em 60 dias.',
    notes: 'Ação acordada com os operadores e aprovada na reunião ordinária da CIPA.',
    source: 'automatic_diagnosis',
    approvalStatus: 'approved',
    approvalHistory: [
      {
        stage: 'technical_validation',
        stageLabel: 'Validação Técnica (SESMT/Ergonomia)',
        approverName: 'Dra. Carolina Ramos Mendes',
        approverRole: 'Médica do Trabalho & Ergonomista (CRM/SP 148.920)',
        date: '2025-04-12T14:30:00Z',
        notes: 'Medida em estrita conformidade com NR-17 Anexo II item 5.4.1.',
      },
      {
        stage: 'management_approval',
        stageLabel: 'Aprovação de Gestão / Orçamento',
        approverName: 'Roberto Silveira',
        approverRole: 'Gerente Geral de Recursos Humanos',
        date: '2025-04-15T09:00:00Z',
        notes: 'Verba aprovada para sala de descompressão e ajuste no software telefônico.',
      },
    ],
    associatedDimensionCode: 'EXIG_EMOC',
    createdAt: '2025-04-10T10:00:00Z',
    updatedAt: '2025-05-15T15:00:00Z',
  },
  {
    id: 'act-2',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-2',
    riskInventoryId: 'risk-4',
    dangerTarget: 'Ofensas Verbais e Desacato de Clientes Externos',
    hierarchyCategory: 'Medidas Administrativas / Capacitação',
    what: 'Instituir Protocolo Operacional Padrão (POP) Anti-Agressão e Desacato com Autorização de Desconexão',
    why: 'Dar amparo legal e psicológico ao operador diante de ameaças ou ofensas graves, evitando traumas psíquicos.',
    where: 'Central de Atendimento ao Cliente (SAC)',
    who: 'Jurídico Corporativo + Liderança de Atendimento + SESMT',
    whenDate: '2025-05-30',
    how: 'Criar roteiro de 2 advertências formais ao cliente; persistindo a ofensa, o sistema transfere para supervisão ou encerra a chamada com registro de ocorrência.',
    costEstimate: 'Custo interno (elaboração de POP e treinamento de 4 horas)',
    pdcaCycle: 'Check',
    status: 'Concluído',
    verificationMethod: 'Zero advertências punitivas a colaboradores por encerramento legítimo de ligações abusivas.',
    notes: 'POP 04/2025 publicado e divulgado em treinamento para 100% da equipe de SAC.',
    source: 'automatic_diagnosis',
    approvalStatus: 'approved',
    approvalHistory: [
      {
        stage: 'technical_validation',
        stageLabel: 'Validação Técnica (SESMT/Ergonomia)',
        approverName: 'Dra. Carolina Ramos Mendes',
        approverRole: 'Médica do Trabalho & Ergonomista (CRM/SP 148.920)',
        date: '2025-04-06T11:00:00Z',
        notes: 'Aprovado com respaldo na Lei 14.457/22 e NR-1.',
      },
      {
        stage: 'management_approval',
        stageLabel: 'Aprovação de Gestão / Orçamento',
        approverName: 'Diretoria de Operações TechLog',
        approverRole: 'Diretor Executivo de Operações',
        date: '2025-04-08T16:00:00Z',
        notes: 'Protocolo homologado para implantação imediata.',
      },
    ],
    associatedDimensionCode: 'COMPORTAMENTOS_OFENSIVOS',
    createdAt: '2025-04-05T09:00:00Z',
    updatedAt: '2025-05-02T14:00:00Z',
  },
  {
    id: 'act-3',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-1',
    riskInventoryId: 'risk-2',
    dangerTarget: 'Ritmo Acelerado e Sobrecarga Física na Triagem',
    hierarchyCategory: 'Evitar/Eliminar',
    what: 'Redesenho do Fluxo de Triagem com Sistema de Rodízio de Postos a cada 2 horas',
    why: 'Alternar grupos musculares e aliviar a pressão monótona contínua de alta velocidade de leitura de código de barras.',
    where: 'Operações e Logística / Galpão Central',
    who: 'Engenheiro de Produção + Ergonomista',
    whenDate: '2025-07-01',
    how: 'Mapear 3 postos diferentes (alimentação, esteira principal e paletização) e implantar escala rotativa automatizada com pausas ativas.',
    costEstimate: 'R$ 12.000,00 (ajuste ergonômico de bancadas e software de esteira)',
    pdcaCycle: 'Plan',
    status: 'Em Andamento',
    verificationMethod: 'Inspeção ergonômica mensal e medição da frequência cardíaca/queixas osteomusculares no PCMSO.',
    notes: 'Aguardando entrega de 4 novas bancadas reguláveis em altura.',
    source: 'automatic_diagnosis',
    approvalStatus: 'approved',
    associatedDimensionCode: 'RITMO_TRAB',
    createdAt: '2025-04-12T14:00:00Z',
    updatedAt: '2025-05-18T16:30:00Z',
  },
  {
    id: 'act-4',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-3',
    riskInventoryId: 'risk-3',
    dangerTarget: 'Plantões Noturnos e Invasão da Vida Privada em TI',
    hierarchyCategory: 'Medidas Administrativas / Capacitação',
    what: 'Política de Desconexão Digital e Escala Estruturada de Sobreaviso Remunerado',
    why: 'Garantir o direito ao repouso e eliminar acionamentos aleatórios em fins de semana sem planejamento.',
    where: 'TI & Rastreamento',
    who: 'Gerente de TI + Recursos Humanos',
    whenDate: '2025-06-30',
    how: 'Publicar política proibindo envio de mensagens/chamadas fora do horário comercial salvo escala oficial de sobreaviso, com compensação em banco de horas e adicionais.',
    costEstimate: 'Custo de folha (adicional de sobreaviso)',
    pdcaCycle: 'Do',
    status: 'Em Andamento',
    verificationMethod: 'Verificação dos registros de chamados após as 19h e pesquisa de satisfação com equipe técnica.',
    notes: 'Em fase de alinhamento com sindicato da categoria.',
    source: 'automatic_diagnosis',
    approvalStatus: 'approved',
    associatedDimensionCode: 'CONFLITO_TRAB_FAMILIA',
    createdAt: '2025-04-20T11:00:00Z',
    updatedAt: '2025-05-10T10:00:00Z',
  },
  {
    id: 'act-sug-1',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-1',
    dangerTarget: 'Excesso de Exigências Quantitativas e Prazos no Armazém',
    hierarchyCategory: 'Proteção Coletiva / Organização do Trabalho',
    what: 'Revisão do Dimensionamento de Equipes de Separação em Dias de Pico e Limite de Horas Extras',
    why: 'A dimensão "Exigências Quantitativas" atingiu nível crítico (score 4.12) nas respostas dos trabalhadores da operação.',
    where: 'Operações e Logística / CD Guarulhos',
    who: 'Gerência de Operações + RH',
    whenDate: '2026-09-30',
    how: 'Contratar reforço temporário em datas promocionais e travar jornada em no máximo 2 horas extras diárias conforme CLT.',
    costEstimate: 'R$ 18.000,00/mês em períodos sazonais',
    pdcaCycle: 'Plan',
    status: 'Não Iniciado',
    source: 'automatic_diagnosis',
    approvalStatus: 'pending_technical',
    approvalHistory: [
      {
        stage: 'technical_validation',
        stageLabel: 'Sugestão Gerada por Diagnóstico COPSOQ II',
        approverName: 'Sistema MindGuard AI',
        approverRole: 'Mecanismo de Correlação de Risco Psicossocial',
        date: '2026-08-01T10:00:00Z',
        notes: 'Identificado desvio de +1.4 pontos acima do benchmark nacional na dimensão Exigências Quantitativas.',
      },
    ],
    associatedDimensionCode: 'EXIG_QUANT',
    verificationMethod: 'Monitoramento semanal do cartão de ponto e reavaliação de escore em 90 dias.',
    notes: 'Ação sugerida aguardando validação técnica do SESMT/Ergonomista.',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'act-sug-2',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-2',
    dangerTarget: 'Sintomas de Burnout e Esgotamento no Atendimento',
    hierarchyCategory: 'Vigilância em Saúde',
    what: 'Programa de Escuta Psicológica Confidencial e Capacitação em Comunicação Não-Violenta',
    why: 'A dimensão "Burnout e Esgotamento" apresentou escore médio de 3.88 (Tercil de Risco) na central de SAC.',
    where: 'Central de Atendimento ao Cliente (SAC)',
    who: 'Coordenação de RH / Saúde Ocupacional',
    whenDate: '2026-10-15',
    how: 'Disponibilizar 4 sessões mensais de acolhimento psicológico voluntário e realizar workshop prático de gestão de conflitos.',
    costEstimate: 'R$ 4.200,00/mês (convênio telepsicologia)',
    pdcaCycle: 'Plan',
    status: 'Não Iniciado',
    source: 'automatic_diagnosis',
    approvalStatus: 'pending_management',
    approvalHistory: [
      {
        stage: 'technical_validation',
        stageLabel: 'Validação Técnica (SESMT/Ergonomia)',
        approverName: 'Dra. Carolina Ramos Mendes',
        approverRole: 'Médica do Trabalho (CRM/SP 148.920)',
        date: '2026-08-05T14:20:00Z',
        notes: 'Validado tecnicamente como medida de vigilância em saúde mental para prevenção de F41/F32.',
      },
    ],
    associatedDimensionCode: 'BURNOUT',
    verificationMethod: 'Taxa de adesão voluntária e redução de atestados CID-10 F41/F32 no PCMSO.',
    notes: 'Aprovada tecnicamente pelo SESMT; aguarda aprovação de orçamento pela Diretoria de RH.',
    createdAt: '2026-08-02T11:30:00Z',
    updatedAt: '2026-08-05T14:20:00Z',
  },
  {
    id: 'act-sug-3',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-1',
    dangerTarget: 'Iluminação Deficiente e Ruído Contínuo no Galpão',
    hierarchyCategory: 'Evitar/Eliminar',
    what: 'Substituição Integral das Luminárias por LED Alto Fator e Instalação de Painéis Acústicos',
    why: 'Medida proposta para reduzir fadiga visual e sensorial relatada pelos operadores da esteira.',
    where: 'Operações e Logística / Setor de Carga',
    who: 'Manutenção Predial + Engenharia',
    whenDate: '2026-11-30',
    how: 'Trocar 40 lâmpadas de vapor metálico por luminárias industriais LED 150W e fixar baffles acústicos no teto.',
    costEstimate: 'R$ 45.000,00',
    pdcaCycle: 'Plan',
    status: 'Não Iniciado',
    source: 'manual',
    approvalStatus: 'rejected',
    rejectionReason: 'Substituição das luminárias LED já foi executada na reforma estrutural de janeiro/2026 (Ordem de Serviço #8821).',
    approvalHistory: [
      {
        stage: 'rejection',
        stageLabel: 'Recusa Justificada',
        approverName: 'Eng. Marcelo Antunes',
        approverRole: 'Engenheiro de Segurança do Trabalho (CREA/SP 506.123)',
        date: '2026-08-08T10:15:00Z',
        notes: 'Já atendido por reforma predial anterior.',
      },
    ],
    verificationMethod: 'Inspeção de iluminância e laudo dosimétrico.',
    notes: 'Proposta recusada com justificativa técnica registrada para auditoria.',
    createdAt: '2026-08-06T09:00:00Z',
    updatedAt: '2026-08-08T10:15:00Z',
  },
];

export const INITIAL_EVIDENCES = [
  {
    id: 'ev-1',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-1',
    title: 'Inspeção Ergonômica dos Postos de Triagem e Carga',
    category: 'foto_posto' as const,
    categoryLabel: 'Registro Fotográfico / Posto',
    date: '2026-06-10',
    authorName: 'Dra. Carolina Ramos Mendes',
    authorRole: 'Médica do Trabalho & Ergonomista',
    description: 'Avaliação in loco das bancadas de triagem, esteiras rolantes e fluxo de paletização no armazém.',
    findingsSummary: 'Identificada repetitividade elevada (> 30 itens/min) e ausência de assentos para descanso alternado nos postos de triagem fixa.',
    impactOnRisk: 'Aumenta Risco' as const,
    fileName: 'relatorio_inspecao_postos_galpao.pdf',
    fileSize: '3.4 MB',
    fileType: 'PDF / Imagens Anexadas',
    createdAt: '2026-06-10T14:30:00Z',
  },
  {
    id: 'ev-2',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-1',
    title: 'Ata da Reunião Ordinária da CIPA nº 06/2026',
    category: 'ata_cipa' as const,
    categoryLabel: 'Ata de Reunião CIPA',
    date: '2026-06-18',
    authorName: 'Comitê CIPA TechLog',
    authorRole: 'Representantes dos Empregados e Empregador',
    description: 'Discussão formal sobre metas operacionais, queixas de ritmo excessivo e planejamento da SIPAT com foco em Saúde Mental.',
    findingsSummary: 'Representantes dos trabalhadores relataram pressão de pontualidade no embarque e solicitaram treinamento de liderança humanizada.',
    impactOnRisk: 'Evidência Neutra/Diagnóstica' as const,
    fileName: 'ata_cipa_ordinaria_06_2026.pdf',
    fileSize: '1.2 MB',
    fileType: 'Documento Assinado',
    createdAt: '2026-06-18T16:00:00Z',
  },
  {
    id: 'ev-3',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-2',
    title: 'Relatório Epidemiológico de Afastamentos CID F32/F43',
    category: 'relatorio_absenteismo' as const,
    categoryLabel: 'Relatório de Absenteísmo / PCMSO',
    date: '2026-07-05',
    authorName: 'Dr. Roberto Silveira',
    authorRole: 'Médico Coordenador do PCMSO',
    description: 'Levantamento estatístico anual de atestados médicos superiores a 5 dias no setor de SAC.',
    findingsSummary: 'Aumento de 18% em queixas de ansiedade e estresse no SAC associadas a ligações de alta hostilidade de clientes.',
    impactOnRisk: 'Aumenta Risco' as const,
    fileName: 'estatistica_afastamentos_sac_2026.xlsx',
    fileSize: '890 KB',
    fileType: 'Planilha Epidemiológica',
    createdAt: '2026-07-05T09:15:00Z',
  },
  {
    id: 'ev-4',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    sectorId: 'sec-2',
    title: 'POP 04/2025 - Protocolo de Tratamento de Ligações Hostis',
    category: 'pop_norma' as const,
    categoryLabel: 'POP / Procedimento Operacional',
    date: '2026-05-12',
    authorName: 'Supervisão de Atendimento & Jurídico',
    authorRole: 'Gestão de Operações SAC',
    description: 'Norma interna que disciplina o procedimento de segurança psicológica do atendente contra ofensas.',
    findingsSummary: 'Procedimento formal implementado; operadores autorizados a registrar alerta e encerrar chamada após aviso formal.',
    impactOnRisk: 'Mitiga Risco' as const,
    fileName: 'pop_04_seguranca_psicologica_sac.pdf',
    fileSize: '650 KB',
    fileType: 'Norma Técnica Interna',
    createdAt: '2026-05-12T11:00:00Z',
  },
];

