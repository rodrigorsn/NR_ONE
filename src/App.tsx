import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CompaniesView } from './components/CompaniesView';
import { AssessmentsView } from './components/AssessmentsView';
import { RiskMatrixView } from './components/RiskMatrixView';
import { ActionPlanView } from './components/ActionPlanView';
import { ReportsView } from './components/ReportsView';
import { AnonymousSurveyView } from './components/AnonymousSurveyView';
import { GuideNR1View } from './components/GuideNR1View';
import { SettingsView } from './components/SettingsView';
import { TestsLibraryView } from './components/TestsLibraryView';
import { StorageService } from './services/storageService';
import { Company, TechnicalInCharge, AssessmentCampaign } from './types';

export default function App() {
  // Initialize storage once
  useEffect(() => {
    StorageService.init();
  }, []);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [companies, setCompanies] = useState<Company[]>(() => StorageService.getCompanies());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    const saved = StorageService.getSelectedCompanyId();
    const comps = StorageService.getCompanies();
    if (saved === 'all' || comps.some((c) => c.id === saved)) {
      return saved;
    }
    return comps[0]?.id || '';
  });
  const [technicalProfile, setTechnicalProfile] = useState<TechnicalInCharge>(() =>
    StorageService.getTechnicalProfile()
  );
  const [campaigns, setCampaigns] = useState<AssessmentCampaign[]>(() =>
    StorageService.getCampaigns()
  );

  const [tabResetCounter, setTabResetCounter] = useState<number>(0);
  const [selectedQuestionnaireForAssessment, setSelectedQuestionnaireForAssessment] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setTabResetCounter((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCompany = (compIId: string) => {
    setSelectedCompanyId(compIId);
    StorageService.setSelectedCompanyId(compIId);
    setTabResetCounter((prev) => prev + 1);
  };

  // Anonymous survey params
  const [activeSurveyToken, setActiveSurveyToken] = useState<string | null>(null);
  const [activeSurveyCampaignId, setActiveSurveyCampaignId] = useState<string | null>(null);

  // Hash listener to support deep linking e.g. #survey=token-123 or #campaign=camp-1
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#survey=')) {
        const token = hash.replace('#survey=', '');
        setActiveSurveyToken(token);
        setCurrentTab('anonymous-survey');
      } else if (hash.startsWith('#campaign=')) {
        const cId = hash.replace('#campaign=', '');
        setActiveSurveyCampaignId(cId);
        setCurrentTab('anonymous-survey');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const refreshData = () => {
    const updatedCompanies = StorageService.getCompanies();
    const updatedCampaigns = StorageService.getCampaigns();
    const updatedProfile = StorageService.getTechnicalProfile();

    setCompanies(updatedCompanies);
    setCampaigns(updatedCampaigns);
    setTechnicalProfile(updatedProfile);

    if (updatedCompanies.length > 0 && !updatedCompanies.some((c) => c.id === selectedCompanyId)) {
      setSelectedCompanyId(updatedCompanies[0].id);
    }
  };

  const selectedCompany: Company =
    selectedCompanyId === 'all'
      ? {
          id: 'all',
          tradeName: 'Todas as Empresas',
          corporateName: 'Visão Consolidada Multi-Empresas',
          cnpj: 'Consolidado Corporativo',
          cnae: 'Diversos',
          cnaeDescription: 'Gestão Geral de SST e Riscos Psicossociais',
          riskGrade: 2,
          totalEmployees: companies.reduce((sum, c) => sum + (c.totalEmployees || 0), 0),
          cipaEstablished: true,
          hasSESMT: true,
          contactPerson: 'Gestão Corporativa de SST',
          contactEmail: 'gestao@sst.com.br',
          sectors: companies.flatMap((c) => c.sectors),
          address: {
            street: 'Múltiplas Unidades',
            number: '-',
            neighborhood: '-',
            city: 'Múltiplas Cidades',
            state: 'BR',
            cep: '00000-000',
          },
          createdAt: new Date().toISOString(),
        }
      : companies.find((c) => c.id === selectedCompanyId) ||
        companies[0] || {
          id: 'default-comp',
          tradeName: 'TechLog Soluções',
          corporateName: 'TechLog Soluções em Logística Ltda',
          cnpj: '18.442.907/0001-63',
          cnae: '6201-5/00',
          cnaeDescription: 'Tecnologia da Informação & Logística',
          riskGrade: 2,
          totalEmployees: 990,
          cipaEstablished: true,
          hasSESMT: true,
          contactPerson: 'Dra. Marina Toledo',
          contactEmail: 'marina.toledo@techlog.com.br',
          sectors: [],
          address: {
            street: 'Av. das Nações Unidas',
            number: '14200',
            neighborhood: 'Brooklin',
            city: 'São Paulo',
            state: 'SP',
            cep: '04794-000',
          },
          createdAt: new Date().toISOString(),
        };

  const handleOpenAnonymousSurvey = (token?: string) => {
    if (token) {
      setActiveSurveyToken(token);
    } else {
      const camp = campaigns.find((c) => c.companyId === selectedCompany.id) || campaigns[0];
      if (camp) {
        setActiveSurveyToken(camp.anonymousLinkToken);
        setActiveSurveyCampaignId(camp.id);
      }
    }
    setCurrentTab('anonymous-survey');
  };

  // If in anonymous survey mode, render full-screen worker questionnaire
  if (currentTab === 'anonymous-survey') {
    return (
      <AnonymousSurveyView
        token={activeSurveyToken || undefined}
        campaignId={activeSurveyCampaignId || undefined}
        onBackToDashboard={() => {
          window.location.hash = '';
          setActiveSurveyToken(null);
          setActiveSurveyCampaignId(null);
          setCurrentTab('dashboard');
          refreshData();
        }}
        onFinish={() => {
          refreshData();
        }}
      />
    );
  }

  // Count active badges
  const pendingActions = StorageService.getActionPlans().filter(
    (a) => a.approvalStatus === 'suggested' || a.approvalStatus === 'pending_technical' || a.approvalStatus === 'pending_management'
  ).length || 4;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Left Corporate Sidebar Rail */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        pendingAssessmentsCount={2}
        pendingActionsCount={pendingActions}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Corporate Navbar */}
        <Navbar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          companies={companies}
          selectedCompanyId={selectedCompany.id}
          onSelectCompany={handleSelectCompany}
          onOpenAnonymousSurvey={handleOpenAnonymousSurvey}
          technicalProfile={technicalProfile}
          onUpdateTechnicalProfile={(prof) => setTechnicalProfile(prof)}
          onRefreshData={refreshData}
        />

        {/* Widescreen Full-Canvas Main Container */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              key={`dashboard-${tabResetCounter}`}
              company={selectedCompany}
              companies={companies}
              onSelectCompany={handleSelectCompany}
              campaigns={campaigns}
              onOpenAnonymousSurvey={handleOpenAnonymousSurvey}
              onNavigateToTab={handleTabChange}
            />
          )}

          {currentTab === 'companies' && (
            <CompaniesView
              key={`companies-${tabResetCounter}`}
              companies={companies}
              selectedCompanyId={selectedCompany.id}
              onSelectCompany={handleSelectCompany}
              onRefreshData={refreshData}
            />
          )}

          {currentTab === 'assessments' && (
            <AssessmentsView
              key={`assessments-${tabResetCounter}`}
              company={selectedCompany}
              companies={companies}
              onSelectCompany={handleSelectCompany}
              campaigns={campaigns}
              onOpenAnonymousSurvey={handleOpenAnonymousSurvey}
              onRefreshData={refreshData}
              preselectedQuestionnaireId={selectedQuestionnaireForAssessment}
              onClearPreselectedQuestionnaire={() => setSelectedQuestionnaireForAssessment(null)}
            />
          )}

          {(currentTab === 'tests' || currentTab === 'questionnaires') && (
            <TestsLibraryView
              key={`tests-${tabResetCounter}`}
              onNavigateToAssessments={(questionnaireId) => {
                setSelectedQuestionnaireForAssessment(questionnaireId);
                handleTabChange('assessments');
              }}
              onRefreshData={refreshData}
            />
          )}

          {(currentTab === 'risk_matrix' || currentTab === 'risk-matrix') && (
            <RiskMatrixView
              key={`risk_matrix-${tabResetCounter}`}
              company={selectedCompany}
              companies={companies}
              onSelectCompany={handleSelectCompany}
              campaigns={campaigns}
              onNavigateToActionPlan={() => handleTabChange('action_plan')}
              onRefreshData={refreshData}
            />
          )}

          {(currentTab === 'action_plan' || currentTab === 'action-plan') && (
            <ActionPlanView
              key={`action_plan-${tabResetCounter}`}
              company={selectedCompany}
              companies={companies}
              onSelectCompany={handleSelectCompany}
              campaigns={campaigns}
              onRefreshData={refreshData}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              key={`reports-${tabResetCounter}`}
              company={selectedCompany}
              companies={companies}
              onSelectCompany={handleSelectCompany}
              campaigns={campaigns}
              technicalProfile={technicalProfile}
              onRefreshData={refreshData}
            />
          )}

          {currentTab === 'guide' && <GuideNR1View key={`guide-${tabResetCounter}`} />}

          {currentTab === 'settings' && (
            <SettingsView
              key={`settings-${tabResetCounter}`}
              technicalProfile={technicalProfile}
              onUpdateTechnicalProfile={(prof) => setTechnicalProfile(prof)}
              companies={companies}
              onRefreshData={refreshData}
            />
          )}
        </main>

        {/* Modern Compact Corporate Footer */}
        <footer className="bg-white border-t border-slate-200/90 py-3.5 text-xs text-slate-500 mt-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <span className="font-bold text-slate-900">PsicoGRO • NR-01</span>
              <span>Plataforma Corporativa de Gestão de Riscos Psicossociais & GRO</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Portaria MTE nº 1.419/2024</span>
              <span>COPSOQ II Validado</span>
              <span>Laudos com Validade Jurídica</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
