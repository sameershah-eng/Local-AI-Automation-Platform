import React from 'react';
import {
  ListTodo,
  Video,
  Mic,
  Brain,
  Cpu,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Bot,
  CircleDot,
} from 'lucide-react';
import { Workspace } from '../../types';

export type ActiveTab =
  | 'tasks'
  | 'recorder'
  | 'meeting'
  | 'memory'
  | 'models'
  | 'vault';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentWorkspace: Workspace;
  activeTasksCount: number;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  currentWorkspace,
  activeTasksCount,
  pendingApprovalsCount,
}) => {
  const navItems = [
    {
      id: 'tasks' as ActiveTab,
      label: 'Task Execution Engine',
      shortLabel: 'Tasks',
      icon: ListTodo,
      badge: activeTasksCount > 0 ? `${activeTasksCount} active` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'recorder' as ActiveTab,
      label: 'Observe & Learn Recorder',
      shortLabel: 'Recorder',
      icon: Video,
      badge: 'Live',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'meeting' as ActiveTab,
      label: 'Meeting & Audio Copilot',
      shortLabel: 'Meeting',
      icon: Mic,
      badge: undefined,
    },
    {
      id: 'memory' as ActiveTab,
      label: 'Memory & Knowledge Hub',
      shortLabel: 'Memory',
      icon: Brain,
      badge: `${(currentWorkspace.vectorCount / 1000).toFixed(0)}k vecs`,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'models' as ActiveTab,
      label: 'Local Models & Hardware',
      shortLabel: 'Models',
      icon: Cpu,
      badge: '4x GPU',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    {
      id: 'vault' as ActiveTab,
      label: 'Security, Vault & Audit',
      shortLabel: 'Vault',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} req` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 font-bold',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                AegisLocal
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200/60">
                  v3.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Autonomous Local Engine</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Control Center
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group relative ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="text-xs truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ml-1.5 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Collapsed Tooltip Indicator dot */}
              {collapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Workspace Context Footer */}
      {!collapsed ? (
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Active Enclave</span>
            <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
              <CircleDot className="w-2.5 h-2.5 fill-current animate-pulse" />
              Encrypted
            </span>
          </div>
          <div className="font-bold text-slate-800 truncate">{currentWorkspace.name}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
            {currentWorkspace.isolationKey}
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Enclave Secure" />
        </div>
      )}
    </aside>
  );
};
