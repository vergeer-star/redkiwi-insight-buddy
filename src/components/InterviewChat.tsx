import { useState, useEffect } from "react";
import { StartScreen } from "@/components/StartScreen";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import redkiwiLogo from "@/assets/redkiwi-logo-new.png";
export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [interviewId, setInterviewId] = useState<string>("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [isRedkiwiEmployee, setIsRedkiwiEmployee] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Fixed avatar - Maiya
  const AVATAR_URL = "eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9DaGFpcl9TaXR0aW5nX3B1Ymxp%0D%0AYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2IxZmY1%0D%0AZWRiZjk2MjQyZTZhYzk0NjkyMjdkZjQwOTI0XzU1MzYwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJu%0D%0AZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjIwMWZkZDcxMmIy%0D%0ANDQwYjZiNmViNDdiYzVmOTYwNmIwIiwidXNlcm5hbWUiOiI2MGQxOTExYjQxZmM0YWI5YTkzYjY4%0D%0AY2EyYTE4ODY4NiJ9";
  const AVATAR_NAME = "Maiya";

  // Check if user is a RedKiwi employee
  useEffect(() => {
    const checkEmployee = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.email?.endsWith('@redkiwi.nl')) {
          setIsRedkiwiEmployee(true);
        }
      }
    };
    checkEmployee();
  }, []);

  // Initialize HeyGen SDK
  useEffect(() => {
    if (!hasStarted || !interviewId) return;

    setIsLoadingAvatar(true);
    let avatarInstance: any = null;

    const initializeHeyGenSDK = async () => {
      try {
        // Create HeyGen session via our edge function
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('heygen-session', {
          body: { interviewId }
        });

        if (sessionError) {
          console.error('Error creating HeyGen session:', sessionError);
          toast({
            title: "Fout",
            description: "Kon avatar sessie niet aanmaken",
            variant: "destructive",
          });
          setIsLoadingAvatar(false);
          return;
        }

        console.log('HeyGen session created:', sessionData);

        // Load HeyGen Streaming SDK
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@heygen/streaming-avatar@1.0.3/dist/index.umd.js';
        script.async = true;

        script.onload = async () => {
          try {
            // @ts-ignore - HeyGen SDK loaded via script
            const StreamingAvatar = window.StreamingAvatar;

            avatarInstance = new StreamingAvatar({
              token: sessionData.data.access_token,
            });

            // Event handlers for conversation tracking
            avatarInstance.on('avatar_start_talking', () => {
              console.log('Avatar started talking');
            });

            avatarInstance.on('avatar_stop_talking', async (event: any) => {
              console.log('Avatar stopped talking:', event);
              if (event?.message) {
                await supabase.functions.invoke('heygen-message', {
                  body: {
                    interviewId,
                    role: 'assistant',
                    message: event.message
                  }
                });
              }
            });

            avatarInstance.on('user_start', () => {
              console.log('User started speaking');
            });

            avatarInstance.on('user_stop', async (event: any) => {
              console.log('User stopped speaking:', event);
              if (event?.message) {
                await supabase.functions.invoke('heygen-message', {
                  body: {
                    interviewId,
                    role: 'user',
                    message: event.message
                  }
                });
              }
            });

            // Create and start avatar session
            await avatarInstance.createStartAvatar({
              quality: 'high',
              avatarName: AVATAR_NAME,
              voice: {
                rate: 1.0,
                emotion: 'friendly'
              },
              language: 'Dutch',
              knowledgeBase: sessionData.data.knowledge_base_id
            });

            console.log('Avatar initialized successfully');
            setIsLoadingAvatar(false);

          } catch (error) {
            console.error('Error initializing HeyGen SDK:', error);
            toast({
              title: "Fout",
              description: "Kon avatar niet initialiseren",
              variant: "destructive",
            });
            setIsLoadingAvatar(false);
          }
        };

        script.onerror = () => {
          console.error('Failed to load HeyGen SDK script');
          toast({
            title: "Fout",
            description: "Kon avatar script niet laden",
            variant: "destructive",
          });
          setIsLoadingAvatar(false);
        };

        document.body.appendChild(script);

      } catch (error) {
        console.error('Error in HeyGen initialization:', error);
        setIsLoadingAvatar(false);
      }
    };

    initializeHeyGenSDK();

    return () => {
      // Cleanup avatar instance
      if (avatarInstance) {
        try {
          avatarInstance.stopAvatar();
        } catch (e) {
          console.error('Error stopping avatar:', e);
        }
      }
    };
  }, [hasStarted, interviewId]);

  const handleChecklistComplete = async () => {
    // Pre-generate IDs to avoid RLS SELECT on return
    const newInterviewId = crypto.randomUUID();
    const newSessionId = crypto.randomUUID();

    // Save interview session to the backend first
    try {
      const { error } = await supabase
        .from('interviews')
        .insert({
          id: newInterviewId,
          session_id: newSessionId,
          avatar_name: AVATAR_NAME,
          avatar_url: AVATAR_URL,
          status: 'started',
        });

      if (error) throw error;

      // Set state after successful save
      setInterviewId(newInterviewId);
      setSessionId(newSessionId);
      setHasStarted(true);

    } catch (error) {
      console.error('Error saving interview:', error);
      toast({
        title: "Fout",
        description: "Kon interview sessie niet opslaan",
        variant: "destructive",
      });
    }
  };
  const handleEndInterview = async () => {
    // Update interview status to completed
    if (interviewId) {
      try {
        await supabase.from('interviews').update({
          status: 'completed',
          ended_at: new Date().toISOString()
        }).eq('id', interviewId);

        // Trigger AI analysis of the interview
        toast({
          title: "Interview beëindigd",
          description: "Je antwoorden worden nu geanalyseerd..."
        });

        // Call edge function to analyze the interview
        supabase.functions.invoke('analyze-interview', {
          body: {
            interviewId
          }
        }).then(({
          data,
          error
        }) => {
          if (error) {
            console.error('Error analyzing interview:', error);
            toast({
              title: "Analyse fout",
              description: "Er is een fout opgetreden bij het analyseren",
              variant: "destructive"
            });
          } else {
            console.log('Interview analysis completed:', data);
          }
        });
      } catch (error) {
        console.error('Error updating interview:', error);
      }
    }
    
    // Show thank you page
    setShowThankYou(true);
  };

  const handleBack = () => {
    // Navigate back to homepage
    setHasStarted(false);
    setSessionId("");
    setInterviewId("");
  };
  const handleReturnToStart = () => {
    setShowThankYou(false);
    setHasStarted(false);
    setSessionId("");
    setInterviewId("");
  };
  if (showThankYou) {
    return <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Subtle diagonal pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        <div className="relative z-10 text-center px-8 max-w-2xl flex flex-col items-center">
          <a 
            href="https://www.redkiwi.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block transition-transform duration-300 hover:scale-110 mb-8"
          >
            <img src={redkiwiLogo} alt="RedKiwi Logo" className="h-24 mx-auto" />
          </a>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bedankt voor je deelname!
          </h1>
          
          <p className="text-xl text-white/80 mb-8">Je hebt succesvol deelgenomen aan een AI-Interview. Jouw antwoorden helpen Redkiwi verbeteren.</p>
          
          <div className="flex flex-col gap-4 items-center">
            <Button 
              onClick={() => {
                navigator.share({ 
                  title: 'AI Interview met RedKiwi', 
                  text: 'Doe mee met het AI Interview van RedKiwi!',
                  url: window.location.origin 
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.origin);
                  toast({ title: "Link gekopieerd!", description: "De link is naar je klembord gekopieerd." });
                });
              }}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Share2 size={20} />
              Deel deze website
            </Button>
            <Button 
              onClick={handleReturnToStart} 
              variant="ghost"
              className="text-white/60 hover:text-white/80 hover:bg-white/5 px-8 py-6 text-lg rounded-lg transition-all duration-300"
            >
              Terug naar start
            </Button>
          </div>
        </div>
      </div>;
  }
  if (!hasStarted) {
    return <StartScreen onStart={handleChecklistComplete} />;
  }
  return <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Loading Screen */}
      {isLoadingAvatar && (
        <div className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Maiya wordt geladen...</h2>
            <p className="text-white/60">Een moment geduld, het interview start zo</p>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <button onClick={handleBack} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white font-bold text-sm tracking-wide uppercase transition-all duration-300 hover:scale-105 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Terug
          </button>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center whitespace-nowrap">
              Interview met <span className="text-primary">{AVATAR_NAME}</span>
            </h2>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleEndInterview} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300">
              Eindig interview
            </Button>
          </div>
        </div>
      </div>

      {/* Tips Sidebar - positioned to the right of avatar */}
      <div className="fixed left-[calc(50%+420px)] top-1/2 -translate-y-1/2 z-[9990] w-72 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">
            Interview Tips
          </h3>
        </div>
        <ul className="text-white/80 text-sm space-y-3">
          <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Zorg dat er geen achtergrondgeluiden zijn</span>
          </li>
          <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Spreek duidelijk en articuleer goed</span>
          </li>
          <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Vergeet niet de juiste taal te selecteren</span>
          </li>
        </ul>
      </div>
    </div>;
};