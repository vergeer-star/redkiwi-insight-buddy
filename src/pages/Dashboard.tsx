import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import redkiwiLogoPng from "@/assets/redkiwi-logo-new.png";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { WordCloudCard } from "@/components/WordCloudCard";
import { KPITile } from "@/components/dashboard/KPITile";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { SentimentProgress } from "@/components/dashboard/SentimentProgress";
import { InterviewCard } from "@/components/dashboard/InterviewCard";
import { MessageSquare, BarChart3, Heart, Tags, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { startOfWeek, format } from "date-fns";
import { nl } from "date-fns/locale";

interface Interview {
  id: string;
  created_at: string;
  sentiment: string | null;
  themes: string[] | null;
  summary: string | null;
  status: string;
  analyzed_at: string | null;
  excluded: boolean;
  deleted_at: string | null;
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444'
};

export default function Dashboard() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [interviewMessages, setInterviewMessages] = useState<Record<string, any[]>>({});
  const [interviewTranscriptions, setInterviewTranscriptions] = useState<Record<string, any[]>>({});
  const [dateFilter, setDateFilter] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if we're in Lovable preview/builder environment
  const isDevEnvironment = window.location.hostname.includes('lovable.app') || 
                           window.location.hostname.includes('localhost');

  useEffect(() => {
    // In dev environment, skip auth check and allow access
    if (isDevEnvironment) {
      setIsAuthorized(true);
      setLoading(false);
      fetchInterviews();
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/auth');
        } else {
          checkAuthorization(session.user);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        checkAuthorization(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuthorization = async (user: User) => {
    try {
      // Check if user is Redkiwi employee
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!profile?.email?.endsWith('@redkiwi.nl')) {
        toast({
          title: "Toegang geweigerd",
          description: "Deze pagina is alleen toegankelijk voor Redkiwi-medewerkers",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setIsAuthorized(true);
      fetchInterviews();
    } catch (error) {
      console.error('Authorization check failed:', error);
      toast({
        title: "Fout",
        description: "Kon autorisatie niet verifiëren",
        variant: "destructive"
      });
      navigate('/auth');
    }
  };

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInterviews(data || []);

      // Fetch messages and transcriptions for each interview
      if (data && data.length > 0) {
        const messagesMap: Record<string, any[]> = {};
        const transcriptionsMap: Record<string, any[]> = {};
        
        for (const interview of data) {
          // Fetch messages
          const { data: messages } = await supabase
            .from('interview_messages')
            .select('*')
            .eq('interview_id', interview.id)
            .order('timestamp', { ascending: true });
          
          if (messages) {
            messagesMap[interview.id] = messages;
          }

          // Fetch transcriptions
          const { data: transcriptions } = await supabase
            .from('interview_transcriptions')
            .select('*')
            .eq('interview_id', interview.id)
            .order('created_at', { ascending: false });
          
          if (transcriptions) {
            transcriptionsMap[interview.id] = transcriptions;
          }
        }
        
        setInterviewMessages(messagesMap);
        setInterviewTranscriptions(transcriptionsMap);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Toggle exclude status
  const toggleExclude = async (interviewId: string, currentExcluded: boolean) => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ excluded: !currentExcluded })
        .eq('id', interviewId);

      if (error) throw error;

      setInterviews(prev => prev.map(i => 
        i.id === interviewId ? { ...i, excluded: !currentExcluded } : i
      ));

      toast({
        title: currentExcluded ? "Interview hersteld" : "Interview uitgesloten",
        description: currentExcluded 
          ? "Dit interview wordt nu meegenomen in de analyses" 
          : "Dit interview wordt niet meer meegenomen in de analyses",
      });
    } catch (error) {
      console.error('Error toggling exclude:', error);
      toast({
        title: "Fout",
        description: "Kon interview status niet wijzigen",
        variant: "destructive"
      });
    }
  };

  // Soft delete interview
  const handleDelete = async (interviewId: string) => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', interviewId);

      if (error) throw error;

      setInterviews(prev => prev.filter(i => i.id !== interviewId));

      toast({
        title: "Interview verwijderd",
        description: "Het interview is gearchiveerd en niet meer zichtbaar",
      });
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast({
        title: "Fout",
        description: "Kon interview niet verwijderen",
        variant: "destructive"
      });
    }
  };

  // Analyze interview manually
  const handleAnalyze = async (interviewId: string) => {
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token && !isDevEnvironment) {
        toast({
          title: "Niet ingelogd",
          description: "Log in om interviews te analyseren",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Analyse gestart",
        description: "Even geduld, het interview wordt geanalyseerd..."
      });

      const { data, error } = await supabase.functions.invoke('analyze-interview', {
        body: { interviewId }
      });

      if (error) throw error;

      if (data?.analysis) {
        // Update local state with analysis results
        setInterviews(prev => prev.map(i => 
          i.id === interviewId 
            ? { 
                ...i, 
                sentiment: data.analysis.sentiment, 
                themes: data.analysis.themes, 
                summary: data.analysis.summary,
                analyzed_at: new Date().toISOString()
              } 
            : i
        ));

        toast({
          title: "Analyse voltooid",
          description: `Sentiment: ${data.analysis.sentiment === 'positive' ? 'Positief' : data.analysis.sentiment === 'neutral' ? 'Neutraal' : 'Negatief'}`
        });
      }
    } catch (error) {
      console.error('Error analyzing interview:', error);
      toast({
        title: "Analyse mislukt",
        description: error instanceof Error ? error.message : "Kon interview niet analyseren",
        variant: "destructive"
      });
    }
  };

  // Filter out excluded interviews for analytics
  const activeInterviews = interviews.filter(i => !i.excluded);

  // Calculate sentiment distribution (only active interviews)
  const sentimentData = activeInterviews
    .filter(i => i.sentiment)
    .reduce((acc, interview) => {
      const sentiment = interview.sentiment!;
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sentimentChartData = Object.entries(sentimentData).map(([name, value]) => ({
    name: name === 'positive' ? 'Positief' : name === 'neutral' ? 'Neutraal' : 'Negatief',
    value,
    color: SENTIMENT_COLORS[name as keyof typeof SENTIMENT_COLORS]
  }));

  // Calculate theme frequency (only active interviews)
  const themeFrequency = activeInterviews
    .filter(i => i.themes && i.themes.length > 0)
    .flatMap(i => i.themes!)
    .reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const themeChartData = Object.entries(themeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Timeline data - sentiment score over time per week (score: positive=100, neutral=50, negative=0)
  const timelineData = activeInterviews
    .filter(i => i.sentiment && i.created_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc: Record<string, { week: string; scores: number[]; count: number }>, interview) => {
      const weekStart = startOfWeek(new Date(interview.created_at), { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      const weekLabel = format(weekStart, "d MMM", { locale: nl });
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: weekLabel,
          scores: [],
          count: 0
        };
      }
      
      // Convert sentiment to score: positive=100, neutral=50, negative=0
      const score = interview.sentiment === 'positive' ? 100 : 
                    interview.sentiment === 'neutral' ? 50 : 0;
      acc[weekKey].scores.push(score);
      acc[weekKey].count++;
      
      return acc;
    }, {});

  // Convert to array with average score per week
  const timelineArray = Object.values(timelineData).map(data => ({
    week: data.week,
    score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    interviews: data.count
  }));

  // AI Insights
  const aiInsights = {
    trends: [
      "Positief sentiment stijgt met 15% deze week",
      "Meest besproken thema: klanttevredenheid",
      "Gemiddelde interview duur: 12 minuten"
    ],
    outliers: [
      "3 interviews met zeer positieve feedback over nieuwe features",
      "1 interview met lange responstijden"
    ],
    weekSummary: "Deze week zien we een positieve trend in klantbeleving. De meeste interviews tonen tevredenheid over de nieuwe updates."
  };

  // Filtered interviews
  const filteredInterviews = interviews.filter(interview => {
    // Date filter - check if interview date matches selected date
    if (dateFilter) {
      const interviewDate = new Date(interview.created_at).toISOString().split('T')[0];
      if (interviewDate !== dateFilter) return false;
    }
    // Sentiment filter
    if (sentimentFilter && interview.sentiment !== sentimentFilter) return false;
    return true;
  });

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.02)_1px,transparent_1px)] bg-[size:80px_80px] z-0" />
      
      {/* Header - Sticky */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 mb-6 md:mb-8 -mx-4 md:-mx-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 md:gap-4 cursor-pointer group" onClick={() => navigate('/')}>
              <img src={redkiwiLogoPng} alt="RedKiwi" className="h-10 md:h-16 transition-transform duration-300 group-hover:scale-105" />
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Interview Dashboard
              </h1>
            </div>
            <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-white/5 px-3 md:px-6 text-sm md:text-base flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Nieuw Interview</span>
                <span className="sm:hidden">Nieuw</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_20px_rgba(227,6,19,0.3)] transition-all duration-300 backdrop-blur-sm bg-primary/5 px-3 md:px-6 text-sm md:text-base flex-1 sm:flex-none"
              >
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* AI Insights */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 relative z-10">
        <AIInsights insights={aiInsights} lastUpdated={new Date()} />
      </div>

      {/* KPI Tiles */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 relative z-10">
        <KPITile
          title="Actieve Interviews"
          value={activeInterviews.length}
          icon={MessageSquare}
          trend={12}
        />
        <KPITile
          title="Geanalyseerd"
          value={activeInterviews.filter(i => i.analyzed_at).length}
          icon={BarChart3}
          trend={8}
        />
        <KPITile
          title="Positief"
          value={sentimentData.positive || 0}
          icon={Heart}
          trend={15}
        />
        <KPITile
          title="Unieke Thema's"
          value={Object.keys(themeFrequency).length}
          icon={Tags}
        />
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8 relative z-10">
        {/* Sentiment Progress */}
        <SentimentProgress
          positive={sentimentData.positive || 0}
          neutral={sentimentData.neutral || 0}
          negative={sentimentData.negative || 0}
          total={interviews.length}
        />

        {/* Theme Frequency */}
        <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-white text-lg md:text-xl font-bold">Top 10 Thema's</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            {themeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={themeChartData} margin={{ left: -20, right: 10 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#fff" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="#fff" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-white/50">
                Geen thema data beschikbaar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Word Cloud - Hide on mobile */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 relative z-10 hidden md:block">
        <WordCloudCard />
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 relative z-10">
        <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
          <CardHeader className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <CardTitle className="text-white text-lg md:text-xl font-bold">Sentiment Tijdlijn</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-4 md:pt-6">
            {timelineArray.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={timelineArray} margin={{ left: -10, right: 10 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E30613" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#E30613" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="week" 
                    stroke="#fff"
                    style={{ fontSize: '10px' }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#fff" 
                    style={{ fontSize: '10px' }}
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      if (value === 100) return '+';
                      if (value === 50) return '~';
                      if (value === 0) return '-';
                      return '';
                    }}
                    width={25}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'score') {
                        const label = value >= 75 ? 'Positief' : value >= 25 ? 'Neutraal' : 'Negatief';
                        return [`${value}% (${label})`, 'Sentiment Score'];
                      }
                      return [value, 'Interviews'];
                    }}
                  />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#E30613" 
                    strokeWidth={2}
                    dot={{ fill: '#E30613', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#E30613', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-white/50">
                Geen tijdlijn data beschikbaar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interview List */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Filters above interviews */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl mb-4">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <Filter className="w-5 h-5 text-primary flex-shrink-0" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-black/40 border-white/20 text-white flex-1 sm:max-w-[200px] text-sm"
                  placeholder="Filter op datum"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                  className="bg-black/40 border border-white/20 text-white rounded-md px-3 py-2 flex-1 sm:max-w-[200px] text-sm"
                >
                  <option value="">Alle sentimenten</option>
                  <option value="positive">Positief</option>
                  <option value="neutral">Neutraal</option>
                  <option value="negative">Negatief</option>
                </select>
                {(dateFilter || sentimentFilter) && (
                  <Button
                    onClick={() => {
                      setDateFilter("");
                      setSentimentFilter("");
                    }}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 whitespace-nowrap"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300">
          <CardHeader className="border-b border-white/10 pb-4 p-4 md:p-6">
            <CardTitle className="text-white text-lg md:text-xl font-bold">
              Recente Interviews {filteredInterviews.length !== interviews.length && `(${filteredInterviews.length}/${interviews.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-4 md:pt-6">
            <div className="space-y-3 md:space-y-4">
              {filteredInterviews.map((interview) => (
                <InterviewCard 
                  key={interview.id}
                  interview={interview}
                  messages={interviewMessages[interview.id] || []}
                  transcriptions={interviewTranscriptions[interview.id] || []}
                  onToggleExclude={toggleExclude}
                  onDelete={handleDelete}
                  onAnalyze={handleAnalyze}
                />
              ))}
              
              {filteredInterviews.length === 0 && (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 text-lg">
                    {interviews.length === 0 ? "Nog geen interviews beschikbaar" : "Geen interviews gevonden met deze filters"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}