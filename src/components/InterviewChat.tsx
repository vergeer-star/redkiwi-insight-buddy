import { useState, useEffect } from "react";
import { StartScreen } from "@/components/StartScreen";
import redkiwiLogo from "@/assets/redkiwi-logo.png";

export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);

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
            border: 2px solid hsl(356 85% 53% / 0.4);
            box-shadow: 0 0 80px hsl(356 85% 53% / 0.5);
            opacity: 0;
            visibility: hidden;
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
            border-radius: inherit;
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

  const handleStart = () => {
    setHasStarted(true);
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Header with logo */}
      <header className="relative border-b border-white/10 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <img src={redkiwiLogo} alt="Redkiwi" className="h-10" />
          <div className="text-xs text-white/50 font-bold tracking-widest uppercase">
            AI Interview
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center max-w-6xl w-full mx-auto p-8 min-h-[calc(100vh-80px)]">
        <div className="text-center space-y-8">
          <div className="inline-block px-5 py-2 bg-primary/10 border border-primary/40 rounded-sm text-xs font-bold tracking-widest text-primary uppercase">
            Merkperceptie Onderzoek 2025
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-tight">
            REDKIWI<br />
            <span className="text-primary">INTERVIEW</span>
          </h2>
          
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
            De AI-interviewer staat klaar in het centrum van je scherm.
            <br />
            Praat natuurlijk via je microfoon.
          </p>
          
          <div className="mt-12 p-8 bg-card/20 backdrop-blur-sm rounded-sm border border-white/10 max-w-xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-secondary rounded-sm animate-pulse" />
                <p className="text-sm font-black text-secondary tracking-widest uppercase">System Ready</p>
              </div>
              <p className="text-sm text-white/60 font-medium leading-relaxed">
                <strong className="text-white">✓</strong> Zorg dat je microfoon toegang is ingeschakeld
                <br />
                <strong className="text-white">✓</strong> De interviewer wordt gecentreerd tijdens het gesprek
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
