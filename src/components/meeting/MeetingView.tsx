import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Users,
  CheckSquare,
  Sparkles,
  Search,
  Plus,
  Copy,
  Check,
  Send,
  Radio,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  TranscriptItem,
  MeetingActionItem,
  VectorKnowledgeSuggestion,
  Workspace,
} from '../../types';

interface MeetingViewProps {
  transcripts: TranscriptItem[];
  actionItems: MeetingActionItem[];
  vectorSuggestions: VectorKnowledgeSuggestion[];
  currentWorkspace: Workspace;
  onAddTranscript: (item: TranscriptItem) => void;
  onToggleActionItem: (id: string) => void;
  onAddActionItem: (item: Partial<MeetingActionItem>) => void;
}

export const MeetingView: React.FC<MeetingViewProps> = ({
  transcripts,
  actionItems,
  vectorSuggestions,
  currentWorkspace,
  onAddTranscript,
  onToggleActionItem,
  onAddActionItem,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [audioSource, setAudioSource] = useState('System Audio (Zoom / Teams Loopback)');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newSpeakerText, setNewSpeakerText] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('Marcus Vance');
  const [searchQuery, setSearchQuery] = useState('');
  const [newActionText, setNewActionText] = useState('');
  const [newActionOwner, setNewActionOwner] = useState('Dave K.');

  // Waveform visualization bars
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>([
    25, 45, 80, 55, 30, 70, 95, 60, 40, 65, 85, 35, 50, 75, 90, 45,
  ]);

  useEffect(() => {
    if (!isTranscribing) return;
    const interval = setInterval(() => {
      setWaveAmplitudes((prev) =>
        prev.map(() => Math.floor(Math.random() * 70) + 20)
      );
    }, 200);
    return () => clearInterval(interval);
  }, [isTranscribing]);

  const handleCopySuggestion = (id: string, text: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddLiveTranscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeakerText.trim()) return;

    const newItem: TranscriptItem = {
      id: `tr-${Date.now()}`,
      speaker: selectedSpeaker,
      speakerRole: selectedSpeaker.includes('Marcus')
        ? 'Head of Operations'
        : selectedSpeaker.includes('Elena')
        ? 'CFO'
        : 'Team Member',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newSpeakerText.trim(),
      sentiment: 'neutral',
    };
    onAddTranscript(newItem);
    setNewSpeakerText('');
  };

  const handleCreateActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    onAddActionItem({
      task: newActionText.trim(),
      owner: newActionOwner,
      due: 'End of Day',
      status: 'open',
      confidence: 97,
    });
    setNewActionText('');
  };

  const filteredTranscripts = transcripts.filter(
    (t) =>
      t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls & Audio Source Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTranscribing(!isTranscribing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isTranscribing
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isTranscribing ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Pause Live Transcriber</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Start Live Transcriber</span>
                </>
              )}
            </button>
          </div>

          {/* Audio Source Dropdown */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <select
              value={audioSource}
              onChange={(e) => setAudioSource(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="System Audio (Zoom / Teams Loopback)">System Audio (Zoom / Teams Loopback)</option>
              <option value="Hardware Mic (Rode Wireless PRO USB)">Hardware Mic (Rode Wireless PRO USB)</option>
              <option value="Virtual Cable Input #2 (Desktop Call)">Virtual Cable Input #2 (Desktop Call)</option>
            </select>
          </div>
        </div>

        {/* Live Audio Visualizer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 h-6 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200/60">
            {waveAmplitudes.map((amp, idx) => (
              <span
                key={idx}
                className="w-1 bg-indigo-500 rounded-full transition-all duration-150"
                style={{
                  height: isTranscribing ? `${Math.max(4, amp * 0.22)}px` : '4px',
                  opacity: isTranscribing ? 0.8 : 0.2,
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Whisper-v3 Local Diarization
          </div>
        </div>
      </div>

      {/* Main Grid: Live Transcripts + Copilot Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Real-Time Speaker Separated Transcript */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Transcript Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Meeting Transcript Stream</h3>
              <p className="text-xs text-slate-500">
                Whisper-v3-Large running locally on GPU 3 · Zero audio packets egressing local subnet
              </p>
            </div>

            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dialogue..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Transcript Scrolling List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/20">
            {filteredTranscripts.map((item) => {
              const isAssistant = item.speaker.includes('AegisLocal');

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isAssistant
                      ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/50 border-indigo-200 shadow-2xs'
                      : 'bg-white border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isAssistant
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.speaker.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{item.speaker}</span>
                      <span className="text-[11px] text-slate-500">· {item.speakerRole}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pl-8">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Simulated Dialogue Injector Form */}
          <form
            onSubmit={handleAddLiveTranscript}
            className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2"
          >
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
            >
              <option value="Marcus Vance">Marcus Vance</option>
              <option value="Elena Rostova">Elena Rostova</option>
              <option value="Dave K.">Dave K.</option>
              <option value="Dr. Harrison">Dr. Harrison</option>
            </select>

            <input
              type="text"
              value={newSpeakerText}
              onChange={(e) => setNewSpeakerText(e.target.value)}
              placeholder="Simulate live microphone speech or question..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
              title="Send speech input"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column (5 cols): Context Suggester & Extracted Action Items */}
        <div className="lg:col-span-5 space-y-6">
          {/* Context-Aware Screen Suggester */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Vector Retrieval Suggester
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                Auto-Triggered
              </span>
            </div>

            <div className="space-y-3">
              {vectorSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Trigger: "{sug.queryTrigger}"
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-600">
                      {sug.relevanceScore}% match
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">
                    {sug.matchedContent}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span className="font-mono text-[10px] truncate max-w-[200px]">
                      Source: {sug.sourceDoc}
                    </span>
                    <button
                      onClick={() => handleCopySuggestion(sug.id, sug.matchedContent)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      {copiedId === sug.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Action Items & Assigned Owners */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Action Items & Owners
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {actionItems.filter((a) => a.status === 'open').length} Open
              </span>
            </div>

            <div className="space-y-2.5">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    item.status === 'completed'
                      ? 'bg-slate-50/50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <button
                    onClick={() => onToggleActionItem(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    <CheckSquare
                      className={`w-4 h-4 ${
                        item.status === 'completed' ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold ${
                        item.status === 'completed'
                          ? 'line-through text-slate-400'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.task}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">Owner: {item.owner}</span>
                      <span>·</span>
                      <span className="text-rose-600 font-medium">Due: {item.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Action Item */}
            <form onSubmit={handleCreateActionItem} className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                placeholder="Assign new follow-up..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
