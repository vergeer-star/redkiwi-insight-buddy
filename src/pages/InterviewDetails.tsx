import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TranscriptionViewer from "@/components/TranscriptionViewer";

interface Interview {
  id: string;
  created_at: string;
  sentiment: string | null;
  themes: string[] | null;
  summary: string | null;
  status: string;
  avatar_name: string;
  avatar_url: string;
  language: string | null;
}

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface Transcription {
  id: string;
  transcription_text: string;
  segments?: any[];
  audio_url?: string;
  confidence?: number;
  created_at: string;
  metadata?: {
    language?: string;
    duration?: number;
  };
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444'
};

export default function InterviewDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightWord = searchParams.get('highlight');
  const { toast } = useToast();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullTranscript, setShowFullTranscript] = useState(!!highlightWord);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate('/auth');
      return;
    }

    // Check if user is Redkiwi employee
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', session.user.id)
      .single();

    if (!profile?.email?.endsWith('@redkiwi.nl')) {
      toast({
        title: "Toegang geweigerd",
        description: "Deze pagina is alleen toegankelijk voor Redkiwi-medewerkers",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    fetchInterviewDetails();
  };

  const fetchInterviewDetails = async () => {
    try {
      // Fetch interview
      const { data: interviewData, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', id)
        .single();

      if (interviewError) throw interviewError;
      setInterview(interviewData);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('interview_messages')
        .select('*')
        .eq('interview_id', id)
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Fetch transcriptions
      const { data: transcriptionsData, error: transcriptionsError } = await supabase
        .from('interview_transcriptions')
        .select('*')
        .eq('interview_id', id)
        .order('created_at', { ascending: false });

      if (transcriptionsError) throw transcriptionsError;
      setTranscriptions(transcriptionsData as any || []);
    } catch (error) {
      console.error('Error fetching interview details:', error);
      toast({
        title: "Fout",
        description: "Kon interview niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Interview niet gevonden</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white/70 hover:text-white mb-3 md:mb-4 -ml-2 px-2"
          >
            <ArrowLeft className="mr-1 md:mr-2 h-4 w-4" />
            <span className="text-sm md:text-base">Terug</span>
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Interview Details</h1>
              <p className="text-white/70 text-sm md:text-base">
                {new Date(interview.created_at).toLocaleString('nl-NL')}
              </p>
            </div>
            {interview.sentiment && (
              <span 
                className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold self-start sm:self-center"
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
        </div>

        {/* Avatar Info */}
        <Card className="bg-white/5 border-white/10 mb-4 md:mb-6">
          <CardContent className="p-4 md:pt-6">
            <div className="flex items-center gap-3 md:gap-4">
              <img 
                src={interview.avatar_url} 
                alt={interview.avatar_name}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full"
              />
              <div>
                <h3 className="text-white font-semibold text-sm md:text-base">{interview.avatar_name}</h3>
                <p className="text-white/70 text-xs md:text-sm">
                  Taal: {interview.language || 'Nederlands'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Themes */}
        {interview.themes && interview.themes.length > 0 && (
          <Card className="bg-white/5 border-white/10 mb-4 md:mb-6">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
              <CardTitle className="text-white text-base md:text-lg">Thema's</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {interview.themes.map((theme, idx) => (
                  <span 
                    key={idx}
                    className="px-2 md:px-3 py-0.5 md:py-1 bg-primary/20 text-primary rounded-full text-xs md:text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card className="bg-white/5 border-white/10 mb-4 md:mb-6">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-white text-base md:text-lg">Samenvatting</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {interview.summary ? (
              <p className="text-white/80 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {interview.summary}
              </p>
            ) : (
              <p className="text-white/50 text-sm md:text-base">Nog geen samenvatting beschikbaar</p>
            )}
          </CardContent>
        </Card>

        {/* Transcriptions */}
        {transcriptions.length > 0 && (
          <div className="mb-4 md:mb-6 space-y-4 md:space-y-6">
            {transcriptions.map((transcription) => (
              <TranscriptionViewer 
                key={transcription.id} 
                transcription={transcription}
              />
            ))}
          </div>
        )}

        {/* Full Transcript */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-white text-base md:text-lg">Volledige Transcriptie</CardTitle>
              <Button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 self-start sm:self-center"
              >
                <FileText className="mr-1.5 h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">{showFullTranscript ? 'Verberg' : 'Toon transcriptie'}</span>
              </Button>
            </div>
          </CardHeader>
          {showFullTranscript && (
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3 md:space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`p-3 md:p-4 rounded-lg ${
                      message.role === 'assistant' 
                        ? 'bg-primary/10 border-l-4 border-primary' 
                        : 'bg-white/5 border-l-4 border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                      <span className="font-semibold text-white text-sm md:text-base">
                        {message.role === 'assistant' ? interview.avatar_name : 'Kandidaat'}
                      </span>
                      <span className="text-white/50 text-xs md:text-sm">
                        {new Date(message.timestamp).toLocaleTimeString('nl-NL')}
                      </span>
                    </div>
                    <p className="text-white/80 whitespace-pre-line text-sm md:text-base">
                      {highlightWord ? (
                        message.content.split(new RegExp(`(${highlightWord})`, 'gi')).map((part, i) => 
                          part.toLowerCase() === highlightWord.toLowerCase() ? (
                            <mark key={i} className="bg-primary/50 text-white px-1 rounded">{part}</mark>
                          ) : part
                        )
                      ) : (
                        message.content
                      )}
                    </p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-white/50 text-center py-6 md:py-8 text-sm md:text-base">
                    Geen berichten beschikbaar
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
