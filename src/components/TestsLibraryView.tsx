import React, { useState, useMemo, useRef } from 'react';
import {
  ClipboardCheck,
  Plus,
  Upload,
  Download,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  FileText,
  Copy,
  Trash2,
  Edit3,
  Eye,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Layers,
  Clock,
  BookOpen,
  Check,
  BarChart3,
  Smile,
  Meh,
  Frown,
  Send,
  MoveUp,
  MoveDown,
  Info,
  ShieldCheck,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import {
  QuestionnaireTemplate,
  QuestionnaireQuestion,
  QuestionnaireDimension,
  QuestionResponseType,
} from '../types';
import { StorageService } from '../services/storageService';
import {
  COPSOQ_SHORT_TEMPLATE,
  COPSOQ_MEDIUM_TEMPLATE,
  COPSOQ_LONG_TEMPLATE,
  SAMPLE_CSV_TEMPLATE,
  SAMPLE_JSON_TEMPLATE,
  parseQuestionnaireCSV,
  parseQuestionnaireJSON,
  exportQuestionnaireToCSV,
} from '../data/questionnairesLibrary';
import { COPSOQ_SCALE_LABELS } from '../data/copsoqQuestions';

interface TestsLibraryViewProps {
  onNavigateToAssessments?: (selectedQuestionnaireId?: string) => void;
  onRefreshData?: () => void;
}

export const TestsLibraryView: React.FC<TestsLibraryViewProps> = ({
  onNavigateToAssessments,
  onRefreshData,
}) => {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireTemplate[]>(() =>
    StorageService.getQuestionnaires()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'standard' | 'custom' | 'imported'>('all');
  const [applicationFilter, setApplicationFilter] = useState<string>('all');

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState<QuestionnaireTemplate | null>(null);
  const [showSimulatorModal, setShowSimulatorModal] = useState<QuestionnaireTemplate | null>(null);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<QuestionnaireTemplate | null>(null);

  // Estados de Formulário do Construtor de Questionário (Criar / Editar)
  const [builderTab, setBuilderTab] = useState<'general' | 'dimensions' | 'questions'>('general');
  const [formData, setFormData] = useState<{
    id: string;
    code: string;
    title: string;
    subtitle: string;
    description: string;
    version: string;
    author: string;
    targetApplication: string;
    estimatedMinutes: number;
    tags: string;
    dimensions: QuestionnaireDimension[];
    questions: QuestionnaireQuestion[];
    scoringMethod: 'copsoq_tercils' | 'custom_rules' | 'percentage' | 'yes_no_count';
  }>({
    id: '',
    code: '',
    title: '',
    subtitle: '',
    description: '',
    version: '1.0',
    author: '',
    targetApplication: 'Triagem Rápida / AEP (NR-1)',
    estimatedMinutes: 8,
    tags: 'NR-1, AEP, Psicossocial',
    dimensions: [
      {
        code: 'EXIG_LABORAIS',
        title: 'Exigências e Ritmo de Trabalho',
        category: 'EXIGÊNCIAS LABORAIS',
        isFavorableHigh: false,
        nr1Category: 'Organização do Trabalho',
      },
      {
        code: 'RELACOES_SOCIAIS',
        title: 'Relações Sociais e Liderança',
        category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
        isFavorableHigh: true,
        nr1Category: 'Relações Interpessoais',
      },
    ],
    questions: [],
    scoringMethod: 'custom_rules',
  });

  // Estados de Importação de Arquivo
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Partial<QuestionnaireTemplate> | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do Simulador / Test Drive
  const [simAnswers, setSimAnswers] = useState<Record<number, any>>({});
  const [simCurrentPage, setSimCurrentPage] = useState(0);
  const [simCompleted, setSimCompleted] = useState(false);
  const simQuestionsPerPage = 6;

  // Atualiza lista do storage
  const reloadData = () => {
    const fresh = StorageService.getQuestionnaires();
    setQuestionnaires(fresh);
    if (onRefreshData) onRefreshData();
  };

  // Filtragem de questionários
  const filteredQuestionnaires = useMemo(() => {
    return questionnaires.filter((q) => {
      // Filtro de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesSub = q.subtitle?.toLowerCase().includes(query);
        const matchesCode = q.code.toLowerCase().includes(query);
        const matchesAuthor = q.author?.toLowerCase().includes(query);
        const matchesTags = q.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesQuestion = q.questions?.some((qu) => qu.text.toLowerCase().includes(query));
        if (!matchesTitle && !matchesSub && !matchesCode && !matchesAuthor && !matchesTags && !matchesQuestion) {
          return false;
        }
      }

      // Filtro de tipo
      if (typeFilter !== 'all' && q.type !== typeFilter) {
        return false;
      }

      // Filtro de aplicação
      if (applicationFilter !== 'all') {
        if (applicationFilter === 'aep' && !q.targetApplication?.toLowerCase().includes('aep')) {
          return false;
        }
        if (applicationFilter === 'aet' && !q.targetApplication?.toLowerCase().includes('aet')) {
          return false;
        }
        if (applicationFilter === 'pesquisa' && !q.targetApplication?.toLowerCase().includes('pesquisa') && !q.targetApplication?.toLowerCase().includes('auditoria')) {
          return false;
        }
      }

      return true;
    });
  }, [questionnaires, searchQuery, typeFilter, applicationFilter]);

  // Estatísticas do topo
  const totalQuestionnaires = questionnaires.length;
  const standardCount = questionnaires.filter((q) => q.type === 'standard').length;
  const customCount = questionnaires.filter((q) => q.type === 'custom' || q.type === 'imported').length;
  const totalQuestionsCataloged = questionnaires.reduce((sum, q) => sum + (q.itemCount || q.questions?.length || 0), 0);

  // Abertura do Construtor para Novo Questionário
  const handleOpenNewBuilder = () => {
    setEditingQuestionnaire(null);
    setFormData({
      id: `custom-${Date.now()}`,
      code: `TESTE-SST-${Date.now().toString().slice(-4)}`,
      title: 'Novo Questionário de Avaliação Psicossocial',
      subtitle: 'Instrumento customizado para diagnóstico ergonômico e psicossocial',
      description: 'Questionário personalizado para levantamento de fatores de risco psicossociais no trabalho.',
      version: '1.0',
      author: 'Equipe de SST e Ergonomia',
      targetApplication: 'AEP - Avaliação Ergonômica Preliminar (NR-1)',
      estimatedMinutes: 6,
      tags: 'Personalizado, NR-1, AEP, Ergonomia',
      dimensions: [
        {
          code: 'EXIG_LABORAIS',
          title: 'Exigências e Ritmo de Trabalho',
          category: 'EXIGÊNCIAS LABORAIS',
          isFavorableHigh: false,
          nationalBenchmark: 2.8,
          riskFactorDescription: 'Sobrecarga e pressão temporal',
          nr1Category: 'Organização do Trabalho',
        },
        {
          code: 'RELACOES_SOCIAIS',
          title: 'Relações Sociais e Liderança',
          category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
          isFavorableHigh: true,
          nationalBenchmark: 3.5,
          riskFactorDescription: 'Suporte de superiores e cooperação',
          nr1Category: 'Relações Interpessoais',
        },
        {
          code: 'CONDICOES_FISICAS',
          title: 'Condições de Trabalho e Conforto',
          category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
          isFavorableHigh: true,
          nationalBenchmark: 3.2,
          riskFactorDescription: 'Mobiliário, iluminação e ruído',
          nr1Category: 'Condições Ergonômicas',
        },
      ],
      questions: [
        {
          id: 1,
          code: 'Q01',
          text: 'Com que frequência você sente que tem tempo hábil para executar as tarefas com qualidade e segurança?',
          dimensionCode: 'EXIG_LABORAIS',
          dimensionTitle: 'Exigências e Ritmo de Trabalho',
          category: 'EXIGÊNCIAS LABORAIS',
          responseType: 'likert_copsoq',
          scaleType: 'frequency',
          isRequired: true,
        },
        {
          id: 2,
          code: 'Q02',
          text: 'Você recebe apoio e orientações claras da chefia imediata diante de imprevistos na rotina?',
          dimensionCode: 'RELACOES_SOCIAIS',
          dimensionTitle: 'Relações Sociais e Liderança',
          category: 'RELAÇÕES SOCIAIS E LIDERANÇA',
          responseType: 'likert_copsoq',
          scaleType: 'frequency',
          isRequired: true,
        },
        {
          id: 3,
          code: 'Q03',
          text: 'O seu posto de trabalho dispõe de equipamentos e mobiliário com regulagens ergonômicas adequadas?',
          dimensionCode: 'CONDICOES_FISICAS',
          dimensionTitle: 'Condições de Trabalho e Conforto',
          category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
          responseType: 'yes_no',
          scaleType: 'yes_no',
          isRequired: true,
        },
        {
          id: 4,
          code: 'Q04',
          text: 'Descreva aqui eventuais situações de tensão, atritos ou melhorias necessárias no seu setor:',
          dimensionCode: 'CONDICOES_FISICAS',
          dimensionTitle: 'Condições de Trabalho e Conforto',
          category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
          responseType: 'text_description',
          placeholder: 'Espaço aberto e sigiloso para observações e sugestões de melhoria...',
          isRequired: false,
        },
      ],
      scoringMethod: 'custom_rules',
    });
    setBuilderTab('general');
    setShowCreateModal(true);
  };

  // Abertura do Construtor para Edição de Questionário Existente
  const handleOpenEditBuilder = (template: QuestionnaireTemplate) => {
    setEditingQuestionnaire(template);
    setFormData({
      id: template.id,
      code: template.code,
      title: template.title,
      subtitle: template.subtitle,
      description: template.description,
      version: template.version,
      author: template.author,
      targetApplication: template.targetApplication,
      estimatedMinutes: template.estimatedMinutes,
      tags: template.tags?.join(', ') || '',
      dimensions: template.dimensions || [],
      questions: template.questions.map((q) => ({ ...q })),
      scoringMethod: template.scoringMethod || 'custom_rules',
    });
    setBuilderTab('general');
    setShowCreateModal(true);
  };

  // Salvar Questionário Customizado
  const handleSaveQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Informe o título do questionário.');
      return;
    }
    if (formData.questions.length === 0) {
      alert('Adicione pelo menos uma pergunta ao questionário antes de salvar.');
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const savedTemplate: QuestionnaireTemplate = {
      id: formData.id || `custom-${Date.now()}`,
      code: formData.code || `TESTE-${Date.now().toString().slice(-4)}`,
      title: formData.title,
      subtitle: formData.subtitle || `${formData.questions.length} questões psicossociais`,
      description: formData.description,
      version: formData.version || '1.0',
      author: formData.author || 'Equipe SST',
      type: editingQuestionnaire ? editingQuestionnaire.type : 'custom',
      itemCount: formData.questions.length,
      dimensionsCount: formData.dimensions.length || 1,
      estimatedMinutes: formData.estimatedMinutes || Math.max(3, Math.round(formData.questions.length * 0.35)),
      targetApplication: formData.targetApplication,
      tags: tagsArray.length > 0 ? tagsArray : ['Personalizado', 'NR-1'],
      dimensions: formData.dimensions,
      questions: formData.questions,
      scoringMethod: formData.scoringMethod,
      createdAt: editingQuestionnaire ? editingQuestionnaire.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveCustomQuestionnaire(savedTemplate);
    reloadData();
    setShowCreateModal(false);
  };

  // Duplicar / Clonar Questionário
  const handleDuplicate = (template: QuestionnaireTemplate) => {
    try {
      const cloned = StorageService.duplicateQuestionnaire(template.id);
      reloadData();
      alert(`Questionário duplicado com sucesso: "${cloned.title}"! Agora você pode editá-lo.`);
    } catch (err: any) {
      alert(`Erro ao duplicar questionário: ${err.message || err}`);
    }
  };

  // Excluir Questionário Customizado
  const handleDelete = (template: QuestionnaireTemplate) => {
    if (template.type === 'standard') {
      alert('Questionários padrão COPSOQ II oficiais não podem ser excluídos. Você pode duplicá-los para criar uma versão personalizada.');
      return;
    }

    if (window.confirm(`Tem certeza de que deseja excluir o questionário "${template.title}"? Esta ação não pode ser desfeita.`)) {
      StorageService.deleteCustomQuestionnaire(template.id);
      reloadData();
    }
  };

  // Exportar Questionário em JSON
  const handleExportJSON = (template: QuestionnaireTemplate) => {
    const jsonStr = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Questionario_${template.code || template.id}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exportar Questionário em CSV
  const handleExportCSV = (template: QuestionnaireTemplate) => {
    const csvStr = exportQuestionnaireToCSV(template);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Questionario_${template.code || template.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Baixar Modelo de Exemplo (JSON ou CSV)
  const handleDownloadSample = (format: 'json' | 'csv') => {
    if (format === 'csv') {
      const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Modelo_Template_Questionario_PsicoGRO.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonStr = JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Modelo_Template_Questionario_PsicoGRO.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Processamento de Arquivo de Upload
  const handleFileProcess = (file: File) => {
    setImportFile(file);
    setImportError(null);
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setImportError('Não foi possível ler o conteúdo do arquivo selecionado.');
        return;
      }

      if (file.name.endsWith('.json')) {
        const res = parseQuestionnaireJSON(content);
        if (res.success && res.template) {
          setImportPreview(res.template);
        } else {
          setImportError(res.error || 'Erro ao processar JSON.');
        }
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const res = parseQuestionnaireCSV(content);
        if (res.success && res.template) {
          setImportPreview(res.template);
        } else {
          setImportError(res.error || 'Erro ao processar CSV.');
        }
      } else {
        setImportError('Formato não suportado. Utilize arquivos .json ou .csv.');
      }
    };
    reader.readAsText(file);
  };

  // Confirmar Importação de Arquivo
  const handleConfirmImport = () => {
    if (!importPreview || !importPreview.questions || importPreview.questions.length === 0) {
      alert('Nenhum questionário válido para importar.');
      return;
    }

    const templateToSave: QuestionnaireTemplate = {
      id: `imported-${Date.now()}`,
      code: importPreview.code || `IMP-${Date.now().toString().slice(-4)}`,
      title: importPreview.title || 'Questionário Importado',
      subtitle: importPreview.subtitle || `${importPreview.questions.length} questões`,
      description: importPreview.description || 'Questionário importado com sucesso para a biblioteca.',
      version: importPreview.version || '1.0 Importado',
      author: importPreview.author || 'Importado pelo Usuário',
      type: 'imported',
      itemCount: importPreview.questions.length,
      dimensionsCount: importPreview.dimensions?.length || 1,
      estimatedMinutes: importPreview.estimatedMinutes || Math.max(3, Math.round(importPreview.questions.length * 0.35)),
      targetApplication: importPreview.targetApplication || 'Diagnóstico Personalizado / NR-1',
      tags: importPreview.tags || ['Importado', 'Personalizado', 'NR-1'],
      dimensions: importPreview.dimensions || [],
      questions: importPreview.questions.map((q, idx) => ({
        id: idx + 1,
        code: q.code || `Q${idx + 1 < 10 ? '0' + (idx + 1) : idx + 1}`,
        text: q.text,
        dimensionCode: q.dimensionCode || 'GERAL',
        dimensionTitle: q.dimensionTitle || 'Geral',
        category: q.category || 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
        responseType: q.responseType || 'likert_copsoq',
        scaleType: q.scaleType || 'frequency',
        options: q.options,
        inverted: q.inverted,
        isRequired: q.isRequired !== false,
        placeholder: q.placeholder,
        helpText: q.helpText,
      })),
      scoringMethod: importPreview.scoringMethod || 'custom_rules',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveCustomQuestionnaire(templateToSave);
    reloadData();
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview(null);
    alert(`Questionário "${templateToSave.title}" importado com sucesso com ${templateToSave.itemCount} perguntas!`);
  };

  // Adicionar Pergunta no Construtor
  const handleAddQuestionToBuilder = () => {
    const nextId = formData.questions.length + 1;
    const defaultDim = formData.dimensions[0] || {
      code: 'EXIG_LABORAIS',
      title: 'Exigências e Ritmo de Trabalho',
      category: 'EXIGÊNCIAS LABORAIS',
      isFavorableHigh: false,
    };

    const newQuestion: QuestionnaireQuestion = {
      id: nextId,
      code: `Q${nextId < 10 ? '0' + nextId : nextId}`,
      text: 'Nova pergunta de avaliação psicossocial / ergonômica...',
      dimensionCode: defaultDim.code,
      dimensionTitle: defaultDim.title,
      category: defaultDim.category,
      responseType: 'likert_copsoq',
      scaleType: 'frequency',
      isRequired: true,
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  // Remover Pergunta no Construtor
  const handleRemoveQuestionFromBuilder = (idx: number) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      updated.splice(idx, 1);
      // Reindexa IDs e Códigos
      return {
        ...prev,
        questions: updated.map((q, i) => ({
          ...q,
          id: i + 1,
          code: `Q${i + 1 < 10 ? '0' + (i + 1) : i + 1}`,
        })),
      };
    });
  };

  // Mover Pergunta para cima/baixo no Construtor
  const handleMoveQuestion = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formData.questions.length) return;

    setFormData((prev) => {
      const list = [...prev.questions];
      const item = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = item;
      return {
        ...prev,
        questions: list.map((q, i) => ({
          ...q,
          id: i + 1,
          code: `Q${i + 1 < 10 ? '0' + (i + 1) : i + 1}`,
        })),
      };
    });
  };

  // Abertura do Simulador / Test Drive
  const handleStartSimulator = (template: QuestionnaireTemplate) => {
    setShowSimulatorModal(template);
    setSimAnswers({});
    setSimCurrentPage(0);
    setSimCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#0d1e38] via-[#102a4e] to-[#0c1f3a] rounded-2xl p-6 text-white border border-blue-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <ClipboardCheck className="w-6 h-6 text-cyan-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Biblioteca de Testes & Questionários
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    NR-01 & COPSOQ II
                  </span>
                </div>
                <p className="text-slate-300 text-sm mt-0.5">
                  Gestão completa de instrumentos psicossociais validados (COPSOQ Curto, Médio e Longo), criação de questionários do zero e importação via upload de planilhas.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Download Templates Dropdown */}
            <div className="relative group">
              <button
                id="btn-download-templates"
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/15 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <Download className="w-4 h-4 text-cyan-300" />
                <span>Baixar Modelos</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#0c1f38] border border-blue-800/80 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
                <button
                  onClick={() => handleDownloadSample('csv')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-blue-600/30 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold">Modelo Excel / CSV</div>
                    <div className="text-[10px] text-slate-400">Template com colunas prontas</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDownloadSample('json')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-blue-600/30 hover:text-white rounded-lg flex items-center gap-2 transition-colors mt-0.5"
                >
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-semibold">Modelo JSON Estruturado</div>
                    <div className="text-[10px] text-slate-400">Schema de dados com validação</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Upload Questionnaire Button */}
            <button
              id="btn-open-upload-modal"
              onClick={() => {
                setImportFile(null);
                setImportPreview(null);
                setImportError(null);
                setShowImportModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-sm font-medium border border-indigo-400/30 transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/40"
            >
              <Upload className="w-4 h-4" />
              <span>Importar Arquivo</span>
            </button>

            {/* Create Custom Questionnaire Button */}
            <button
              id="btn-open-create-modal"
              onClick={handleOpenNewBuilder}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/50"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Questionário do Zero</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-blue-800/40 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-slate-400">Total de Instrumentos</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalQuestionnaires}</div>
            <div className="text-[11px] text-cyan-300 font-medium">
              {standardCount} oficiais COPSOQ • {customCount} customizados
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-slate-400">Perguntas Catalogadas</div>
            <div className="text-xl font-bold text-cyan-300 mt-0.5">{totalQuestionsCataloged}</div>
            <div className="text-[11px] text-slate-300 font-medium">Itens de avaliação psicossocial</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-slate-400">Formatos de Resposta</div>
            <div className="text-xl font-bold text-emerald-300 mt-0.5">5 Tipos</div>
            <div className="text-[11px] text-slate-300">Likert COPSOQ, Sim/Não, Texto, etc.</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-slate-400">Enquadramento Legal</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">NR-1 & NR-17</div>
            <div className="text-[11px] text-slate-300">Compatível com PGR e AEP/AET</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título do teste, dimensão, código, pergunta ou tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({questionnaires.length})
            </button>
            <button
              onClick={() => setTypeFilter('standard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === 'standard'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              COPSOQ Oficial ({standardCount})
            </button>
            <button
              onClick={() => setTypeFilter('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === 'custom'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customizados ({questionnaires.filter((q) => q.type === 'custom').length})
            </button>
            <button
              onClick={() => setTypeFilter('imported')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === 'imported'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Importados ({questionnaires.filter((q) => q.type === 'imported').length})
            </button>
          </div>

          <select
            value={applicationFilter}
            onChange={(e) => setApplicationFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Todas as Aplicações</option>
            <option value="aep">AEP (Triagem Rápida)</option>
            <option value="aet">AET (Aprofundamento)</option>
            <option value="pesquisa">Auditoria & Pesquisa</option>
          </select>
        </div>
      </div>

      {/* Questionnaires Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredQuestionnaires.map((template) => {
          const isStandard = template.type === 'standard';
          const isCustom = template.type === 'custom';
          const isImported = template.type === 'imported';

          return (
            <div
              key={template.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:shadow-lg ${
                template.isDefault
                  ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-sm'
                  : 'border-slate-200 hover:border-blue-200'
              }`}
            >
              {/* Card Header & Badges */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isStandard ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        Padrão COPSOQ II
                      </span>
                    ) : isImported ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-purple-600" />
                        Importado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Customizado
                      </span>
                    )}

                    {template.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Principal
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {template.code}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {template.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                  {template.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {template.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-base font-bold text-blue-700">
                      {template.itemCount || template.questions?.length}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Itens / Questões</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-base font-bold text-slate-800">
                      {template.dimensionsCount || template.dimensions?.length || 1}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Dimensões</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-base font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{template.estimatedMinutes}m
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Tempo Médio</div>
                  </div>
                </div>

                {/* Target Application Badge */}
                <div className="mt-3.5 text-xs text-slate-600 bg-blue-50/50 border border-blue-100 rounded-lg p-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-700 line-clamp-1">
                    {template.targetApplication}
                  </span>
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer & Action Buttons */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex flex-col gap-2">
                {/* Secondary Actions Row */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleStartSimulator(template)}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Simular preenchimento do questionário"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Test-Drive</span>
                  </button>

                  <button
                    onClick={() => setShowInspectModal(template)}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Ver todas as perguntas e escalas"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Questões</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(template)}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Duplicar para criar versão personalizada"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Duplicar</span>
                  </button>
                </div>

                {/* Primary Row: Edit/Delete or Start Assessment */}
                <div className="flex items-center gap-1.5 pt-1">
                  {!isStandard && (
                    <>
                      <button
                        onClick={() => handleOpenEditBuilder(template)}
                        className="p-2 bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 rounded-lg text-xs transition-colors"
                        title="Editar questionário"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        className="p-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-lg text-xs transition-colors"
                        title="Excluir questionário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleExportJSON(template)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs transition-colors"
                    title="Exportar JSON"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  </button>

                  <button
                    onClick={() => handleExportCSV(template)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs transition-colors"
                    title="Exportar CSV / Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigateToAssessments) {
                        onNavigateToAssessments(template.id);
                      }
                    }}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors ml-auto"
                  >
                    <span>Iniciar Avaliação</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: CONSTRUTOR DE QUESTIONÁRIO (CRIAR / EDITAR) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col my-auto overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-white/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingQuestionnaire ? 'Editar Questionário' : 'Novo Questionário do Zero'}
                  </h2>
                  <p className="text-xs text-blue-200">
                    Defina perguntas, opções de resposta (COPSOQ, Sim/Não, Texto) e dimensões ergonômicas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subnav Tabs */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBuilderTab('general')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  builderTab === 'general'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Informações Gerais
              </button>
              <button
                type="button"
                onClick={() => setBuilderTab('dimensions')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  builderTab === 'dimensions'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Dimensões & Categorias ({formData.dimensions.length})
              </button>
              <button
                type="button"
                onClick={() => setBuilderTab('questions')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  builderTab === 'questions'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Perguntas & Tipos de Avaliação ({formData.questions.length})
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveQuestionnaire} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: GERAL */}
              {builderTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Título do Questionário *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Ex: Checklist de Riscos Psicossociais - Call Center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Código Identificador *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Ex: CHECK-CALL-2025"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subtítulo / Descrição Curta
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Ex: Instrumento de triagem com 15 itens focado em atendimento e estresse"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descrição Detalhada & Finalidade Técnica
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Descreva para quais setores, cargos ou riscos específicos este questionário foi desenhado..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Aplicação Recomendada
                      </label>
                      <select
                        value={formData.targetApplication}
                        onChange={(e) => setFormData({ ...formData, targetApplication: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="AEP - Avaliação Ergonômica Preliminar (NR-1)">AEP (Triagem Preliminar - NR-1)</option>
                        <option value="AET - Análise Ergonômica do Trabalho (NR-17)">AET (Aprofundamento Ergonômico - NR-17)</option>
                        <option value="Pesquisa de Clima & Cultura de Segurança">Pesquisa de Clima & Segurança</option>
                        <option value="Diagnóstico Setorial Específico">Diagnóstico Setorial Específico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tempo Médio Estimado (minutos)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={formData.estimatedMinutes}
                        onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Versão / Referência
                      </label>
                      <input
                        type="text"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                        placeholder="Ex: 1.0 (2025)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      placeholder="Ex: NR-1, AEP, Call Center, Assédio, Ritmo"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DIMENSÕES */}
              {builderTab === 'dimensions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Dimensões e Fatores de Análise
                      </h4>
                      <p className="text-xs text-slate-500">
                        Cada pergunta deve estar vinculada a uma dimensão para cálculo de risco e laudos
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newDim: QuestionnaireDimension = {
                          code: `DIM_${Date.now().toString().slice(-4)}`,
                          title: 'Nova Dimensão de Análise',
                          category: 'ORGANIZAÇÃO DO TRABALHO E CONTEÚDO',
                          isFavorableHigh: true,
                          nr1Category: 'Organização do Trabalho',
                        };
                        setFormData((prev) => ({ ...prev, dimensions: [...prev.dimensions, newDim] }));
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Dimensão</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.dimensions.map((dim, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Código da Dimensão
                            </label>
                            <input
                              type="text"
                              value={dim.code}
                              onChange={(e) => {
                                const updated = [...formData.dimensions];
                                updated[idx].code = e.target.value.toUpperCase();
                                setFormData({ ...formData, dimensions: updated });
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Título da Dimensão
                            </label>
                            <input
                              type="text"
                              value={dim.title}
                              onChange={(e) => {
                                const updated = [...formData.dimensions];
                                updated[idx].title = e.target.value;
                                setFormData({ ...formData, dimensions: updated });
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Categoria Geral
                            </label>
                            <select
                              value={dim.category}
                              onChange={(e) => {
                                const updated = [...formData.dimensions];
                                updated[idx].category = e.target.value;
                                setFormData({ ...formData, dimensions: updated });
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            >
                              <option value="EXIGÊNCIAS LABORAIS">EXIGÊNCIAS LABORAIS</option>
                              <option value="ORGANIZAÇÃO DO TRABALHO E CONTEÚDO">ORGANIZAÇÃO DO TRABALHO E CONTEÚDO</option>
                              <option value="RELAÇÕES SOCIAIS E LIDERANÇA">RELAÇÕES SOCIAIS E LIDERANÇA</option>
                              <option value="INTERFACE TRABALHO-INDIVÍDUO">INTERFACE TRABALHO-INDIVÍDUO</option>
                              <option value="VALORES NO LOCAL DE TRABALHO">VALORES NO LOCAL DE TRABALHO</option>
                              <option value="SAÚDE E BEM-ESTAR">SAÚDE E BEM-ESTAR</option>
                              <option value="COMPORTAMENTOS OFENSIVOS">COMPORTAMENTOS OFENSIVOS</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Sentido da Pontuação
                            </label>
                            <select
                              value={dim.isFavorableHigh ? 'true' : 'false'}
                              onChange={(e) => {
                                const updated = [...formData.dimensions];
                                updated[idx].isFavorableHigh = e.target.value === 'true';
                                setFormData({ ...formData, dimensions: updated });
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            >
                              <option value="true">Nota Alta = Fator Protetor / Positivo</option>
                              <option value="false">Nota Alta = Fator de Risco / Alerta</option>
                            </select>
                          </div>

                          <div className="flex items-end justify-end">
                            {formData.dimensions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...formData.dimensions];
                                  updated.splice(idx, 1);
                                  setFormData({ ...formData, dimensions: updated });
                                }}
                                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover Dimensão</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PERGUNTAS E TIPOS DE AVALIAÇÃO */}
              {builderTab === 'questions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Lista de Perguntas & Formato de Resposta
                      </h4>
                      <p className="text-xs text-slate-500">
                        Configure o enunciado, dimensão vinculada e tipo de avaliação (Likert 1-5, Sim/Não, Texto Livre, etc.)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQuestionToBuilder}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Nova Pergunta</span>
                    </button>
                  </div>

                  {formData.questions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <div className="text-sm font-semibold text-slate-700">Nenhuma pergunta adicionada</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Clique no botão acima para adicionar a primeira questão ao teste.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-2xl border border-slate-200 space-y-3"
                        >
                          {/* Top row of question: Code, Move, Delete */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {q.code}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveQuestion(idx, 'up')}
                                className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                                title="Mover para cima"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === formData.questions.length - 1}
                                onClick={() => handleMoveQuestion(idx, 'down')}
                                className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                                title="Mover para baixo"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionFromBuilder(idx)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-1"
                                title="Excluir pergunta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Question Text */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Texto do Enunciado da Pergunta *
                            </label>
                            <input
                              type="text"
                              required
                              value={q.text}
                              onChange={(e) => {
                                const updated = [...formData.questions];
                                updated[idx].text = e.target.value;
                                setFormData({ ...formData, questions: updated });
                              }}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                              placeholder="Digite a pergunta clara para o colaborador..."
                            />
                          </div>

                          {/* Row: Dimension & Response Type */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Dimensão Vinculada
                              </label>
                              <select
                                value={q.dimensionCode}
                                onChange={(e) => {
                                  const selectedDim = formData.dimensions.find((d) => d.code === e.target.value);
                                  const updated = [...formData.questions];
                                  updated[idx].dimensionCode = e.target.value;
                                  if (selectedDim) {
                                    updated[idx].dimensionTitle = selectedDim.title;
                                    updated[idx].category = selectedDim.category;
                                  }
                                  setFormData({ ...formData, questions: updated });
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                              >
                                {formData.dimensions.map((dim) => (
                                  <option key={dim.code} value={dim.code}>
                                    {dim.title}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Formato de Avaliação / Resposta
                              </label>
                              <select
                                value={q.responseType}
                                onChange={(e) => {
                                  const updated = [...formData.questions];
                                  const val = e.target.value as QuestionResponseType;
                                  updated[idx].responseType = val;
                                  if (val === 'yes_no') updated[idx].scaleType = 'yes_no';
                                  setFormData({ ...formData, questions: updated });
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-blue-800"
                              >
                                <option value="likert_copsoq">Escala COPSOQ (Likert 1 a 5)</option>
                                <option value="yes_no">Resposta Sim / Não</option>
                                <option value="text_description">Descrição / Texto Livre</option>
                                <option value="numeric_scale">Escala Numérica (0 a 10)</option>
                                <option value="multiple_choice">Múltipla Escolha Customizada</option>
                              </select>
                            </div>

                            {q.responseType === 'likert_copsoq' && (
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Tipo de Escala COPSOQ
                                </label>
                                <select
                                  value={q.scaleType || 'frequency'}
                                  onChange={(e) => {
                                    const updated = [...formData.questions];
                                    updated[idx].scaleType = e.target.value as any;
                                    setFormData({ ...formData, questions: updated });
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                >
                                  <option value="frequency">Frequência (Nunca a Sempre)</option>
                                  <option value="intensity">Intensidade (Nada a Extremamente)</option>
                                  <option value="health_quality">Saúde (Muito má a Excelente)</option>
                                  <option value="agreement_5">Concordância (Discordo a Concordo)</option>
                                  <option value="satisfaction_4">Satisfação (4 níveis)</option>
                                </select>
                              </div>
                            )}

                            {q.responseType === 'text_description' && (
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Placeholder da Caixa de Texto
                                </label>
                                <input
                                  type="text"
                                  value={q.placeholder || ''}
                                  onChange={(e) => {
                                    const updated = [...formData.questions];
                                    updated[idx].placeholder = e.target.value;
                                    setFormData({ ...formData, questions: updated });
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                  placeholder="Ex: Descreva detalhes..."
                                />
                              </div>
                            )}
                          </div>

                          {/* Extra Flags (Inverted, Offensive, Required) */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={q.isRequired !== false}
                                onChange={(e) => {
                                  const updated = [...formData.questions];
                                  updated[idx].isRequired = e.target.checked;
                                  setFormData({ ...formData, questions: updated });
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">Resposta Obrigatória</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!q.inverted}
                                onChange={(e) => {
                                  const updated = [...formData.questions];
                                  updated[idx].inverted = e.target.checked;
                                  setFormData({ ...formData, questions: updated });
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">Item Reverso (Inverte pontuação)</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!q.isOffensiveBehavior}
                                onChange={(e) => {
                                  const updated = [...formData.questions];
                                  updated[idx].isOffensiveBehavior = e.target.checked;
                                  setFormData({ ...formData, questions: updated });
                                }}
                                className="rounded text-red-600 focus:ring-red-500"
                              />
                              <span className="font-medium text-red-700">Comportamento Ofensivo / Assédio</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {formData.questions.length} questão(ões) configurada(s) em {formData.dimensions.length} dimensão(ões).
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Questionário na Biblioteca</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD / IMPORTAR ARQUIVO (JSON / CSV) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-white/10 rounded-xl">
                  <Upload className="w-5 h-5 text-cyan-300" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">Importar Questionário por Arquivo</h2>
                  <p className="text-xs text-indigo-200">Suporte a arquivos JSON e planilhas CSV/Excel formatadas</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileProcess(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileProcess(file);
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {importFile ? importFile.name : 'Arraste seu arquivo JSON ou CSV aqui'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ou clique para selecionar do seu computador (.json, .csv, .txt)
                </p>
              </div>

              {/* Sample Download Bar */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Precisa do modelo com as colunas corretas?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSample('csv')}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors"
                  >
                    Baixar Modelo CSV
                  </button>
                  <button
                    onClick={() => handleDownloadSample('json')}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors"
                  >
                    Baixar Modelo JSON
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {importError && (
                <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Falha na validação do arquivo</div>
                    <div>{importError}</div>
                  </div>
                </div>
              )}

              {/* Success Preview */}
              {importPreview && (
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Arquivo lido com sucesso!</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Título do Questionário Importado
                      </label>
                      <input
                        type="text"
                        value={importPreview.title || ''}
                        onChange={(e) => setImportPreview({ ...importPreview, title: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <div className="font-bold text-emerald-700">{importPreview.questions?.length}</div>
                        <div className="text-[10px] text-slate-500">Perguntas Detectadas</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <div className="font-bold text-slate-800">{importPreview.dimensions?.length || 1}</div>
                        <div className="text-[10px] text-slate-500">Dimensões</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <div className="font-bold text-blue-700">~{importPreview.estimatedMinutes || 5} min</div>
                        <div className="text-[10px] text-slate-500">Tempo Estimado</div>
                      </div>
                    </div>

                    {/* Preview first 3 questions */}
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-slate-700 mb-1">
                        Prévia das Primeiras Perguntas:
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {importPreview.questions?.slice(0, 4).map((q, idx) => (
                          <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-xs">
                            <span className="font-mono font-bold text-blue-700 mr-2">{q.code}:</span>
                            <span className="text-slate-800">{q.text}</span>
                            <span className="ml-2 text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                              {q.responseType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!importPreview}
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar e Salvar na Biblioteca</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INSPETOR DE QUESTÕES & DIMENSÕES */}
      {showInspectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{showInspectModal.title}</h2>
                  <span className="px-2 py-0.5 rounded bg-blue-500/30 text-cyan-300 text-xs font-mono">
                    {showInspectModal.code}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Visualização detalhada das {showInspectModal.questions?.length} questões e {showInspectModal.dimensions?.length} dimensões
                </p>
              </div>
              <button
                onClick={() => setShowInspectModal(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-2">
                {showInspectModal.questions?.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl transition-all flex items-start gap-3"
                  >
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {q.code}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {q.dimensionTitle}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {q.category}
                        </span>
                        {q.inverted && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Reverso
                          </span>
                        )}
                        {q.isOffensiveBehavior && (
                          <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                            Assédio / Ofensa
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 leading-relaxed">
                        {q.text}
                      </div>

                      {/* Scale display */}
                      <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="font-medium text-slate-600">Tipo de Resposta:</span>
                        {q.responseType === 'likert_copsoq' && q.scaleType && (
                          <span className="text-slate-700 font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                            {COPSOQ_SCALE_LABELS[q.scaleType]?.join('  →  ') || 'Escala 1 a 5'}
                          </span>
                        )}
                        {q.responseType === 'yes_no' && (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Sim / Não
                          </span>
                        )}
                        {q.responseType === 'text_description' && (
                          <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Texto Livre / Descrição
                          </span>
                        )}
                        {q.responseType === 'numeric_scale' && (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Escala 0 a 10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {showInspectModal.questions?.length} questões catalogadas
              </div>
              <button
                onClick={() => setShowInspectModal(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SIMULADOR / TEST DRIVE INTERATIVO */}
      {showSimulatorModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-cyan-400/20 text-cyan-300 text-xs font-bold uppercase">
                    Modo Test-Drive
                  </span>
                  <h2 className="text-base font-bold text-white">{showSimulatorModal.title}</h2>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Experimente a experiência do colaborador respondendo a este teste em tempo real
                </p>
              </div>
              <button
                onClick={() => setShowSimulatorModal(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            {!simCompleted && (
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Progresso do Teste:</span>
                  <span className="font-bold text-blue-700">
                    {Object.keys(simAnswers).length} de {showSimulatorModal.questions?.length} respondidas
                  </span>
                </div>
                <div className="w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (Object.keys(simAnswers).length / (showSimulatorModal.questions?.length || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Simulator Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {simCompleted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Simulação Concluída com Sucesso!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Você testou todas as perguntas e escalas deste instrumento. O questionário está pronto para ser aplicado nas campanhas de avaliação da sua empresa!
                  </p>
                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSimAnswers({});
                        setSimCurrentPage(0);
                        setSimCompleted(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Reiniciar Test-Drive
                    </button>
                    <button
                      onClick={() => {
                        setShowSimulatorModal(null);
                        if (onNavigateToAssessments) onNavigateToAssessments(showSimulatorModal.id);
                      }}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      Criar Campanha com este Teste
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {showSimulatorModal.questions
                    ?.slice(
                      simCurrentPage * simQuestionsPerPage,
                      (simCurrentPage + 1) * simQuestionsPerPage
                    )
                    .map((q, idx) => {
                      const actualIdx = simCurrentPage * simQuestionsPerPage + idx;
                      const selectedVal = simAnswers[q.id];

                      return (
                        <div
                          key={q.id}
                          className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {actualIdx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{q.text}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{q.dimensionTitle}</div>
                            </div>
                          </div>

                          {/* Response rendering depending on responseType */}
                          {q.responseType === 'likert_copsoq' && q.scaleType && (
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                              {(COPSOQ_SCALE_LABELS[q.scaleType] || ['1', '2', '3', '4', '5']).map(
                                (label, ratingIdx) => {
                                  const ratingValue = ratingIdx + 1;
                                  const isSelected = selectedVal === ratingValue;
                                  return (
                                    <button
                                      key={ratingIdx}
                                      type="button"
                                      onClick={() => setSimAnswers({ ...simAnswers, [q.id]: ratingValue })}
                                      className={`p-2.5 rounded-xl border text-center transition-all ${
                                        isSelected
                                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-500/20'
                                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 text-xs'
                                      }`}
                                    >
                                      <div className="text-[11px] leading-snug">{label}</div>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          )}

                          {q.responseType === 'yes_no' && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => setSimAnswers({ ...simAnswers, [q.id]: 'sim' })}
                                className={`p-3 rounded-xl border text-center transition-all font-semibold text-xs ${
                                  selectedVal === 'sim'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                    : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => setSimAnswers({ ...simAnswers, [q.id]: 'nao' })}
                                className={`p-3 rounded-xl border text-center transition-all font-semibold text-xs ${
                                  selectedVal === 'nao'
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                Não
                              </button>
                            </div>
                          )}

                          {q.responseType === 'text_description' && (
                            <div className="pt-1">
                              <textarea
                                rows={2}
                                value={selectedVal || ''}
                                onChange={(e) => setSimAnswers({ ...simAnswers, [q.id]: e.target.value })}
                                placeholder={q.placeholder || 'Digite suas observações aqui...'}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                          )}

                          {q.responseType === 'numeric_scale' && (
                            <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 pt-1">
                              {Array.from({ length: 11 }).map((_, n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setSimAnswers({ ...simAnswers, [q.id]: n })}
                                  className={`p-2 rounded-lg border text-center font-bold text-xs transition-all ${
                                    selectedVal === n
                                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            {!simCompleted && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  disabled={simCurrentPage === 0}
                  onClick={() => setSimCurrentPage((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <div className="text-xs text-slate-500 font-medium">
                  Página {simCurrentPage + 1} de{' '}
                  {Math.ceil((showSimulatorModal.questions?.length || 1) / simQuestionsPerPage)}
                </div>

                {simCurrentPage <
                Math.ceil((showSimulatorModal.questions?.length || 1) / simQuestionsPerPage) - 1 ? (
                  <button
                    type="button"
                    onClick={() => setSimCurrentPage((prev) => prev + 1)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Próxima</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSimCompleted(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Concluir Simulação</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
