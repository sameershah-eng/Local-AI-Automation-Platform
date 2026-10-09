import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  RotateCw,
  AlertTriangle,
  FileSpreadsheet,
  Monitor,
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Maximize2,
} from 'lucide-react';
import { AutonomousTask } from '../../types';

interface TaskInspectorModalProps {
  task: AutonomousTask | null;
  onClose: () => void;
  onSimulateRecovery: (taskId: string) => void;
  onTogglePause: (taskId: string) => void;
}

export const TaskInspectorModal: React.FC<TaskInspectorModalProps> = ({
  task,
  onClose,
  onSimulateRecovery,
  onTogglePause,
}) => {
  if (!task) return null;

  const [activeTab, setActiveTab] = useState<'steps' | 'logs' | 'proof' | 'recovery'>('steps');
  const [logFilter, setLogFilter] = useState<'all' | 'action' | 'checkpoint' | 'warn'>('all');
  const [isSimulatingCrash, setIsSimulatingCrash] = useState(false);

  const filteredLogs = task.logs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  const handleTriggerRecovery = () => {
    setIsSimulatingCrash(true);
    setTimeout(() => {
      onSimulateRecovery(task.id);
      setIsSimulatingCrash(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                {task.id}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                task.status === 'running'
                  ? 'bg-emerald-100 text-emerald-800'
                  : task.status === 'checkpointed'
                  ? 'bg-amber-100 text-amber-800'
                  : task.status === 'paused'
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {task.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">Started: {task.startedAt}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{task.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePause(task.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              {task.status === 'paused' ? 'Resume Task' : 'Pause Task'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Tabs */}
        <div className="flex items-center justify-between px-5 border-b border-slate-200/80 bg-white">
          <div className="flex gap-2">
            {[
              { id: 'steps', label: 'Step Breakdown (Plan/Exec/Verify)' },
              { id: 'logs', label: 'Terminal Logs' },
              { id: 'proof', label: 'Proof of Execution (GUI Screenshot & File)' },
              { id: 'recovery', label: 'Self-Healing Checkpoint Engine' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>{task.assignedModel}</span>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
          {/* 1. Step Breakdown */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Autonomous Execution Progress</div>
                  <div className="text-sm font-bold text-slate-800">{task.progress}% Completed</div>
                </div>
                <div className="w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {task.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : step.status === 'in_progress' ? (
                            <RotateCw className="w-5 h-5 text-indigo-600 animate-spin" />
                          ) : (
                            <Clock className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              Phase {idx + 1}: {step.phase}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{step.name}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{step.detail}</p>
                          {step.timestamp && (
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              Completed at {step.timestamp}
                            </span>
                          )}
                        </div>
                      </div>

                      {step.checkpointId && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold">
                          Checkpoint #{step.checkpointId}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Terminal Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {(['all', 'action', 'checkpoint', 'warn'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                        logFilter === lvl
                          ? 'bg-slate-800 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {filteredLogs.length} events logged
                </div>
              </div>

              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800 max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 leading-relaxed">
                    <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                    <span
                      className={`shrink-0 uppercase font-bold text-[10px] px-1.5 py-0.2 rounded select-none ${
                        log.level === 'action'
                          ? 'bg-indigo-900 text-indigo-300'
                          : log.level === 'checkpoint'
                          ? 'bg-emerald-900 text-emerald-300'
                          : log.level === 'warn'
                          ? 'bg-amber-900 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-slate-300 flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Proof of Execution (Screenshot & File) */}
          {activeTab === 'proof' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Desktop Screenshot Preview */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Agent Desktop Capture (Live Handle)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                      1920x1080 Native GUI
                    </span>
                  </div>

                  {/* Simulated High-Res Desktop GUI Screen with Agent Bounding Box */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-slate-900 aspect-video flex flex-col">
                    {/* Simulated Window Titlebar */}
                    <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b border-slate-700 text-[10px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="ml-2 font-mono">SAP GUI - [T-Code: MB52 - Material Stock Overview]</span>
                      </div>
                      <span className="font-mono text-emerald-400">PID: 9028</span>
                    </div>

                    {/* Window Contents */}
                    <div className="flex-1 bg-slate-100 p-3 font-mono text-[10px] text-slate-800 relative">
                      <div className="bg-white border border-slate-300 rounded p-2 mb-2 text-[10px]">
                        <div className="font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">
                          Material: 4902-BL9921 | Plant: 1000 (Melbourne Depot)
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-slate-600">
                          <div>Storage Loc: RACK-A4</div>
                          <div>Unrestricted: 182 EA</div>
                          <div>Blocked Stock: 0 EA</div>
                          <div>Valuation: $148,200 AUD</div>
                        </div>
                      </div>

                      {/* Autonomous Agent Focus Ring overlay */}
                      <div className="absolute top-14 left-16 border-2 border-indigo-600 bg-indigo-500/15 rounded px-2 py-1 text-indigo-900 font-sans font-bold text-[9px] shadow-sm flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping inline-block" />
                        Agent Click Target: Cell [Row 148, Col B]
                      </div>

                      <div className="mt-8 text-slate-400 text-[9px] italic text-right">
                        Direct Win32 GUI automation stream (0.1ms render latency)
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Autonomous desktop driver coordinates click events directly with the local display server without transmitting video to any remote cloud.
                  </p>
                </div>

                {/* Generated File Proof */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Cryptographically Signed Ledger Export
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      SHA-256 Validated
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="text-emerald-700 font-mono">{task.proofFileName}</span>
                    </div>
                    <p className="text-xs text-slate-600">{task.proofFileSummary}</p>
                    <div className="pt-2 border-t border-slate-200/60 text-[10px] font-mono text-slate-500">
                      Digest: 4f1a9b821038eec74b12aa...90184c (Stored on Local Enclave)
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-900 text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Tamper-Proof Guarantee:</span> Every row change is logged to the local immutable SQLite journal before submission.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Self-Healing & Recovery Simulation */}
          {activeTab === 'recovery' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-5 h-5 text-indigo-600 ${isSimulatingCrash ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-bold text-slate-900">
                      Crash-Resilient State Checkpointing Engine
                    </span>
                  </div>
                  <button
                    onClick={handleTriggerRecovery}
                    disabled={isSimulatingCrash}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSimulatingCrash ? 'Restoring State...' : 'Simulate Interruption & Auto-Resume'}
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  If the desktop process crashes, power drops, or system reboots, AegisLocal never restarts from scratch. It automatically inspects verified local checkpoints and resumes within 1 second.
                </p>
              </div>

              {/* Visual Checkpoint Timeline */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Checkpoint Ledger Trail
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                    <div className="text-xs font-bold text-slate-900">
                      Checkpoint #{task.checkpointNumber}: {task.lastCheckpoint}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      NVMe Snapshot ID: snap_0910_{task.id}_v{task.checkpointNumber} · Integrity: 100%
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-slate-100" />
                    <div className="text-xs font-semibold text-slate-700">
                      Checkpoint #{Math.max(1, task.checkpointNumber - 2)}: Extracted Initial Ledger Entries
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Verified 48 items · Commited to local journal
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-slate-100" />
                    <div className="text-xs font-semibold text-slate-600">
                      Checkpoint #1: Initialized Sandboxed Desktop Environment
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Mounted secure loopback volume
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
