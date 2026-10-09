import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Plus,
  Eye,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { AutonomousTask, TaskStatus, Workspace } from '../../types';
import { TaskInspectorModal } from './TaskInspectorModal';
import { NewTaskModal } from './NewTaskModal';

interface TasksViewProps {
  tasks: AutonomousTask[];
  currentWorkspace: Workspace;
  onTogglePauseTask: (taskId: string) => void;
  onAbortTask: (taskId: string) => void;
  onSimulateRecovery: (taskId: string) => void;
  onTriggerNewTask: (task: Partial<AutonomousTask>) => void;
  onEmergencyStopAll: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  currentWorkspace,
  onTogglePauseTask,
  onAbortTask,
  onSimulateRecovery,
  onTriggerNewTask,
  onEmergencyStopAll,
}) => {
  const [selectedTask, setSelectedTask] = useState<AutonomousTask | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Workspace-filtered tasks
  const workspaceTasks = tasks.filter((t) => t.workspaceId === currentWorkspace.id);

  const filteredTasks = workspaceTasks.filter((task) => {
    const matchesFilter = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedModel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const runningCount = workspaceTasks.filter((t) => t.status === 'running').length;
  const checkpointedCount = workspaceTasks.filter((t) => t.status === 'checkpointed').length;
  const pausedCount = workspaceTasks.filter((t) => t.status === 'paused').length;

  return (
    <div className="space-y-6">
      {/* Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Workers</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <RotateCw className={`w-4 h-4 ${runningCount > 0 ? 'animate-spin' : ''}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{runningCount} Running</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Zero cloud latency · 100% local NVMe execution
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Checkpointed States</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{checkpointedCount} Preserved</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Instant crash recovery ready
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Security Enclave</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">Air-Gapped</div>
          <div className="text-[11px] text-cyan-700 font-medium mt-1">
            Strict {currentWorkspace.complianceLevel} sandbox
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Paused / Standby</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{pausedCount} Tasks</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Awaiting user trigger or auth clearance
          </div>
        </div>
      </div>

      {/* Control Bar & Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search background tasks, models, or active steps..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl">
            {(['all', 'running', 'checkpointed', 'paused'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Trigger New Autonomous Task
          </button>
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Task Queue</h3>
            <p className="text-xs text-slate-500">
              Autonomous background operations executing in isolated workspace memory space
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'} listed
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No matching tasks found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no background tasks matching your filters for {currentWorkspace.name}.
            </p>
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              Launch First Task &rarr;
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Task Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {task.id}
                    </span>

                    {/* Status Indicator */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 ${
                        task.status === 'running'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : task.status === 'checkpointed'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          : task.status === 'paused'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {task.status === 'running' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      {task.status.toUpperCase()}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      Started: {task.startedAt}
                    </span>

                    {task.requiresAuth && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        Gate: Auto-sign limit ${task.authLimitUSD} AUD
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>

                  {/* Current Active Step & Checkpoint */}
                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-indigo-900 bg-indigo-50/80 px-2.5 py-1 rounded-lg">
                      <RotateCw className="w-3 h-3 text-indigo-600 animate-spin" />
                      <span className="font-medium text-[11px] truncate max-w-md">
                        {task.currentStep}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Checkpoint #{task.checkpointNumber}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {task.assignedModel}
                    </div>
                  </div>
                </div>

                {/* Right Progress & Action Buttons */}
                <div className="flex items-center gap-4 shrink-0 lg:pl-6 lg:border-l lg:border-slate-100">
                  {/* Progress Ring / Bar */}
                  <div className="w-28 text-right">
                    <div className="text-xs font-bold text-slate-800 mb-1">{task.progress}%</div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTogglePauseTask(task.id)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      title={task.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                      {task.status === 'paused' ? (
                        <Play className="w-4 h-4 fill-current text-emerald-600" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedTask(task)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      Inspect
                    </button>

                    <button
                      onClick={() => onAbortTask(task.id)}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Abort task"
                    >
                      <AlertOctagon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskInspectorModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSimulateRecovery={onSimulateRecovery}
        onTogglePause={onTogglePauseTask}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        currentWorkspace={currentWorkspace}
        onTriggerTask={onTriggerNewTask}
      />
    </div>
  );
};
