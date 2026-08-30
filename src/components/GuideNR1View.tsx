import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export const GuideNR1View: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O que determina a Portaria MTE nº 1.419/2024 sobre os riscos psicossociais?',
      a: 'A Portaria MTE nº 1.419, de 27 de agosto de 2024, atualizou formalmente o texto da Norma Regulamentadora nº 01 (NR-1), estabelecendo a obrigatoriedade explícita de incluir os fatores psicossociais relacionados ao trabalho no processo de Gerenciamento de Riscos Ocupacionais (GRO) e no Programa de Gerenciamento de Riscos (PGR) de todas as empresas.',
    },
    {
      q: 'Como a empresa deve identificar os fatores de riscos psicossociais?',
      a: 'A identificação deve ser realizada preferencialmente por meio da Avaliação Ergonômica Preliminar (AEP) prevista na NR-17 e na NR-1, combinando métodos quantitativos padronizados e validados (como o questionário COPSOQ II) e escuta qualificada dos trabalhadores, garantindo anonimato absoluto.',
    },
    {
      q: 'O que o subitem 1.5.3.3 da NR-1 exige em relação aos trabalhadores?',
      a: 'O subitem 1.5.3.3 determina que a organização deve adotar mecanismos para consultar os trabalhadores quanto à percepção de riscos ocupacionais, podendo para este fim adotar as manifestações da CIPA, quando houver. O anonimato é crucial para garantir a veracidade e liberdade de manifestação.',
    },
    {
      q: 'Como funciona a matriz de riscos 5x5 para fatores psicossociais?',
      a: 'A matriz cruza a Severidade dos possíveis danos (estresse, ansiedade, burnout, depressão) na escala de 1 a 5 com a Probabilidade de ocorrência na escala de 1 a 5. O produto determina o Nível de Risco (Baixo: 1-4, Médio: 5-9, Alto: 10-16, Muito Alto: 20-25), orientando a prioridade e o prazo máximo de implementação de medidas mitigadoras.',
    },
    {
      q: 'Quais medidas de prevenção devem constar no Plano de Ação (NR-1.5.5.2)?',
      a: 'Deve ser rigorosamente respeitada a hierarquia de controle: 1º Eliminar os fatores de estresse através de redesenho do trabalho; 2º Medidas de proteção coletiva e organização do trabalho (distribuição equilibrada de tarefas, pausas); 3º Medidas administrativas (treinamento de líderes, combate ao assédio moral/sexual); 4º Vigilância epidemiológica em saúde (integração ao PCMSO/NR-7).',
    },
    {
      q: 'Qual o prazo de revisão do Inventário de Riscos e do PGR?',
      a: 'A avaliação de riscos deve ser revista a cada 2 (dois) anos ou para organizações que possuam certificações em sistema de gestão de SST o prazo poderá ser de até 3 (três) anos. Deve ser revista imediatamente se ocorrerem modificações significativas nas condições de trabalho ou após acidentes/afastamentos relevantes.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Guia Regulatório & Boas Práticas (NR-1)
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Portaria MTE nº 1.419/2024
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Manual técnico de conformidade jurídica e metodológica para o Gerenciamento de Riscos Ocupacionais (GRO/PGR)
        </p>
      </div>

      {/* 4 Pilares da Nova NR-1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-sm font-bold text-slate-900">Inclusão no GRO/PGR</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fatores psicossociais deixam de ser opcionais e tornam-se parte obrigatória do inventário de riscos de qualquer organização.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-sm font-bold text-slate-900">Escuta Anônima & CIPA</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Exigência de canais e questionários anônimos para consultar os trabalhadores sem risco de retaliação (subitem 1.5.3.3 e NR-5).
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="text-sm font-bold text-slate-900">Matriz Bidimensional</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Classificação objetiva de perigos cruzando Severidade (1 a 5) x Probabilidade (1 a 5) com prazos vinculados para ação.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            04
          </div>
          <h3 className="text-sm font-bold text-slate-900">Plano 5W2H & Eficácia</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Medidas com responsáveis, cronograma, recursos e método obrigatório de aferição de eficácia no ciclo PDCA (subitem 1.5.5.3.2).
          </p>
        </div>
      </div>

      {/* Tabela Comparativa de Hierarquia de Controle */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-700" />
          <span>Hierarquia de Medidas de Prevenção (Subitem 1.5.5.2 da NR-1)</span>
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3">Nível Hierárquico</th>
                <th className="p-3">Tipo de Medida</th>
                <th className="p-3">Exemplos Práticos no Ambiente de Trabalho</th>
                <th className="p-3 text-center">Eficácia Esperada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-blue-900">1º Prioridade</td>
                <td className="p-3 font-semibold text-slate-800">Eliminação / Redesenho do Trabalho</td>
                <td className="p-3 text-slate-600">
                  Redefinição de metas irrealistas, eliminação de duplicidade de comandos, adequação do efetivo para eliminar horas extras sistemáticas.
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Máxima
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-blue-900">2º Prioridade</td>
                <td className="p-3 font-semibold text-slate-800">Proteção Coletiva & Organização</td>
                <td className="p-3 text-slate-600">
                  Instituição de pausas psicofisiológicas regulares (NR-17), rodízio de postos de alta exigência emocional, autonomia sobre o ritmo de trabalho.
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                    Alta
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-blue-900">3º Prioridade</td>
                <td className="p-3 font-semibold text-slate-800">Medidas Administrativas & Liderança</td>
                <td className="p-3 text-slate-600">
                  Treinamentos obrigatórios de gestão humanizada para chefias, política transparente de combate ao assédio moral e sexual (Lei 14.457/22).
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Média-Alta
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-blue-900">4º Prioridade</td>
                <td className="p-3 font-semibold text-slate-800">Suporte Individual & PCMSO</td>
                <td className="p-3 text-slate-600">
                  Programa de apoio psicológico, acolhimento em saúde mental, vigilância de afastamentos no PCMSO (NR-7).
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                    Complementar
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-700" />
          <span>Perguntas Frequentes & Auditoria Fiscal do Trabalho</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-slate-900 hover:text-blue-700 transition text-xs sm:text-sm"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 border-l-2 border-blue-500 ml-1">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
