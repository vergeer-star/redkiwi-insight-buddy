import { useState, useEffect } from "react";
import { StartScreen } from "@/components/StartScreen";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import redkiwiLogo from "@/assets/redkiwi-logo-new.png";

export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [interviewId, setInterviewId] = useState<string>("");
  const { toast } = useToast();
  
  // Fixed avatar - Katya
  const AVATAR_URL = "eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9DaGFpcl9TaXR0aW5nX3B1Ymxp%0D%0AYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2IxZmY1%0D%0AZWRiZjk2MjQyZTZhYzk0NjkyMjdkZjQwOTI0XzU1MzYwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJu%0D%0AZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjIwMWZkZDcxMmIy%0D%0ANDQwYjZiNmViNDdiYzVmOTYwNmIwIiwidXNlcm5hbWUiOiI2MGQxOTExYjQxZmM0YWI5YTkzYjY4%0D%0AY2EyYTE4ODY4NiJ9";
  const AVATAR_NAME = "Katya";

  useEffect(() => {
    // Only load HeyGen streaming embed script after interview has started
    if (!hasStarted) return;

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
            z-index: 1;
            position: fixed;
            top: 140px;
            left: 50%;
            transform: translateX(-50%);
            width: min(650px, 85vw);
            height: min(650px, calc(100vh - 180px));
            border-radius: 16px;
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          }
          #heygen-streaming-embed.show {
            opacity: 1;
            visibility: visible;
          }
          #heygen-streaming-container {
            width: 100%;
            height: 100%;
          }
          #heygen-streaming-container iframe {
            width: 100%;
            height: 100%;
            border: 0;
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
              wrapDiv.classList.toggle("show",initial);
            }
          }
        }));
        
        container.appendChild(iframe);
        wrapDiv.appendChild(stylesheet);
        wrapDiv.appendChild(container);
        document.body.appendChild(wrapDiv);
      }(globalThis);
    `;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove the widget and script when component unmounts
      const widget = document.getElementById("heygen-streaming-embed");
      if (widget) widget.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [hasStarted]); // Load when hasStarted

  const handleChecklistComplete = async () => {
    setHasStarted(true);
    
    // Save interview session to Supabase
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          avatar_name: AVATAR_NAME,
          avatar_url: AVATAR_URL,
          status: 'started'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSessionId(data.session_id);
        setInterviewId(data.id);
      }
    } catch (error) {
      console.error('Error saving interview:', error);
      toast({
        title: "Fout",
        description: "Kon interview sessie niet opslaan",
        variant: "destructive"
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

  const handleBack = async () => {
    // Update interview status to completed
    if (interviewId) {
      try {
        await supabase
          .from('interviews')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('id', interviewId);
      } catch (error) {
        console.error('Error updating interview:', error);
      }
    }
    
    // Clean up interviewer widget
    const widget = document.getElementById("heygen-streaming-embed");
    if (widget) widget.remove();
    setHasStarted(false);
    setSessionId("");
    setInterviewId("");
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleChecklistComplete} />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Header Section */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white font-bold text-sm tracking-wide uppercase transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Terug
          </button>
          
          <div className="flex-1 flex gap-8 items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Interview met <span className="text-[#FF2B2B]">{AVATAR_NAME}</span>
              </h2>
            </div>
            
            <div className="border-l border-white/20 pl-8">
              <h3 className="text-lg font-bold text-white mb-3">
                Tips voor een soepel AI-interview
              </h3>
              <ul className="text-white/70 text-sm space-y-2 text-left">
                <li>• Zorg dat er geen achtergrondgeluiden zijn.</li>
                <li>• Spreek duidelijk en articuleer goed.</li>
                <li>• Vergeet niet de juiste taal te selecteren.</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handlePauseToggle}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:border-[#FF2B2B] transition-all duration-300"
            >
              {isPaused ? 'Hervat' : 'Pauze'}
            </Button>
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-[#FF2B2B]/50 text-[#FF2B2B] hover:bg-[#FF2B2B]/10 hover:border-[#FF2B2B] transition-all duration-300"
            >
              Eindig interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
