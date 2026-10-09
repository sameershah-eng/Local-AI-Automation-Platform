import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Key,
  Trash2,
  Edit3,
  Plus,
  Upload,
  Layers,
  Lock,
  FileText,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MemoryItem, MemoryType, Workspace } from '../../types';

interface MemoryViewProps {
  memories: MemoryItem[];
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onVerifyMemory: (id: string) => void;
  onPurgeMemory: (id: string) => void;
  onAddMemory: (memory: Partial<MemoryItem>) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memories,
  workspaces,
  currentWorkspace,
  onVerifyMemory,
  onPurgeMemory,
  onAddMemory,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | MemoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shieldActive, setShieldActive] = useState(true);

  // Ingestion Modal / Quick Add
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<MemoryType>('fact');
  const [newSource, setNewSource] = useState('Manual Operator Entry');

  const workspaceMemories = memories.filter((m) => m.workspaceId === currentWorkspace.id);

  const filteredMemories = workspaceMemories.filter((mem) => {
    const matchesType = typeFilter === 'all' || mem.type === typeFilter;
    const matchesSearch =
      mem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const factsCount = workspaceMemories.filter((m) => m.type === 'fact').length;
  const assumptionsCount = workspaceMemories.filter((m) => m.type === 'assumption').length;
  const credentialsCount = workspaceMemories.filter((m) => m.type === 'credential_hint').length;

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddMemory({
      workspaceId: currentWorkspace.id,
      title: newTitle.trim(),
      content: newContent.trim(),
      type: newType,
      source: newSource.trim(),
      confidence: newType === 'fact' ? 100 : 70,
      lastVerified: 'Just now',
      isVerified: newType === 'fact',
    });

    setNewTitle('');
    setNewContent('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Strict Partitioning & Prompt Injection Defense */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Workspace Isolation Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Air-Gapped Multi-Tenant Vector Partition
              </span>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-bold">
                100% Zero Cross-Tenant Leakage
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Active Store: {currentWorkspace.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Encrypted enclave key: <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{currentWorkspace.isolationKey}</code>. Vector search queries are cryptographically restricted to this partition only.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-3 mt-3 border-t border-slate-100 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-900">{currentWorkspace.vectorCount.toLocaleString()}</span> Local Vectors
            </div>
            <div>·</div>
            <div>
              <span className="font-bold text-slate-900">{factsCount}</span> Verified Facts
            </div>
            <div>·</div>
            <div>
              <span className="font-bold text-amber-700">{assumptionsCount}</span> Hypotheses
            </div>
          </div>
        </div>

        {/* Prompt Injection Shield Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Prompt Injection Defense
              </span>
              <button
                onClick={() => setShieldActive(!shieldActive)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  shieldActive ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    shieldActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {shieldActive ? 'Shield Active (Llama-Guard-3)' : 'Shield Standby'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sanitizes incoming emails, PDFs, and web pages for prompt hacking, prompt leaking, and invisible zero-width unicode attacks.
            </p>
          </div>

          <div className="pt-2 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg mt-2 font-mono">
            Blocked 14 hidden text attacks this week
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facts, temporary assumptions, or credential bindings..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['all', 'fact', 'assumption', 'credential_hint'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'credential_hint' ? 'Credentials' : t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Ingest Knowledge Item
        </button>
      </div>

      {/* Memory Tree / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.map((mem) => {
          const isFact = mem.type === 'fact';
          const isAssumption = mem.type === 'assumption';

          return (
            <div
              key={mem.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isFact
                  ? 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                  : isAssumption
                  ? 'bg-amber-50/40 border-amber-200 shadow-2xs hover:border-amber-300'
                  : 'bg-indigo-50/30 border-indigo-200 shadow-2xs hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isFact
                        ? 'bg-emerald-100 text-emerald-800'
                        : isAssumption
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {isFact ? 'Verified Fact' : isAssumption ? 'Temporary Hypothesis' : 'Credential Hint'}
                  </span>

                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    {mem.confidence}% Conf.
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  {mem.title}
                </h4>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {mem.content}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 font-mono truncate mb-2">
                  Source: {mem.source}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{mem.lastVerified}</span>

                  <div className="flex items-center gap-1.5">
                    {isAssumption && (
                      <button
                        onClick={() => onVerifyMemory(mem.id)}
                        className="px-2 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer"
                        title="Promote assumption to verified fact"
                      >
                        Verify as Fact
                      </button>
                    )}

                    <button
                      onClick={() => onPurgeMemory(mem.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Purge / Wipe from memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ingestion Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Ingest Knowledge Item</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="fact">Verified Fact (100% Confidence)</option>
                  <option value="assumption">Working Assumption / Hypothesis</option>
                  <option value="credential_hint">Credential Hint / Token Metadata</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Title / Subject
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Shipping Port Holiday Schedule"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Knowledge Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter detailed facts or extracted document rules..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Document / Provenance Source
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g., Melbourne_Port_2026.pdf"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  Embed & Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
