import React, { useState } from 'react';
import {
  FileDown,
  Printer,
  ShieldCheck,
  Building2,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import { Company, AssessmentCampaign, TechnicalInCharge, DimensionResult } from '../types';
import { StorageService } from '../services/storageService';
import { generateNR1CompliancePDF } from '../services/pdfService';
import { COPSOQ_DIMENSIONS, calculateDimensionScore, COPSOQ_SHORT_QUESTIONS } from '../data/copsoqQuestions';
import { CompanyCampaignHeader } from './CompanyCampaignHeader';

interface ReportsViewProps {
  company: Company;
  companies?: Company[];
  onSelectCompany?: (companyId: string) => void;
  campaigns: AssessmentCampaign[];
  technicalProfile: TechnicalInCharge;
  onRefreshData: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  company,
  companies = [],
  onSelectCompany,
  campaigns,
  technicalProfile,
  onRefreshData,
}) => {
  const companyCampaigns = campaigns.filter((c) => c.companyId === company.id);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    companyCampaigns[0]?.id || campaigns[0]?.id || ''
  );

  const currentCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) ||
    companyCampaigns[0] ||
    campaigns[0];

  const responses = StorageService.getResponses(currentCampaign?.id);
  const riskInventory = StorageService.getRiskInventory(currentCampaign?.id);
  const actionPlans = StorageService.getActionPlans(currentCampaign?.id);

  // Calcula escores
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

  const favorableCount = dimensionResults.filter((d) => d.tercil === 'favorable').length;
  const intermediateCount = dimensionResults.filter((d) => d.tercil === 'intermediate').length;
  const riskCount = dimensionResults.filter((d) => d.tercil === 'risk').length;

  const handleDownloadPDF = () => {
    if (currentCampaign) {
      generateNR1CompliancePDF(company, currentCampaign, technicalProfile);
    }
  };

  const handlePrint = () => {
    window.print();
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
        allowAllCampaigns={false}
        allowAllCompanies={true}
        allCompaniesLabel="Todas as Empresas"
      >
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Imprimir</span>
        </button>

        <button
          id="download-pdf-report-btn"
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition"
        >
          <FileDown className="w-4 h-4" />
          <span>Exportar Laudo PDF (NR-1)</span>
        </button>
      </CompanyCampaignHeader>

      {/* Sub Header Informativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Laudo Técnico de Riscos Psicossociais
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Pronto para PGR / GRO
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Documento formal auditável conforme Portaria MTE nº 1.419/2024, NR-1.5.7 e NR-17 para integração ao PGR
          </p>
        </div>
      </div>

      {/* Visual Report Paper Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-5xl mx-auto overflow-hidden">
        {/* Document Header Bar */}
        <div className="bg-slate-900 text-white p-8 text-center space-y-2 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Conformidade Legal: Portaria MTE nº 1.419/2024 • NR-1 • NR-17</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            LAUDO TÉCNICO PERICIAL DE GESTÃO DE RISCOS PSICOSSOCIAIS
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto">
            Avaliação Ergonômica Preliminar (AEP) e Inventário de Riscos Ocupacionais para atendimento ao Gerenciamento de Riscos Ocupacionais (GRO) e Programa de Gerenciamento de Riscos (PGR)
          </p>
        </div>

        <div className="p-8 space-y-8 text-xs text-slate-800">
          {/* Seção 1: Identificação da Empresa */}
          <section className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>1. Identificação do Estabelecimento & Atividade Econômica</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Razão Social</span>
                <strong className="text-slate-900 text-xs">{company.corporateName}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nome Fantasia</span>
                <strong className="text-slate-900 text-xs">{company.tradeName}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CNPJ</span>
                <span className="font-mono text-slate-900 text-xs">{company.cnpj}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CNAE Principal</span>
                <span className="text-slate-800 text-xs">{company.cnae} - {company.cnaeDescription}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Grau de Risco (NR-4)</span>
                <span className="font-bold text-blue-700 text-xs">Grau {company.riskGrade}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Efetivo de Trabalhadores</span>
                <span className="text-slate-900 text-xs">
                  {company.totalEmployees} trabalhadores ({responses.length} respondentes na amostra)
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Endereço do Estabelecimento</span>
                <span className="text-slate-700 text-xs">
                  {company.address.street}, {company.address.number} - {company.address.neighborhood}, {company.address.city}/{company.address.state} - CEP: {company.address.cep}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CIPA (NR-5) / SESMT</span>
                <span className="text-slate-700 text-xs">
                  CIPA: {company.cipaEstablished ? 'Instalada' : 'Não'} | SESMT: {company.hasSESMT ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </section>

          {/* Seção 2: Responsável Técnico */}
          <section className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>2. Responsabilidade Técnica & Habilitação Legal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Profissional Habilitado</span>
                <strong className="text-slate-900 text-xs">{technicalProfile.name}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Especialidade / Título</span>
                <span className="text-slate-800 text-xs">{technicalProfile.title}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registro no Conselho</span>
                <strong className="text-blue-800 text-xs">{technicalProfile.professionalCouncil}</strong>
              </div>
            </div>
          </section>

          {/* Seção 3: Metodologia e Resultados COPSOQ II */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>3. Resultados da Avaliação Quantitativa (COPSOQ II)</span>
              </h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-700 font-semibold">● {favorableCount} Favoráveis</span>
                <span className="text-amber-700 font-semibold">● {intermediateCount} Intermédias</span>
                <span className="text-red-600 font-semibold">● {riskCount} em Risco</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2.5">Dimensão Psicossocial</th>
                    <th className="p-2.5">Categoria</th>
                    <th className="p-2.5 text-center">Média Obtida</th>
                    <th className="p-2.5 text-center">Benchmark Nac.</th>
                    <th className="p-2.5 text-center">Classificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dimensionResults.map((dim) => {
                    let badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                    let label = 'Intermédio';
                    if (dim.tercil === 'favorable') {
                      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      label = 'Favorável (Saudável)';
                    } else if (dim.tercil === 'risk') {
                      badgeClass = 'bg-red-50 text-red-700 border-red-200 font-bold';
                      label = 'Risco à Saúde (Crítico)';
                    }

                    return (
                      <tr key={dim.code} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-medium text-slate-900">{dim.title}</td>
                        <td className="p-2.5 text-slate-500 text-[11px]">{dim.category}</td>
                        <td className="p-2.5 text-center font-bold text-slate-900">{dim.score.toFixed(2)}</td>
                        <td className="p-2.5 text-center text-slate-500">{dim.nationalBenchmark.toFixed(2)}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] border ${badgeClass}`}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Seção 4: Inventário de Riscos (NR-1.5.7.3.2) */}
          <section className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-700" />
              <span>4. Inventário de Riscos Ocupacionais (NR-1 subitem 1.5.7.3.2)</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2.5">Setor / Processo</th>
                    <th className="p-2.5">Perigo / Fator de Risco</th>
                    <th className="p-2.5">Possíveis Agravos</th>
                    <th className="p-2.5 text-center">Sev x Prob</th>
                    <th className="p-2.5 text-center">Nível NR-1</th>
                    <th className="p-2.5 text-center">Prazo Limite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riskInventory.map((item) => {
                    const sector = company.sectors.find((s) => s.id === item.sectorId);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-semibold text-slate-800">{sector?.name || 'Geral'}</td>
                        <td className="p-2.5">
                          <div className="font-medium text-slate-900">{item.dangerName}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{item.dangerSource}</div>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-600">
                          {item.possibleInjuries.slice(0, 2).join(', ')}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {item.severity} x {item.probability} = {item.riskScore}
                        </td>
                        <td className="p-2.5 text-center font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              item.riskLevel === 'MUITO ALTO' || item.riskLevel === 'ALTO'
                                ? 'bg-red-100 text-red-800 font-bold'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.riskLevel}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-semibold text-slate-700">
                          {item.maxActionDeadline}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Seção 5: Plano de Ação 5W2H */}
          <section className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <span>5. Plano de Ação & Medidas de Prevenção (NR-1 subitem 1.5.5.2)</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2.5">O que será feito (What)</th>
                    <th className="p-2.5">Hierarquia</th>
                    <th className="p-2.5">Responsável (Who)</th>
                    <th className="p-2.5 text-center">Prazo (When)</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actionPlans.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-medium text-slate-900">{act.what}</td>
                      <td className="p-2.5 text-[11px] text-slate-600">{act.hierarchyCategory}</td>
                      <td className="p-2.5 text-slate-700">{act.who}</td>
                      <td className="p-2.5 text-center font-mono">{act.whenDate}</td>
                      <td className="p-2.5 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            act.status === 'Concluído'
                              ? 'bg-emerald-100 text-emerald-800'
                              : act.status === 'Em Andamento'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Seção 6: Conclusão & Assinaturas */}
          <section className="space-y-6 pt-4 border-t border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">6. Parecer Técnico Conclusivo & Encaminhamentos</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Com base nos dados coletados e na aplicação do instrumento padronizado COPSOQ II, o presente estabelecimento cumpriu integralmente os requisitos de escuta e participação dos trabalhadores (subitem 1.5.3.3 da NR-1). As medidas de intervenção estabelecidas no Plano de Ação devem ser implementadas conforme os prazos assinalados, com reavaliação periódica em prazo não superior a 2 (dois) anos.
              </p>
            </div>

            {/* Assinaturas */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="text-center space-y-1">
                <div className="border-t border-slate-400 w-3/4 mx-auto pt-2">
                  <strong className="block text-slate-900 text-xs">{technicalProfile.name}</strong>
                  <span className="block text-slate-500 text-[11px]">{technicalProfile.title}</span>
                  <span className="block text-blue-700 text-[11px] font-mono">{technicalProfile.professionalCouncil}</span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="border-t border-slate-400 w-3/4 mx-auto pt-2">
                  <strong className="block text-slate-900 text-xs">{company.contactPerson || 'Representante Legal da Empresa'}</strong>
                  <span className="block text-slate-500 text-[11px]">{company.corporateName}</span>
                  <span className="block text-slate-400 text-[11px]">Data: {new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
