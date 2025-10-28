import { useState, useEffect } from "react";
import { StartScreen } from "@/components/StartScreen";
import redkiwiLogo from "@/assets/redkiwi-logo.png";

export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Load HeyGen streaming embed script immediately
    const script = document.createElement("script");
    script.innerHTML = `
      !function(window){
        const host="https://labs.heygen.com",
        url=host+"/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9DaGFpcl9TaXR0aW5nX3B1Ymxp%0D%0AYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2IxZmY1%0D%0AZWRiZjk2MjQyZTZhYzk0NjkyMjdkZjQwOTI0XzU1MzYwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJu%0D%0AZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjIwMWZkZDcxMmIy%0D%0ANDQwYjZiNmViNDdiYzVmOTYwNmIwIiwidXNlcm5hbWUiOiI2MGQxOTExYjQxZmM0YWI5YTkzYjY4%0D%0AY2EyYTE4ODY4NiJ9&inIFrame=1",
        clientWidth=document.body.clientWidth,
        wrapDiv=document.createElement("div");
        wrapDiv.id="heygen-streaming-embed";
        wrapDiv.setAttribute("data-started", "false");
        
        const container=document.createElement("div");
        container.id="heygen-streaming-container";
        
        const stylesheet=document.createElement("style");
        stylesheet.innerHTML=\`
          #heygen-streaming-embed {
            z-index: 9999;
            position: fixed;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
          }
          
          /* Before start: small floating widget bottom left */
          #heygen-streaming-embed[data-started="false"] {
            left: 40px;
            bottom: 40px;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            border: 3px solid hsl(0 85% 55%);
            box-shadow: 0 0 30px hsl(0 85% 55% / 0.5), 0 0 60px hsl(195 85% 50% / 0.3);
          }
          
          /* After start: centered and larger */
          #heygen-streaming-embed[data-started="true"] {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: min(800px, 90vw);
            height: min(600px, 70vh);
            border-radius: 24px;
            border: 2px solid hsl(0 85% 55% / 0.5);
            box-shadow: 0 0 60px hsl(0 85% 55% / 0.6), 0 0 120px hsl(195 85% 50% / 0.4);
            backdrop-filter: blur(10px);
          }
          
          #heygen-streaming-embed.show {
            opacity: 1;
            visibility: visible;
          }
          
          #heygen-streaming-embed.expand {
            \${clientWidth<540?"height: 266px; width: 96%;":"height: 366px; width: calc(366px * 16 / 9);"}
            border: 0;
            border-radius: 16px;
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
              wrapDiv.classList.toggle("expand",visible);
            } else if("hide"===e.data.action){
              visible=false;
              wrapDiv.classList.toggle("expand",visible);
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
  }, []); // Empty dependency array - load once on mount

  const handleStart = () => {
    setHasStarted(true);
    // Update avatar position to center
    const widget = document.getElementById("heygen-streaming-embed");
    if (widget) {
      widget.setAttribute("data-started", "true");
    }
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
      {/* Futuristic background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,59,59,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,59,59,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Header with logo */}
      <header className="relative border-b border-primary/20 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img src={redkiwiLogo} alt="Redkiwi" className="h-10 drop-shadow-[0_0_15px_rgba(255,59,59,0.5)]" />
          <div className="text-xs text-muted-foreground font-mono">
            AI-DRIVEN INTERVIEW
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto p-8 min-h-[calc(100vh-80px)]">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs font-mono text-primary mb-4">
            MERKPERCEPTIE ONDERZOEK 2025
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent animate-pulse">
            Redkiwi Interview
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            De AI-interviewer staat klaar in het centrum van je scherm.
            <br />
            Praat natuurlijk via je microfoon.
          </p>
          
          <div className="mt-8 p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-primary/20 max-w-xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <p className="text-sm font-mono text-secondary">SYSTEM READY</p>
              </div>
              <p className="text-sm text-muted-foreground">
                ⚡ Zorg dat je microfoon toegang is ingeschakeld
                <br />
                🎯 De interviewer wordt gecentreerd tijdens het gesprek
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
