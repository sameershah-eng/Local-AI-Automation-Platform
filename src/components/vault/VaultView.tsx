import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Download,
  RotateCw,
  Plus,
  AlertTriangle,
  Fingerprint,
  Layers,
  Check,
} from 'lucide-react';
import {
  VaultCredential,
  ApprovalRequest,
  AuditLogItem,
  Workspace,
} from '../../types';

interface VaultViewProps {
  credentials: VaultCredential[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLogItem[];
  currentWorkspace: Workspace;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onRotateCredential: (id: string) => void;
  onAddCredential: (cred: Partial<VaultCredential>) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  credentials,
  approvals,
  auditLogs,
  currentWorkspace,
  onApproveRequest,
  onRejectRequest,
  onRotateCredential,
  onAddCredential,
}) => {
  const [activeTab, setActiveTab] = useState<'gate' | 'credentials' | 'audit'>('gate');
  const [searchAudit, setSearchAudit] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [isAddCredOpen, setIsAddCredOpen] = useState(false);
  const [newCredService, setNewCredService] = useState('');
  const [newCredType, setNewCredType] = useState<any>('API Key');
  const [newCredLimit, setNewCredLimit] = useState('');
  const [exportedStatus, setExportedStatus] = useState(false);

  const workspaceCredentials = credentials.filter((c) => c.workspaceId === currentWorkspace.id);
  const workspaceApprovals = approvals.filter((a) => a.workspaceId === currentWorkspace.id);
  const workspaceAuditLogs = auditLogs.filter((l) => l.workspaceId === currentWorkspace.id);

  const pendingApprovals = workspaceApprovals.filter((a) => a.status === 'pending');

  const filteredLogs = workspaceAuditLogs.filter((log) => {
    const matchesFilter = actionTypeFilter === 'all' || log.actionType === actionTypeFilter;
    const matchesSearch =
      log.target.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.sha256Hash.toLowerCase().includes(searchAudit.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportAudit = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AegisLocal_AuditLog_${currentWorkspace.id}_20261009.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportedStatus(true);
    setTimeout(() => setExportedStatus(false), 2500);
  };

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredService.trim()) return;

    onAddCredential({
      workspaceId: currentWorkspace.id,
      service: newCredService.trim(),
      credentialType: newCredType,
      authorityLimit: newCredLimit || 'Read-Only Standard Scope',
      boundIP: '127.0.0.1 (Enclave bound)',
      status: 'active',
      lastRotated: 'Just now',
    });

    setNewCredService('');
    setNewCredLimit('');
    setIsAddCredOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            {
              id: 'gate',
              label: 'Action Approval Gate',
              badge: pendingApprovals.length > 0 ? `${pendingApprovals.length} Pending` : undefined,
              badgeColor: 'bg-rose-100 text-rose-800 font-bold',
            },
            {
              id: 'credentials',
              label: 'Encrypted Credential Vault',
              badge: `${workspaceCredentials.length} Keys`,
              badgeColor: 'bg-indigo-100 text-indigo-800',
            },
            {
              id: 'audit',
              label: 'Immutable Cryptographic Audit Trail',
              badge: `${workspaceAuditLogs.length} Records`,
              badgeColor: 'bg-slate-100 text-slate-700',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'audit' && (
          <button
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            {exportedStatus ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Exported Signed JSON</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Log</span>
              </>
            )}
          </button>
        )}

        {activeTab === 'credentials' && (
          <button
            onClick={() => setIsAddCredOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Store New Credential</span>
          </button>
        )}
      </div>

      {/* 1. Action Approval Gate Tab */}
      {activeTab === 'gate' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-white p-5 rounded-2xl border border-rose-100 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Human-in-the-Loop High-Risk Decision Gate
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Actions Requiring Explicit Cryptographic Sign-Off
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Transactions, outbound wire transfers, or sensitive database mutations that exceed autonomous policy thresholds are intercepted here before execution.
              </p>
            </div>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900">No Pending Approvals</h4>
              <p className="text-xs text-slate-500 mt-1">
                All autonomous agent operations in {currentWorkspace.name} are running within standard authorized thresholds.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {req.riskLevel.toUpperCase()} RISK
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Requested: {req.timestamp}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{req.title}</h4>
                    <p className="text-xs text-slate-600">{req.justification}</p>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Source Worker: <span className="text-indigo-700 font-semibold">{req.requestedBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:pl-4 md:border-l md:border-slate-100">
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Reject & Abort
                    </button>
                    <button
                      onClick={() => onApproveRequest(req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                    >
                      <Fingerprint className="w-4 h-4" />
                      Approve & Sign Digest
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Encrypted Credential Vault Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                <Lock className="w-4 h-4" />
                Local Hardware Security Enclave (AES-256-GCM)
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Encrypted Credentials with Strict Scopes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keys and session cookies never leave this workstation. Subnet IP binding prevents exfiltration.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaceCredentials.map((cred) => (
              <div
                key={cred.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cred.service}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{cred.credentialType}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {cred.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authority Boundary:</span>
                    <span className="font-semibold text-slate-800 text-right">{cred.authorityLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP Binding:</span>
                    <span className="font-mono text-slate-700">{cred.boundIP}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Key Rotation:</span>
                    <span className="text-slate-600">{cred.lastRotated}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onRotateCredential(cred.id)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Rotate Enclave Key
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Immutable Cryptographic Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable Audit Journal</h3>
              <p className="text-xs text-slate-500">
                Every file modification, desktop interaction, and API dispatch is sealed with SHA-256 hashes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchAudit}
                  onChange={(e) => setSearchAudit(e.target.value)}
                  placeholder="Filter targets or actors..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <select
                value={actionTypeFilter}
                onChange={(e) => setActionTypeFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                <option value="all">All Action Types</option>
                <option value="Desktop GUI">Desktop GUI</option>
                <option value="Filesystem">Filesystem</option>
                <option value="Payment Call">Payment Call</option>
                <option value="API Dispatch">API Dispatch</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target Window / Endpoint</th>
                  <th className="py-3 px-4">Actor Agent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 font-mono">SHA-256 Digest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{log.actionType}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-800 max-w-xs truncate">
                      {log.target}
                    </td>
                    <td className="py-3 px-4 text-indigo-700 font-medium">{log.actor}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.status === 'Success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'Blocked'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {log.sha256Hash.substring(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Store Credential Modal */}
      {isAddCredOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Store New Hardware-Bound Credential</h3>
              <button
                onClick={() => setIsAddCredOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCredential} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Service / Integration Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCredService}
                  onChange={(e) => setNewCredService(e.target.value)}
                  placeholder="e.g., NAB Transact Merchant API"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Credential Type
                </label>
                <select
                  value={newCredType}
                  onChange={(e) => setNewCredType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="API Key">API Key</option>
                  <option value="OAuth Token">OAuth Token</option>
                  <option value="Banking Certificate">Banking Certificate</option>
                  <option value="Session Cookie">Session Cookie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Authority Limit & Safety Ceiling
                </label>
                <input
                  type="text"
                  value={newCredLimit}
                  onChange={(e) => setNewCredLimit(e.target.value)}
                  placeholder="e.g., Read-Only or Max $500 AUD Auto-Approved"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg text-[11px] text-emerald-900">
                Encrypted in hardware enclave with AES-256-GCM. Bound to local loopback interface.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCredOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  Encrypt & Seal in Enclave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
