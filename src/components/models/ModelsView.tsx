import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  HardDrive,
  Layers,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Power,
  RotateCw,
  Lock,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import { LocalModel, GPUSpec } from '../../types';

interface ModelsViewProps {
  models: LocalModel[];
  gpus: GPUSpec[];
  onToggleModelStatus: (modelId: string) => void;
  onUpdateContextWindow: (modelId: string, contextSize: number) => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  models,
  gpus,
  onToggleModelStatus,
  onUpdateContextWindow,
}) => {
  // Cloud Fallback Safety Locks
  const [cloudFallbackEnabled, setCloudFallbackEnabled] = useState(false);
  const [cloudSpendCap, setCloudSpendCap] = useState(0.0);
  const [strictAnonymization, setStrictAnonymization] = useState(true);

  const totalVramUsed = gpus.reduce((acc, g) => acc + g.vramUsedGB, 0);
  const totalVramCapacity = gpus.reduce((acc, g) => acc + g.vramTotalGB, 0);

  return (
    <div className="space-y-6">
      {/* 4x RTX 4090 Hardware Telemetry Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Local Hardware PCIe Engine — 4x NVIDIA RTX 4090 (96 GB Total VRAM)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct DMA transfer between GPU clusters over NVLink/PCIe 5.0 · Zero external API reliance
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Aggregate VRAM:</span>
            <span className="font-bold text-slate-900">
              {totalVramUsed.toFixed(1)} / {totalVramCapacity} GB ({((totalVramUsed / totalVramCapacity) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* 4 GPUs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gpus.map((gpu) => (
            <div
              key={gpu.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{gpu.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    gpu.utilizationPct > 70
                      ? 'bg-rose-100 text-rose-800'
                      : gpu.utilizationPct > 40
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {gpu.utilizationPct}% LOAD
                </span>
              </div>

              {/* VRAM Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>VRAM</span>
                  <span className="font-semibold text-slate-800">
                    {gpu.vramUsedGB} / {gpu.vramTotalGB} GB
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${(gpu.vramUsedGB / gpu.vramTotalGB) * 100}%` }}
                  />
                </div>
              </div>

              {/* Temp and Power */}
              <div className="flex justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 font-mono">
                <div>Temp: {gpu.tempCelsius}°C</div>
                <div>Power: {gpu.powerWatts}W</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Model Zoo / VRAM Allocation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Local Neural Models & Quantization</h3>
            <p className="text-xs text-slate-500">
              Manage weights loaded in VRAM, context window length, and inference throughput
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-semibold">
            FP16 & 4-bit AWQ / GGUF
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {models.map((mod) => {
            const isLoaded = mod.status === 'loaded';

            return (
              <div
                key={mod.id}
                className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Model Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isLoaded
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {mod.status}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-500">
                      {mod.parameters} · {mod.quantization}
                    </span>
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Role: {mod.role}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                    {mod.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-mono">
                    <div>VRAM: {mod.vramUsageGB} GB</div>
                    <div>·</div>
                    <div>Assigned: {mod.gpuAssigned}</div>
                    <div>·</div>
                    <div className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {mod.tokensPerSec} tokens/sec
                    </div>
                  </div>
                </div>

                {/* Right Context Window Slider & Toggle */}
                <div className="flex items-center gap-5 shrink-0">
                  {/* Context Slider */}
                  <div className="w-40 text-right space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>Context Window</span>
                      <span className="font-mono text-slate-800">{mod.contextWindow / 1000}k tokens</span>
                    </div>
                    <input
                      type="range"
                      min="8000"
                      max="128000"
                      step="8000"
                      value={mod.contextWindow}
                      onChange={(e) => onUpdateContextWindow(mod.id, Number(e.target.value))}
                      disabled={!isLoaded}
                      className="w-full accent-indigo-600 disabled:opacity-40 cursor-pointer"
                    />
                  </div>

                  {/* Toggle Load / Unload */}
                  <button
                    onClick={() => onToggleModelStatus(mod.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isLoaded
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isLoaded ? 'Unload from VRAM' : 'Load into VRAM'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* External Cloud Fallback Configurator (Strict Air-Gap Enforcer) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              External Cloud Fallback Configurator (Disabled By Default)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200">
            AIR-GAP LOCK ACTIVE
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Strict policy: AegisLocal runs 100% locally. In the rare event of extreme load exceeding local VRAM capacity, you may configure fallback controls with hard financial caps and mandatory client-side PII scrubbing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Allow Cloud Fallback</span>
              <button
                onClick={() => setCloudFallbackEnabled(!cloudFallbackEnabled)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  cloudFallbackEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    cloudFallbackEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {cloudFallbackEnabled ? 'Fallback permitted under strict limits' : 'Strictly disabled (100% air-gapped)'}
            </p>
          </div>

          {/* Hard Spend Cap */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Hard Spend Cap Limit</span>
              <span className="text-xs font-mono font-bold text-indigo-700">
                ${cloudSpendCap.toFixed(2)} USD
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={cloudSpendCap}
              onChange={(e) => setCloudSpendCap(Number(e.target.value))}
              disabled={!cloudFallbackEnabled}
              className="w-full accent-indigo-600 disabled:opacity-40 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Hard freeze at $0.00 prevents accidental cloud billing.
            </p>
          </div>

          {/* Mandatory PII Masking */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Pre-Egress Anonymization</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                ENFORCED
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Local regex & BERT scrubbers replace names, card numbers, and health records with UUID hashes before any outbound packet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
