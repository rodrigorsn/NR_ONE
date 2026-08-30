import React, { useState, useMemo } from 'react';
import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  Sun,
  Video,
  UserCheck,
  Download,
  Upload,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Company, TechnicalInCharge } from '../types';
import { StorageService } from '../services/storageService';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  companies: Company[];
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  onOpenAnonymousSurvey: (campaignToken?: string) => void;
  technicalProfile: TechnicalInCharge;
  onUpdateTechnicalProfile: (profile: TechnicalInCharge) => void;
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  companies,
  selectedCompanyId,
  onSelectCompany,
  onOpenAnonymousSurvey,
  technicalProfile,
  onUpdateTechnicalProfile,
  onRefreshData,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [tempProfile, setTempProfile] = useState<TechnicalInCharge>(technicalProfile);

  const isAllSelected = selectedCompanyId === 'all';
  const selectedCompany = isAllSelected
    ? {
        id: 'all',
        tradeName: 'Todas as Empresas',
        corporateName: 'Visão Consolidada Multi-Empresas',
        cnpj: 'Consolidado Corporativo',
        cnae: 'Diversos',
        riskGrade: 2,
        totalEmployees: companies.reduce((sum, c) => sum + (c.totalEmployees || 0), 0),
        sectors: [],
      }
    : companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery.trim()) return companies;
    const q = companySearchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.tradeName.toLowerCase().includes(q) ||
        c.corporateName.toLowerCase().includes(q) ||
        c.cnpj.includes(q)
    );
  }, [companies, companySearchQuery]);

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PsicoGRO_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageService.importBackupJSON(content)) {
        alert('Backup importado com sucesso!');
        onRefreshData();
      } else {
        alert('Falha ao importar o arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveTechnicalProfile(tempProfile);
    onUpdateTechnicalProfile(tempProfile);
    setShowProfileModal(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 text-slate-800 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand + Company Switcher */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Brand Title */}
            <div
              onClick={() => onTabChange('dashboard')}
              className="cursor-pointer flex flex-col shrink-0"
            >
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  PsicoGRO
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 -mt-1 tracking-wide">
                NR-01 • COPSOQ II
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Company Selector Dropdown */}
            <div className="relative">
              <button
                id="company-selector-btn"
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition text-xs font-semibold max-w-[240px]"
                title="Selecionar Empresa Ativa"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <div className="text-left truncate">
                  <div className="font-bold text-slate-900 truncate leading-tight">
                    {selectedCompany.tradeName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate leading-tight">
                    {selectedCompany.cnpj}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
              </button>

              {showCompanyDropdown && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Filtrar empresa por nome ou CNPJ..."
                      value={companySearchQuery}
                      onChange={(e) => setCompanySearchQuery(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        onSelectCompany('all');
                        setShowCompanyDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between font-semibold transition ${
                        isAllSelected
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>🏢 Todas as Empresas (Consolidado)</span>
                      <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600">
                        {companies.length}
                      </span>
                    </button>

                    {filteredCompanies.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectCompany(c.id);
                          setShowCompanyDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCompanyId === c.id
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 truncate">{c.tradeName}</div>
                        <div className="text-[10px] text-slate-400">{c.cnpj}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar GHE, cargo, plano ou perigo..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch.trim()) {
                    onTabChange('action_plan');
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right: Actions, Notifications & User Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Presentation/Video Mode */}
            <button
              onClick={() => onTabChange('reports')}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition hidden sm:flex items-center justify-center"
              title="Apresentar Laudo Executivo / Modo Reunião"
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Sun/Theme Toggle placeholder */}
            <button
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition hidden sm:flex items-center justify-center"
              title="Modo de Visualização Corporativo"
            >
              <Sun className="w-4 h-4" />
            </button>

            {/* Notifications with badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center justify-center"
                title="Notificações e Pendências de Aprovação"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                  4
                </span>
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">Pendências do Ciclo GRO</span>
                    <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full">
                      4 Ações
                    </span>
                  </div>
                  <div className="py-2 space-y-2">
                    <div
                      onClick={() => {
                        setShowNotificationsDropdown(false);
                        onTabChange('action_plan');
                      }}
                      className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100/80 cursor-pointer transition border border-amber-200/80"
                    >
                      <div className="font-bold text-amber-900">4 Ações Pendentes de Homologação</div>
                      <div className="text-[11px] text-amber-700">
                        Medidas aguardando validação técnica e homologação no PGR oficial.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile Badge */}
            <div className="relative">
              <button
                id="technical-profile-btn"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition text-left"
                title="Perfil Técnico do Responsável (NR-1)"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-xs border border-teal-300">
                  MT
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {technicalProfile.name || 'Dra. Marina Toledo'}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {technicalProfile.role || 'Psicóloga do Trabalho / Consultora SST'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Responsável Técnico */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Responsável Técnico Legal (NR-1)
                </h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Nome Completo do Profissional
                </label>
                <input
                  type="text"
                  required
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Cargo / Função</label>
                <input
                  type="text"
                  required
                  value={tempProfile.role}
                  onChange={(e) => setTempProfile({ ...tempProfile, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Conselho Profissional
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CRP, CRM, CREA"
                    value={tempProfile.professionalCouncil}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, professionalCouncil: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Número de Registro
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 06/123456"
                    value={tempProfile.registrationNumber}
                    onChange={(e) =>
                      setTempProfile({ ...tempProfile, registrationNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 underline"
                  >
                    <Download className="w-3 h-3" />
                    Backup JSON
                  </button>
                  <label className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 underline cursor-pointer">
                    <Upload className="w-3 h-3" />
                    Restaurar
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs"
                  >
                    Salvar Dados
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
