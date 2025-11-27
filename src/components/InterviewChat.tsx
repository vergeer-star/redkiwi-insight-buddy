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
  const [heygenSessionId, setHeygenSessionId] = useState<string>(""); // HeyGen's actual session ID
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
    
    // Get the Supabase project URL for the edge function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const customServerUrl = `${supabaseUrl}/functions/v1/interview-chat`;
    
    script.innerHTML = `
      !function(window){
        const host="https://labs.heygen.com",
        url=host+"/guest/streaming-embed?share=${AVATAR_URL}&inIFrame=1&serverUrl=${encodeURIComponent(customServerUrl)}",
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
            border-radius: 24px !important;
            overflow: hidden !important;
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
            console.log("HeyGen message received:", e.data);
            
            if("init"===e.data.action){
              initial=true;
              wrapDiv.classList.add("show");
              console.log("Heygen embed initialized and shown");
              // Hide loading screen
              window.dispatchEvent(new CustomEvent("heygen-loaded"));
            }
            
            // Capture session info
            if(e.data.sessionId){
              console.log("HeyGen session ID:", e.data.sessionId);
              window.dispatchEvent(new CustomEvent("heygen-session", { 
                detail: { sessionId: e.data.sessionId } 
              }));
            }
            
            // Capture user talking messages
            if(e.data.action === "user_talking_message" || e.data.event === "USER_TALKING_MESSAGE"){
              console.log("User talking message:", e.data);
              window.dispatchEvent(new CustomEvent("heygen-user-message", { 
                detail: e.data 
              }));
            }
            
            // Capture avatar talking messages
            if(e.data.action === "avatar_talking_message" || e.data.event === "AVATAR_TALKING_MESSAGE"){
              console.log("Avatar talking message:", e.data);
              window.dispatchEvent(new CustomEvent("heygen-avatar-message", { 
                detail: e.data 
              }));
            }
            
            // Capture session end event
            if(e.data.action === "session_end" || e.data.action === "ended"){
              console.log("HeyGen session ended");
              window.dispatchEvent(new CustomEvent("heygen-session-end", { 
                detail: e.data 
              }));
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
      console.log("[HEYGEN] Avatar loaded and ready");
      setIsLoadingAvatar(false);
    };
    
    // Listen for HeyGen session ID
    const handleHeygenSession = (e: CustomEvent) => {
      console.log("[HEYGEN] Captured session ID:", e.detail.sessionId);
      setHeygenSessionId(e.detail.sessionId);
    };
    
    // Listen for user messages and save them to database
    const handleUserMessage = async (e: CustomEvent) => {
      console.log("[HEYGEN] User message received:", e.detail);
      if (!interviewId) return;
      
      try {
        const { error } = await supabase
          .from('interview_messages')
          .insert({
            interview_id: interviewId,
            role: 'user',
            content: e.detail.message || e.detail.text || JSON.stringify(e.detail),
            timestamp: new Date().toISOString()
          });
        
        if (error) {
          console.error("[HEYGEN] Failed to save user message:", error);
        } else {
          console.log("[HEYGEN] User message saved successfully");
        }
      } catch (error) {
        console.error("[HEYGEN] Error saving user message:", error);
      }
    };
    
    // Listen for avatar messages and save them to database
    const handleAvatarMessage = async (e: CustomEvent) => {
      console.log("[HEYGEN] Avatar message received:", e.detail);
      if (!interviewId) return;
      
      try {
        const { error } = await supabase
          .from('interview_messages')
          .insert({
            interview_id: interviewId,
            role: 'assistant',
            content: e.detail.message || e.detail.text || JSON.stringify(e.detail),
            timestamp: new Date().toISOString()
          });
        
        if (error) {
          console.error("[HEYGEN] Failed to save avatar message:", error);
        } else {
          console.log("[HEYGEN] Avatar message saved successfully");
        }
      } catch (error) {
        console.error("[HEYGEN] Error saving avatar message:", error);
      }
    };
    
    window.addEventListener("heygen-loaded", handleHeygenLoaded);
    window.addEventListener("heygen-session", handleHeygenSession as EventListener);
    window.addEventListener("heygen-user-message", handleUserMessage as EventListener);
    window.addEventListener("heygen-avatar-message", handleAvatarMessage as EventListener);
    
    return () => {
      // Cleanup: remove the widget and script when component unmounts
      const widget = document.getElementById("heygen-streaming-embed");
      if (widget) widget.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
      localStorage.removeItem('currentInterviewId');
      // Restore original fetch
      window.fetch = originalFetch;
      window.removeEventListener("heygen-loaded", handleHeygenLoaded);
      window.removeEventListener("heygen-session", handleHeygenSession as EventListener);
      window.removeEventListener("heygen-user-message", handleUserMessage as EventListener);
      window.removeEventListener("heygen-avatar-message", handleAvatarMessage as EventListener);
    };
  }, [hasStarted, interviewId]); // Load when hasStarted and interviewId is available

  const handleChecklistComplete = async () => {
    // Pre-generate IDs to avoid RLS SELECT on return
    const newInterviewId = crypto.randomUUID();
    const newSessionId = crypto.randomUUID();

    console.log('[INTERVIEW] Starting new interview:', { interviewId: newInterviewId, sessionId: newSessionId });

    // Set locally so UI and embed can initialize immediately
    setInterviewId(newInterviewId);
    setSessionId(newSessionId);
    setHasStarted(true);

    // Save interview session to the backend without requesting a representation
    try {
      console.log('[INTERVIEW] Saving interview to database');
      const { error } = await supabase
        .from('interviews')
        .insert({
          id: newInterviewId,
          session_id: newSessionId,
          avatar_name: AVATAR_NAME,
          avatar_url: AVATAR_URL,
          status: 'started',
        });

      if (error) {
        console.error('[INTERVIEW] Failed to save interview:', error);
        throw error;
      }
      console.log('[INTERVIEW] Interview saved successfully');
    } catch (error) {
      console.error('[INTERVIEW] Error saving interview:', error);
      toast({
        title: "Fout",
        description: "Kon interview sessie niet opslaan",
        variant: "destructive",
      });
    }
  };
  const handleEndInterview = async () => {
    console.log('[INTERVIEW] Ending interview:', interviewId);
    
    // Update interview status to completed
    if (interviewId) {
      try {
        console.log('[INTERVIEW] Updating interview status to completed');
        await supabase.from('interviews').update({
          status: 'completed',
          ended_at: new Date().toISOString()
        }).eq('id', interviewId);
        console.log('[INTERVIEW] Interview marked as completed');

        // Trigger AI analysis of the interview
        toast({
          title: "Interview beëindigd",
          description: "Je antwoorden worden nu geanalyseerd..."
        });

        // Analyze the interview based on stored messages
        const processInterview = async () => {
          try {
            console.log("[PROCESS] Starting interview processing");
            console.log(`[PROCESS] HeyGen session ID: ${heygenSessionId || 'none'}, Fallback: ${sessionId}`);
            
            // Call transcribe-audio edge function to fetch HeyGen recording
            console.log("[PROCESS] Attempting to fetch HeyGen recording for transcription");
            const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe-audio', {
              body: {
                interviewId,
                sessionId: heygenSessionId || sessionId,
                fallbackSessionId: sessionId
              }
            });

            if (transcribeError) {
              console.error('[PROCESS] Error transcribing interview:', transcribeError);
              toast({
                title: "Transcriptie fout",
                description: "Audio kon niet worden getranscribeerd",
                variant: "destructive"
              });
            } else {
              console.log('[PROCESS] Transcription completed:', transcribeData);
            }
            
            console.log('[PROCESS] Starting interview analysis');

            // Then analyze the interview
            const { data, error } = await supabase.functions.invoke('analyze-interview', {
              body: {
                interviewId
              }
            });

            if (error) {
              console.error('[PROCESS] Error analyzing interview:', error);
              toast({
                title: "Analyse fout",
                description: "Er is een fout opgetreden bij het analyseren",
                variant: "destructive"
              });
            } else {
              console.log('[PROCESS] Interview analysis completed:', data);
            }
          } catch (err) {
            console.error('[PROCESS] Error processing interview:', err);
          }
        };

        processInterview();
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