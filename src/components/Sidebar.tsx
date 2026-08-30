import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  ListTodo,
  FileText,
  Grid3X3,
  BookOpen,
  Settings,
  ShieldAlert,
  FolderKanban,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingAssessmentsCount?: number;
  pendingActionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  pendingAssessmentsCount = 2,
  pendingActionsCount = 4,
}) => {
  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'Painel',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assessments',
      label: 'Avaliações',
      icon: ClipboardList,
      badge: pendingAssessmentsCount > 0 ? pendingAssessmentsCount : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'companies',
      label: 'Empresas',
      icon: Building2,
      badge: null,
    },
    {
      id: 'action_plan',
      label: 'Planos',
      icon: ListTodo,
      badge: pendingActionsCount > 0 ? pendingActionsCount : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'tests',
      label: 'Testes',
      icon: ClipboardCheck,
      badge: null,
    },
    {
      id: 'risk_matrix',
      label: 'Matriz GRO',
      icon: Grid3X3,
      badge: null,
    },
    {
      id: 'reports',
      label: 'Laudos',
      icon: FileText,
      badge: null,
    },
    {
      id: 'guide',
      label: 'Guia NR-1',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Workspace',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-20 bg-[#091629] border-r border-[#152a4a] flex flex-col items-center py-4 select-none shrink-0 z-30 min-h-screen text-slate-300">
      {/* Brand Icon */}
      <button
        onClick={() => onTabChange('dashboard')}
        className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-950/60 mb-6 hover:scale-105 transition-transform"
        title="PsicoGRO • NR-01"
      >
        <ShieldAlert className="w-6 h-6 text-white" />
      </button>

      {/* Navigation Rail */}
      <nav className="flex-1 w-full px-2 space-y-2.5 flex flex-col items-center">
        {mainNavItems.map((item) => {
          const isActive =
            currentTab === item.id ||
            (item.id === 'action_plan' && currentTab === 'action-plan') ||
            (item.id === 'risk_matrix' && currentTab === 'risk-matrix');
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all group ${
                isActive
                  ? 'bg-[#162f55] text-white font-bold shadow-md shadow-black/20 border border-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              {/* Badge indicator */}
              {item.badge !== null && item.badge > 0 && (
                <span
                  className={`absolute top-1 right-2.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                    item.badgeColor || 'bg-red-500 text-white'
                  } shadow-xs`}
                >
                  {item.badge}
                </span>
              )}

              <Icon
                className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span className="text-[10px] tracking-tight text-center leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom status badge */}
      <div className="mt-auto pt-4 flex flex-col items-center text-center px-1">
        <div
          className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mb-1.5"
          title="Sistema Operacional em Conformidade NR-1"
        />
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
          NR-01
        </span>
      </div>
    </aside>
  );
};
