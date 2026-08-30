import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Company, AssessmentCampaign, RiskInventoryItem, ActionPlanItem, TechnicalInCharge, DimensionResult } from '../types';
import { COPSOQ_DIMENSIONS, calculateDimensionScore, COPSOQ_SHORT_QUESTIONS } from '../data/copsoqQuestions';
import { StorageService } from './storageService';

export function generateNR1CompliancePDF(
  company: Company,
  campaign: AssessmentCampaign,
  technicalInCharge: TechnicalInCharge
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 76, 129]; // #0F4C81 (Classic Blue)
  const darkNeutral = [30, 41, 59]; // Slate 800
  const emeraldGreen = [16, 185, 129]; // Green
  const amberOrange = [245, 158, 11]; // Amber
  const dangerRed = [239, 68, 68]; // Red

  const responses = StorageService.getResponses(campaign.id);
  const riskInventory = StorageService.getRiskInventory(campaign.id);
  const actionPlans = StorageService.getActionPlans(campaign.id);

  // Calcula escores das dimensões
  const dimensionResults: DimensionResult[] = Object.keys(COPSOQ_DIMENSIONS).map((code) => {
    const dim = COPSOQ_DIMENSIONS[code];
    const calc = calculateDimensionScore(
      code,
      responses.map((r) => r.answers),
      COPSOQ_SHORT_QUESTIONS
    );
    return {
      code,
      title: dim.title,
      category: dim.category,
      score: calc.score,
      tercil: calc.tercil,
      isFavorableHigh: dim.isFavorableHigh,
      nationalBenchmark: dim.nationalBenchmark,
      deltaFromBenchmark: calc.delta,
      questionIds: [],
      riskFactorDescription: dim.riskFactorDescription,
      possibleConsequences: dim.possibleConsequences,
    };
  });

  // ================= PAGE 1: CAPA & EXPEDIENTE =================
  // Cabeçalho institucional
  doc.setFillColor(15, 76, 129);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('LAUDO TÉCNICO DE GESTÃO DE RISCOS PSICOSSOCIAIS', 105, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO / PGR) - NR-1 & NR-17', 105, 29, { align: 'center' });
  doc.text('Conformidade com a Portaria MTE nº 1.419/2024 e Metodologia COPSOQ II', 105, 36, { align: 'center' });

  // Bloco da Empresa
  let y = 55;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. DADOS DE IDENTIFICAÇÃO DO ESTABELECIMENTO', 14, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [['Campo', 'Informação Registrada']],
    body: [
      ['Razão Social', company.corporateName],
      ['Nome Fantasia', company.tradeName],
      ['CNPJ', company.cnpj],
      ['CNAE Principal', `${company.cnae} - ${company.cnaeDescription}`],
      ['Grau de Risco (NR-4)', `Grau ${company.riskGrade}`],
      ['Endereço Completo', `${company.address.street}, ${company.address.number} - ${company.address.neighborhood}, ${company.address.city}/${company.address.state} - CEP: ${company.address.cep}`],
      ['Efetivo Total de Trabalhadores', `${company.totalEmployees} colaboradores (${responses.length} respondentes na amostra)`],
      ['CIPA / SESMT', `CIPA Instalada: ${company.cipaEstablished ? 'Sim (Item 5.3.1 NR-5)' : 'Não'} | SESMT Ativo: ${company.hasSESMT ? 'Sim' : 'Não'}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 125 },
    },
    margin: { left: 14, right: 14 },
  });

  // Bloco do Responsável Técnico
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('2. RESPONSÁVEL TÉCNICO PELA AVALIAÇÃO', 14, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [['Profissional Habilitado', 'Registro e Qualificação']],
    body: [
      ['Nome do Responsável', technicalInCharge.name],
      ['Especialidade / Título', technicalInCharge.title],
      ['Conselho Profissional (CRM/CREA/CRP)', technicalInCharge.professionalCouncil],
      ['Entidade / Consultoria SST', technicalInCharge.companyConsultancy || 'Serviço Próprio / Especializado'],
      ['Contato Técnico', `${technicalInCharge.email} | ${technicalInCharge.phone}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 125 },
    },
    margin: { left: 14, right: 14 },
  });

  // Bloco da Campanha & Amostragem
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('3. ESCOPO DA AVALIAÇÃO ERGONÔMICA PRELIMINAR (AEP)', 14, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Detalhamento do Escopo']],
    body: [
      ['Título da Campanha', campaign.title],
      ['Tipo de Instrumento', `${campaign.assessmentType} via COPSOQ II (${campaign.questionnaireType === 'copsoq-short' ? 'Versão Curta - 41 questões' : 'Versão Média - 76 questões'})`],
      ['Período de Coleta de Dados', `${campaign.startDate} até ${campaign.endDate}`],
      ['Garantia de Anonimato', 'Questionário 100% anônimo sem identificação nominal, em estrita conformidade com NR-1 e LGPD'],
      ['Participação e Taxa de Adesão', `${responses.length} respondentes de ${campaign.sampleGoal} previstos (${Math.round((responses.length / (campaign.sampleGoal || 1)) * 100)}% da meta amostral)`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 125 },
    },
    margin: { left: 14, right: 14 },
  });

  // ================= PAGE 2: DIAGNÓSTICO COPSOQ II =================
  doc.addPage();
  
  // Header simples de continuação
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 0, 210, 15, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`MindGuard NR-1 | Laudo de Riscos Psicossociais - ${company.tradeName}`, 14, 10);
  doc.text(`Página 2`, 195, 10, { align: 'right' });

  y = 25;
  doc.setTextColor(15, 76, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('4. DIAGNÓSTICO QUANTITATIVO DAS DIMENSÕES PSICOSSOCIAIS (COPSOQ II)', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Interpretação pelo Sistema Semáforo por Tercis: Verde = Favorável | Amarelo = Intermédio | Vermelho = Risco para a Saúde', 14, y);

  y += 4;
  const copsoqTableBody = dimensionResults.map((dim) => {
    let statusText = 'INTERMÉDIO (Atenção)';
    if (dim.tercil === 'favorable') statusText = 'FAVORÁVEL (Saudável)';
    if (dim.tercil === 'risk') statusText = 'RISCO À SAÚDE (Crítico)';

    const deltaSign = dim.deltaFromBenchmark > 0 ? `+${dim.deltaFromBenchmark}` : `${dim.deltaFromBenchmark}`;

    return [
      dim.title,
      dim.category,
      dim.score.toFixed(2),
      dim.nationalBenchmark.toFixed(2),
      deltaSign,
      statusText,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Dimensão Psicossocial', 'Categoria', 'Média Obtida (1-5)', 'Benchmark Nac.', 'Delta', 'Classificação']],
    body: copsoqTableBody,
    theme: 'striped',
    headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 35, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.includes('RISCO')) {
          data.cell.styles.textColor = [185, 28, 28]; // Vermelho
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('FAVORÁVEL')) {
          data.cell.styles.textColor = [21, 128, 61]; // Verde
        } else {
          data.cell.styles.textColor = [180, 83, 9]; // Amarelo
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ================= PAGE 3: INVENTÁRIO DE RISCOS NR-1 =================
  doc.addPage();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 0, 210, 15, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`MindGuard NR-1 | Inventário de Riscos Ocupacionais (NR-1.5.7.3.2)`, 14, 10);
  doc.text(`Página 3`, 195, 10, { align: 'right' });

  y = 25;
  doc.setTextColor(15, 76, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('5. INVENTÁRIO DE RISCOS PSICOSSOCIAIS (Subitem 1.5.7.3.2 da NR-1)', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Matriz de Riscos 5x5: Severidade (1 a 5) x Probabilidade (1 a 5) conforme Portaria MTE 1.419/2024 e ISO 45002', 14, y);

  y += 4;
  const inventoryRows = riskInventory.map((item) => {
    const sector = company.sectors.find((s) => s.id === item.sectorId)?.name || 'Geral';
    return [
      sector,
      item.dangerName,
      item.dangerSource,
      item.possibleInjuries.join(', '),
      item.exposedWorkersCount.toString(),
      `Sev: ${item.severity} | Prob: ${item.probability}\nEscore: ${item.riskScore} (${item.riskLevel})`,
      item.maxActionDeadline,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Setor / Processo', 'Perigo / Fator de Risco', 'Fonte / Circunstância', 'Possíveis Danos / Agravos', 'Trab. Exp.', 'Nível de Risco NR-1', 'Prazo Máx. Ação']],
    body: inventoryRows.length > 0 ? inventoryRows : [['Nenhum risco cadastrado', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 32 },
      3: { cellWidth: 34 },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 24, halign: 'center' },
      6: { cellWidth: 20, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.includes('ALTO') || text.includes('MUITO ALTO')) {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ================= PAGE 4: PLANO DE AÇÃO 5W2H & ENCERRAMENTO =================
  doc.addPage();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 0, 210, 15, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`MindGuard NR-1 | Plano de Ação & Controle de Riscos (NR-1.5.5.2)`, 14, 10);
  doc.text(`Página 4`, 195, 10, { align: 'right' });

  y = 25;
  doc.setTextColor(15, 76, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('6. PLANO DE AÇÃO E MEDIDAS DE PREVENÇÃO (Subitem 1.5.5.2 da NR-1)', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Hierarquia de Prevenção: Eliminar perigo > Proteção Coletiva/Organização > Medidas Administrativas > Vigilância em Saúde', 14, y);

  y += 4;
  const actionRows = actionPlans.map((action) => {
    return [
      action.what,
      action.hierarchyCategory,
      action.who,
      action.whenDate,
      action.verificationMethod,
      action.status,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['O que será feito (Ação)', 'Hierarquia', 'Responsável', 'Prazo Limite', 'Aferição de Eficácia (PDCA)', 'Status']],
    body: actionRows.length > 0 ? actionRows : [['Nenhuma ação cadastrada', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 28 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 32 },
      5: { cellWidth: 17, halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // Recomendações e Participação dos Trabalhadores (NR-1.5.3.3)
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 76, 129);
  doc.text('7. PARTICIPAÇÃO DOS TRABALHADORES E RECOMENDAÇÕES DA CIPA', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const cipaNotes = [
    '• A presente avaliação garantiu a escuta ativa e o anonimato de todos os participantes conforme preceitua a NR-1.5.3.3.',
    '• Os resultados consolidados neste documento devem ser apresentados em reunião ordinária da CIPA (NR-5 / subitem 5.3.1).',
    '• O Plano de Ação deve ser revisado periodicamente a cada 2 anos (ou antes, em caso de novos afastamentos ou alterações de processos).',
    '• Recomenda-se a integração dos achados ao PCMSO (NR-7) para vigilância epidemiológica e promoção da saúde mental no trabalho.',
  ];
  cipaNotes.forEach((line) => {
    doc.text(line, 14, y);
    y += 5;
  });

  // Bloco de Assinaturas e Data
  y += 10;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 95, y);
  doc.line(115, y, 196, y);

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(technicalInCharge.name, 54, y, { align: 'center' });
  doc.text(company.contactPerson || 'Representante Legal da Empresa', 155, y, { align: 'center' });

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(technicalInCharge.title, 54, y, { align: 'center' });
  doc.text(technicalInCharge.professionalCouncil, 54, y + 4, { align: 'center' });
  doc.text(`${company.corporateName} - Direção`, 155, y, { align: 'center' });
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 155, y + 4, { align: 'center' });

  // Download do arquivo
  const safeFilename = `Laudo_NR1_Riscos_Psicossociais_${company.tradeName.replace(/\s+/g, '_')}.pdf`;
  doc.save(safeFilename);
}
