import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
  Layers,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Company, SectorGHE } from '../types';
import { StorageService } from '../services/storageService';

interface CompaniesViewProps {
  companies: Company[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  onRefreshData: () => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Company>>({
    tradeName: '',
    corporateName: '',
    cnpj: '',
    cnae: '',
    cnaeDescription: '',
    riskGrade: 2,
    totalEmployees: 50,
    cipaEstablished: true,
    hasSESMT: false,
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      cep: '',
    },
    sectors: [
      {
        id: 'sec-new-1',
        name: 'Administrativo & Financeiro',
        description: 'Atividades gerais de escritório e gestão',
        employeeCount: 15,
        workRegime: 'Presencial',
      },
      {
        id: 'sec-new-2',
        name: 'Operacional / Produção',
        description: 'Atividades operacionais diretas',
        employeeCount: 35,
        workRegime: 'Turnos/Escala',
      },
    ],
  });

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      tradeName: '',
      corporateName: '',
      cnpj: '',
      cnae: '',
      cnaeDescription: '',
      riskGrade: 2,
      totalEmployees: 50,
      cipaEstablished: true,
      hasSESMT: false,
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: 'SP',
        cep: '',
      },
      sectors: [
        {
          id: `sec-${Date.now()}-1`,
          name: 'Administrativo & Financeiro',
          description: 'Atividades de escritório',
          employeeCount: 15,
          workRegime: 'Presencial',
        },
      ],
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormData(JSON.parse(JSON.stringify(company)));
    setShowModal(true);
  };

  const handleAddSectorToForm = () => {
    const sectors = formData.sectors || [];
    setFormData({
      ...formData,
      sectors: [
        ...sectors,
        {
          id: `sec-${Date.now()}`,
          name: 'Novo Setor / GHE',
          description: 'Descrição das atividades laborais',
          employeeCount: 10,
          workRegime: 'Presencial',
        },
      ],
    });
  };

  const handleRemoveSector = (index: number) => {
    const sectors = [...(formData.sectors || [])];
    sectors.splice(index, 1);
    setFormData({ ...formData, sectors });
  };

  const handleUpdateSector = (index: number, field: keyof SectorGHE, value: any) => {
    const sectors = [...(formData.sectors || [])];
    sectors[index] = { ...sectors[index], [field]: value };
    setFormData({ ...formData, sectors });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tradeName || !formData.cnpj) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const companyToSave: Company = {
      id: editingCompany ? editingCompany.id : `comp-${Date.now()}`,
      corporateName: formData.corporateName || formData.tradeName!,
      tradeName: formData.tradeName!,
      cnpj: formData.cnpj!,
      cnae: formData.cnae || '00.00-0-00',
      cnaeDescription: formData.cnaeDescription || 'Atividades Gerais',
      riskGrade: (formData.riskGrade as any) || 2,
      totalEmployees: Number(formData.totalEmployees) || 1,
      cipaEstablished: !!formData.cipaEstablished,
      hasSESMT: !!formData.hasSESMT,
      contactPerson: formData.contactPerson || '',
      contactEmail: formData.contactEmail || '',
      contactPhone: formData.contactPhone || '',
      address: {
        street: formData.address?.street || '',
        number: formData.address?.number || '',
        neighborhood: formData.address?.neighborhood || '',
        city: formData.address?.city || '',
        state: formData.address?.state || 'SP',
        cep: formData.address?.cep || '',
      },
      sectors: formData.sectors || [],
      createdAt: editingCompany ? editingCompany.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveCompany(companyToSave);
    if (!editingCompany) {
      StorageService.setSelectedCompanyId(companyToSave.id);
      onSelectCompany(companyToSave.id);
    }
    setShowModal(false);
    onRefreshData();
  };

  const handleDeleteCompany = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a empresa "${name}"?`)) {
      StorageService.deleteCompany(id);
      onRefreshData();
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.corporateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Empresas & Estabelecimentos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre e gerencie as empresas clientes atendidas pelo serviço de SST, com seus respectivos setores (GHE)
          </p>
        </div>
        <button
          id="add-company-btn"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Empresa</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por Nome Fantasia, Razão Social ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((comp) => {
          const isSelected = comp.id === selectedCompanyId;
          const campaignsCount = StorageService.getCampaigns(comp.id).length;
          const responsesCount = StorageService.getResponses().filter((r) => r.companyId === comp.id).length;

          return (
            <div
              key={comp.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-600/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Grau de Risco {comp.riskGrade} (NR-4)
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 line-clamp-1">
                      {comp.tradeName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{comp.cnpj}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(comp)}
                      title="Editar Empresa"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {companies.length > 1 && (
                      <button
                        onClick={() => handleDeleteCompany(comp.id, comp.tradeName)}
                        title="Excluir Empresa"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* CNAE & Details */}
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="line-clamp-1">CNAE: {comp.cnae} - {comp.cnaeDescription}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{comp.address.city}/{comp.address.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{comp.totalEmployees} trabalhadores • {comp.sectors.length} setores (GHE)</span>
                  </div>
                </div>

                {/* Setores Preview */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Setores Avaliados (GHE)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.sectors.map((sec) => (
                      <span
                        key={sec.id}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                      >
                        {sec.name.split('/')[0]} ({sec.employeeCount})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Select Button */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {campaignsCount} campanhas • {responsesCount} respostas
                </span>

                <button
                  id={`select-company-${comp.id}`}
                  onClick={() => {
                    StorageService.setSelectedCompanyId(comp.id);
                    onSelectCompany(comp.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Empresa Ativa</span>
                    </>
                  ) : (
                    <span>Selecionar</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro / Edição de Empresa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 text-slate-900 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">
                  {editingCompany ? 'Editar Empresa Cliente' : 'Cadastrar Nova Empresa Cliente'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Seção 1: Dados Jurídicos */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1">
                  1. Informações Cadastrais e Enquadramento NR-1 / NR-4
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Nome Fantasia *</label>
                    <input
                      type="text"
                      required
                      value={formData.tradeName || ''}
                      onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                      placeholder="Ex: TechLog Express"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Razão Social *</label>
                    <input
                      type="text"
                      required
                      value={formData.corporateName || ''}
                      onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                      placeholder="Ex: TechLog Soluções em Logística S.A."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">CNPJ *</label>
                    <input
                      type="text"
                      required
                      value={formData.cnpj || ''}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">CNAE Principal</label>
                    <input
                      type="text"
                      value={formData.cnae || ''}
                      onChange={(e) => setFormData({ ...formData, cnae: e.target.value })}
                      placeholder="Ex: 52.29-0-99"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Grau de Risco (NR-4)</label>
                    <select
                      value={formData.riskGrade || 2}
                      onChange={(e) => setFormData({ ...formData, riskGrade: Number(e.target.value) as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value={1}>Grau 1 (Risco Baixo)</option>
                      <option value={2}>Grau 2 (Risco Médio)</option>
                      <option value={3}>Grau 3 (Risco Alto)</option>
                      <option value={4}>Grau 4 (Risco Máximo)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Descrição da Atividade Econômica</label>
                  <input
                    type="text"
                    value={formData.cnaeDescription || ''}
                    onChange={(e) => setFormData({ ...formData, cnaeDescription: e.target.value })}
                    placeholder="Descrição da atividade do CNAE"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Total de Trabalhadores</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.totalEmployees || 10}
                      onChange={(e) => setFormData({ ...formData, totalEmployees: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="cipa-check"
                      checked={formData.cipaEstablished}
                      onChange={(e) => setFormData({ ...formData, cipaEstablished: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="cipa-check" className="text-slate-700 font-medium cursor-pointer">
                      Possui CIPA Instalada (NR-5)
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="sesmt-check"
                      checked={formData.hasSESMT}
                      onChange={(e) => setFormData({ ...formData, hasSESMT: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="sesmt-check" className="text-slate-700 font-medium cursor-pointer">
                      Possui SESMT Próprio
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção 2: Localização e Contato */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1">
                  2. Localização do Estabelecimento e Contato
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={formData.address?.street || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, street: e.target.value },
                        })
                      }
                      placeholder="Av. Paulista"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Número</label>
                    <input
                      type="text"
                      value={formData.address?.number || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, number: e.target.value },
                        })
                      }
                      placeholder="1000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, city: e.target.value },
                        })
                      }
                      placeholder="São Paulo"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Estado (UF)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.address?.state || 'SP'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, state: e.target.value.toUpperCase() },
                        })
                      }
                      placeholder="SP"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Pessoa de Contato na Empresa</label>
                    <input
                      type="text"
                      value={formData.contactPerson || ''}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Nome do Gestor / RH"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Setores / Grupos Homogêneos de Exposição (GHE) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    3. Setores / Grupos Homogêneos de Exposição (GHE)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSectorToForm}
                    className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Setor</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(formData.sectors || []).map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="md:col-span-5">
                        <label className="block text-[10px] text-slate-500 uppercase font-semibold">Nome do Setor / Função</label>
                        <input
                          type="text"
                          required
                          value={sec.name}
                          onChange={(e) => handleUpdateSector(idx, 'name', e.target.value)}
                          placeholder="Ex: Atendimento SAC / Operação"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] text-slate-500 uppercase font-semibold">Regime de Trabalho</label>
                        <select
                          value={sec.workRegime}
                          onChange={(e) => handleUpdateSector(idx, 'workRegime', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                        >
                          <option value="Presencial">Presencial</option>
                          <option value="Híbrido">Híbrido</option>
                          <option value="Remoto">Remoto</option>
                          <option value="Turnos/Escala">Turnos / Escala</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] text-slate-500 uppercase font-semibold">Nº Trabalhadores</label>
                        <input
                          type="number"
                          min={1}
                          value={sec.employeeCount}
                          onChange={(e) => handleUpdateSector(idx, 'employeeCount', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-center pt-3 md:pt-0">
                        {formData.sectors!.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSector(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition"
                            title="Remover Setor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs"
                >
                  {editingCompany ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
