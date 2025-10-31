import { useState, useEffect } from "react";
import { StartScreen } from "@/components/StartScreen";
import { AvatarSelection } from "@/components/AvatarSelection";
import { Button } from "@/components/ui/button";
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
        wrapDiv=document.createElement("div");
        wrapDiv.id="heygen-streaming-embed";
        
        const container=document.createElement("div");
        container.id="heygen-streaming-container";
        
        const stylesheet=document.createElement("style");
        stylesheet.innerHTML=\`
          #heygen-streaming-embed {
            z-index: 1;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: min(600px, 90vw);
            height: min(600px, 90vh);
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
    setSelectedAvatarUrl("");
    setSelectedAvatarName("");
    setShowAvatarSelection(true);
  };

  const handleAvatarSelectionBack = () => {
    setShowAvatarSelection(false);
  };

  if (showAvatarSelection) {
    return <AvatarSelection onSelect={handleAvatarSelect} onBack={handleAvatarSelectionBack} />;
  }

  if (!hasStarted) {
    return <StartScreen onStart={handleChecklistComplete} />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Header Section */}
      <div className="fixed top-0 left-0 right-0 z-[10000] bg-black/80 backdrop-blur-sm border-b border-white/10 py-6">
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
          
          <div className="text-center flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Interview met <span className="text-[#FF2B2B]">{selectedAvatarName}</span>
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Kies de taal waarin je het interview wilt voeren
            </p>
          </div>
          
          <Button
            onClick={handlePauseToggle}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 hover:border-[#FF2B2B] transition-all duration-300"
          >
            {isPaused ? 'Hervat' : 'Pauze'}
          </Button>
        </div>
      </div>
    </div>
  );
};
