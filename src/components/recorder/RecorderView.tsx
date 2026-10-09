import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Sliders,
  HelpCircle,
  Sparkles,
  MousePointer,
  Eye,
  ArrowRight,
  Zap,
  Layers,
  FileCode,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { RecordedWorkflow, WorkflowStep, Workspace } from '../../types';

interface RecorderViewProps {
  workflows: RecordedWorkflow[];
  currentWorkspace: Workspace;
  onPromoteWorkflow: (workflow: RecordedWorkflow) => void;
}

export const RecorderView: React.FC<RecorderViewProps> = ({
  workflows,
  currentWorkspace,
  onPromoteWorkflow,
}) => {
  const workspaceWorkflows = workflows.filter((w) => w.workspaceId === currentWorkspace.id);
  const [selectedWorkflow, setSelectedWorkflow] = useState<RecordedWorkflow>(
    workspaceWorkflows[0] || workflows[0]
  );

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [captureSource, setCaptureSource] = useState<'desktop' | 'window' | 'mouse'>('desktop');

  // Test Run Sandbox State
  const [isRunningDryRun, setIsRunningDryRun] = useState(false);
  const [dryRunStepIndex, setDryRunStepIndex] = useState(-1);
  const [dryRunLog, setDryRunLog] = useState<string[]>([]);

  // Simulation timer for recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Update selected workflow if workspace changes
  useEffect(() => {
    if (workspaceWorkflows.length > 0) {
      setSelectedWorkflow(workspaceWorkflows[0]);
    }
  }, [currentWorkspace.id]);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      // add a simulated new step to the current workflow
      const newStep: WorkflowStep = {
        id: `wfs-${Date.now()}`,
        order: selectedWorkflow.steps.length + 1,
        actionType: 'gui_click',
        targetApp: 'Discovered App Handle',
        instruction: 'Click "Export Reconciliation Batch" in target window',
        confidenceThreshold: 94,
        clarifiedByUser: true,
      };
      setSelectedWorkflow({
        ...selectedWorkflow,
        steps: [...selectedWorkflow.steps, newStep],
      });
    }
  };

  const handleClarifyRule = (stepId: string, ruleText: string) => {
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.map((st) =>
        st.id === stepId
          ? { ...st, conditionRule: ruleText, clarifiedByUser: true }
          : st
      ),
      ambiguitiesCount: Math.max(0, selectedWorkflow.ambiguitiesCount - 1),
    });
  };

  const handleUpdateThreshold = (stepId: string, val: number) => {
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.map((st) =>
        st.id === stepId ? { ...st, confidenceThreshold: val } : st
      ),
    });
  };

  const startDryRunSandbox = () => {
    setIsRunningDryRun(true);
    setDryRunStepIndex(0);
    setDryRunLog(['[Sandbox Init] Booting air-gapped test container...', `[Sandbox] Loaded ${selectedWorkflow.steps.length} workflow steps.`]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < selectedWorkflow.steps.length) {
        setDryRunStepIndex(step);
        setDryRunLog((prev) => [
          ...prev,
          `[Step ${step + 1} Success] Executed ${selectedWorkflow.steps[step].actionType} on ${selectedWorkflow.steps[step].targetApp}`,
        ]);
      } else {
        clearInterval(interval);
        setDryRunLog((prev) => [...prev, '[Sandbox Verified] All steps executed with 0 exceptions. Ready for production promotion!']);
        setTimeout(() => setIsRunningDryRun(false), 800);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Observe & Learn introduction */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white p-5 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Demonstration-Guided AI Automation
            </span>
            <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">
              Observe & Learn
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Record Your Desktop Screen Once, Let Aegis Run It Autonomously
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Demonstrate routine tasks across legacy desktop software, accounting tools, or browser portals. The local model decomposes clicks into parameterized decision logic.
          </p>
        </div>

        {/* Live Recorder Control Card */}
        <div className="flex items-center gap-3 shrink-0 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <select
              value={captureSource}
              onChange={(e) => setCaptureSource(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="desktop">Full Screen (Display #1)</option>
              <option value="window">Active Foreground Window</option>
              <option value="mouse">Pointer & Hotkey Stream</option>
            </select>
          </div>

          <button
            onClick={handleToggleRecord}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Recording ({recordSeconds}s) - Stop</span>
              </>
            ) : (
              <>
                <Video className="w-3.5 h-3.5" />
                <span>Start Screen Capture</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Workflow Selector + Step Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Workflows List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recorded Workflows
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {workspaceWorkflows.length} Workflows
            </span>
          </div>

          <div className="space-y-2">
            {workspaceWorkflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setSelectedWorkflow(wf)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedWorkflow.id === wf.id
                    ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
                    : 'bg-white border-slate-200/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    wf.status === 'production'
                      ? 'bg-emerald-100 text-emerald-800'
                      : wf.status === 'verified'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {wf.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {wf.steps.length} steps · {wf.durationSeconds}s
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">
                  {wf.title}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Target: {wf.sourceApp}
                </div>

                {wf.ambiguitiesCount > 0 && (
                  <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    {wf.ambiguitiesCount} ambiguous rule(s) need clarification
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Visual Step Builder & Human-in-the-Loop Clarification */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs font-mono text-slate-400">{selectedWorkflow.recordedDate}</div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {selectedWorkflow.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={startDryRunSandbox}
                  disabled={isRunningDryRun}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningDryRun ? 'animate-spin' : ''}`} />
                  Test-Run Dry Run
                </button>

                <button
                  onClick={() => onPromoteWorkflow(selectedWorkflow)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Promote to Production Task
                </button>
              </div>
            </div>

            {/* Dry Run Sandbox Live Terminal if Active */}
            {isRunningDryRun && (
              <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs space-y-1 border border-slate-800 animate-in fade-in">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1 mb-1">
                  <span>Dry Run Desktop Sandbox Running (Step {dryRunStepIndex + 1}/{selectedWorkflow.steps.length})</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                {dryRunLog.map((log, i) => (
                  <div key={i} className="text-[11px] text-slate-300">
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Step-by-Step Flow Builder */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Observed Action Pipeline</span>
                <span className="text-slate-400 font-normal">
                  Adjust confidence thresholds and disambiguation rules below
                </span>
              </div>

              <div className="space-y-3">
                {selectedWorkflow.steps.map((step, idx) => {
                  const isCurrentDryRun = isRunningDryRun && dryRunStepIndex === idx;

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrentDryRun
                          ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {step.actionType.replace('_', ' ')}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {step.targetApp}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 font-medium">
                              {step.instruction}
                            </p>

                            {/* Screenshot Target preview if available */}
                            {step.screenshotTarget && (
                              <div className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200/60 inline-flex items-center gap-1.5">
                                <MousePointer className="w-3 h-3 text-indigo-600" />
                                {step.screenshotTarget}
                              </div>
                            )}

                            {/* Disambiguation / Condition Rule Box */}
                            <div className="pt-2">
                              {step.clarifiedByUser ? (
                                <div className="text-xs p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 space-y-1">
                                  <div className="font-semibold flex items-center gap-1.5 text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Rule Clarified for Autonomous Engine:
                                  </div>
                                  <p className="text-[11px] text-emerald-800">
                                    {step.conditionRule || 'Proceed automatically if confidence > 95%'}
                                  </p>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                                    <HelpCircle className="w-4 h-4 text-amber-600" />
                                    Human-in-the-Loop Clarification Required
                                  </div>
                                  <p className="text-xs text-amber-800">
                                    {step.conditionRule || 'Specify fallback behavior if window handle or data row is missing.'}
                                  </p>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                      onClick={() =>
                                        handleClarifyRule(
                                          step.id,
                                          'Halt & trigger Human Sign-off gate if invoice variance exceeds $50 AUD'
                                        )
                                      }
                                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 transition-colors cursor-pointer"
                                    >
                                      Require Human Sign-Off &gt; $50
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleClarifyRule(
                                          step.id,
                                          'Auto-retry up to 3 times, then notify duty manager'
                                        )
                                      }
                                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 transition-colors cursor-pointer"
                                    >
                                      Auto-Retry 3x
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Confidence Threshold Slider */}
                        <div className="w-32 shrink-0 p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-right space-y-1">
                          <div className="text-[10px] text-slate-500 font-semibold uppercase">
                            Min Confidence
                          </div>
                          <div className="text-xs font-mono font-bold text-slate-900">
                            {step.confidenceThreshold}%
                          </div>
                          <input
                            type="range"
                            min="80"
                            max="100"
                            value={step.confidenceThreshold}
                            onChange={(e) => handleUpdateThreshold(step.id, Number(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
