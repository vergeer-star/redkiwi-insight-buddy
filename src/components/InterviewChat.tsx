import { useState, useEffect } from "react";
import { StartScreen } from "@/components/StartScreen";
import { AvatarSelection } from "@/components/AvatarSelection";
import redkiwiLogo from "@/assets/redkiwi-logo-new.png";

export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>("");
  const [selectedAvatarName, setSelectedAvatarName] = useState<string>("");
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);

  useEffect(() => {
    // Only load HeyGen streaming embed script after interview has started
    if (!hasStarted || !selectedAvatarUrl) return;

    const script = document.createElement("script");
    script.innerHTML = `
      !function(window){
        const host="https://labs.heygen.com",
        url=host+"/guest/streaming-embed?share=${selectedAvatarUrl}&inIFrame=1",
        clientWidth=document.body.clientWidth,
        wrapDiv=document.createElement("div");
        wrapDiv.id="heygen-streaming-embed";
        
        const container=document.createElement("div");
        container.id="heygen-streaming-container";
        
        const stylesheet=document.createElement("style");
        stylesheet.innerHTML=\`
          #heygen-streaming-embed {
            z-index: 9999;
            position: fixed;
            left: 40px;
            bottom: 40px;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.12);
            transition: all linear 0.1s;
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
          }
          #heygen-streaming-embed.show {
            opacity: 1;
            visibility: visible;
          }
          #heygen-streaming-embed.expand {
            \${clientWidth<540?"height: 266px; width: 96%; left: 50%; transform: translateX(-50%);":"height: 366px; width: calc(366px * 16 / 9);"}
            border: 0;
            border-radius: 8px;
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
  }, [hasStarted, selectedAvatarUrl]); // Load when hasStarted or avatar changes

  const handleAvatarSelect = (avatarUrl: string, avatarName: string) => {
    setSelectedAvatarUrl(avatarUrl);
    setSelectedAvatarName(avatarName);
    setShowAvatarSelection(false);
    setHasStarted(true); // Start interview direct bij avatar selectie
  };

  const handleChecklistComplete = () => {
    setShowAvatarSelection(true);
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

  if (showAvatarSelection) {
    return <AvatarSelection onSelect={handleAvatarSelect} />;
  }

  if (!hasStarted) {
    return <StartScreen onStart={handleChecklistComplete} />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Redkiwi Logo */}
      <div className="fixed top-8 left-8 z-[10000]">
        <a href="https://www.redkiwi.com/" target="_blank" rel="noopener noreferrer">
          <img src={redkiwiLogo} alt="Redkiwi" className="h-20 w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer" />
        </a>
      </div>
      
      {/* Language reminder overlay */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm animate-fade-in">
        Vergeet niet de juiste taal in te stellen in de widget
      </div>
      
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
