import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import redkiwiLogo from "@/assets/redkiwi-logo.png";
import redkiwiLogoNew from "@/assets/redkiwi-logo-new.png";
import heygenLogoNew from "@/assets/heygen-logo-new.png";
import heroAnimation from "@/assets/hero-animation.gif";
import { ChevronRight, ChevronLeft, Mic, Volume2, Globe, Shield, CheckCircle2 } from "lucide-react";
interface StartScreenProps {
  onStart: (language: string) => void;
}
export const StartScreen = ({
  onStart
}: StartScreenProps) => {
  const [step, setStep] = useState(1);
  const [isStarting, setIsStarting] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [quietEnvironmentConfirmed, setQuietEnvironmentConfirmed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStart(selectedLanguage);
    }, 1500);
  };
  const toggleMicPermission = async () => {
    if (micPermissionGranted && micStream) {
      // Turn off microphone
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
      setMicPermissionGranted(false);
    } else {
      // Request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        setMicStream(stream);
        setMicPermissionGranted(true);
      } catch (error) {
        console.error('Microphone permission denied:', error);
        alert('Microfoon toegang is nodig voor het interview. Klik op "Toestaan" wanneer je browser erom vraagt.');
      }
    }
  };

  // Step 1: Hero with GIF
  if (step === 1) {
    return <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        <div className="relative max-w-5xl w-full space-y-8 text-center -mt-20">
          <div className="relative cursor-pointer" onClick={() => setStep(2)}>
            <div className="relative overflow-hidden rounded-lg">
              <img src={heroAnimation} alt="AI Animation" className="h-96 md:h-[32rem] mx-auto transition-all duration-500" style={{
              animationPlayState: 'running'
            }} />
              {/* Hover zone in het midden */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 group" onMouseEnter={e => {
              const img = e.currentTarget.parentElement?.querySelector('img');
              if (img) {
                img.style.animationPlayState = 'paused';
                img.style.transform = 'scale(1.05)';
              }
            }} onMouseLeave={e => {
              const img = e.currentTarget.parentElement?.querySelector('img');
              if (img) {
                img.style.animationPlayState = 'running';
                img.style.transform = 'scale(1)';
              }
            }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-md">
                    <span className="text-white/80 font-medium text-base tracking-wide flex items-center gap-2">
                      Klik om te beginnen
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-wide leading-tight">
              WELCOME TO AN<br />
              <span className="text-primary">AI-DRIVEN</span> INTERVIEW
            </h1>
          </div>
        </div>
        
        {/* Powered by section at bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-0.5">
          <p className="text-xs text-secondary/60 font-normal">Powered by:</p>
          <div className="flex items-center gap-0.5">
            <img src={redkiwiLogoNew} alt="Redkiwi" className="h-12" />
            <span className="text-secondary/60 text-xs mx-0.5">&</span>
            <img src={heygenLogoNew} alt="HeyGen" className="h-12" />
          </div>
        </div>
      </div>;
  }

  // Step 2: Instructions with checklist
  if (step === 2) {
    return <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative max-w-4xl w-full space-y-10 text-center">
          {/* Header Section */}
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
              LET'S GET <span className="text-primary">STARTED</span>
            </h2>
            
            <div className="max-w-2xl mx-auto space-y-3">
              <p className="text-base text-white leading-relaxed">
                Een persoonlijk AI-gesprek van <strong className="text-white">5-10 minuten</strong> om je ervaring te delen.
              </p>
              <p className="text-sm text-white">
                Jouw antwoorden helpen ons beter te begrijpen hoe je ons merk beleeft.
              </p>
            </div>
          </div>

          {/* Checklist Card */}
          <Card className="max-w-2xl mx-auto p-8 md:p-10 bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_48px_rgba(237,28,36,0.15)] transition-all duration-500 animate-fade-in">
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Mic Permission - Interactive */}
                <div onClick={toggleMicPermission} className="flex items-start gap-4 group cursor-pointer animate-fade-in hover:bg-white/5 p-3 -m-3 rounded-lg transition-all duration-300" style={{
                animationDelay: '0ms'
              }}>
                  <div className={`mt-0.5 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 border ${micPermissionGranted ? 'bg-gradient-to-br from-[#DFFF00]/30 to-[#DFFF00]/15 border-[#DFFF00]/60 group-hover:shadow-[0_0_25px_rgba(223,255,0,0.6)]' : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:shadow-[0_0_20px_rgba(237,28,36,0.3)]'}`}>
                    {micPermissionGranted ? <CheckCircle2 className="w-5 h-5 text-[#DFFF00] drop-shadow-[0_0_8px_rgba(223,255,0,0.8)]" strokeWidth={2.5} /> : <Mic className="w-5 h-5 text-primary" strokeWidth={2.5} />}
                  </div>
                  <div className="flex-1 text-left pt-2">
                    <p className="text-base text-white/90 font-medium leading-relaxed">
                      {micPermissionGranted ? 'Microfoon toegang verleend ✓ (klik om uit te schakelen)' : 'Klik om microfoon toegang te geven'}
                    </p>
                  </div>
                </div>

                {/* Quiet Environment - Interactive */}
                <div onClick={() => setQuietEnvironmentConfirmed(!quietEnvironmentConfirmed)} className="flex items-start gap-4 group cursor-pointer animate-fade-in hover:bg-white/5 p-3 -m-3 rounded-lg transition-all duration-300" style={{
                animationDelay: '150ms'
              }}>
                  <div className={`mt-0.5 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 border ${quietEnvironmentConfirmed ? 'bg-gradient-to-br from-[#DFFF00]/30 to-[#DFFF00]/15 border-[#DFFF00]/60 group-hover:shadow-[0_0_25px_rgba(223,255,0,0.6)]' : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:shadow-[0_0_20px_rgba(237,28,36,0.3)]'}`}>
                    {quietEnvironmentConfirmed ? <CheckCircle2 className="w-5 h-5 text-[#DFFF00] drop-shadow-[0_0_8px_rgba(223,255,0,0.8)]" strokeWidth={2.5} /> : <Volume2 className="w-5 h-5 text-primary" strokeWidth={2.5} />}
                  </div>
                  <div className="flex-1 text-left pt-2">
                    <p className="text-base text-white/90 font-medium leading-relaxed">
                      {quietEnvironmentConfirmed ? 'Rustige omgeving bevestigd ✓' : 'Ja, ik zit op een rustige omgeving zonder achtergrondgeluiden'}
                    </p>
                  </div>
                </div>

                {/* Language Selection - Interactive */}
                <div className="space-y-3">
                  <div className="flex items-start gap-4 animate-fade-in" style={{
                  animationDelay: '300ms'
                }}>
                    <div className={`mt-0.5 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 border ${selectedLanguage ? 'bg-gradient-to-br from-[#DFFF00]/30 to-[#DFFF00]/15 border-[#DFFF00]/60 shadow-[0_0_20px_rgba(223,255,0,0.4)]' : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'}`}>
                      {selectedLanguage ? <CheckCircle2 className="w-5 h-5 text-[#DFFF00] drop-shadow-[0_0_8px_rgba(223,255,0,0.8)]" strokeWidth={2.5} /> : <Globe className="w-5 h-5 text-primary" strokeWidth={2.5} />}
                    </div>
                    <div className="flex-1 text-left pt-2">
                      <p className="text-base text-white/90 font-medium leading-relaxed mb-3">
                        {selectedLanguage ? `Taal geselecteerd: ${selectedLanguage}` : 'Kies je voorkeurstaal voor het interview'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Nederlands', 'English', 'Français', 'Deutsch'].map(lang => <button key={lang} onClick={() => setSelectedLanguage(lang)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${selectedLanguage === lang ? 'bg-primary text-white shadow-[0_0_20px_rgba(237,28,36,0.4)]' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}>
                            {lang}
                          </button>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Consent - Interactive */}
              <div className="pt-6 border-t border-white/10">
                <div onClick={() => setPrivacyConsent(!privacyConsent)} className="flex items-start gap-4 group cursor-pointer animate-fade-in hover:bg-white/5 p-3 -m-3 rounded-lg transition-all duration-300" style={{
                animationDelay: '450ms'
              }}>
                  <div className={`mt-0.5 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 border ${privacyConsent ? 'bg-gradient-to-br from-[#DFFF00]/30 to-[#DFFF00]/15 border-[#DFFF00]/60 group-hover:shadow-[0_0_25px_rgba(223,255,0,0.6)]' : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:shadow-[0_0_20px_rgba(237,28,36,0.3)]'}`}>
                    {privacyConsent ? <CheckCircle2 className="w-5 h-5 text-[#DFFF00] drop-shadow-[0_0_8px_rgba(223,255,0,0.8)]" strokeWidth={2.5} /> : <Shield className="w-5 h-5 text-primary" strokeWidth={2.5} />}
                  </div>
                  <div className="flex-1 text-left pt-2">
                    <p className="text-base text-white/90 font-medium leading-relaxed mb-2">
                      {privacyConsent ? 'Toestemming verleend ✓' : 'Klik om toestemming te geven'}
                    </p>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Jouw privacy is belangrijk. Er worden <strong>geen stem- of beeldopnames</strong> gemaakt; alleen de transcriptie van het interview wordt anoniem verwerkt. Alle antwoorden blijven volledig vertrouwelijk en worden uitsluitend gebruikt voor dit onderzoek.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Button */}
          <div className="space-y-4 animate-fade-in" style={{
          animationDelay: '600ms'
        }}>
            <Button onClick={handleStart} disabled={isStarting || !privacyConsent || !micPermissionGranted || !quietEnvironmentConfirmed || !selectedLanguage} className="px-12 md:px-16 py-6 bg-white hover:bg-white/90 text-black text-sm font-black tracking-[0.12em] uppercase shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(237,28,36,0.5)] hover:scale-105 transition-all duration-300 border-none rounded-lg disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden">
              {isStarting ? <span className="flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Even instellen...
                </span> : <span className="flex items-center gap-2">
                  Start Interview
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>}
            </Button>
            
            {(!privacyConsent || !micPermissionGranted || !quietEnvironmentConfirmed || !selectedLanguage) && <p className="text-xs text-white/40">
                Vul eerst alle stappen in de checklist in
              </p>}
            
            <button onClick={() => setStep(1)} className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 mx-auto">
              <ChevronLeft className="w-4 h-4" />
              Terug
            </button>
          </div>
        </div>
      </div>;
  }
  return null;
};