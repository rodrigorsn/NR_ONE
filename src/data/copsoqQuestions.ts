import { SurveyQuestion } from '../types';

export const COPSOQ_SCALE_LABELS = {
  frequency: [
    { value: 1, label: '1 - Nunca / quase nunca' },
    { value: 2, label: '2 - Raramente' },
    { value: 3, label: '3 - Às vezes' },
    { value: 4, label: '4 - Frequentemente' },
    { value: 5, label: '5 - Sempre' },
  ],
  intensity: [
    { value: 1, label: '1 - Nada / quase nada' },
    { value: 2, label: '2 - Um pouco' },
    { value: 3, label: '3 - Moderadamente' },
    { value: 4, label: '4 - Muito' },
    { value: 5, label: '5 - Extremamente' },
  ],
  health_quality: [
    { value: 1, label: '1 - Deficitária' },
    { value: 2, label: '2 - Razoável' },
    { value: 3, label: '3 - Boa' },
    { value: 4, label: '4 - Muito boa' },
    { value: 5, label: '5 - Excelente' },
  ],
};

// Metadados das Dimensões do COPSOQ II com Benchmarks Normativos
export interface DimensionMeta {
  code: string;
  title: string;
  category: 'EXIGÊNCIAS LABORAIS' | 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO' | 'RELAÇÕES SOCIAIS E LIDERANÇA' | 'INTERFACE TRABALHO-INDIVÍDUO' | 'VALORES NO LOCAL DE TRABALHO' | 'PERSONALIDADE' | 'SAÚDE E BEM-ESTAR' | 'COMPORTAMENTOS OFENSIVOS';
  isFavorableHigh: boolean; // Se true, nota mais alta é bom. Se false, nota mais alta é risco.
  nationalBenchmark: number; // Média da população ativa (Valores de referência validados)
  riskFactorDescription: string;
  possibleConsequences: string[];
  recommendedMitigations: string[];
  nr1Category: 'Organização do Trabalho' | 'Relações Interpessoais' | 'Condições Ergonômicas' | 'Vigilância em Saúde' | 'Valores e Ética';
}

export const COPSOQ_DIMENSIONS: Record<string, DimensionMeta> = {
  EXIG_QUANT: {
    code: 'EXIG_QUANT',
    title: 'Exigências Quantitativas e Ritmo',
    category: 'EXIGÊNCIAS LABORAIS',
    isFavorableHigh: false,
    nationalBenchmark: 2.48,
    riskFactorDescription: 'Excesso de demandas no trabalho, sobrecarga quantitativa de tarefas e acúmulo por má distribuição.',
    possibleConsequences: ['Esgotamento físico e mental', 'Transtorno de ansiedade', 'DORT por sobrecarga contínua', 'Insônia'],
    recommendedMitigations: ['Redistribuição de tarefas com base na capacidade real', 'Definição de limites estritos para horas extras', 'Revisão do dimensionamento de equipes'],
    nr1Category: 'Organização do Trabalho'
  },
  RITMO_TRAB: {
    code: 'RITMO_TRAB',
    title: 'Ritmo de Trabalho Acelerado',
    category: 'EXIGÊNCIAS LABORAIS',
    isFavorableHigh: false,
    nationalBenchmark: 3.18,
    riskFactorDescription: 'Pressão constante para entrega acelerada e urgência sem pausas adequadas.',
    possibleConsequences: ['Estresse ocupacional crônico', 'Fadiga cognitiva', 'Erros operacionais e acidentes'],
    recommendedMitigations: ['Implementação de pausas psicofisiológicas regulares (NR-17)', 'Redução da pressão de metas irreais'],
    nr1Category: 'Organização do Trabalho'
  },
  EXIG_COGN: {
    code: 'EXIG_COGN',
    title: 'Exigências Cognitivas',
    category: 'EXIGÊNCIAS LABORAIS',
    isFavorableHigh: false,
    nationalBenchmark: 3.79,
    riskFactorDescription: 'Alta exigência de atenção ininterrupta, tomada de decisões complexas e multitarefas simultâneas.',
    possibleConsequences: ['Sobrecarga mental', 'Dificuldade de concentração', 'Cefaleias tensionais'],
    recommendedMitigations: ['Fracionamento de tarefas complexas', 'Automação de rotinas repetitivas', 'Ambiente com menor poluição sonora/distrações'],
    nr1Category: 'Condições Ergonômicas'
  },
  EXIG_EMOC: {
    code: 'EXIG_EMOC',
    title: 'Exigências Emocionais',
    category: 'EXIGÊNCIAS LABORAIS',
    isFavorableHigh: false,
    nationalBenchmark: 3.42,
    riskFactorDescription: 'Confronto com situações emocionalmente desgastantes, atendimento a clientes difíceis ou contenção de emoções.',
    possibleConsequences: ['Burnout emocional', 'Despersonalização', 'Desmotivação', 'Sintomas somáticos'],
    recommendedMitigations: ['Protocolos claros para lidar com clientes agressivos', 'Supervisão técnica e suporte psicológico/ouvidos atentos', 'Rodízio em postos de alta tensão'],
    nr1Category: 'Organização do Trabalho'
  },
  INFLUENCIA: {
    code: 'INFLUENCIA',
    title: 'Influência e Autonomia no Trabalho',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    isFavorableHigh: true,
    nationalBenchmark: 2.83,
    riskFactorDescription: 'Baixo controle sobre a própria atividade, falta de flexibilidade e autonomia decisória.',
    possibleConsequences: ['Sentimento de desamparo e desvalorização', 'Estresse laboral por baixa latitude de decisão', 'Desengajamento'],
    recommendedMitigations: ['Aumento da margem de decisão do trabalhador sobre como conduzir sua rotina', 'Criação de comitês participativos'],
    nr1Category: 'Organização do Trabalho'
  },
  DESENVOLVIMENTO: {
    code: 'DESENVOLVIMENTO',
    title: 'Possibilidades de Desenvolvimento',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    isFavorableHigh: true,
    nationalBenchmark: 3.85,
    riskFactorDescription: 'Oportunidades de aprendizado contínuo, iniciativa e aproveitamento pleno de habilidades.',
    possibleConsequences: ['Monotonia e estagnação profissional se baixo', 'Aumento de turnover'],
    recommendedMitigations: ['Planos de capacitação continuada', 'Incentivo à inovação e autonomia de projetos'],
    nr1Category: 'Organização do Trabalho'
  },
  PREVISIBILIDADE: {
    code: 'PREVISIBILIDADE',
    title: 'Previsibilidade e Informação Antecipada',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    isFavorableHigh: true,
    nationalBenchmark: 3.23,
    riskFactorDescription: 'Falta de clareza prévia sobre mudanças organizacionais, escalas e metas futuras.',
    possibleConsequences: ['Ansiedade antecipatória', 'Insegurança nas rotinas', 'Rumores e desestabilização'],
    recommendedMitigations: ['Comunicação transparente e antecipada de mudanças organizacionais (NR-1.5.3.3)', 'Cronogramas prévios'],
    nr1Category: 'Organização do Trabalho'
  },
  TRANSPARENCIA_PAPEL: {
    code: 'TRANSPARENCIA_PAPEL',
    title: 'Clareza de Papéis e Responsabilidades',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    isFavorableHigh: true,
    nationalBenchmark: 4.19,
    riskFactorDescription: 'Ambiguidade de funções e falta de definição sobre o que se espera de cada colaborador.',
    possibleConsequences: ['Conflitos internos', 'Retrabalho', 'Cobranças contraditórias'],
    recommendedMitigations: ['Descrição clara e formal de cargos e fluxos de processos', 'Alinhamentos periódicos 1-on-1'],
    nr1Category: 'Organização do Trabalho'
  },
  RECOMPENSAS: {
    code: 'RECOMPENSAS',
    title: 'Reconhecimento e Recompensas',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    isFavorableHigh: true,
    nationalBenchmark: 3.71,
    riskFactorDescription: 'Sensação de desvalorização e ausência de reconhecimento pelo esforço empenhado.',
    possibleConsequences: ['Desmotivação', 'Queda de produtividade', 'Adoecimento por desequilíbrio esforço-recompensa'],
    recommendedMitigations: ['Políticas formais de elogio e feedback estruturado', 'Alinhamento justo de planos de carreira'],
    nr1Category: 'Relações Interpessoais'
  },
  CONFLITOS_PAPEIS: {
    code: 'CONFLITOS_PAPEIS',
    title: 'Conflitos de Papéis e Demandas Contraditórias',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    isFavorableHigh: false,
    nationalBenchmark: 2.94,
    riskFactorDescription: 'Necessidade de realizar tarefas contraditórias, desnecessárias ou com discordância ética/operacional.',
    possibleConsequences: ['Tensão moral e psicológica', 'Desgaste relacional', 'Erros operacionais'],
    recommendedMitigations: ['Eliminação de ordens conflitantes entre gestores', 'Revisão dos procedimentos operacionais padrão (POPs)'],
    nr1Category: 'Organização do Trabalho'
  },
  APOIO_COLEGAS: {
    code: 'APOIO_COLEGAS',
    title: 'Apoio Social de Colegas',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    isFavorableHigh: true,
    nationalBenchmark: 3.44,
    riskFactorDescription: 'Clima de cooperação e disposição dos colegas de trabalho para ajudar em momentos difíceis.',
    possibleConsequences: ['Isolamento no ambiente de trabalho se baixo', 'Sobrecarga individual'],
    recommendedMitigations: ['Incentivo à cultura de cooperação e trabalho em equipe', 'Dinâmicas de integração e apoio mútuo'],
    nr1Category: 'Relações Interpessoais'
  },
  APOIO_SUPERIORES: {
    code: 'APOIO_SUPERIORES',
    title: 'Apoio Social de Superiores / Liderança',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    isFavorableHigh: true,
    nationalBenchmark: 3.13,
    riskFactorDescription: 'Presença, suporte técnico e escuta ativa da chefia direta nos desafios do dia a dia.',
    possibleConsequences: ['Sensação de abandono', 'Aumento de absenteísmo', 'Estresse agudo'],
    recommendedMitigations: ['Capacitação em liderança servidora e escuta ativa', 'Sessões regulares de acompanhamento e suporte'],
    nr1Category: 'Relações Interpessoais'
  },
  COMUNIDADE_SOCIAL: {
    code: 'COMUNIDADE_SOCIAL',
    title: 'Comunidade Social e Sentimento de Pertencimento',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    isFavorableHigh: true,
    nationalBenchmark: 3.97,
    riskFactorDescription: 'Bom ambiente relacional e sentimento de fazer parte de um time unido.',
    possibleConsequences: ['Alienamento e desengajamento se baixo'],
    recommendedMitigations: ['Fortalecimento dos canais internos e eventos de integração com segurança psicológica'],
    nr1Category: 'Relações Interpessoais'
  },
  QUALIDADE_LIDERANCA: {
    code: 'QUALIDADE_LIDERANCA',
    title: 'Qualidade da Liderança e Planejamento',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    isFavorableHigh: true,
    nationalBenchmark: 3.49,
    riskFactorDescription: 'Competência da liderança no planejamento do trabalho, mediação de conflitos e valorização das pessoas.',
    possibleConsequences: ['Gestão desorganizada', 'Estresse em cascata para as equipes'],
    recommendedMitigations: ['Treinamento de gestão de processos e resolução pacífica de conflitos'],
    nr1Category: 'Relações Interpessoais'
  },
  CONFIANCA_JUSTICA: {
    code: 'CONFIANCA_JUSTICA',
    title: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    isFavorableHigh: true,
    nationalBenchmark: 3.37,
    riskFactorDescription: 'Percepção de tratamento justo e imparcial, ausência de privilégios e consideração séria das sugestões dos colaboradores.',
    possibleConsequences: ['Sentimento de injustiça e revolta', 'Clima de desconfiança generalizada'],
    recommendedMitigations: ['Critérios transparentes de avaliação e mérito', 'Canais seguros e anônimos para sugestões e ouvidoria'],
    nr1Category: 'Valores e Ética'
  },
  SATISFACAO_TRAB: {
    code: 'SATISFACAO_TRAB',
    title: 'Satisfação Geral com o Trabalho',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    isFavorableHigh: true,
    nationalBenchmark: 3.37,
    riskFactorDescription: 'Grau de contentamento com as perspectivas profissionais, condições físicas e uso das próprias competências.',
    possibleConsequences: ['Apatia e absenteísmo se baixo', 'Maior propensão a pedidos de demissão'],
    recommendedMitigations: ['Melhoria contínua do ambiente físico e ergonômico', 'Enriquecimento do conteúdo das tarefas'],
    nr1Category: 'Condições Ergonômicas'
  },
  INSEGURANCA_LABORAL: {
    code: 'INSEGURANCA_LABORAL',
    title: 'Insegurança no Emprego',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    isFavorableHigh: false,
    nationalBenchmark: 3.13,
    riskFactorDescription: 'Medo constante de demissão involuntária, obsolescência tecnológica ou transferência indesejada.',
    possibleConsequences: ['Estresse crônico', 'Somatizações gastrointestinais e cardiovasculares'],
    recommendedMitigations: ['Comunicação clara da estabilidade e metas corporativas', 'Capacitação para transição tecnológica'],
    nr1Category: 'Organização do Trabalho'
  },
  CONFLITO_TRAB_FAMILIA: {
    code: 'CONFLITO_TRAB_FAMILIA',
    title: 'Conflito Trabalho - Família / Vida Privada',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    isFavorableHigh: false,
    nationalBenchmark: 2.67,
    riskFactorDescription: 'Drenagem de tempo e energia que impede a vida pessoal, o descanso e o convívio familiar saudável.',
    possibleConsequences: ['Esgotamento crônico', 'Conflitos familiares', 'Depressão'],
    recommendedMitigations: ['Respeito estrito aos horários de desconexão digital', 'Flexibilização de horários quando possível'],
    nr1Category: 'Organização do Trabalho'
  },
  BURNOUT_ESTRESSE: {
    code: 'BURNOUT_ESTRESSE',
    title: 'Sintomas de Burnout e Estresse',
    category: 'SAÚDE E BEM-ESTAR',
    isFavorableHigh: false,
    nationalBenchmark: 2.70,
    riskFactorDescription: 'Exaustão física e emocional frequente, irritabilidade constante, ansiedade e dificuldade para relaxar.',
    possibleConsequences: ['Crises de pânico', 'Afastamento por CID-10 F43 / F32', 'Transtornos cardiovasculares'],
    recommendedMitigations: ['Intervenção ergonômica imediata nas fontes estressoras', 'Encaminhamento médico-ocupacional (PCMSO / NR-7)'],
    nr1Category: 'Vigilância em Saúde'
  },
  SONO_SAUDE: {
    code: 'SONO_SAUDE',
    title: 'Qualidade do Sono e Saúde Geral',
    category: 'SAÚDE E BEM-ESTAR',
    isFavorableHigh: false,
    nationalBenchmark: 2.46,
    riskFactorDescription: 'Insônia, despertares frequentes e percepção de saúde física debilitada relacionada ao labor.',
    possibleConsequences: ['Fadiga acumulada', 'Redução drástica de reflexos', 'Imunossupressão'],
    recommendedMitigations: ['Ajustes em turnos noturnos/revezamentos', 'Palestras de higiene do sono e pausas ergonômicas'],
    nr1Category: 'Vigilância em Saúde'
  },
  SINTOMAS_DEPRESSIVOS: {
    code: 'SINTOMAS_DEPRESSIVOS',
    title: 'Sintomas Depressivos e Humor',
    category: 'SAÚDE E BEM-ESTAR',
    isFavorableHigh: false,
    nationalBenchmark: 2.35,
    riskFactorDescription: 'Sensação de tristeza constante, perda de interesse por atividades cotidianas e sentimento de inutilidade.',
    possibleConsequences: ['Incapacidade temporária ou permanente', 'Risco de automutilação ou ideação suicida'],
    recommendedMitigations: ['Programa de acolhimento e suporte em saúde mental', 'Revisão imediata da gestão do trabalho'],
    nr1Category: 'Vigilância em Saúde'
  },
  COMPORTAMENTOS_OFENSIVOS: {
    code: 'COMPORTAMENTOS_OFENSIVOS',
    title: 'Comportamentos Ofensivos e Assédio',
    category: 'COMPORTAMENTOS OFENSIVOS',
    isFavorableHigh: false,
    nationalBenchmark: 1.23,
    riskFactorDescription: 'Exposição a ofensas verbais, humilhações públicas, assédio sexual, ameaças ou violência no trabalho.',
    possibleConsequences: ['Trauma psicológico severo', 'Danos morais', 'Absenteísmo extremo', 'Afastamentos pelo INSS'],
    recommendedMitigations: ['Canal confidencial de denúncias independente (Lei 14.457/22 & CIPA)', 'Código de conduta com tolerância zero e apuração rigorosa'],
    nr1Category: 'Valores e Ética'
  },
};

// 41 Questões da Versão Curta (COPSOQ II Versão Curta adaptada para NR-1)
export const COPSOQ_SHORT_QUESTIONS: SurveyQuestion[] = [
  {
    id: 1,
    code: 'Q01',
    text: 'A sua carga de trabalho acumula-se por ser mal distribuída?',
    dimensionCode: 'EXIG_QUANT',
    dimensionTitle: 'Exigências Quantitativas e Ritmo',
    category: 'EXIGÊNCIAS LABORAIS',
    scaleType: 'frequency',
  },
  {
    id: 2,
    code: 'Q02',
    text: 'Com que frequência não tem tempo suficiente para completar todas as tarefas do seu trabalho?',
    dimensionCode: 'EXIG_QUANT',
    dimensionTitle: 'Exigências Quantitativas e Ritmo',
    category: 'EXIGÊNCIAS LABORAIS',
    scaleType: 'frequency',
  },
  {
    id: 3,
    code: 'Q03',
    text: 'Precisa trabalhar muito rapidamente durante a maior parte da jornada?',
    dimensionCode: 'RITMO_TRAB',
    dimensionTitle: 'Ritmo de Trabalho Acelerado',
    category: 'EXIGÊNCIAS LABORAIS',
    scaleType: 'frequency',
  },
  {
    id: 4,
    code: 'Q04',
    text: 'O seu trabalho exige a sua atenção e concentração constante?',
    dimensionCode: 'EXIG_COGN',
    dimensionTitle: 'Exigências Cognitivas',
    category: 'EXIGÊNCIAS LABORAIS',
    scaleType: 'frequency',
  },
  {
    id: 5,
    code: 'Q05',
    text: 'O seu trabalho exige que tome decisões difíceis ou sob pressão?',
    dimensionCode: 'EXIG_COGN',
    dimensionTitle: 'Exigências Cognitivas',
    category: 'EXIGÊNCIAS LABORAIS',
    scaleType: 'frequency',
  },
  {
    id: 6,
    code: 'Q06',
    text: 'O seu trabalho exige emocionalmente de si (lidar com problemas graves ou pessoas irritadas)?',
    dimensionCode: 'EXIG_EMOC',
    dimensionTitle: 'Exigências Emocionais',
    category: 'EXIGÊNCIAS LABORAIS',
    scaleType: 'frequency',
  },
  {
    id: 7,
    code: 'Q07',
    text: 'Tem um elevado grau de influência e autonomia na realização do seu trabalho?',
    dimensionCode: 'INFLUENCIA',
    dimensionTitle: 'Influência e Autonomia no Trabalho',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    scaleType: 'frequency',
  },
  {
    id: 8,
    code: 'Q08',
    text: 'O seu trabalho exige e estimula que tenha iniciativa própria?',
    dimensionCode: 'DESENVOLVIMENTO',
    dimensionTitle: 'Possibilidades de Desenvolvimento',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    scaleType: 'frequency',
  },
  {
    id: 9,
    code: 'Q09',
    text: 'O seu trabalho permite-lhe aprender coisas novas e desenvolver competências?',
    dimensionCode: 'DESENVOLVIMENTO',
    dimensionTitle: 'Possibilidades de Desenvolvimento',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    scaleType: 'frequency',
  },
  {
    id: 10,
    code: 'Q10',
    text: 'No seu local de trabalho, é informado com antecedência sobre decisões importantes, mudanças ou planos para o futuro?',
    dimensionCode: 'PREVISIBILIDADE',
    dimensionTitle: 'Previsibilidade e Informação Antecipada',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    scaleType: 'frequency',
  },
  {
    id: 11,
    code: 'Q11',
    text: 'Recebe toda a informação de que necessita para fazer bem o seu trabalho?',
    dimensionCode: 'PREVISIBILIDADE',
    dimensionTitle: 'Previsibilidade e Informação Antecipada',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    scaleType: 'frequency',
  },
  {
    id: 12,
    code: 'Q12',
    text: 'Sabe exatamente quais são as suas responsabilidades e o que a liderança espera de você?',
    dimensionCode: 'TRANSPARENCIA_PAPEL',
    dimensionTitle: 'Clareza de Papéis e Responsabilidades',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    scaleType: 'frequency',
  },
  {
    id: 13,
    code: 'Q13',
    text: 'O seu trabalho é reconhecido e apreciado pela gerência?',
    dimensionCode: 'RECOMPENSAS',
    dimensionTitle: 'Reconhecimento e Recompensas',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    scaleType: 'frequency',
  },
  {
    id: 14,
    code: 'Q14',
    text: 'É tratado de forma justa, respeitosa e imparcial no seu local de trabalho?',
    dimensionCode: 'CONFIANCA_JUSTICA',
    dimensionTitle: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    scaleType: 'frequency',
  },
  {
    id: 15,
    code: 'Q15',
    text: 'Com que frequência tem ajuda, suporte e apoio do seu superior imediato?',
    dimensionCode: 'APOIO_SUPERIORES',
    dimensionTitle: 'Apoio Social de Superiores / Liderança',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    scaleType: 'frequency',
  },
  {
    id: 16,
    code: 'Q16',
    text: 'Existe um bom ambiente de colaboração e respeito mútuo entre si e os seus colegas?',
    dimensionCode: 'APOIO_COLEGAS',
    dimensionTitle: 'Apoio Social de Colegas',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    scaleType: 'frequency',
  },
  {
    id: 17,
    code: 'Q17',
    text: 'A sua chefia direta oferece oportunidades de desenvolvimento e crescimento profissional?',
    dimensionCode: 'QUALIDADE_LIDERANCA',
    dimensionTitle: 'Qualidade da Liderança e Planejamento',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    scaleType: 'frequency',
  },
  {
    id: 18,
    code: 'Q18',
    text: 'A sua chefia direta é competente no planejamento e distribuição das demandas?',
    dimensionCode: 'QUALIDADE_LIDERANCA',
    dimensionTitle: 'Qualidade da Liderança e Planejamento',
    category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
    scaleType: 'frequency',
  },
  {
    id: 19,
    code: 'Q19',
    text: 'A gerência confia nos seus funcionários para desempenharem suas funções com autonomia?',
    dimensionCode: 'CONFIANCA_JUSTICA',
    dimensionTitle: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    scaleType: 'frequency',
  },
  {
    id: 20,
    code: 'Q20',
    text: 'Confia nas informações e comunicados que são transmitidos pela gerência?',
    dimensionCode: 'CONFIANCA_JUSTICA',
    dimensionTitle: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    scaleType: 'frequency',
  },
  {
    id: 21,
    code: 'Q21',
    text: 'No seu setor, os eventuais conflitos são mediados e resolvidos de forma justa?',
    dimensionCode: 'CONFIANCA_JUSTICA',
    dimensionTitle: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    scaleType: 'frequency',
  },
  {
    id: 22,
    code: 'Q22',
    text: 'O trabalho é distribuído de forma equilibrada e justa entre todos os funcionários?',
    dimensionCode: 'CONFIANCA_JUSTICA',
    dimensionTitle: 'Confiança Organizacional e Justiça',
    category: 'VALORES NO LOCAL DE TRABALHO',
    scaleType: 'frequency',
  },
  {
    id: 23,
    code: 'Q23',
    text: 'Sente-se capaz de solucionar os problemas e desafios operacionais do dia a dia?',
    dimensionCode: 'DESENVOLVIMENTO',
    dimensionTitle: 'Possibilidades de Desenvolvimento',
    category: 'PERSONALIDADE',
    scaleType: 'frequency',
  },
  {
    id: 24,
    code: 'Q24',
    text: 'O seu trabalho tem significado e propósito importante para você?',
    dimensionCode: 'SATISFACAO_TRAB',
    dimensionTitle: 'Satisfação Geral com o Trabalho',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    scaleType: 'intensity',
  },
  {
    id: 25,
    code: 'Q25',
    text: 'Sente que o trabalho que você realiza é importante para a organização ou sociedade?',
    dimensionCode: 'SATISFACAO_TRAB',
    dimensionTitle: 'Satisfação Geral com o Trabalho',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    scaleType: 'intensity',
  },
  {
    id: 26,
    code: 'Q26',
    text: 'Sente os sucessos e desafios do seu local de trabalho como sendo seus também?',
    dimensionCode: 'COMUNIDADE_SOCIAL',
    dimensionTitle: 'Comunidade Social e Sentimento de Pertencimento',
    category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
    scaleType: 'intensity',
  },
  {
    id: 27,
    code: 'Q27',
    text: 'Quão satisfeito você está com o seu trabalho de uma forma global?',
    dimensionCode: 'SATISFACAO_TRAB',
    dimensionTitle: 'Satisfação Geral com o Trabalho',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    scaleType: 'intensity',
  },
  {
    id: 28,
    code: 'Q28',
    text: 'Sente-se preocupado ou inseguro com o risco de ficar desempregado?',
    dimensionCode: 'INSEGURANCA_LABORAL',
    dimensionTitle: 'Insegurança no Emprego',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    scaleType: 'intensity',
  },
  {
    id: 29,
    code: 'Q29',
    text: 'Em geral, como você avalia o seu estado de saúde físico e mental atual?',
    dimensionCode: 'SONO_SAUDE',
    dimensionTitle: 'Qualidade do Sono e Saúde Geral',
    category: 'SAÚDE E BEM-ESTAR',
    scaleType: 'health_quality',
  },
  {
    id: 30,
    code: 'Q30',
    text: 'Sente que o seu trabalho exige tanta energia que acaba por afetar a sua vida privada e familiar negativamente?',
    dimensionCode: 'CONFLITO_TRAB_FAMILIA',
    dimensionTitle: 'Conflito Trabalho - Família / Vida Privada',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    scaleType: 'intensity',
  },
  {
    id: 31,
    code: 'Q31',
    text: 'Sente que o trabalho consome tempo excessivo que impede seu lazer e convívio familiar?',
    dimensionCode: 'CONFLITO_TRAB_FAMILIA',
    dimensionTitle: 'Conflito Trabalho - Família / Vida Privada',
    category: 'INTERFACE TRABALHO-INDIVÍDUO',
    scaleType: 'intensity',
  },
  {
    id: 32,
    code: 'Q32',
    text: 'Nas últimas 4 semanas, acordou várias vezes à noite com dificuldade para voltar a dormir devido a preocupações de trabalho?',
    dimensionCode: 'SONO_SAUDE',
    dimensionTitle: 'Qualidade do Sono e Saúde Geral',
    category: 'SAÚDE E BEM-ESTAR',
    scaleType: 'frequency',
  },
  {
    id: 33,
    code: 'Q33',
    text: 'Nas últimas 4 semanas, com que frequência se sentiu fisicamente exausto ao terminar a jornada?',
    dimensionCode: 'BURNOUT_ESTRESSE',
    dimensionTitle: 'Sintomas de Burnout e Estresse',
    category: 'SAÚDE E BEM-ESTAR',
    scaleType: 'frequency',
  },
  {
    id: 34,
    code: 'Q34',
    text: 'Nas últimas 4 semanas, com que frequência se sentiu emocionalmente esgotado?',
    dimensionCode: 'BURNOUT_ESTRESSE',
    dimensionTitle: 'Sintomas de Burnout e Estresse',
    category: 'SAÚDE E BEM-ESTAR',
    scaleType: 'frequency',
  },
  {
    id: 35,
    code: 'Q35',
    text: 'Nas últimas 4 semanas, com que frequência se sentiu excessivamente irritado ou impaciente no trabalho?',
    dimensionCode: 'BURNOUT_ESTRESSE',
    dimensionTitle: 'Sintomas de Burnout e Estresse',
    category: 'SAÚDE E BEM-ESTAR',
    scaleType: 'frequency',
  },
  {
    id: 36,
    code: 'Q36',
    text: 'Nas últimas 4 semanas, com que frequência sentiu ansiedade ou aperto no peito/angústia em relação ao trabalho?',
    dimensionCode: 'BURNOUT_ESTRESSE',
    dimensionTitle: 'Sintomas de Burnout e Estresse',
    category: 'SAÚDE E BEM-ESTAR',
    scaleType: 'frequency',
  },
  {
    id: 37,
    code: 'Q37',
    text: 'Nas últimas 4 semanas, com que frequência sentiu tristeza persistente ou desânimo?',
    dimensionCode: 'SINTOMAS_DEPRESSIVOS',
    dimensionTitle: 'Sintomas Depressivos e Humor',
    category: 'SAÚDE E BEM-ESTAR',
    scaleType: 'frequency',
  },
  {
    id: 38,
    code: 'Q38',
    text: 'Nos últimos 12 meses no seu local de trabalho, tem sido alvo de insultos, humilhações ou provocações verbais?',
    dimensionCode: 'COMPORTAMENTOS_OFENSIVOS',
    dimensionTitle: 'Comportamentos Ofensivos e Assédio',
    category: 'COMPORTAMENTOS OFENSIVOS',
    scaleType: 'frequency',
    isOffensiveBehavior: true,
  },
  {
    id: 39,
    code: 'Q39',
    text: 'Nos últimos 12 meses no seu local de trabalho, foi exposto a assédio moral, constrangimento ou assédio sexual indesejado?',
    dimensionCode: 'COMPORTAMENTOS_OFENSIVOS',
    dimensionTitle: 'Comportamentos Ofensivos e Assédio',
    category: 'COMPORTAMENTOS OFENSIVOS',
    scaleType: 'frequency',
    isOffensiveBehavior: true,
  },
  {
    id: 40,
    code: 'Q40',
    text: 'Nos últimos 12 meses no seu local de trabalho, foi exposto a ameaças verbais ou intimidação?',
    dimensionCode: 'COMPORTAMENTOS_OFENSIVOS',
    dimensionTitle: 'Comportamentos Ofensivos e Assédio',
    category: 'COMPORTAMENTOS OFENSIVOS',
    scaleType: 'frequency',
    isOffensiveBehavior: true,
  },
  {
    id: 41,
    code: 'Q41',
    text: 'Nos últimos 12 meses no seu local de trabalho, foi exposto a violência física ou agressão?',
    dimensionCode: 'COMPORTAMENTOS_OFENSIVOS',
    dimensionTitle: 'Comportamentos Ofensivos e Assédio',
    category: 'COMPORTAMENTOS OFENSIVOS',
    scaleType: 'frequency',
    isOffensiveBehavior: true,
  },
];

// Helper para calcular escore e tercil de uma dimensão
export function calculateDimensionScore(
  dimensionCode: string,
  answersList: Array<Record<number, number>>,
  questionSet: SurveyQuestion[] = COPSOQ_SHORT_QUESTIONS
): { score: number; tercil: 'favorable' | 'intermediate' | 'risk'; benchmark: number; delta: number } {
  const dim = COPSOQ_DIMENSIONS[dimensionCode];
  if (!dim) {
    return { score: 3.0, tercil: 'intermediate', benchmark: 3.0, delta: 0 };
  }

  const relatedQuestions = questionSet.filter(q => q.dimensionCode === dimensionCode);
  if (relatedQuestions.length === 0 || answersList.length === 0) {
    return { score: dim.nationalBenchmark, tercil: 'favorable', benchmark: dim.nationalBenchmark, delta: 0 };
  }

  let totalScore = 0;
  let count = 0;

  for (const resp of answersList) {
    for (const q of relatedQuestions) {
      if (resp[q.id] !== undefined) {
        let val = resp[q.id];
        // Inversão de itens específicos quando aplicável
        if (q.inverted) {
          val = 6 - val;
        }
        totalScore += val;
        count++;
      }
    }
  }

  const avg = count > 0 ? Number((totalScore / count).toFixed(2)) : dim.nationalBenchmark;
  const delta = Number((avg - dim.nationalBenchmark).toFixed(2));

  // Divisão em Tercis (< 2.33 / 2.33 - 3.66 / > 3.66)
  let tercil: 'favorable' | 'intermediate' | 'risk' = 'intermediate';

  if (dim.isFavorableHigh) {
    // Para fatores protetores (ex: apoio social, autonomia, clareza):
    // >= 3.67 -> Favorável (Verde)
    // 2.33 a 3.66 -> Intermédio (Amarelo)
    // < 2.33 -> Risco (Vermelho)
    if (avg >= 3.67) tercil = 'favorable';
    else if (avg >= 2.33) tercil = 'intermediate';
    else tercil = 'risk';
  } else {
    // Para fatores de risco estressores (ex: sobrecarga, assédio, burnout, conflitos):
    // < 2.33 -> Favorável (Verde)
    // 2.33 a 3.66 -> Intermédio (Amarelo)
    // >= 3.67 -> Risco (Vermelho)
    // Exceção especial para assédio / violência: se > 1.5 já acende alerta
    if (dimensionCode === 'COMPORTAMENTOS_OFENSIVOS') {
      if (avg <= 1.3) tercil = 'favorable';
      else if (avg <= 2.0) tercil = 'intermediate';
      else tercil = 'risk';
    } else {
      if (avg <= 2.33) tercil = 'favorable';
      else if (avg < 3.67) tercil = 'intermediate';
      else tercil = 'risk';
    }
  }

  return {
    score: avg,
    tercil,
    benchmark: dim.nationalBenchmark,
    delta,
  };
}

// Matriz de Risco NR-1: Severidade (1 a 5) x Probabilidade (1 a 5)
// Conforme Tabela ISO 45002 / Manual MTE NR-1 Figuras 31 e 32
export function getNR1RiskCalculation(severity: 1 | 2 | 3 | 4 | 5, probability: 1 | 2 | 3 | 4 | 5, exposedCount: number = 10): {
  score: number;
  level: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'MUITO ALTO';
  priority: 'BAIXA' | 'MODERADA' | 'ALTA' | 'ALTÍSSIMA';
  deadline: 'Até 12 meses' | 'Menor que 9 meses' | 'Menor que 3 meses' | 'IMEDIATO';
  color: string;
} {
  const score = severity * probability;

  // Classificação conforme Guia MTE / ISO 45002:
  // 1-5: Baixo (Verde)
  // 6-9: Médio (Amarelo)
  // 10-16: Alto (Laranja)
  // 20-25: Muito Alto (Vermelho)
  if (score >= 20 || (severity === 5 && probability >= 4) || (severity === 4 && probability === 5)) {
    return {
      score,
      level: 'MUITO ALTO',
      priority: 'ALTÍSSIMA',
      deadline: 'IMEDIATO',
      color: '#dc2626',
    };
  } else if (score >= 10 || (severity === 5 && probability >= 2) || (severity === 4 && probability >= 3)) {
    // Refinamento por número de trabalhadores (NR-1.5.5.2.1.1)
    const refinedDeadline = exposedCount > 30 ? 'Menor que 2 meses' as any : 'Menor que 3 meses';
    return {
      score,
      level: 'ALTO',
      priority: 'ALTA',
      deadline: refinedDeadline,
      color: '#ea580c',
    };
  } else if (score >= 6) {
    const refinedDeadline = exposedCount > 50 ? 'Menor que 6 meses' as any : 'Menor que 9 meses';
    return {
      score,
      level: 'MÉDIO',
      priority: 'MODERADA',
      deadline: refinedDeadline,
      color: '#ca8a04',
    };
  } else {
    return {
      score,
      level: 'BAIXO',
      priority: 'BAIXA',
      deadline: 'Até 12 meses',
      color: '#16a34a',
    };
  }
}
