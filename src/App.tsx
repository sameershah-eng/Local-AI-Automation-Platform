/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { TasksView } from './components/tasks/TasksView';
import { RecorderView } from './components/recorder/RecorderView';
import { MeetingView } from './components/meeting/MeetingView';
import { MemoryView } from './components/memory/MemoryView';
import { ModelsView } from './components/models/ModelsView';
import { VaultView } from './components/vault/VaultView';
import { EmergencyStopModal } from './components/common/EmergencyStopModal';

import {
  INITIAL_WORKSPACES,
  INITIAL_TASKS,
  INITIAL_RECORDED_WORKFLOWS,
  INITIAL_TRANSCRIPTS,
  INITIAL_ACTION_ITEMS,
  INITIAL_VECTOR_SUGGESTIONS,
  INITIAL_MEMORIES,
  INITIAL_MODELS,
  INITIAL_GPUS,
  INITIAL_CREDENTIALS,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
} from './mock/initialData';

import {
  Workspace,
  WorkspaceId,
  AutonomousTask,
  RecordedWorkflow,
  TranscriptItem,
  MeetingActionItem,
  MemoryItem,
  LocalModel,
  VaultCredential,
  ApprovalRequest,
  AuditLogItem,
} from './types';

export default function App() {
  // Global Workspaces
  const [workspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<WorkspaceId>('apex');

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Emergency Stop & Safe Lockdown
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLockedDown, setIsLockedDown] = useState(false);

  // Data States
  const [tasks, setTasks] = useState<AutonomousTask[]>(INITIAL_TASKS);
  const [workflows, setWorkflows] = useState<RecordedWorkflow[]>(INITIAL_RECORDED_WORKFLOWS);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>(INITIAL_TRANSCRIPTS);
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>(INITIAL_ACTION_ITEMS);
  const [vectorSuggestions] = useState(INITIAL_VECTOR_SUGGESTIONS);
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [models, setModels] = useState<LocalModel[]>(INITIAL_MODELS);
  const [gpus] = useState(INITIAL_GPUS);
  const [credentials, setCredentials] = useState<VaultCredential[]>(INITIAL_CREDENTIALS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Dynamic Telemetry
  const [telemetry, setTelemetry] = useState({
    vramUsed: 38.2,
    vramTotal: 96.0,
    cpuPct: 28,
    ramUsed: 64.5,
    ramTotal: 256.0,
    tokensPerSec: 42.4,
  });

  const currentWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  // Subtle live telemetry fluctuation
  useEffect(() => {
    if (isLockedDown) {
      setTelemetry((prev) => ({
        ...prev,
        cpuPct: 4,
        tokensPerSec: 0.0,
      }));
      return;
    }

    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        cpuPct: Math.floor(Math.random() * 8) + 24,
        tokensPerSec: +(41.5 + Math.random() * 3).toFixed(1),
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isLockedDown]);

  // Handle Emergency Stop Kill Switch
  const handleConfirmEmergencyStop = (reason: string) => {
    setIsLockedDown(true);

    // Freeze all active tasks
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        status: t.status === 'running' ? 'paused' : t.status,
      }))
    );

    // Log to immutable audit journal
    const haltAuditLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      workspaceId: currentWorkspaceId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionType: 'Desktop GUI',
      target: 'Emergency Engine Kill-Switch Activated',
      actor: 'Human Operator',
      status: 'Blocked',
      sha256Hash: '9a48fbc2e11893c52e1858a8f89c0258129034c56e36b8563a3d5e6833890251',
    };
    setAuditLogs((prev) => [haltAuditLog, ...prev]);
  };

  const handleResetLockdown = () => {
    setIsLockedDown(false);

    const resumeAuditLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      workspaceId: currentWorkspaceId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionType: 'Desktop GUI',
      target: 'Safe Standby Cleared -> Engine Resumed',
      actor: 'Human Operator',
      status: 'Authorized',
      sha256Hash: '2c5a7114b341f2389bc094236a2e873b5443a53f092301c435a26620f49d32b1',
    };
    setAuditLogs((prev) => [resumeAuditLog, ...prev]);
  };

  // Task Handlers
  const handleTogglePauseTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newStatus = t.status === 'paused' ? 'running' : 'paused';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const handleAbortTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSimulateRecovery = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'running',
            progress: Math.min(100, t.progress + 6),
            checkpointNumber: t.checkpointNumber + 1,
            lastCheckpoint: `Checkpoint #${t.checkpointNumber + 1}: Auto-healed state snapshot verified after crash. Resumed safely.`,
            logs: [
              ...t.logs,
              {
                id: `log-${Date.now()}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                level: 'checkpoint',
                message: `[Self-Healing Recovery] Process resumed from NVMe Checkpoint #${t.checkpointNumber}. All 0ms buffers validated.`,
              },
            ],
          };
        }
        return t;
      })
    );
  };

  const handleTriggerNewTask = (taskData: Partial<AutonomousTask>) => {
    const newTask: AutonomousTask = {
      id: `task-${Math.floor(Math.random() * 900) + 100}`,
      workspaceId: currentWorkspaceId,
      title: taskData.title || 'Custom Autonomous Operation',
      description: taskData.description || 'Executing in sandboxed environment',
      status: 'running',
      progress: 12,
      currentStep: 'Phase 1: Analyzing DOM structure & setting display hooks',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastCheckpoint: 'Checkpoint #1: Initialized Sandboxed Desktop Environment',
      checkpointNumber: 1,
      assignedModel: taskData.assignedModel || 'Llama-3.1-70B-Instruct-Q4_K_M',
      requiresAuth: taskData.requiresAuth ?? true,
      authLimitUSD: taskData.authLimitUSD,
      steps: [
        { id: 'st-1', phase: 'Plan', name: 'Mount virtual frame buffer & load target window', status: 'completed', detail: 'Initialized X11/Win32 local handle' },
        { id: 'st-2', phase: 'Execute', name: 'Execute workflow parameters', status: 'in_progress', detail: 'Running primary directive' },
        { id: 'st-3', phase: 'Verify', name: 'Cryptographic sanity check & output verification', status: 'pending', detail: 'Awaiting completion' },
        { id: 'st-4', phase: 'Report', name: 'Update local ledger & sign audit trail', status: 'pending', detail: 'Ready for commit' },
      ],
      logs: [
        { id: 'lg-1', time: 'Just now', level: 'info', message: 'Autonomous agent spawned by user.' },
        { id: 'lg-2', time: 'Just now', level: 'action', message: 'Display driver attached to display handle #0x4A11' },
      ],
      proofFileName: 'Execution_Journal_Live.csv',
      proofFileSummary: 'Initialized verified journal file.',
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  // Workflow Promotion to Production Task
  const handlePromoteWorkflow = (wf: RecordedWorkflow) => {
    const newTask: AutonomousTask = {
      id: `task-${Math.floor(Math.random() * 900) + 200}`,
      workspaceId: wf.workspaceId,
      title: `[Automated] ${wf.title}`,
      description: `Production deployment of recorded demonstration on ${wf.sourceApp}`,
      status: 'running',
      progress: 25,
      currentStep: `Step 1: ${wf.steps[0]?.instruction || 'Initiating GUI sequence'}`,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastCheckpoint: 'Checkpoint #1: Verified target desktop app handles',
      checkpointNumber: 1,
      assignedModel: 'Llama-3.1-70B-Instruct-Q4_K_M',
      requiresAuth: true,
      authLimitUSD: 500,
      steps: wf.steps.map((st, i) => ({
        id: `step-${st.id}`,
        phase: i === 0 ? 'Plan' : i === wf.steps.length - 1 ? 'Report' : 'Execute',
        name: st.instruction,
        status: i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'pending',
        detail: `Target: ${st.targetApp}`,
      })),
      logs: [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          level: 'info',
          message: `Promoted recorded workflow '${wf.title}' into active background task engine.`,
        },
      ],
    };

    setTasks((prev) => [newTask, ...prev]);
    setActiveTab('tasks');
  };

  // Meeting Handlers
  const handleAddTranscript = (item: TranscriptItem) => {
    setTranscripts((prev) => [...prev, item]);
  };

  const handleToggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((act) =>
        act.id === id
          ? { ...act, status: act.status === 'open' ? 'completed' : 'open' }
          : act
      )
    );
  };

  const handleAddActionItem = (item: Partial<MeetingActionItem>) => {
    const newAct: MeetingActionItem = {
      id: `act-${Date.now()}`,
      task: item.task || 'New Follow-Up',
      owner: item.owner || 'Dave K.',
      due: item.due || 'Tomorrow',
      status: 'open',
      confidence: 98,
    };
    setActionItems((prev) => [...prev, newAct]);
  };

  // Memory Handlers
  const handleVerifyMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              type: 'fact',
              isVerified: true,
              confidence: 100,
              lastVerified: 'Verified by Human Operator today',
            }
          : m
      )
    );
  };

  const handlePurgeMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMemory = (item: Partial<MemoryItem>) => {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      workspaceId: currentWorkspaceId,
      title: item.title || 'New Knowledge Entry',
      content: item.content || '',
      type: item.type || 'fact',
      source: item.source || 'Manual User Ingestion',
      confidence: item.confidence || 100,
      lastVerified: 'Just now',
      isVerified: item.isVerified ?? true,
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  // Models Handlers
  const handleToggleModelStatus = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === modelId) {
          const nextStatus = m.status === 'loaded' ? 'unloaded' : 'loaded';
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleUpdateContextWindow = (modelId: string, contextSize: number) => {
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, contextWindow: contextSize } : m))
    );
  };

  // Vault Handlers
  const handleApproveRequest = (id: string) => {
    const req = approvals.find((a) => a.id === id);
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
    );

    if (req) {
      const newAudit: AuditLogItem = {
        id: `aud-${Date.now()}`,
        workspaceId: currentWorkspaceId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        actionType: req.amountUSD ? 'Payment Call' : 'API Dispatch',
        target: req.title,
        actor: 'Human Sign-off Authorized',
        status: 'Authorized',
        sha256Hash: 'a71e89c33290141f092301c435a26620f49d32b189218274bb98acfa7114b341',
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleRejectRequest = (id: string) => {
    const req = approvals.find((a) => a.id === id);
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
    );

    if (req) {
      const newAudit: AuditLogItem = {
        id: `aud-${Date.now()}`,
        workspaceId: currentWorkspaceId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        actionType: 'Payment Call',
        target: req.title,
        actor: 'Human Operator (Blocked)',
        status: 'Blocked',
        sha256Hash: '3b5443a53f092301c435a26620f49d32b189218274bb98acfa7114b341f2389b',
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleRotateCredential = (credId: string) => {
    setCredentials((prev) =>
      prev.map((c) =>
        c.id === credId
          ? { ...c, lastRotated: 'Rotated today (Fresh hardware entropy)' }
          : c
      )
    );
  };

  const handleAddCredential = (cred: Partial<VaultCredential>) => {
    const newCred: VaultCredential = {
      id: `cred-${Date.now()}`,
      workspaceId: currentWorkspaceId,
      service: cred.service || 'New Service Token',
      credentialType: cred.credentialType || 'API Key',
      authorityLimit: cred.authorityLimit || 'Standard Scope',
      boundIP: '127.0.0.1 (Enclave bound)',
      status: 'active',
      lastRotated: 'Just now',
    };
    setCredentials((prev) => [newCred, ...prev]);
  };

  const activeTasksCount = tasks.filter(
    (t) => t.workspaceId === currentWorkspaceId && t.status === 'running'
  ).length;

  const pendingApprovalsCount = approvals.filter(
    (a) => a.workspaceId === currentWorkspaceId && a.status === 'pending'
  ).length;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentWorkspace={currentWorkspace}
        activeTasksCount={activeTasksCount}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onSelectWorkspace={setCurrentWorkspaceId}
          isLockedDown={isLockedDown}
          onOpenEmergencyStop={() => setIsEmergencyModalOpen(true)}
          telemetry={telemetry}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-slate-50/50 via-slate-50 to-white">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'tasks' && (
              <TasksView
                tasks={tasks}
                currentWorkspace={currentWorkspace}
                onTogglePauseTask={handleTogglePauseTask}
                onAbortTask={handleAbortTask}
                onSimulateRecovery={handleSimulateRecovery}
                onTriggerNewTask={handleTriggerNewTask}
                onEmergencyStopAll={() => setIsEmergencyModalOpen(true)}
              />
            )}

            {activeTab === 'recorder' && (
              <RecorderView
                workflows={workflows}
                currentWorkspace={currentWorkspace}
                onPromoteWorkflow={handlePromoteWorkflow}
              />
            )}

            {activeTab === 'meeting' && (
              <MeetingView
                transcripts={transcripts}
                actionItems={actionItems}
                vectorSuggestions={vectorSuggestions}
                currentWorkspace={currentWorkspace}
                onAddTranscript={handleAddTranscript}
                onToggleActionItem={handleToggleActionItem}
                onAddActionItem={handleAddActionItem}
              />
            )}

            {activeTab === 'memory' && (
              <MemoryView
                memories={memories}
                workspaces={workspaces}
                currentWorkspace={currentWorkspace}
                onVerifyMemory={handleVerifyMemory}
                onPurgeMemory={handlePurgeMemory}
                onAddMemory={handleAddMemory}
              />
            )}

            {activeTab === 'models' && (
              <ModelsView
                models={models}
                gpus={gpus}
                onToggleModelStatus={handleToggleModelStatus}
                onUpdateContextWindow={handleUpdateContextWindow}
              />
            )}

            {activeTab === 'vault' && (
              <VaultView
                credentials={credentials}
                approvals={approvals}
                auditLogs={auditLogs}
                currentWorkspace={currentWorkspace}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
                onRotateCredential={handleRotateCredential}
                onAddCredential={handleAddCredential}
              />
            )}
          </div>
        </main>
      </div>

      {/* Emergency Stop Modal */}
      <EmergencyStopModal
        isOpen={isEmergencyModalOpen}
        isLockedDown={isLockedDown}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirmStop={handleConfirmEmergencyStop}
        onResetLockdown={handleResetLockdown}
      />
    </div>
  );
}
