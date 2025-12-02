import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, FileAudio, EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TranscriptionViewer from "@/components/TranscriptionViewer";

interface Interview {
  id: string;
  created_at: string;
  sentiment: string | null;
  themes: string[] | null;
  summary: string | null;
  analyzed_at: string | null;
  excluded?: boolean;
}

interface InterviewCardProps {
  interview: Interview;
  messages?: { role: string; content: string }[];
  transcriptions?: any[];
  onToggleExclude?: (id: string, excluded: boolean) => void;
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444'
};

export function InterviewCard({ interview, messages = [], transcriptions = [], onToggleExclude }: InterviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTranscriptions, setShowTranscriptions] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={`p-5 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border transition-all duration-300 group ${
      interview.excluded 
        ? 'border-white/10 opacity-50' 
        : 'border-white/20 hover:border-primary/50 hover:bg-white/15 hover:shadow-[0_10px_40px_rgba(227,6,19,0.2)]'
    }`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-white/70 group-hover:text-white transition-colors font-medium">
                {new Date(interview.created_at).toLocaleString('nl-NL')}
              </span>
              {interview.sentiment && (
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ 
                    backgroundColor: `${SENTIMENT_COLORS[interview.sentiment as keyof typeof SENTIMENT_COLORS]}20`,
                    color: SENTIMENT_COLORS[interview.sentiment as keyof typeof SENTIMENT_COLORS]
                  }}
                >
                  {interview.sentiment === 'positive' ? 'Positief' : 
                   interview.sentiment === 'neutral' ? 'Neutraal' : 'Negatief'}
                </span>
              )}
            </div>
            
            {/* Themes */}
            {interview.themes && interview.themes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {interview.themes.map((theme, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-medium border border-primary/30"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            )}
            
            {/* Summary */}
            {interview.summary && (
              <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors leading-relaxed">
                {interview.summary}
              </p>
            )}
            
            {!interview.analyzed_at && (
              <p className="text-yellow-400 text-sm mt-2 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                Wacht op analyse...
              </p>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/70" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/70" />
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
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => navigate(`/interview/${interview.id}`)}
            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-medium border border-primary/30 hover:border-primary/50 transition-all duration-200"
          >
            Details bekijken
          </button>
          {onToggleExclude && (
            <button
              onClick={() => onToggleExclude(interview.id, interview.excluded || false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 flex items-center gap-2 ${
                interview.excluded
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30 hover:border-green-500/50'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20 hover:border-white/40'
              }`}
            >
              {interview.excluded ? (
                <>
                  <Eye className="w-4 h-4" />
                  Herstellen
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Uitsluiten
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
