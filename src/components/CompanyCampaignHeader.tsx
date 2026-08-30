import React, { useState } from 'react';
import { Building2, Calendar, ChevronDown, Check, Copy, FileDown, Search, ArrowRightLeft } from 'lucide-react';
import { Company, AssessmentCampaign } from '../types';

interface CompanyCampaignHeaderProps {
  company: Company;
  companies?: Company[];
  onSelectCompany?: (companyId: string) => void;
  campaigns: AssessmentCampaign[];
  selectedCampaignId: string;
  onSelectCampaign: (campaignId: string) => void;
  allowAllCampaigns?: boolean;
  allCampaignsLabel?: string;
  allowAllCompanies?: boolean;
  allCompaniesLabel?: string;
  showCompanySelector?: boolean;
  children?: React.ReactNode;
}

export const CompanyCampaignHeader: React.FC<CompanyCampaignHeaderProps> = ({
  company,
  companies = [],
  onSelectCompany,
  campaigns,
  selectedCampaignId,
  onSelectCampaign,
  allowAllCampaigns = true,
  allCampaignsLabel = 'Todas as avaliações da empresa',
  allowAllCompanies = false,
  allCompaniesLabel = 'Todas as Empresas',
  showCompanySelector = true,
  children,
}) => {
  const isAllCompanies = company.id === 'all';
  const totalAllEmployees = companies.reduce((acc, c) => acc + (c.totalEmployees || 0), 0);
  const totalAllSectors = companies.reduce((acc, c) => acc + (c.sectors?.length || 0), 0);

  const availableCampaigns = isAllCompanies
    ? campaigns
    : campaigns.filter((c) => c.companyId === company.id);

  return (
    <div
      id="company-campaign-header-card"
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-all"
    >
      {/* Left Section: Company Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          {showCompanySelector && companies.length > 0 && onSelectCompany ? (
            <div className="relative inline-flex items-center">
              <select
                id="header-company-select"
                aria-label="Selecionar Empresa"
                value={company.id}
                onChange={(e) => {
                  onSelectCompany(e.target.value);
                }}
                className="text-xl font-bold text-slate-900 tracking-tight bg-transparent hover:bg-slate-100/80 pr-7 pl-1 py-0.5 rounded-lg border border-transparent hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
              >
                {allowAllCompanies && (
                  <option value="all" className="text-sm font-semibold text-slate-900">
                    🏢 {allCompaniesLabel} ({companies.length})
                  </option>
                )}
                {companies.map((c) => (
                  <option key={c.id} value={c.id} className="text-sm font-normal text-slate-800">
                    {c.tradeName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-1 pointer-events-none" />
            </div>
          ) : (
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isAllCompanies ? allCompaniesLabel : company.tradeName}
            </h2>
          )}

          {/* Grau de Risco / Multi-empresa Pill */}
          {isAllCompanies ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
              Visão Geral Consolidada ({companies.length} Empresas)
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
              Grau de Risco {company.riskGrade} (NR-4)
            </span>
          )}

          {/* CNAE Pill */}
          {!isAllCompanies && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60 whitespace-nowrap">
              CNAE: {company.cnae}
            </span>
          )}

          {showCompanySelector && companies.length > 0 && onSelectCompany && (
            <span className="text-[11px] text-blue-600/80 font-medium hidden sm:inline-flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3" />
              Clique no nome para alternar empresa
            </span>
          )}
        </div>

        {/* Corporate Details */}
        {isAllCompanies ? (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed truncate sm:whitespace-normal">
            Gestão Integrada de Riscos Psicossociais (NR-1/NR-17) •{' '}
            <strong className="font-semibold text-slate-700">{totalAllEmployees}</strong> trabalhadores somados em{' '}
            <strong className="font-semibold text-slate-700">{totalAllSectors}</strong> setores em todas as organizações
          </p>
        ) : (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed truncate sm:whitespace-normal">
            {company.corporateName} • CNPJ: <span className="font-mono text-slate-600">{company.cnpj}</span> •{' '}
            <strong className="font-semibold text-slate-700">{company.totalEmployees}</strong> trabalhadores distribuídos em{' '}
            <strong className="font-semibold text-slate-700">{company.sectors.length}</strong> setores (GHE)
          </p>
        )}
      </div>

      {/* Right Section: Campaign Selector & Optional Actions */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        {/* Campaign Filter Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/70 transition px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-500 font-medium whitespace-nowrap">Campanha:</span>
          <select
            id="header-campaign-select"
            aria-label="Selecionar Campanha de Avaliação"
            value={selectedCampaignId}
            onChange={(e) => onSelectCampaign(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[260px] sm:max-w-[340px] truncate"
          >
            {allowAllCampaigns && (
              <option value="all">
                {isAllCompanies ? `Todas as avaliações (${availableCampaigns.length})` : `${allCampaignsLabel} (${availableCampaigns.length})`}
              </option>
            )}
            {availableCampaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.assessmentType})
              </option>
            ))}
            {availableCampaigns.length === 0 && (
              <option value="" disabled>
                Nenhuma avaliação cadastrada
              </option>
            )}
          </select>
        </div>

        {/* Optional Custom Action Buttons (Download, Nova Avaliação, etc.) */}
        {children}
      </div>
    </div>
  );
};
