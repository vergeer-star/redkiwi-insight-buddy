import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import redkiwiLogo from "@/assets/redkiwi-logo.png";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { WordCloudCard } from "@/components/WordCloudCard";

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

  // Timeline data - sentiment over time
  const timelineData = interviews
    .filter(i => i.sentiment && i.created_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((interview, index) => ({
      index: index + 1,
      date: new Date(interview.created_at).toLocaleDateString('nl-NL'),
      positief: interview.sentiment === 'positive' ? 1 : 0,
      neutraal: interview.sentiment === 'neutral' ? 1 : 0,
      negatief: interview.sentiment === 'negative' ? 1 : 0,
    }));

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
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px] z-0" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
            <img src={redkiwiLogo} alt="RedKiwi" className="h-14 transition-transform duration-300 group-hover:scale-105" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
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
              className="border-[#FF2B2B]/50 text-[#FF2B2B] hover:bg-[#FF2B2B]/10 hover:border-[#FF2B2B] hover:shadow-[0_0_20px_rgba(237,28,36,0.3)] transition-all duration-300 backdrop-blur-sm bg-[#FF2B2B]/5 px-6"
            >
              Uitloggen
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 relative z-10">
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] group">
          <CardHeader>
            <CardTitle className="text-white/60 text-sm font-medium tracking-wide uppercase">Totaal Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white group-hover:scale-105 transition-transform duration-300">{interviews.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] group">
          <CardHeader>
            <CardTitle className="text-white/60 text-sm font-medium tracking-wide uppercase">Geanalyseerd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
              {interviews.filter(i => i.analyzed_at).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#FF2B2B]/20 to-[#FF2B2B]/5 border-[#FF2B2B]/30 backdrop-blur-xl hover:border-[#FF2B2B]/60 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(237,28,36,0.3)] group">
          <CardHeader>
            <CardTitle className="text-white/60 text-sm font-medium tracking-wide uppercase">Positief</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#FF2B2B] group-hover:scale-105 transition-transform duration-300">
              {sentimentData.positive || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] group">
          <CardHeader>
            <CardTitle className="text-white/60 text-sm font-medium tracking-wide uppercase">Unieke Thema's</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
              {Object.keys(themeFrequency).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 relative z-10">
        {/* Sentiment Distribution */}
        <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-white text-xl font-bold">Sentimentverdeling</CardTitle>
          </CardHeader>
          <CardContent>
            {sentimentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/50">
                Geen sentiment data beschikbaar
              </div>
            )}
          </CardContent>
        </Card>

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
                  <Bar dataKey="count" fill="#FF2B2B" />
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
      <div className="max-w-7xl mx-auto mb-12 relative z-10">
        <WordCloudCard />
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto mb-12 relative z-10">
        <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-white text-xl font-bold">Sentiment Tijdlijn</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#fff"
                  />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="positief" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="neutraal" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="negatief" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/50">
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
            <CardTitle className="text-white text-xl font-bold">Recente Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interviews.map((interview) => (
                <div 
                  key={interview.id}
                  onClick={() => navigate(`/interview/${interview.id}`)}
                  className="p-5 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 hover:border-[#FF2B2B]/50 hover:bg-white/15 hover:shadow-[0_10px_40px_rgba(237,28,36,0.2)] transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white/70 group-hover:text-white transition-colors">
                          {new Date(interview.created_at).toLocaleString('nl-NL')}
                        </span>
                        {interview.sentiment && (
                          <span 
                            className="px-2 py-1 rounded text-xs font-bold"
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
                      
                      {interview.themes && interview.themes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {interview.themes.map((theme, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-[#FF2B2B]/20 text-[#FF2B2B] rounded-lg text-xs font-medium border border-[#FF2B2B]/30"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {interview.summary && (
                        <p className="text-white/70 text-sm mt-2 group-hover:text-white/90 transition-colors">
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
                  </div>
                </div>
              ))}
              
              {interviews.length === 0 && (
                <div className="text-center py-12 text-white/50">
                  Nog geen interviews beschikbaar
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}