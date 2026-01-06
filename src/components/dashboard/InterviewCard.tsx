import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, FileAudio, EyeOff, Eye, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TranscriptionViewer from "@/components/TranscriptionViewer";

interface Interview {
  id: string;
  created_at: string;
  sentiment: string | null;
  themes: string[] | null;
  summary: string | null;
  status: string;
  analyzed_at: string | null;
  excluded?: boolean;
}

interface InterviewCardProps {
  interview: Interview;
  messages?: { role: string; content: string }[];
  transcriptions?: any[];
  onToggleExclude?: (id: string, excluded: boolean) => void;
  onDelete?: (id: string) => void;
  onAnalyze?: (id: string) => Promise<void>;
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444'
};

export function InterviewCard({ interview, messages = [], transcriptions = [], onToggleExclude, onDelete, onAnalyze }: InterviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTranscriptions, setShowTranscriptions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!onAnalyze || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      await onAnalyze(interview.id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`p-3 md:p-5 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border transition-all duration-300 group ${
      interview.excluded 
        ? 'border-white/10 opacity-50' 
        : 'border-white/20 hover:border-primary/50 hover:bg-white/15 hover:shadow-[0_10px_40px_rgba(227,6,19,0.2)]'
    }`}>
      <div className="space-y-2 md:space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mb-2">
              <span className="text-white/70 group-hover:text-white transition-colors font-medium text-xs md:text-base">
                {new Date(interview.created_at).toLocaleString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {/* Status badge */}
              <span 
                className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${
                  interview.status === 'completed' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {interview.status === 'completed' ? 'Voltooid' : 'Niet af'}
              </span>
              {interview.sentiment && (
                <span 
                  className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold"
                  style={{ 
                    backgroundColor: `${SENTIMENT_COLORS[interview.sentiment as keyof typeof SENTIMENT_COLORS]}20`,
                    color: SENTIMENT_COLORS[interview.sentiment as keyof typeof SENTIMENT_COLORS]
                  }}
                >
                  {interview.sentiment === 'positive' ? 'Pos' : 
                   interview.sentiment === 'neutral' ? 'Neu' : 'Neg'}
                </span>
              )}
            </div>
            
            {/* Themes */}
            {interview.themes && interview.themes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
                {interview.themes.slice(0, 3).map((theme, idx) => (
                  <span 
                    key={idx}
                    className="px-2 md:px-3 py-0.5 md:py-1 bg-primary/20 text-primary rounded-lg text-[10px] md:text-xs font-medium border border-primary/30"
                  >
                    {theme}
                  </span>
                ))}
                {interview.themes.length > 3 && (
                  <span className="px-2 py-0.5 text-white/50 text-[10px] md:text-xs">
                    +{interview.themes.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* Summary */}
            {interview.summary && (
              <p className="text-white/70 text-xs md:text-sm group-hover:text-white/90 transition-colors leading-relaxed line-clamp-2 md:line-clamp-none">
                {interview.summary}
              </p>
            )}
            
            {!interview.analyzed_at && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-yellow-400 text-xs md:text-sm flex items-center gap-2">
                  <span className="w-3 h-3 md:w-4 md:h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                  Wacht op analyse...
                </p>
                {onAnalyze && (
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="px-2 py-0.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded text-[10px] md:text-xs font-medium border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-200 flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Bezig...' : 'Nu analyseren'}
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 md:ml-4 p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
            ) : (
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
            )}
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && messages.length > 0 && (
          <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/10 space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-center gap-2 text-white/80 font-medium mb-3">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Transcript</span>
            </div>
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-1">
                <span className={`text-xs font-medium ${msg.role === 'assistant' ? 'text-primary' : 'text-white/60'}`}>
                  {msg.role === 'assistant' ? 'Interviewer' : 'Gebruiker'}
                </span>
                <p className="text-white/70 text-sm leading-relaxed pl-3 border-l-2 border-white/10">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Transcriptions Section */}
        {transcriptions.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowTranscriptions(!showTranscriptions)}
              className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-3 transition-colors"
            >
              <FileAudio className="w-4 h-4 text-primary" />
              <span>Transcripties ({transcriptions.length})</span>
              {showTranscriptions ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {showTranscriptions && (
              <div className="space-y-4">
                {transcriptions.map((transcription) => (
                  <TranscriptionViewer 
                    key={transcription.id} 
                    transcription={transcription}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => navigate(`/interview/${interview.id}`)}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs md:text-sm font-medium border border-primary/30 hover:border-primary/50 transition-all duration-200"
          >
            Details
          </button>
          {onToggleExclude && (
            <button
              onClick={() => onToggleExclude(interview.id, interview.excluded || false)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium border transition-all duration-200 flex items-center gap-1.5 md:gap-2 ${
                interview.excluded
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30 hover:border-green-500/50'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20 hover:border-white/40'
              }`}
            >
              {interview.excluded ? (
                <>
                  <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Herstellen</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Uitsluiten</span>
                </>
              )}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(interview.id)}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium border transition-all duration-200 flex items-center gap-1.5 md:gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 hover:border-red-500/50"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Verwijderen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
