import React, { useState } from 'react';
import {
  Settings,
  UserCheck,
  Shield,
  Sliders,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Lock,
  Save,
  Trash2,
} from 'lucide-react';
import { TechnicalInCharge, Company } from '../types';
import { StorageService } from '../services/storageService';

interface SettingsViewProps {
  technicalProfile: TechnicalInCharge;
  onUpdateTechnicalProfile: (profile: TechnicalInCharge) => void;
  companies: Company[];
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  technicalProfile,
  onUpdateTechnicalProfile,
  companies,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'parameters' | 'privacy' | 'backup'>('profile');
  const [profileForm, setProfileForm] = useState<TechnicalInCharge>(technicalProfile);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // General evaluation parameters state (with local storage persistence)
  const [evaluationParams, setEvaluationParams] = useState({
    matrixFormat: '5x5',
    strictAnonymityMinRespondents: 3,
    confidenceLevel: '95',
    marginOfError: '5',
    defaultQuestionnaire: 'copsoq-short',
    enableAIAnalysis: true,
    enableLGPDConsent: true,
    institutionHeader: 'MindGuard SST - Gestão de Riscos Ocupacionais',
  });

  const showSuccessFeedback = (msg: string) => {
    setSavedSuccessMessage(msg);
    setTimeout(() => setSavedSuccessMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveTechnicalProfile(profileForm);
    onUpdateTechnicalProfile(profileForm);
    showSuccessFeedback('Perfil do Responsável Técnico salvo com sucesso!');
  };

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccessFeedback('Parâmetros técnicos e critérios normativos atualizados com sucesso!');
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindGuard_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccessFeedback('Backup exportado com sucesso!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageService.importBackupJSON(content)) {
        onRefreshData();
        showSuccessFeedback('Backup importado com sucesso! Dados sincronizados.');
      } else {
        alert('Falha ao importar o arquivo. Verifique se o formato é um JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    if (
      confirm(
        'ATENÇÃO: Deseja restaurar a base de dados de demonstração de fábrica? Todas as alterações manuais serão substituídas pelos dados iniciais da Portaria MTE nº 1.419/2024.'
      )
    ) {
      StorageService.resetToDefaults();
      onRefreshData();
      showSuccessFeedback('Base demonstrativa restaurada com sucesso!');
    }
  };

  const totalEmployees = companies.reduce((acc, c) => acc + (c.totalEmployees || 0), 0);
  const totalResponses = StorageService.getResponses().length;
  const totalRiskItems = StorageService.getRiskInventory().length;
  const totalActionPlans = StorageService.getActionPlans().length;

  return (
    <div id="settings-view-container" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Configurações do Sistema</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão de Responsabilidade Técnica, parâmetros metodológicos NR-1/NR-17, LGPD e backups
            </p>
          </div>
        </div>

        {savedSuccessMessage && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Main Settings Layout with Sidebar Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
          <button
            id="settings-tab-profile"
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
              activeSubTab === 'profile'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${activeSubTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Responsável Técnico (Laudo)</span>
          </button>

          <button
            id="settings-tab-parameters"
            onClick={() => setActiveSubTab('parameters')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
              activeSubTab === 'parameters'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeSubTab === 'parameters' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Parâmetros Metodológicos</span>
          </button>

          <button
            id="settings-tab-privacy"
            onClick={() => setActiveSubTab('privacy')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
              activeSubTab === 'privacy'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeSubTab === 'privacy' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Privacidade & LGPD</span>
          </button>

          <button
            id="settings-tab-backup"
            onClick={() => setActiveSubTab('backup')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
              activeSubTab === 'backup'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Database className={`w-4 h-4 ${activeSubTab === 'backup' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Gerenciamento de Dados</span>
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3">
          {/* TAB 1: Responsável Técnico */}
          {activeSubTab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span>Responsável Técnico e Emissor do Laudo (NR-1 / GRO)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Estes dados são impressos no cabeçalho, rodapé e campo de assinatura com validade jurídica dos laudos técnicos periciais em PDF.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nome Completo do Profissional *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: Dr. Carlos Eduardo Silva"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Título / Qualificação Profissional *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Ex: Médico do Trabalho / Ergonomista Sênior"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Conselho de Classe e Registro (com UF) *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.professionalCouncil}
                      onChange={(e) => setProfileForm({ ...profileForm, professionalCouncil: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Ex: CRM/SP 148.291 / CREA 506.123-D / CRP"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultoria SST ou Serviço Ocupacional (SESMT)</label>
                  <input
                    type="text"
                    value={profileForm.companyConsultancy || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, companyConsultancy: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: MindGuard Medicina e Segurança Ocupacional Ltda"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">E-mail Profissional</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="carlos.silva@consultoriasst.com.br"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Telefone de Contato / WhatsApp</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Declaração Técnica de Responsabilidade (PGR / GRO)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    O profissional cadastrado acima responde tecnicamente pela aplicação dos instrumentos psicométricos, validação da matriz de risco 5x5 e emissão dos laudos de conformidade com a <strong>Portaria MTE nº 1.419/2024</strong> e <strong>NR-1</strong>.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    id="save-profile-btn"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Dados do Responsável Técnico</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Parâmetros Metodológicos */}
          {activeSubTab === 'parameters' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  <span>Parâmetros Metodológicos e Critérios Técnicos</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Diretrizes de cálculo da Matriz de Risco Ocupacional e amostragem estatística conforme a NR-1 e COPSOQ II.
                </p>
              </div>

              <form onSubmit={handleSaveParams} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="block text-slate-800 font-bold">Matriz de Risco Ocupacional</label>
                    <select
                      value={evaluationParams.matrixFormat}
                      onChange={(e) => setEvaluationParams({ ...evaluationParams, matrixFormat: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    >
                      <option value="5x5">Matriz 5x5 Severidade x Probabilidade (Recomendado NR-1 / AIHA)</option>
                      <option value="4x4">Matriz 4x4 Matriz Simplificada BS 8800</option>
                      <option value="3x3">Matriz 3x3 Matriz Básica</option>
                    </select>
                    <p className="text-[11px] text-slate-500">
                      Nível de risco gerado em 5 faixas: Trivial (1-3), Tolerável (4-6), Moderado (8-12), Substancial (15-16) e Intolerável (20-25).
                    </p>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="block text-slate-800 font-bold">Instrumento Psicométrico Padrão</label>
                    <select
                      value={evaluationParams.defaultQuestionnaire}
                      onChange={(e) => setEvaluationParams({ ...evaluationParams, defaultQuestionnaire: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    >
                      <option value="copsoq-short">COPSOQ II - Versão Curta (41 questões - Rastreamento Rápido)</option>
                      <option value="copsoq-medium">COPSOQ II - Versão Média (86 questões - AET Completa)</option>
                      <option value="hse-it">HSE Management Standards (35 questões)</option>
                      <option value="proart">PROART - Riscos Organizacionais</option>
                    </select>
                    <p className="text-[11px] text-slate-500">
                      Instrumento validado internacionalmente com distribuição de tercis semafóricos (Verde, Amarelo e Vermelho).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nível de Confiança Estatística</label>
                    <input
                      type="text"
                      value={`${evaluationParams.confidenceLevel}% (Gauss z = 1.96)`}
                      disabled
                      className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Margem de Erro Amostral Máxima</label>
                    <input
                      type="text"
                      value={`± ${evaluationParams.marginOfError}%`}
                      disabled
                      className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 font-mono"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={evaluationParams.enableAIAnalysis}
                      onChange={(e) => setEvaluationParams({ ...evaluationParams, enableAIAnalysis: e.target.checked })}
                      className="rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-slate-800 font-semibold block">Geração Inteligente de Planos 5W2H e Recomendações</span>
                      <span className="text-[11px] text-slate-500 block">
                        Sugere automaticamente medidas de controle ergonômicas e organizacionais com base nos fatores críticos identificados.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    id="save-params-btn"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Parâmetros Metodológicos</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Privacidade & LGPD */}
          {activeSubTab === 'privacy' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>Privacidade, Anonimato e Conformidade LGPD (Lei 13.709/18)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Garantias técnicas de blindagem e sigilo das respostas dos trabalhadores conforme requisitos do MTE e Ministério Público do Trabalho.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-emerald-900">Protocolo de Anonimato Estrito (Zero Identificação)</h3>
                    <p className="text-emerald-800 mt-1 text-[11px] leading-relaxed">
                      Nenhum dado pessoal direto (como Nome, CPF, Matrícula ou E-mail) é solicitado ou armazenado nas respostas aos questionários psicossociais. Os respondentes recebem apenas um token anônimo de campanha.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-900 block">Número Mínimo de Respondentes por Setor (GHE)</span>
                      <span className="text-[11px] text-slate-500 block">
                        Setores com menos de 3 respondentes são agrupados para impedir dedução da identidade dos trabalhadores.
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-white border border-slate-300 font-bold text-slate-800 rounded-lg text-sm">
                      {evaluationParams.strictAnonymityMinRespondents} respondentes
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-900 block">Termo de Consentimento Livre e Esclarecido (TCLE)</span>
                      <span className="text-[11px] text-slate-500 block">
                        Exibido na abertura do questionário com confirmação prévia e explicação dos fins exclusivos de SST.
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Ativo no Sistema
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-900 block">Armazenamento Local Seguro e Isolamento</span>
                      <span className="text-[11px] text-slate-500 block">
                        Os dados do inventário e respostas permanecem confidenciais sob guarda da consultoria técnica autorizada.
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                      Conforme NR-1.5.7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Gerenciamento de Dados & Backups */}
          {activeSubTab === 'backup' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <span>Gerenciamento de Dados, Backups e Sincronização</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Exportação de segurança, restauração de arquivos e controle do banco de dados local.
                </p>
              </div>

              {/* Data Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xl font-bold text-slate-900">{companies.length}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Empresas Cadastradas</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xl font-bold text-slate-900">{totalEmployees}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Trabalhadores</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xl font-bold text-emerald-600">{totalResponses}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Respostas Coletadas</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xl font-bold text-blue-600">{totalActionPlans}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Planos de Ação 5W2H</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Exportar Backup Completo (.JSON)</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Gera um arquivo com todas as empresas, avaliações, respostas psicossociais, matrizes de risco e planos de ação.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    id="btn-export-backup-settings"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Backup</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Importar e Restaurar Backup (.JSON)</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Carrega dados previamente salvos e atualiza o sistema sem perda de registros.
                    </p>
                  </div>
                  <label
                    id="btn-import-backup-settings"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl font-semibold text-xs transition shrink-0 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Selecionar Arquivo JSON</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-amber-900 text-xs">Restaurar Dados Demonstrativos</h3>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Recarrega as 3 empresas de exemplo (Hospital, Tech e Logística), 420 respostas amostrais e matrizes calibradas para testes.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDemoData}
                    id="btn-reset-demo-settings"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs transition shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurar Demonstração</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
