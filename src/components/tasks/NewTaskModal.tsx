import React, { useState } from 'react';
import { X, Play, ShieldAlert, Cpu, Sparkles, CheckSquare, Layers, Lock } from 'lucide-react';
import { Workspace, WorkspaceId, AutonomousTask } from '../../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkspace: Workspace;
  onTriggerTask: (task: Partial<AutonomousTask>) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  currentWorkspace,
  onTriggerTask,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('Llama-3.1-70B-Instruct-Q4_K_M');
  const [authLimitUSD, setAuthLimitUSD] = useState<number>(500);
  const [requiresAuth, setRequiresAuth] = useState(true);

  // Autonomous Permissions
  const [permissions, setPermissions] = useState({
    desktopGui: true,
    filesystem: true,
    terminalExec: false,
    headlessBrowser: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onTriggerTask({
      title: title.trim(),
      description: description.trim() || 'Custom autonomous desktop operation',
      assignedModel: model,
      requiresAuth,
      authLimitUSD: requiresAuth ? authLimitUSD : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Trigger New Autonomous Task</h3>
            <p className="text-xs text-slate-500">
              Workspace: <span className="font-semibold text-indigo-700">{currentWorkspace.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Goal / Directive Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cross-check carrier bill variances in Xero & generate dispute"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Operational Instructions & Boundary Constraints
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe step requirements, target desktop apps, error fallback behaviors..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Local Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Llama-3.1-70B-Instruct-Q4_K_M">Llama-3.1-70B-Instruct (High-Reasoning & Orchestration)</option>
              <option value="Qwen-2.5-Coder-32B-Instruct-Q8">Qwen-2.5-Coder-32B (High-Precision Code, SQL & Win32 GUI)</option>
              <option value="DeepSeek-R1-Distill-Qwen-14B">DeepSeek-R1-Distill-14B (Fast Chain-of-Thought)</option>
            </select>
          </div>

          {/* Sandboxed Permissions */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Autonomous Tool Sandboxing
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.desktopGui}
                  onChange={(e) => setPermissions({ ...permissions, desktopGui: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Desktop GUI Driver</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.filesystem}
                  onChange={(e) => setPermissions({ ...permissions, filesystem: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Encrypted Local FS</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.headlessBrowser}
                  onChange={(e) => setPermissions({ ...permissions, headlessBrowser: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Browser Headless</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.terminalExec}
                  onChange={(e) => setPermissions({ ...permissions, terminalExec: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">CLI / Terminal Exec</span>
              </label>
            </div>
          </div>

          {/* Human-in-the-loop Gate */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-indigo-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresAuth}
                  onChange={(e) => setRequiresAuth(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Enforce Human Sign-Off Gate for Financial Calls
              </label>
            </div>

            {requiresAuth && (
              <div className="flex items-center gap-2 text-xs text-indigo-900 pt-1">
                <span>Auto-sign threshold limit: $</span>
                <input
                  type="number"
                  value={authLimitUSD}
                  onChange={(e) => setAuthLimitUSD(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-semibold"
                />
                <span>AUD</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Launch Background Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
