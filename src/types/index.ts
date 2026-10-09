export type WorkspaceId = 'apex' | 'vanguard' | 'horizon';

export interface Workspace {
  id: WorkspaceId;
  name: string;
  tagline: string;
  industry: string;
  isolationKey: string;
  vectorCount: number;
  activeAgents: number;
  complianceLevel: 'HIPAA & ISO27001' | 'SOC2 Type II' | 'PCI-DSS Tier 1';
  color: string;
}

export type TaskStatus = 'running' | 'paused' | 'checkpointed' | 'completed' | 'failed' | 'needs_auth';

export interface TaskStep {
  id: string;
  phase: 'Plan' | 'Execute' | 'Verify' | 'Report';
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  detail: string;
  timestamp?: string;
  checkpointId?: string;
}

export interface TaskLog {
  id: string;
  time: string;
  level: 'info' | 'warn' | 'action' | 'checkpoint';
  message: string;
}

export interface AutonomousTask {
  id: string;
  workspaceId: WorkspaceId;
  title: string;
  description: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
  startedAt: string;
  lastCheckpoint: string;
  checkpointNumber: number;
  assignedModel: string;
  requiresAuth: boolean;
  authLimitUSD?: number;
  steps: TaskStep[];
  logs: TaskLog[];
  proofScreenshotUrl?: string;
  proofFileName?: string;
  proofFileSummary?: string;
}

export interface WorkflowStep {
  id: string;
  order: number;
  actionType: 'gui_click' | 'keyboard_input' | 'ocr_read' | 'api_call' | 'approval_prompt';
  targetApp: string;
  instruction: string;
  conditionRule?: string;
  confidenceThreshold: number;
  clarifiedByUser: boolean;
  screenshotTarget?: string;
}

export interface RecordedWorkflow {
  id: string;
  workspaceId: WorkspaceId;
  title: string;
  sourceApp: string;
  recordedDate: string;
  status: 'draft' | 'verified' | 'production';
  durationSeconds: number;
  steps: WorkflowStep[];
  ambiguitiesCount: number;
}

export interface TranscriptItem {
  id: string;
  speaker: string;
  speakerRole: string;
  timestamp: string;
  text: string;
  sentiment?: 'positive' | 'neutral' | 'urgent';
}

export interface MeetingActionItem {
  id: string;
  task: string;
  owner: string;
  due: string;
  status: 'open' | 'completed';
  confidence: number;
}

export interface VectorKnowledgeSuggestion {
  id: string;
  queryTrigger: string;
  matchedContent: string;
  sourceDoc: string;
  relevanceScore: number;
  appliedCount: number;
}

export type MemoryType = 'fact' | 'assumption' | 'credential_hint';

export interface MemoryItem {
  id: string;
  workspaceId: WorkspaceId;
  type: MemoryType;
  title: string;
  content: string;
  source: string;
  confidence: number; // 0-100
  lastVerified: string;
  isVerified: boolean;
}

export interface LocalModel {
  id: string;
  name: string;
  parameters: string;
  quantization: string;
  vramUsageGB: number;
  contextWindow: number;
  status: 'loaded' | 'standby' | 'unloaded';
  role: 'Reasoning & Orchestration' | 'Code & SQL Synthesis' | 'Speech Diarization' | 'Embedding & Retrieval';
  tokensPerSec: number;
  gpuAssigned: string;
}

export interface GPUSpec {
  id: number;
  name: string;
  vramUsedGB: number;
  vramTotalGB: number;
  tempCelsius: number;
  powerWatts: number;
  utilizationPct: number;
}

export interface VaultCredential {
  id: string;
  workspaceId: WorkspaceId;
  service: string;
  credentialType: 'OAuth Token' | 'API Key' | 'Session Cookie' | 'Banking Certificate';
  authorityLimit: string;
  lastRotated: string;
  status: 'active' | 'warning' | 'locked';
  boundIP: string;
}

export interface ApprovalRequest {
  id: string;
  workspaceId: WorkspaceId;
  title: string;
  requestedBy: string;
  amountUSD?: number;
  justification: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
}

export interface AuditLogItem {
  id: string;
  workspaceId: WorkspaceId;
  timestamp: string;
  actionType: 'Desktop GUI' | 'Filesystem' | 'Payment Call' | 'API Dispatch' | 'Memory Wipe';
  target: string;
  actor: string;
  status: 'Success' | 'Blocked' | 'Authorized' | 'Rolled Back';
  sha256Hash: string;
}
