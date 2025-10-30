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
    <div className="min-h-screen bg-[#0B0B0B] relative overflow-hidden flex flex-col items-center justify-center p-8">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Back Button - keer terug naar avatar selectie */}
      <button
        onClick={handleBack}
        className="fixed top-8 left-8 z-[10000] px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white font-bold text-sm tracking-wide uppercase transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Terug naar keuze
      </button>

      {/* Language Selection Reminder */}
      <div className="relative z-10 max-w-2xl w-full mb-8 text-center animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Interview met <span className="text-[#FF2B2B]">{selectedAvatarName}</span>
        </h2>
        <p className="text-white/70 text-sm mb-6">
          Kies de taal waarin je het interview wilt voeren
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={() => setSelectedLanguage('Nederlands')}
            variant={selectedLanguage === 'Nederlands' ? 'default' : 'outline'}
            className={selectedLanguage === 'Nederlands' ? 'bg-[#FF2B2B] hover:bg-[#FF2B2B]/90 border-none' : 'border-white/20 text-white hover:bg-white/10'}
          >
            Nederlands
          </Button>
          <Button
            onClick={() => setSelectedLanguage('English')}
            variant={selectedLanguage === 'English' ? 'default' : 'outline'}
            className={selectedLanguage === 'English' ? 'bg-[#FF2B2B] hover:bg-[#FF2B2B]/90 border-none' : 'border-white/20 text-white hover:bg-white/10'}
          >
            English
          </Button>
          <Button
            onClick={() => setSelectedLanguage('Français')}
            variant={selectedLanguage === 'Français' ? 'default' : 'outline'}
            className={selectedLanguage === 'Français' ? 'bg-[#FF2B2B] hover:bg-[#FF2B2B]/90 border-none' : 'border-white/20 text-white hover:bg-white/10'}
          >
            Français
          </Button>
        </div>
      </div>
    </div>
  );
};
