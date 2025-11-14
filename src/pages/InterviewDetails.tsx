import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444'
};

export default function InterviewDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Interview Details</h1>
              <p className="text-white/70">
                {new Date(interview.created_at).toLocaleString('nl-NL')}
              </p>
            </div>
            {interview.sentiment && (
              <span 
                className="px-4 py-2 rounded-lg text-sm font-bold"
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
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <img 
                src={interview.avatar_url} 
                alt={interview.avatar_name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-white font-semibold">{interview.avatar_name}</h3>
                <p className="text-white/70 text-sm">
                  Taal: {interview.language || 'Nederlands'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Themes */}
        {interview.themes && interview.themes.length > 0 && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Thema's</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interview.themes.map((theme, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-[#FF2B2B]/20 text-[#FF2B2B] rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Samenvatting</CardTitle>
          </CardHeader>
          <CardContent>
            {interview.summary ? (
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {interview.summary}
              </p>
            ) : (
              <p className="text-white/50">Nog geen samenvatting beschikbaar</p>
            )}
          </CardContent>
        </Card>

        {/* Full Transcript */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Volledige Transcriptie</CardTitle>
              <Button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <FileText className="mr-2 h-4 w-4" />
                {showFullTranscript ? 'Verberg' : 'Lees volledige transcriptie'}
              </Button>
            </div>
          </CardHeader>
          {showFullTranscript && (
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.role === 'assistant' 
                        ? 'bg-[#FF2B2B]/10 border-l-4 border-[#FF2B2B]' 
                        : 'bg-white/5 border-l-4 border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">
                        {message.role === 'assistant' ? interview.avatar_name : 'Kandidaat'}
                      </span>
                      <span className="text-white/50 text-sm">
                        {new Date(message.timestamp).toLocaleTimeString('nl-NL')}
                      </span>
                    </div>
                    <p className="text-white/80 whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-white/50 text-center py-8">
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
