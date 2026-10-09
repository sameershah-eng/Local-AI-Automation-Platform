import React, { useState } from 'react';
import {
  ChevronDown,
  ShieldCheck,
  Cpu,
  Zap,
  Activity,
  HardDrive,
  AlertOctagon,
  Building2,
  Lock,
  Radio,
  CheckCircle2,
  Server,
  Layers,
} from 'lucide-react';
import { Workspace, WorkspaceId } from '../../types';

interface HeaderProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onSelectWorkspace: (id: WorkspaceId) => void;
  isLockedDown: boolean;
  onOpenEmergencyStop: () => void;
  telemetry: {
    vramUsed: number;
    vramTotal: number;
    cpuPct: number;
    ramUsed: number;
    ramTotal: number;
    tokensPerSec: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  isLockedDown,
  onOpenEmergencyStop,
  telemetry,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [airgapInfoOpen, setAirgapInfoOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top System Status Banner if Locked Down */}
      {isLockedDown && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" />
            <span>EMERGENCY LOCKDOWN ACTIVE — All Autonomous Agents Frozen. Checkpoints Stored Locally.</span>
          </div>
          <button
            onClick={onOpenEmergencyStop}
            className="underline underline-offset-2 hover:text-rose-100 cursor-pointer font-bold"
          >
            Manage Safe Recovery &rarr;
          </button>
        </div>
      )}

      <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Workspace Selector & Brand context */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200 text-slate-800 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                {currentWorkspace.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                  {currentWorkspace.name}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {currentWorkspace.industry} · {currentWorkspace.complianceLevel}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {workspaceMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setWorkspaceMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Business Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        onSelectWorkspace(ws.id);
                        setWorkspaceMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                        ws.id === currentWorkspace.id
                          ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                          ws.id === currentWorkspace.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {ws.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate flex items-center justify-between">
                          <span>{ws.name}</span>
                          {ws.id === currentWorkspace.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{ws.tagline}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Vectors: {ws.vectorCount.toLocaleString()} · {ws.activeAgents} Agents
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="pt-1.5 border-t border-slate-100 px-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Isolated Local Vector Namespaces</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Local Air-Gapped Engine Status Badge */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setAirgapInfoOpen(!airgapInfoOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-medium hover:bg-emerald-100/70 transition-colors cursor-pointer"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold tracking-tight">LOCAL ENGINE ONLINE</span>
              <span className="text-emerald-600">·</span>
              <span className="text-[11px] text-emerald-700">4x RTX 4090 (0ms Cloud Latency)</span>
              <span className="text-emerald-600">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-900 bg-emerald-200/60 px-1.5 py-0.5 rounded">
                <Lock className="w-2.5 h-2.5" /> AIR-GAPPED
              </span>
            </button>

            {/* Air-gap Details Popover */}
            {airgapInfoOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setAirgapInfoOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Air-Gapped Security Verification
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Bind Interface</span>
                      <span className="font-mono text-slate-900">127.0.0.1:8443 (Local Only)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">WAN Internet Egress</span>
                      <span className="font-semibold text-rose-600">0.00 KB (Hardware Blocked)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">DNS Resolution Leak</span>
                      <span className="font-semibold text-emerald-600">Zero (Loopback DNS)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Inference Host</span>
                      <span className="font-medium text-slate-800">Local PCIe 5.0 Bus (96GB VRAM)</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-500">
                    Enterprise confidentiality guarantee: Your business data, PDF invoices, and audio never touch external third-party cloud servers.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Hardware Telemetry Bar & Emergency Stop */}
        <div className="flex items-center gap-3">
          {/* Telemetry Chips */}
          <div className="hidden lg:flex items-center gap-2 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs">
            {/* GPU VRAM */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500 text-[11px]">VRAM:</span>
              <span className="font-mono font-bold text-slate-800 text-[11px]">
                {telemetry.vramUsed.toFixed(1)} / {telemetry.vramTotal} GB
              </span>
              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${(telemetry.vramUsed / telemetry.vramTotal) * 100}%` }}
                />
              </div>
            </div>

            {/* CPU */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-slate-500 text-[11px]">CPU:</span>
              <span className="font-mono font-semibold text-slate-800 text-[11px]">
                {telemetry.cpuPct}%
              </span>
            </div>

            {/* RAM */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white shadow-2xs">
              <HardDrive className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-slate-500 text-[11px]">RAM:</span>
              <span className="font-mono font-semibold text-slate-800 text-[11px]">
                {telemetry.ramUsed.toFixed(1)} / {telemetry.ramTotal} GB
              </span>
            </div>

            {/* Speed */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-2xs">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="font-mono font-bold text-[11px]">
                {telemetry.tokensPerSec.toFixed(1)} t/s
              </span>
            </div>
          </div>

          {/* Emergency Stop Button */}
          <button
            type="button"
            onClick={onOpenEmergencyStop}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-tight shadow-sm transition-all cursor-pointer ${
              isLockedDown
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white hover:shadow-rose-600/25 active:scale-95'
            }`}
          >
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{isLockedDown ? 'ENGINE LOCKED' : 'EMERGENCY STOP'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
