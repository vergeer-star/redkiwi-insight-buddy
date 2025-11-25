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
  const [isPaused, setIsPaused] = useState(false);
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

  useEffect(() => {
    // Only load HeyGen streaming embed script after interview has started
    if (!hasStarted || !interviewId) return;

    // Store interviewId in localStorage for fetch interceptor
    localStorage.setItem('currentInterviewId', interviewId);
    
    // Set loading state
    setIsLoadingAvatar(true);

    // Create fetch interceptor to add interviewId to requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource, config] = args;

      // Check if this is a request to our interview-chat edge function
      if (typeof resource === 'string' && resource.includes('/functions/v1/interview-chat')) {
        const interviewId = localStorage.getItem('currentInterviewId');
        if (interviewId && config) {
          // Parse existing body and add interviewId
          try {
            const body = JSON.parse(config.body as string);
            body.interviewId = interviewId;
            config.body = JSON.stringify(body);
          } catch (e) {
            console.error('Failed to add interviewId to request:', e);
          }
        }
      }
      return originalFetch(resource, config);
    };
    const script = document.createElement("script");
    script.innerHTML = `
      !function(window){
        const host="https://labs.heygen.com",
        url=host+"/guest/streaming-embed?share=${AVATAR_URL}&inIFrame=1",
        wrapDiv=document.createElement("div");
        wrapDiv.id="heygen-streaming-embed";
        
        const container=document.createElement("div");
        container.id="heygen-streaming-container";
        
        const stylesheet=document.createElement("style");
        stylesheet.innerHTML=\`
          #heygen-streaming-embed {
            z-index: 9999 !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: min(800px, 70vw) !important;
            height: min(450px, 60vh) !important;
            border-radius: 16px !important;
            overflow: visible !important;
            opacity: 0 !important;
            visibility: hidden !important;
            transition: opacity 0.3s ease !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
            pointer-events: auto !important;
          }
          #heygen-streaming-embed.show {
            opacity: 1 !important;
            visibility: visible !important;
          }
          #heygen-streaming-container {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
          }
          #heygen-streaming-container iframe {
            width: 100% !important;
            height: 100% !important;
            border: 0 !important;
            position: relative !important;
            z-index: 1 !important;
          }
        \`;
        
        const iframe=document.createElement("iframe");
        iframe.allowFullscreen=true;
        iframe.title="Streaming Embed";
        iframe.role="dialog";
        iframe.allow="microphone";
        iframe.src=url;
        
        let initial=false;
        
        window.addEventListener("message",(e=>{
          if(e.origin===host&&e.data&&e.data.type&&"streaming-embed"===e.data.type){
            if("init"===e.data.action){
              initial=true;
              wrapDiv.classList.add("show");
              console.log("Heygen embed initialized and shown");
              // Hide loading screen
              window.dispatchEvent(new CustomEvent("heygen-loaded"));
            }
          }
        }));
        
        container.appendChild(iframe);
        wrapDiv.appendChild(stylesheet);
        wrapDiv.appendChild(container);
        document.body.appendChild(wrapDiv);
        
        console.log("Heygen embed script loaded");
      }(globalThis);
    `;
    document.body.appendChild(script);
    
    // Listen for Heygen loaded event
    const handleHeygenLoaded = () => {
      setIsLoadingAvatar(false);
    };
    window.addEventListener("heygen-loaded", handleHeygenLoaded);
    
    return () => {
      // Cleanup: remove the widget and script when component unmounts
      const widget = document.getElementById("heygen-streaming-embed");
      if (widget) widget.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
      localStorage.removeItem('currentInterviewId');
      // Restore original fetch
      window.fetch = originalFetch;
      window.removeEventListener("heygen-loaded", handleHeygenLoaded);
    };
  }, [hasStarted, interviewId]); // Load when hasStarted and interviewId is available

  const handleChecklistComplete = async () => {
    // Pre-generate IDs to avoid RLS SELECT on return
    const newInterviewId = crypto.randomUUID();
    const newSessionId = crypto.randomUUID();

    // Set locally so UI and embed can initialize immediately
    setInterviewId(newInterviewId);
    setSessionId(newSessionId);
    setHasStarted(true);

    // Save interview session to the backend without requesting a representation
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
    } catch (error) {
      console.error('Error saving interview:', error);
      toast({
        title: "Fout",
        description: "Kon interview sessie niet opslaan",
        variant: "destructive",
      });
    }
  };
  const handlePauseToggle = () => {
    const widget = document.getElementById("heygen-streaming-embed");
    if (widget) {
      if (isPaused) {
        widget.style.visibility = "visible";
        widget.style.opacity = "1";
      } else {
        widget.style.visibility = "hidden";
        widget.style.opacity = "0";
      }
      setIsPaused(!isPaused);
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

    // Clean up interviewer widget
    const widget = document.getElementById("heygen-streaming-embed");
    if (widget) widget.remove();
    
    // Show thank you page
    setShowThankYou(true);
  };

  const handleBack = () => {
    // Clean up interviewer widget without marking as completed
    const widget = document.getElementById("heygen-streaming-embed");
    if (widget) widget.remove();
    
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
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        <div className="relative z-10 text-center px-8 max-w-2xl">
          <a 
            href="https://www.redkiwi.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block transition-transform duration-300 hover:scale-110 mb-6"
          >
            <img src={redkiwiLogo} alt="RedKiwi Logo" className="h-32 mx-auto" />
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
              className="bg-[#FF2B2B] hover:bg-[#FF2B2B]/90 text-white px-8 py-6 text-lg rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
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
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Loading Screen */}
      {isLoadingAvatar && (
        <div className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-[#FF2B2B]/20 border-t-[#FF2B2B] rounded-full animate-spin mx-auto mb-6"></div>
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
              Interview met <span className="text-[#FF2B2B]">{AVATAR_NAME}</span>
            </h2>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handlePauseToggle} variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-[#FF2B2B] transition-all duration-300">
              {isPaused ? 'Hervat' : 'Pauze'}
            </Button>
            <Button onClick={handleEndInterview} variant="outline" className="border-[#FF2B2B]/50 text-[#FF2B2B] hover:bg-[#FF2B2B]/10 hover:border-[#FF2B2B] transition-all duration-300">
              Eindig interview
            </Button>
          </div>
        </div>
      </div>

      {/* Tips Sidebar - positioned next to avatar on the right */}
      <div className="fixed right-[calc(50%-450px)] top-1/2 -translate-y-1/2 z-[9990] w-64 bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-5 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-3">
          Tips voor een soepel AI-interview
        </h3>
        <ul className="text-white/70 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-[#FF2B2B] mt-1">•</span>
            <span>Zorg dat er geen achtergrondgeluiden zijn.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF2B2B] mt-1">•</span>
            <span>Spreek duidelijk en articuleer goed.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF2B2B] mt-1">•</span>
            <span>Vergeet niet de juiste taal te selecteren.</span>
          </li>
        </ul>
      </div>
    </div>;
};