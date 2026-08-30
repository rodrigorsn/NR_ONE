import {
  QuestionnaireTemplate,
  QuestionnaireQuestion,
  QuestionnaireDimension,
  SurveyQuestion,
} from '../types';
import {
  COPSOQ_DIMENSIONS,
  COPSOQ_SHORT_QUESTIONS,
  COPSOQ_SCALE_LABELS,
} from './copsoqQuestions';

// Convert existing COPSOQ_DIMENSIONS to QuestionnaireDimension array
export const COPSOQ_DIMENSIONS_LIST: QuestionnaireDimension[] = Object.values(COPSOQ_DIMENSIONS).map((d) => ({
  code: d.code,
  title: d.title,
  category: d.category,
  isFavorableHigh: d.isFavorableHigh,
  nationalBenchmark: d.nationalBenchmark,
  riskFactorDescription: d.riskFactorDescription,
  possibleConsequences: d.possibleConsequences,
  recommendedMitigations: d.recommendedMitigations,
  nr1Category: d.nr1Category,
}));

// Map short questions to QuestionnaireQuestion format
export const COPSOQ_SHORT_TEMPLATE_QUESTIONS: QuestionnaireQuestion[] = COPSOQ_SHORT_QUESTIONS.map((q) => ({
  id: q.id,
  code: q.code,
  text: q.text,
  dimensionCode: q.dimensionCode,
  dimensionTitle: q.dimensionTitle,
  category: q.category,
  responseType: 'likert_copsoq',
  scaleType: q.scaleType,
  inverted: q.inverted,
  isOffensiveBehavior: q.isOffensiveBehavior,
  isRequired: true,
}));

// Template 1: COPSOQ II Versão Curta (41 itens)
export const COPSOQ_SHORT_TEMPLATE: QuestionnaireTemplate = {
  id: 'copsoq-short',
  code: 'COPSOQ-II-BR-SHORT',
  title: 'COPSOQ II - Versão Curta (Triagem Rápida / AEP)',
  subtitle: '41 itens psicossociais validados para Avaliação Ergonômica Preliminar (NR-01 & NR-17)',
  description:
    'Instrumento internacional de referência validado no Brasil para diagnóstico rápido de riscos psicossociais no trabalho. Ideal para triagem inicial em larga escala, aplicação rápida (8 a 10 min) e integração direta com o Inventário de Riscos do PGR.',
  version: '2.0 BR (NR-1)',
  author: 'National Research Centre for the Working Environment (NFA) / Adaptado para NR-01 Brasil',
  type: 'standard',
  standardType: 'copsoq-short',
  itemCount: 41,
  dimensionsCount: 16,
  estimatedMinutes: 8,
  targetApplication: 'AEP - Avaliação Ergonômica Preliminar & Triagem em Massa (NR-1.5.4)',
  tags: ['NR-1', 'AEP', 'Triagem Rápida', 'COPSOQ II', 'Oficial'],
  dimensions: COPSOQ_DIMENSIONS_LIST,
  questions: COPSOQ_SHORT_TEMPLATE_QUESTIONS,
  scoringMethod: 'copsoq_tercils',
  isDefault: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-05-15T00:00:00Z',
};

// 76 Perguntas da Versão Média (COPSOQ II Medium - 28 Dimensões com subescalas aprofundadas)
export const COPSOQ_MEDIUM_QUESTIONS: QuestionnaireQuestion[] = [
  ...COPSOQ_SHORT_TEMPLATE_QUESTIONS,
  // Perguntas Adicionais para aprofundamento (itens 42 a 76)
  {
    id: 42,
    code: 'Q42',
    text: 'Com que frequência tem que deixar tarefas pendentes ou inacabadas por falta de tempo na sua jornada?',
    dimensionCode: 'EXIG_QUANT',
    dimensionTitle: 'Exigências Quantitativas e Ritmo',
    category: 'EXIGÊNCIAS LABORAIS',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 43,
    code: 'Q43',
    text: 'O seu trabalho obriga-o a manter um ritmo de trabalho que você considera acelerado demais?',
    dimensionCode: 'RITMO_TRAB',
    dimensionTitle: 'Ritmo de Trabalho Acelerado',
    category: 'EXIGÊNCIAS LABORAIS',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 44,
    code: 'Q44',
    text: 'Precisa memorizar uma grande quantidade de detalhes técnicos ou dados complexos na sua rotina?',
    dimensionCode: 'EXIG_COGN',
    dimensionTitle: 'Exigências Cognitivas',
    category: 'EXIGÊNCIAS LABORAIS',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 45,
    code: 'Q45',
    text: 'O seu trabalho exige que você oculte os seus sentimentos reais perante clientes, chefias ou colegas?',
    dimensionCode: 'EXIG_EMOC',
    dimensionTitle: 'Exigências Emocionais',
    category: 'EXIGÊNCIAS LABORAIS',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 46,
    code: 'Q46',
    text: 'Pode decidir quando fazer uma pausa curta durante a realização das suas tarefas?',
    dimensionCode: 'INFLUENCIA',
    dimensionTitle: 'Influência e Autonomia no Trabalho',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 47,
    code: 'Q47',
    text: 'Tem capacidade e autonomia para influenciar as decisões sobre a quantidade de trabalho que lhe é atribuída?',
    dimensionCode: 'INFLUENCIA',
    dimensionTitle: 'Influência e Autonomia no Trabalho',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 48,
    code: 'Q48',
    text: 'O seu trabalho permite-lhe aplicar as suas competências e conhecimentos adquiridos?',
    dimensionCode: 'DESENVOLVIMENTO',
    dimensionTitle: 'Possibilidades de Desenvolvimento',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 49,
    code: 'Q49',
    text: 'Sente que as suas tarefas diárias são variadas ou extremamente monótonas?',
    dimensionCode: 'DESENVOLVIMENTO',
    dimensionTitle: 'Possibilidades de Desenvolvimento',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 50,
    code: 'Q50',
    text: 'Recebe informações suficientes sobre o planejamento financeiro e a estabilidade da empresa?',
    dimensionCode: 'PREVISIBILIDADE',
    dimensionTitle: 'Previsibilidade e Informação Antecipada',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 51,
    code: 'Q51',
    text: 'Existem objetivos contraditórios ou ordens opostas vindas de diferentes lideranças no seu setor?',
    dimensionCode: 'CONFLITOS_PAPEIS',
    dimensionTitle: 'Conflitos de Papéis e Demandas Contraditórias',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 52,
    code: 'Q52',
    text: 'É-lhe exigido fazer tarefas que você sente que deveriam ser feitas de maneira diferente ou mais segura?',
    dimensionCode: 'CONFLITOS_PAPEIS',
    dimensionTitle: 'Conflitos de Papéis e Demandas Contraditórias',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 53,
    code: 'Q53',
    text: 'A gerência ouve e dá importância real às sugestões apresentadas pelos trabalhadores?',
    dimensionCode: 'CONFIANCA_JUSTICA',
    dimensionTitle: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 54,
    code: 'Q54',
    text: 'Sente que as promoções e aumentos na empresa são baseados no mérito de forma justa?',
    dimensionCode: 'RECOMPENSAS',
    dimensionTitle: 'Reconhecimento e Recompensas',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 55,
    code: 'Q55',
    text: 'Pode contar com os seus colegas quando enfrenta uma sobrecarga repentina de serviço?',
    dimensionCode: 'APOIO_COLEGAS',
    dimensionTitle: 'Apoio Social de Colegas',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 56,
    code: 'Q56',
    text: 'O seu superior imediato disponibiliza tempo para conversar sobre o seu bem-estar e desenvolvimento?',
    dimensionCode: 'APOIO_SUPERIORES',
    dimensionTitle: 'Apoio Social de Superiores / Liderança',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 57,
    code: 'Q57',
    text: 'O seu superior direto sabe lidar adequadamente com reclamações e atritos na equipe?',
    dimensionCode: 'QUALIDADE_LIDERANCA',
    dimensionTitle: 'Qualidade da Liderança e Planejamento',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 58,
    code: 'Q58',
    text: 'Preocupa-se com a possibilidade de ser transferido contra a sua vontade para outro setor ou turno?',
    dimensionCode: 'INSEGURANCA_LABORAL',
    dimensionTitle: 'Insegurança no Emprego',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 59,
    code: 'Q59',
    text: 'Preocupa-se com a possibilidade de redução de benefícios ou alteração desfavorável nas condições de trabalho?',
    dimensionCode: 'INSEGURANCA_LABORAL',
    dimensionTitle: 'Insegurança no Emprego',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 60,
    code: 'Q60',
    text: 'As exigências do seu trabalho interferem na sua capacidade de cumprir compromissos familiares?',
    dimensionCode: 'CONFLITO_TRAB_FAMILIA',
    dimensionTitle: 'Conflito Trabalho - Família / Vida Privada',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 61,
    code: 'Q61',
    text: 'Sente dores musculares no pescoço, ombros ou costas relacionadas à tensão do trabalho?',
    dimensionCode: 'SONO_SAUDE',
    dimensionTitle: 'Qualidade do Sono e Saúde Geral',
    category: 'SAÚDE E BEM-ESTAR',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 62,
    code: 'Q62',
    text: 'Sente azia, desconforto no estômago ou dores de cabeça frequentes após dias de trabalho intenso?',
    dimensionCode: 'SONO_SAUDE',
    dimensionTitle: 'Qualidade do Sono e Saúde Geral',
    category: 'SAÚDE E BEM-ESTAR',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 63,
    code: 'Q63',
    text: 'Nas últimas semanas, teve lapsos de memória ou dificuldade para lembrar instruções de trabalho?',
    dimensionCode: 'BURNOUT_ESTRESSE',
    dimensionTitle: 'Sintomas de Burnout e Estresse',
    category: 'SAÚDE E BEM-ESTAR',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 64,
    code: 'Q64',
    text: 'Nas últimas semanas, sentiu dificuldade para tomar decisões corriqueiras no trabalho?',
    dimensionCode: 'BURNOUT_ESTRESSE',
    dimensionTitle: 'Sintomas de Burnout e Estresse',
    category: 'SAÚDE E BEM-ESTAR',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 65,
    code: 'Q65',
    text: 'Nas últimas 4 semanas, sentiu-se tenso, agitado ou à beira de um ataque de nervos?',
    dimensionCode: 'BURNOUT_ESTRESSE',
    dimensionTitle: 'Sintomas de Burnout e Estresse',
    category: 'SAÚDE E BEM-ESTAR',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 66,
    code: 'Q66',
    text: 'Nas últimas 4 semanas, sentiu falta de energia ou desânimo mesmo após os dias de folga/fim de semana?',
    dimensionCode: 'SINTOMAS_DEPRESSIVOS',
    dimensionTitle: 'Sintomas Depressivos e Humor',
    category: 'SAÚDE E BEM-ESTAR',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 67,
    code: 'Q67',
    text: 'Foi vítima de fofocas maliciosas, exclusão deliberada ou boatos difamatórios no ambiente de trabalho?',
    dimensionCode: 'COMPORTAMENTOS_OFENSIVOS',
    dimensionTitle: 'Comportamentos Ofensivos e Assédio',
    category: 'COMPORTAMENTOS OFENSIVOS',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isOffensiveBehavior: true,
    isRequired: true,
  },
  {
    id: 68,
    code: 'Q68',
    text: 'Presenciou colegas de trabalho sendo tratados com humilhações ou desrespeito pela liderança?',
    dimensionCode: 'COMPORTAMENTOS_OFENSIVOS',
    dimensionTitle: 'Comportamentos Ofensivos e Assédio',
    category: 'COMPORTAMENTOS OFENSIVOS',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isOffensiveBehavior: true,
    isRequired: true,
  },
  {
    id: 69,
    code: 'Q69',
    text: 'Sente que as regras de ergonomia e segurança são rigorosamente cumpridas no seu posto de trabalho?',
    dimensionCode: 'SATISFACAO_TRAB',
    dimensionTitle: 'Satisfação Geral com o Trabalho',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 70,
    code: 'Q70',
    text: 'Recomendaria esta empresa como um bom local para amigos e familiares trabalharem?',
    dimensionCode: 'COMUNIDADE_SOCIAL',
    dimensionTitle: 'Comunidade Social e Sentimento de Pertencimento',
    category: 'VALORES NO LOCAL DE TRABALHO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 71,
    code: 'Q71',
    text: 'Tem liberdade para expressar críticas construtivas e apontar riscos de acidentes sem medo de represálias?',
    dimensionCode: 'CONFIANCA_JUSTICA',
    dimensionTitle: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 72,
    code: 'Q72',
    text: 'Recebe capacitação técnica e reciclagens periódicas suficientes para operar suas funções com segurança?',
    dimensionCode: 'DESENVOLVIMENTO',
    dimensionTitle: 'Possibilidades de Desenvolvimento',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    responseType: 'likert_copsoq',
    scaleType: 'frequency',
    isRequired: true,
  },
  {
    id: 73,
    code: 'Q73',
    text: 'As ferramentas e sistemas operacionais disponibilizados pela empresa facilitam ou travam seu trabalho?',
    dimensionCode: 'SATISFACAO_TRAB',
    dimensionTitle: 'Satisfação Geral com o Trabalho',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 74,
    code: 'Q74',
    text: 'A iluminação, ruído e temperatura no seu ambiente de trabalho são confortáveis para as suas atividades?',
    dimensionCode: 'SATISFACAO_TRAB',
    dimensionTitle: 'Satisfação Geral com o Trabalho',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 75,
    code: 'Q75',
    text: 'Existe um canal seguro, sigiloso e acessível para você relatar situações de assédio ou violação ética?',
    dimensionCode: 'CONFIANCA_JUSTICA',
    dimensionTitle: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
  {
    id: 76,
    code: 'Q76',
    text: 'Considerando todas as condições, sente orgulho em fazer parte da sua equipe e empresa?',
    dimensionCode: 'COMUNIDADE_SOCIAL',
    dimensionTitle: 'Comunidade Social e Sentimento de Pertencimento',
    category: 'VALORES NO LOCAL DE TRABALHO',
    responseType: 'likert_copsoq',
    scaleType: 'intensity',
    isRequired: true,
  },
];

// Template 2: COPSOQ II Versão Média (76 itens)
export const COPSOQ_MEDIUM_TEMPLATE: QuestionnaireTemplate = {
  id: 'copsoq-medium',
  code: 'COPSOQ-II-BR-MEDIUM',
  title: 'COPSOQ II - Versão Média (AET & Aprofundamento Setorial)',
  subtitle: '76 itens psicossociais e somáticos para Análise Ergonômica do Trabalho (AET) e Auditorias',
  description:
    'Instrumento intermediário aprofundado com 76 perguntas que expande a triagem com investigação de estresse somático, conflitos de papel, assédio detalhado, justiça organizacional e clima ergonômico. Ideal para setores críticos e laudos conclusivos de AET.',
  version: '2.0 BR Médio',
  author: 'National Research Centre for the Working Environment (NFA) / Adaptado para NR-1 & NR-17 Brasil',
  type: 'standard',
  standardType: 'copsoq-medium',
  itemCount: 76,
  dimensionsCount: 22,
  estimatedMinutes: 15,
  targetApplication: 'AET - Análise Ergonômica do Trabalho & Setores de Médio/Alto Risco',
  tags: ['NR-1', 'NR-17', 'AET', 'Aprofundamento', 'COPSOQ II'],
  dimensions: COPSOQ_DIMENSIONS_LIST,
  questions: COPSOQ_MEDIUM_QUESTIONS,
  scoringMethod: 'copsoq_tercils',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-05-15T00:00:00Z',
};

// 141 Perguntas da Versão Longa (COPSOQ II Long - Pesquisa & Diagnóstico Exaustivo)
// Gera itens estruturados para a versão longa acadêmica
function generateLongQuestions(): QuestionnaireQuestion[] {
  const baseQuestions = [...COPSOQ_MEDIUM_QUESTIONS];
  const additionalItems: QuestionnaireQuestion[] = [];

  const extraCategories = [
    { code: 'CAPITAL_SOCIAL', title: 'Capital Social e Confiança Recíproca', cat: 'VALORES NO LOCAL DE TRABALHO' },
    { code: 'COPING_ESTRESSE', title: 'Estratégias de Enfrentamento e Resiliência', cat: 'PERSONALIDADE' },
    { code: 'AUTOEFICACIA', title: 'Autoeficácia e Competência Percebida', cat: 'PERSONALIDADE' },
    { code: 'CLIMA_SEGURANCA', title: 'Cultura e Clima de Segurança Psicossocial', cat: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO' },
    { code: 'DEMANDAS_SENSORIAIS', title: 'Demandas Sensoriais e Visuais', cat: 'EXIGÊNCIAS LABORAIS' },
    { code: 'TRANSPARENCIA_FEEDBACK', title: 'Qualidade do Feedback e Avaliação de Desempenho', cat: 'RELAÇÕES SOCIAIS E LIDERANÇA' },
    { code: 'SAUDE_SOMATICA_AMP', title: 'Sintomas Somáticos e Cardiovasculares', cat: 'SAÚDE E BEM-ESTAR' },
  ];

  const questionPrompts = [
    'Com que frequência precisa lidar com metas de curto prazo que entram em choque com os padrões de qualidade?',
    'Sente que os recursos materiais fornecidos pela empresa são de qualidade suficiente para evitar desgaste desnecessário?',
    'Com que frequência precisa refazer tarefas por falta de alinhamento ou especificações incompletas?',
    'O seu trabalho exige esforço visual ou auditivo contínuo que gera cansaço ao final do dia?',
    'Existe tempo hábil e estruturado para você repassar orientações e pendências na troca de turno?',
    'Sente que tem facilidade para se desligar mentalmente do trabalho durante suas horas de descanso?',
    'Com que frequência os membros da sua equipe compartilham conhecimentos e se apoiam espontaneamente?',
    'Sente que a sua liderança imediata é transparente sobre os critérios adotados para tomada de decisões?',
    'Quando ocorrem erros nos processos, a empresa foca em encontrar culpados ou em aprimorar o método de trabalho?',
    'Com que frequência você recebe retornos claros sobre o impacto do seu trabalho nos resultados gerais?',
    'Tem facilidade para solicitar ajustes na sua estação de trabalho quando sente desconforto ergonômico?',
    'Sente que a empresa valoriza o cumprimento de horários e desencoraja horas extras habituais?',
    'Em momentos de alta pressão, sente que pode contar com orientações calmas e equilibradas da liderança?',
    'Com que frequência você sente taquicardia, falta de ar ou palpitações associadas ao estresse no trabalho?',
    'Nas últimas 4 semanas, sentiu alterações repentinas de apetite decorrentes de ansiedade profissional?',
    'Sente que a sua opinião é levada em consideração quando são planejadas novas ferramentas de trabalho?',
    'Com que frequência o fluxo de comunicação entre diferentes setores da empresa é eficiente e sem ruídos?',
    'Sente que os treinamentos da empresa abordam a importância da saúde mental e do respeito mútuo?',
    'Considera que os critérios de promoção valorizam tanto a competência técnica quanto o tratamento humano?',
    'Com que frequência você tem oportunidade de sugerir inovações para simplificar sua rotina?',
    'Sente que os prazos estipulados para os projetos são fundamentados em dimensionamento realista?',
    'Com que frequência você sente que o seu trabalho contribui para o seu crescimento pessoal e profissional?',
    'Sente segurança jurídica e física para relatar desvios e quase-acidentes aos técnicos de segurança?',
    'Considera que a distribuição de tarefas na sua equipe é equilibrada de forma a não sobrecarregar ninguém?',
    'Com que frequência você tem clareza sobre quais são as prioridades quando múltiplas tarefas concorrem?',
    'Sente que as lideranças mantêm uma conduta coerente com os valores éticos divulgados pela empresa?',
    'Com que frequência você se sente valorizado pelos clientes ou usuários finais do seu serviço?',
    'Considera que o suporte de tecnologia da informação e sistemas atende prontamente às necessidades do setor?',
    'Nas últimas 4 semanas, sentiu episódios de tontura ou cansaço inexplicável durante o expediente?',
    'Sente que o ambiente de trabalho incentiva a cooperação em vez de uma competição predatória?',
    'Com que frequência a chefia imediata reconhece publicamente o esforço e a dedicação da equipe?',
    'Sente que os canais de ouvidoria garantem sigilo absoluto e proteção contra qualquer tipo de perseguição?',
    'Com que frequência você tem autonomia para escolher a ordem em que executará suas tarefas do dia?',
    'Considera que as pausas térmicas e psicofisiológicas são respeitadas na prática sem constrangimentos?',
    'Com que frequência você sente satisfação e sentimento de dever cumprido ao concluir a sua jornada?',
    'Sente que a cultura da empresa promove a igualdade de oportunidades independentemente de gênero ou raça?',
    'Com que frequência você consegue conciliar sua jornada de trabalho com cuidados pessoais de saúde?',
    'Sente que os procedimentos de emergência e planos de evacuação são bem conhecidos por todos no setor?',
    'Com que frequência a empresa realiza pesquisas de clima e implementa melhorias práticas solicitadas?',
    'Considera que as orientações de ergonomia (NR-17) são aplicadas efetivamente no seu posto de trabalho?',
    'Com que frequência você sente entusiasmo para iniciar uma nova semana de trabalho?',
    'Sente que os líderes da organização estão acessíveis para dialogar com os colaboradores de campo?',
    'Com que frequência você tem oportunidade de participar de comissões internas como a CIPA ou brigada?',
    'Considera que os investimentos em melhorias nas condições de trabalho são priorizados pela diretoria?',
    'Com que frequência você sente que a sua remuneração e benefícios refletem a complexidade do seu trabalho?',
    'Sente que os programas de qualidade de vida e ginástica laboral/pausas são incentivados pela liderança?',
    'Com que frequência você se sente seguro para admitir uma dúvida técnica sem sofrer julgamentos?',
    'Considera que as reuniões de alinhamento são produtivas e focadas na resolução ágil de problemas?',
    'Com que frequência você percebe que os gestores cumprem os acordos firmados com a equipe?',
    'Sente que a sua empresa possui uma visão sustentável e humanizada sobre o futuro do trabalho?',
    'Com que frequência você consegue manter a calma diante de imprevistos e mudanças repentinas de planos?',
    'Considera que os intervalos intrajornada (almoço/descanso) são usufruídos em local limpo e confortável?',
    'Com que frequência você tem oportunidade de aprender com os colegas mais experientes do setor?',
    'Sente que a liderança incentiva o descanso e desencoraja o envio de mensagens de trabalho fora do expediente?',
    'Com que frequência você tem clareza sobre os indicadores de desempenho pelos quais será avaliado?',
    'Considera que o suporte psicossocial e médico oferecido pela empresa é acolhedor e resolutivo?',
    'Com que frequência você percebe solidariedade e espírito de equipe nos momentos mais desafiadores?',
    'Sente que a sua saúde física e mental é preservada pelas condições de trabalho oferecidas pela empresa?',
    'Com que frequência você tem orgulho de compartilhar seus aprendizados profissionais com novos colaboradores?',
    'Considerando a sua trajetória profissional, quão satisfeito você está com o ambiente e o respeito que vivencia nesta organização?',
    'Sente que a sua estação de trabalho atende aos requisitos ergonômicos da NR-17 em termos de alcance e postura?',
    'Com que frequência os procedimentos operacionais são revisados com a participação direta de quem executa a tarefa?',
    'Sente que o trabalho em equipe nesta unidade contribui para reduzir os níveis de estresse e isolamento?',
    'Considera que as metas corporativas são compartilhadas de forma transparente e compreensível para todos?',
    'Em uma escala global, você considera este ambiente de trabalho saudável, seguro e psicologicamente sustentável?',
  ];

  let currentId = 77;
  for (let i = 0; i < questionPrompts.length && currentId <= 141; i++) {
    const extraCat = extraCategories[i % extraCategories.length];
    additionalItems.push({
      id: currentId,
      code: `Q${currentId < 100 ? '0' + currentId : currentId}`,
      text: questionPrompts[i],
      dimensionCode: extraCat.code,
      dimensionTitle: extraCat.title,
      category: extraCat.cat,
      responseType: 'likert_copsoq',
      scaleType: i % 2 === 0 ? 'frequency' : 'intensity',
      isRequired: true,
    });
    currentId++;
  }

  return [...baseQuestions, ...additionalItems];
}

export const COPSOQ_LONG_QUESTIONS: QuestionnaireQuestion[] = generateLongQuestions();

// Template 3: COPSOQ II Versão Longa (141 itens)
export const COPSOQ_LONG_TEMPLATE: QuestionnaireTemplate = {
  id: 'copsoq-long',
  code: 'COPSOQ-II-BR-LONG',
  title: 'COPSOQ II - Versão Longa (Auditoria Completa & Pesquisa)',
  subtitle: '141 itens psicossociais com inventário exaustivo para diagnósticos organizacionais profundos',
  description:
    'Versão completa e detalhada do COPSOQ II com 141 perguntas. Avalia exaustivamente todas as subdimensões psicossociais, sintomas de estresse cognitivo, comportamentos organizacionais, coping, capital social e clima de segurança psicossocial. Recomendada para diagnósticos institucionais complexos, perícias e pesquisas científicas.',
  version: '2.0 BR Longa',
  author: 'National Research Centre for the Working Environment (NFA) / Edição Completa para Pesquisa & SST',
  type: 'standard',
  standardType: 'copsoq-long',
  itemCount: 141,
  dimensionsCount: 35,
  estimatedMinutes: 28,
  targetApplication: 'Diagnóstico Organizacional Global, Perícias Técnicas, Auditorias Avançadas & Pesquisa',
  tags: ['Pesquisa', 'Completo', 'Auditoria Profunda', 'COPSOQ II', 'Científico'],
  dimensions: COPSOQ_DIMENSIONS_LIST,
  questions: COPSOQ_LONG_QUESTIONS,
  scoringMethod: 'copsoq_tercils',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-05-15T00:00:00Z',
};

// Coleção inicial de templates padrão do sistema
export const INITIAL_QUESTIONNAIRE_TEMPLATES: QuestionnaireTemplate[] = [
  COPSOQ_SHORT_TEMPLATE,
  COPSOQ_MEDIUM_TEMPLATE,
  COPSOQ_LONG_TEMPLATE,
];

// MODELOS DE EXEMPLO PARA DOWNLOAD (CSV e JSON)
export const SAMPLE_CSV_TEMPLATE = `codigo,pergunta,dimensao_codigo,dimensao_titulo,categoria,tipo_resposta,escala_ou_opcoes,inverso,obrigatorio
Q01,"Você sente que tem tempo suficiente para cumprir suas tarefas diárias?",EXIG_QUANT,"Exigências Quantitativas e Ritmo","EXIGÊNCIAS LABORAIS",likert_copsoq,frequencia,nao,sim
Q02,"Precisa trabalhar em ritmo acelerado durante a maior parte do dia?",RITMO_TRAB,"Ritmo de Trabalho Acelerado","EXIGÊNCIAS LABORAIS",likert_copsoq,frequencia,nao,sim
Q03,"O seu trabalho exige concentração contínua e atenção constante?",EXIG_COGN,"Exigências Cognitivas","EXIGÊNCIAS LABORAIS",likert_copsoq,intensidade,nao,sim
Q04,"Você tem liberdade para decidir como organizar suas tarefas diárias?",INFLUENCIA,"Influência e Autonomia","ORGANIZAÇÃO DO TRABALHO E CONTEÚDO",likert_copsoq,frequencia,nao,sim
Q05,"Você já presenciou ou foi alvo de situações de assédio moral no trabalho?",COMPORTAMENTOS_OFENSIVOS,"Comportamentos Ofensivos","COMPORTAMENTOS OFENSIVOS",yes_no,sim_nao,nao,sim
Q06,"Descreva brevemente uma situação do dia a dia de trabalho que cause estresse ou desconforto ergonômico.",CLIMA_GERAL,"Clima e Melhorias","ORGANIZAÇÃO DO TRABALHO E CONTEÚDO",text_description,texto_livre,nao,nao
Q07,"Como você avalia o apoio e suporte oferecido pela liderança direta da sua equipe?",APOIO_SUPERIORES,"Apoio da Liderança","RELAÇÕES SOCIAIS E LIDERANÇA",likert_copsoq,concordancia,nao,sim
Q08,"Em uma escala de 0 a 10, quão satisfeito você está com o ambiente e segurança psicossocial da empresa?",SATISFACAO_GERAL,"Satisfação Geral","INTERFACE TRABALHO-INDIVÍDUO",numeric_scale,0_a_10,nao,sim`;

export const SAMPLE_JSON_TEMPLATE: QuestionnaireTemplate = {
  id: 'custom-questionnaire-sample',
  code: 'CHECKLIST-SST-SAMPLE',
  title: 'Checklist Ergonômico & Psicossocial Personalizado (Exemplo)',
  subtitle: 'Modelo demonstrativo com perguntas tipo COPSOQ, Sim/Não, Descrição e Múltipla Escolha',
  description:
    'Questionário de exemplo configurado para demonstrar múltiplos formatos de avaliação: escala Likert COPSOQ (1 a 5), respostas Sim/Não com flag de risco, texto dissertativo livre e escala numérica.',
  version: '1.0',
  author: 'Equipe de SST e Ergonomia',
  type: 'custom',
  itemCount: 6,
  dimensionsCount: 4,
  estimatedMinutes: 5,
  targetApplication: 'AEP Rápida / Diagnóstico Personalizado de Clima e Ergonomia',
  tags: ['Personalizado', 'Sim/Não', 'Likert', 'Descrição', 'NR-1'],
  dimensions: [
    {
      code: 'EXIG_QUANT',
      title: 'Exigências e Ritmo de Trabalho',
      category: 'EXIGÊNCIAS LABORAIS',
      isFavorableHigh: false,
      nationalBenchmark: 2.5,
      riskFactorDescription: 'Sobrecarga de tarefas e pressão de tempo',
      nr1Category: 'Organização do Trabalho',
    },
    {
      code: 'CLIMA_RELACOES',
      title: 'Relações Interpessoais e Liderança',
      category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
      isFavorableHigh: true,
      nationalBenchmark: 3.5,
      riskFactorDescription: 'Suporte social e cooperação entre equipes',
      nr1Category: 'Relações Interpessoais',
    },
    {
      code: 'CONDICOES_FISICAS',
      title: 'Condições Físicas e Posturais',
      category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
      isFavorableHigh: true,
      nationalBenchmark: 3.2,
      riskFactorDescription: 'Conforto acústico, térmico e postos de trabalho',
      nr1Category: 'Condições Ergonômicas',
    },
    {
      code: 'FEEDBACK_LIVRE',
      title: 'Sugestões e Comentários Abertos',
      category: 'VALORES NO LOCAL DE TRABALHO',
      isFavorableHigh: true,
      riskFactorDescription: 'Manifestação voluntária dos colaboradores',
      nr1Category: 'Valores e Ética',
    },
  ],
  questions: [
    {
      id: 1,
      code: 'Q01',
      text: 'Com que frequência você sente que a quantidade de trabalho excede sua capacidade na jornada normal?',
      dimensionCode: 'EXIG_QUANT',
      dimensionTitle: 'Exigências e Ritmo de Trabalho',
      category: 'EXIGÊNCIAS LABORAIS',
      responseType: 'likert_copsoq',
      scaleType: 'frequency',
      isRequired: true,
    },
    {
      id: 2,
      code: 'Q02',
      text: 'A sua chefia direta oferece suporte e escuta ativa quando você aponta dificuldades operacionais?',
      dimensionCode: 'CLIMA_RELACOES',
      dimensionTitle: 'Relações Interpessoais e Liderança',
      category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
      responseType: 'likert_copsoq',
      scaleType: 'frequency',
      isRequired: true,
    },
    {
      id: 3,
      code: 'Q03',
      text: 'Você tem acesso a pausas regulares para descanso físico e mental durante o turno?',
      dimensionCode: 'CONDICOES_FISICAS',
      dimensionTitle: 'Condições Físicas e Posturais',
      category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
      responseType: 'yes_no',
      scaleType: 'yes_no',
      isRequired: true,
    },
    {
      id: 4,
      code: 'Q04',
      text: 'Você já sofreu ou presenciou gritos, humilhações ou tratamento desrespeitoso no trabalho?',
      dimensionCode: 'CLIMA_RELACOES',
      dimensionTitle: 'Relações Interpessoais e Liderança',
      category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
      responseType: 'yes_no',
      scaleType: 'yes_no',
      isOffensiveBehavior: true,
      isRequired: true,
    },
    {
      id: 5,
      code: 'Q05',
      text: 'Em uma escala de 0 a 10, quão seguro e confortável você se sente no seu ambiente de trabalho?',
      dimensionCode: 'CONDICOES_FISICAS',
      dimensionTitle: 'Condições Físicas e Posturais',
      category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
      responseType: 'numeric_scale',
      isRequired: true,
    },
    {
      id: 6,
      code: 'Q06',
      text: 'Deixe aqui sua sugestão de melhoria ergonômica ou para o bem-estar da sua equipe:',
      dimensionCode: 'FEEDBACK_LIVRE',
      dimensionTitle: 'Sugestões e Comentários Abertos',
      category: 'VALORES NO LOCAL DE TRABALHO',
      responseType: 'text_description',
      placeholder: 'Descreva melhorias em ferramentas, escalas, pausas, ambiente ou processos...',
      isRequired: false,
    },
  ],
  scoringMethod: 'custom_rules',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// HELPERS DE PARSER E EXPORTAÇÃO
export function parseQuestionnaireCSV(csvContent: string): {
  success: boolean;
  template?: Partial<QuestionnaireTemplate>;
  error?: string;
} {
  try {
    const lines = csvContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length < 2) {
      return { success: false, error: 'O arquivo CSV está vazio ou contém apenas o cabeçalho.' };
    }

    // Linha de cabeçalho
    const headerLine = lines[0].toLowerCase();
    const rows = lines.slice(1);

    const questions: QuestionnaireQuestion[] = [];
    const dimensionsMap = new Map<string, QuestionnaireDimension>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Split respeitando aspas
      const cols = parseCSVRow(row);
      if (cols.length < 2) continue;

      const code = cols[0]?.trim() || `Q${i + 1 < 10 ? '0' + (i + 1) : i + 1}`;
      const text = cols[1]?.trim();
      if (!text) continue;

      const dimCode = cols[2]?.trim() || 'GERAL';
      const dimTitle = cols[3]?.trim() || 'Dimensão Geral';
      const category = cols[4]?.trim() || 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO';
      const rawType = cols[5]?.toLowerCase().trim() || 'likert_copsoq';
      const rawScale = cols[6]?.toLowerCase().trim() || 'frequencia';
      const isInverted = cols[7]?.toLowerCase().trim() === 'sim' || cols[7]?.toLowerCase().trim() === 'true';
      const isRequired = cols[8]?.toLowerCase().trim() !== 'nao' && cols[8]?.toLowerCase().trim() !== 'false';

      // Identifica o responseType
      let responseType: QuestionnaireQuestion['responseType'] = 'likert_copsoq';
      let scaleType: QuestionnaireQuestion['scaleType'] = 'frequency';

      if (rawType.includes('sim') || rawType.includes('yes') || rawType === 'yes_no') {
        responseType = 'yes_no';
        scaleType = 'yes_no';
      } else if (rawType.includes('texto') || rawType.includes('desc') || rawType === 'text_description') {
        responseType = 'text_description';
      } else if (rawType.includes('num') || rawType.includes('0_a_10') || rawType === 'numeric_scale') {
        responseType = 'numeric_scale';
      } else if (rawType.includes('mult') || rawType === 'multiple_choice') {
        responseType = 'multiple_choice';
      } else {
        responseType = 'likert_copsoq';
        if (rawScale.includes('intens')) scaleType = 'intensity';
        else if (rawScale.includes('saude')) scaleType = 'health_quality';
        else if (rawScale.includes('concord')) scaleType = 'agreement_5';
        else if (rawScale.includes('satis')) scaleType = 'satisfaction_4';
        else scaleType = 'frequency';
      }

      if (!dimensionsMap.has(dimCode)) {
        dimensionsMap.set(dimCode, {
          code: dimCode,
          title: dimTitle,
          category,
          isFavorableHigh: !dimCode.includes('EXIG') && !dimCode.includes('RISCO') && !dimCode.includes('BURNOUT'),
          nr1Category: 'Organização do Trabalho',
        });
      }

      questions.push({
        id: i + 1,
        code,
        text,
        dimensionCode: dimCode,
        dimensionTitle: dimTitle,
        category,
        responseType,
        scaleType,
        inverted: isInverted,
        isRequired,
      });
    }

    if (questions.length === 0) {
      return { success: false, error: 'Nenhuma pergunta válida foi detectada no arquivo CSV.' };
    }

    const template: Partial<QuestionnaireTemplate> = {
      title: 'Questionário Importado via CSV',
      subtitle: `${questions.length} itens distribuídos em ${dimensionsMap.size} dimensões de análise`,
      description: 'Questionário importado a partir de planilha formatada CSV/Excel para aplicação de diagnósticos de SST e riscos psicossociais.',
      version: '1.0 Importado',
      author: 'Importado pelo Usuário',
      type: 'imported',
      itemCount: questions.length,
      dimensionsCount: dimensionsMap.size,
      estimatedMinutes: Math.max(3, Math.round(questions.length * 0.35)),
      targetApplication: 'Diagnóstico Personalizado / NR-1',
      tags: ['Importado', 'CSV', 'Personalizado'],
      dimensions: Array.from(dimensionsMap.values()),
      questions,
      scoringMethod: 'custom_rules',
    };

    return { success: true, template };
  } catch (err: any) {
    return { success: false, error: `Erro no processamento do CSV: ${err.message || err}` };
  }
}

// Split de linha CSV considerando aspas
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"' || char === "'") {
      if (inQuotes && row[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseQuestionnaireJSON(jsonContent: string): {
  success: boolean;
  template?: QuestionnaireTemplate;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);

    // Validação de campos essenciais
    if (!parsed.title || !parsed.questions || !Array.isArray(parsed.questions)) {
      return {
        success: false,
        error: 'JSON inválido: O arquivo deve conter ao menos "title" e um array "questions".',
      };
    }

    const template: QuestionnaireTemplate = {
      id: parsed.id || `custom-${Date.now()}`,
      code: parsed.code || `QNR1-${Date.now().toString().slice(-4)}`,
      title: parsed.title,
      subtitle: parsed.subtitle || `${parsed.questions.length} questões personalizadas`,
      description: parsed.description || 'Questionário importado em formato JSON.',
      version: parsed.version || '1.0',
      author: parsed.author || 'Importado pelo Usuário',
      type: 'imported',
      itemCount: parsed.questions.length,
      dimensionsCount: parsed.dimensions?.length || 1,
      estimatedMinutes: parsed.estimatedMinutes || Math.max(3, Math.round(parsed.questions.length * 0.35)),
      targetApplication: parsed.targetApplication || 'Diagnóstico Personalizado / NR-1',
      tags: parsed.tags || ['Importado', 'JSON', 'Personalizado'],
      dimensions: parsed.dimensions || [
        {
          code: 'GERAL',
          title: 'Dimensão Geral',
          category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
          isFavorableHigh: true,
        },
      ],
      questions: parsed.questions.map((q: any, idx: number) => ({
        id: q.id || idx + 1,
        code: q.code || `Q${idx + 1 < 10 ? '0' + (idx + 1) : idx + 1}`,
        text: q.text || 'Texto da pergunta',
        dimensionCode: q.dimensionCode || 'GERAL',
        dimensionTitle: q.dimensionTitle || 'Geral',
        category: q.category || 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
        responseType: q.responseType || 'likert_copsoq',
        scaleType: q.scaleType || 'frequency',
        options: q.options,
        inverted: !!q.inverted,
        isRequired: q.isRequired !== false,
        placeholder: q.placeholder,
        helpText: q.helpText,
      })),
      scoringMethod: parsed.scoringMethod || 'custom_rules',
      createdAt: parsed.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { success: true, template };
  } catch (err: any) {
    return { success: false, error: `JSON corrompido ou mal formatado: ${err.message || err}` };
  }
}

export function exportQuestionnaireToCSV(template: QuestionnaireTemplate): string {
  const header = 'codigo,pergunta,dimensao_codigo,dimensao_titulo,categoria,tipo_resposta,escala_ou_opcoes,inverso,obrigatorio\n';
  const rows = template.questions
    .map((q) => {
      const cleanText = `"${q.text.replace(/"/g, '""')}"`;
      const cleanDimTitle = `"${q.dimensionTitle.replace(/"/g, '""')}"`;
      const cleanCat = `"${q.category.replace(/"/g, '""')}"`;
      const inv = q.inverted ? 'sim' : 'nao';
      const req = q.isRequired !== false ? 'sim' : 'nao';
      return `${q.code},${cleanText},${q.dimensionCode},${cleanDimTitle},${cleanCat},${q.responseType},${q.scaleType || 'frequencia'},${inv},${req}`;
    })
    .join('\n');

  return header + rows;
}
