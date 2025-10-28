import { useState, useEffect } from "react";
import { StartScreen } from "@/components/StartScreen";

export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  useEffect(() => {
    // Only load HeyGen streaming embed script after interview has started
    if (!hasStarted) return;

    const script = document.createElement("script");
    script.innerHTML = `
      !function(window){
        const host="https://labs.heygen.com",
        url=host+"/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9DaGFpcl9TaXR0aW5nX3B1Ymxp%0D%0AYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2IxZmY1%0D%0AZWRiZjk2MjQyZTZhYzk0NjkyMjdkZjQwOTI0XzU1MzYwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJu%0D%0AZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjIwMWZkZDcxMmIy%0D%0ANDQwYjZiNmViNDdiYzVmOTYwNmIwIiwidXNlcm5hbWUiOiI2MGQxOTExYjQxZmM0YWI5YTkzYjY4%0D%0AY2EyYTE4ODY4NiJ9&inIFrame=1",
        clientWidth=document.body.clientWidth,
        wrapDiv=document.createElement("div");
        wrapDiv.id="heygen-streaming-embed";
        wrapDiv.setAttribute("data-started", "true");
        
        const container=document.createElement("div");
        container.id="heygen-streaming-container";
        
        const stylesheet=document.createElement("style");
        stylesheet.innerHTML=\`
          #heygen-streaming-embed {
            z-index: 9999;
            position: fixed;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: min(900px, 90vw);
            height: min(680px, 75vh);
            border-radius: 16px;
            border: none !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
            opacity: 0;
            visibility: hidden;
            outline: none !important;
            pointer-events: auto;
            -webkit-tap-highlight-color: transparent !important;
          }
          
          #heygen-streaming-embed *,
          #heygen-streaming-embed *:focus,
          #heygen-streaming-embed *:active,
          #heygen-streaming-embed *:focus-visible {
            outline: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          
          #heygen-streaming-embed:focus,
          #heygen-streaming-embed:active,
          #heygen-streaming-embed:focus-visible {
            outline: none !important;
            border: none !important;
          }
          
          #heygen-streaming-embed.show {
            opacity: 1;
            visibility: visible;
          }
          
          #heygen-streaming-container {
            width: 100%;
            height: 100%;
            outline: none !important;
            border: none !important;
          }
          
          #heygen-streaming-container iframe {
            width: 100%;
            height: 100%;
            border: 0 !important;
            border-radius: inherit;
            outline: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
        \`;
        
        const iframe=document.createElement("iframe");
        iframe.allowFullscreen=false;
        iframe.title="Streaming Embed";
        iframe.role="dialog";
        iframe.allow="microphone";
        iframe.src=url;
        
        let visible=false,initial=false;
        
        window.addEventListener("message",(e=>{
          if(e.origin===host&&e.data&&e.data.type&&"streaming-embed"===e.data.type){
            if("init"===e.data.action){
              initial=true;
              wrapDiv.classList.toggle("show",initial);
            } else if("show"===e.data.action){
              visible=true;
            } else if("hide"===e.data.action){
              visible=false;
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
  }, [hasStarted]); // Load when hasStarted changes

  const handleStart = (language: string) => {
    setSelectedLanguage(language);
    setHasStarted(true);
    
    // Send language preference to HeyGen iframe after it loads
    setTimeout(() => {
      const iframe = document.querySelector('#heygen-streaming-container iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'set-language',
          language: language
        }, '*');
      }
    }, 2000);
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

  const handleBack = () => {
    // Clean up interviewer widget
    const widget = document.getElementById("heygen-streaming-embed");
    if (widget) widget.remove();
    setHasStarted(false);
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  // Language instruction mapping
  const languageInstructions: Record<string, string> = {
    'Nederlands': 'De interviewer zal nu in het Nederlands met je spreken.',
    'English': 'The interviewer will now speak to you in English.',
    'Français': "L'intervieweur vous parlera maintenant en français.",
    'Deutsch': 'Der Interviewer wird jetzt auf Deutsch mit Ihnen sprechen.'
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Language instruction overlay */}
      {selectedLanguage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm animate-fade-in">
          {languageInstructions[selectedLanguage] || languageInstructions['Nederlands']}
        </div>
      )}
      
      {/* Pause/Resume Button */}
      <button
        onClick={handlePauseToggle}
        className="fixed top-8 right-8 z-[10000] px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white font-bold text-sm tracking-wide uppercase transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        {isPaused ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Resume
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            Pauze
          </>
        )}
      </button>
      
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Terug
      </button>
    </div>
  );
};
