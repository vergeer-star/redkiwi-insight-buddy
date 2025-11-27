import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
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
  const [dateFilter, setDateFilter] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInterviews(data || []);

      // Fetch messages for each interview
      if (data && data.length > 0) {
        const messagesMap: Record<string, any[]> = {};
        for (const interview of data) {
          const { data: messages } = await supabase
            .from('interview_messages')
            .select('*')
            .eq('interview_id', interview.id)
            .order('timestamp', { ascending: true });
          
          if (messages) {
            messagesMap[interview.id] = messages;
          }
        }
        setInterviewMessages(messagesMap);
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

  // Calculate sentiment distribution
  const sentimentData = interviews
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

  // Calculate theme frequency
  const themeFrequency = interviews
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

  // Timeline data - sentiment over time per week (cumulative)
  const timelineData = interviews
    .filter(i => i.sentiment && i.created_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc: Record<string, any>, interview) => {
      const weekStart = startOfWeek(new Date(interview.created_at), { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      const weekLabel = format(weekStart, "d MMM", { locale: nl });
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: weekLabel,
          positief: 0,
          neutraal: 0,
          negatief: 0
        };
      }
      
      if (interview.sentiment === 'positive') acc[weekKey].positief++;
      if (interview.sentiment === 'neutral') acc[weekKey].neutraal++;
      if (interview.sentiment === 'negative') acc[weekKey].negatief++;
      
      return acc;
    }, {});

  // Convert to array and make cumulative
  const timelineArray = Object.values(timelineData).reduce((acc: any[], curr: any) => {
    const prev = acc[acc.length - 1] || { positief: 0, neutraal: 0, negatief: 0 };
    acc.push({
      week: curr.week,
      positief: prev.positief + curr.positief,
      neutraal: prev.neutraal + curr.neutraal,
      negatief: prev.negatief + curr.negatief,
    });
    return acc;
  }, []);

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
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.02)_1px,transparent_1px)] bg-[size:80px_80px] z-0" />
      
      {/* Header - Sticky */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 mb-8">
        <div className="max-w-7xl mx-auto py-4 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
              <img src={redkiwiLogoPng} alt="RedKiwi" className="h-16 transition-transform duration-300 group-hover:scale-105" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Interview Dashboard
              </h1>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-white/5 px-6"
              >
                Nieuw Interview
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_20px_rgba(227,6,19,0.3)] transition-all duration-300 backdrop-blur-sm bg-primary/5 px-6"
              >
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-primary" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-black/40 border-white/20 text-white max-w-[200px]"
                placeholder="Filter op datum"
              />
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="bg-black/40 border border-white/20 text-white rounded-md px-4 py-2 max-w-[200px]"
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
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <AIInsights insights={aiInsights} lastUpdated={new Date()} />
      </div>

      {/* KPI Tiles */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-10">
        <KPITile
          title="Totaal Interviews"
          value={interviews.length}
          icon={MessageSquare}
          trend={12}
        />
        <KPITile
          title="Geanalyseerd"
          value={interviews.filter(i => i.analyzed_at).length}
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 relative z-10">
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
            <CardTitle className="text-white text-xl font-bold">Top 10 Thema's</CardTitle>
          </CardHeader>
          <CardContent>
            {themeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={themeChartData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#fff" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/50">
                Geen thema data beschikbaar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Word Cloud */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <WordCloudCard />
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
          <CardHeader className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <CardTitle className="text-white text-xl font-bold">Sentiment Tijdlijn</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {timelineArray.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={timelineArray}>
                  <defs>
                    <linearGradient id="colorPositief" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNeutraal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNegatief" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="week" 
                    stroke="#fff"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#fff" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="positief" 
                    stroke="#10b981" 
                    fillOpacity={1}
                    fill="url(#colorPositief)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="neutraal" 
                    stroke="#f59e0b" 
                    fillOpacity={1}
                    fill="url(#colorNeutraal)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="negatief" 
                    stroke="#ef4444" 
                    fillOpacity={1}
                    fill="url(#colorNegatief)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-white/50">
                Geen tijdlijn data beschikbaar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interview List */}
      <div className="max-w-7xl mx-auto relative z-10">
        <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-white text-xl font-bold">
              Recente Interviews {filteredInterviews.length !== interviews.length && `(${filteredInterviews.length} van ${interviews.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredInterviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  messages={interviewMessages[interview.id] || []}
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