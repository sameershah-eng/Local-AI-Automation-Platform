import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

interface EmergencyStopModalProps {
  isOpen: boolean;
  isLockedDown: boolean;
  onClose: () => void;
  onConfirmStop: (reason: string) => void;
  onResetLockdown: () => void;
}

export const EmergencyStopModal: React.FC<EmergencyStopModalProps> = ({
  isOpen,
  isLockedDown,
  onClose,
  onConfirmStop,
  onResetLockdown,
}) => {
  const [reason, setReason] = useState('Safety protocol: Immediate operator kill-switch activated');
  const [confirmPhrase, setConfirmPhrase] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${isLockedDown ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {isLockedDown ? 'Autonomous Engine In Safe Lockdown' : 'Emergency Stop Engine (Kill Switch)'}
              </h2>
              <p className="text-sm opacity-90 mt-0.5">
                {isLockedDown ? 'All agent workers and desktop drivers are currently suspended.' : 'Hard stop: Freezes all background agents and detaches desktop handles.'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isLockedDown ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Engine State: Safe Standby
                </div>
                Hardware drivers have severed simulated desktop hooks. Checkpoints are frozen on local NVMe disk. No outbound calls will be initiated.
              </div>

              <div className="text-sm text-slate-600">
                To resume normal autonomous execution across all workspaces, verify memory integrity and click the reset button below.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Close Window
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetLockdown();
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resume Autonomous Engine
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-900 text-sm">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Immediate Consequences:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-rose-800/90 ml-1">
                  <li>Halts all 9 background agents across all 3 business workspaces.</li>
                  <li>Releases SAP, Xero, and Browser GUI desktop window focus handles.</li>
                  <li>Saves emergency snapshot checkpoint to local SSD.</li>
                  <li>Locks banking API tokens and revokes OAuth dispatch tickets.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Halt / Incident Log
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Enter reason for audit record..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Type <span className="text-rose-600 font-mono font-bold">HALT</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-sm font-mono tracking-wider bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase"
                  placeholder="Type HALT"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmPhrase !== 'HALT'}
                  onClick={() => {
                    onConfirmStop(reason);
                    onClose();
                  }}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    confirmPhrase === 'HALT'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                      : 'bg-rose-200 text-rose-400 cursor-not-allowed'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4" />
                  Execute Emergency Stop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
