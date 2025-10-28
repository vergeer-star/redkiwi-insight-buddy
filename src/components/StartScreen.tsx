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
    return <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background pattern - behind everything */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px] z-0" />
        
        <div className="relative max-w-6xl w-full flex flex-col items-center justify-center space-y-12 md:space-y-16 z-10 animate-fade-in">
          {/* Main Logo / Animation */}
          <div className="relative cursor-pointer w-full max-w-2xl" onClick={() => setStep(2)}>
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={heroAnimation} 
                alt="AI Animation" 
                className="w-full h-auto mx-auto transition-all duration-500" 
                style={{ animationPlayState: 'running' }} 
              />
              {/* Hover zone in het midden */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 group" 
                onMouseEnter={e => {
                  const img = e.currentTarget.parentElement?.querySelector('img');
                  if (img) {
                    img.style.animationPlayState = 'paused';
                    img.style.transform = 'scale(1.05)';
                  }
                }} 
                onMouseLeave={e => {
                  const img = e.currentTarget.parentElement?.querySelector('img');
                  if (img) {
                    img.style.animationPlayState = 'running';
                    img.style.transform = 'scale(1)';
                  }
                }}
              >
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
          
          {/* Headline */}
          <div className="w-full max-w-4xl text-center space-y-2">
            <h1 
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide leading-tight px-4" 
              style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)' }}
            >
              WELCOME TO AN<br />
              <span className="text-[#FF2B2B]">AI-DRIVEN</span> INTERVIEW
            </h1>
          </div>
          
          {/* Powered by section */}
          <div className="w-full flex flex-col items-center gap-6 mt-20">
            {/* Subtle separator line */}
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            {/* Powered by text */}
            <p className="text-base text-[#9C9C9C] font-medium tracking-[0.2em] uppercase">
              Powered by
            </p>
            
            {/* Logos - horizontaal op desktop, verticaal op mobiel */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              <img 
                src={redkiwiLogoNew} 
                alt="Redkiwi" 
                className="h-7 md:h-8 w-auto object-contain" 
                style={{ imageRendering: 'crisp-edges' }}
              />
              <span className="text-[#9C9C9C] text-lg font-light hidden md:inline">&</span>
              <img 
                src={heygenLogoNew} 
                alt="HeyGen" 
                className="h-7 md:h-8 w-auto object-contain" 
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </div>
        </div>
      </div>;
  }

  // Step 2: Instructions with checklist
  if (step === 2) {
    return <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative max-w-4xl w-full space-y-8 text-center animate-fade-in">
          {/* Header Section */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              LET'S GET <span className="text-[#FF2B2B]">STARTED</span>
            </h2>
            
            <div className="max-w-2xl mx-auto space-y-2">
              <p className="text-base text-white/90 leading-relaxed">
                Een persoonlijk AI-gesprek van <strong className="text-white">5-10 minuten</strong> om je ervaring te delen.
              </p>
              <p className="text-sm text-[#9C9C9C]">
                Jouw antwoorden helpen ons beter te begrijpen hoe je ons merk beleeft.
              </p>
            </div>
          </div>

          {/* Checklist Card */}
          <Card className="max-w-2xl mx-auto p-8 md:p-10 bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-2xl transition-all duration-500">
            <div className="space-y-6">
              {/* Mic Permission - Interactive */}
              <div 
                onClick={toggleMicPermission} 
                className={`flex items-start gap-5 group cursor-pointer p-4 -m-2 rounded-xl transition-all duration-300 border border-transparent ${
                  micPermissionGranted 
                    ? 'bg-[#FF2B2B]/5 border-[#FF2B2B]/20' 
                    : 'hover:bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className={`mt-0.5 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  micPermissionGranted 
                    ? 'bg-[#FF2B2B] shadow-[0_0_30px_rgba(237,28,36,0.5)]' 
                    : 'bg-white/5 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}>
                  {micPermissionGranted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  ) : (
                    <Mic className="w-6 h-6 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1 text-left pt-2">
                  <p className="text-base text-white font-medium leading-relaxed">
                    {micPermissionGranted ? 'Microfoon toegang verleend' : 'Klik om microfoon toegang te geven'}
                  </p>
                  {micPermissionGranted && (
                    <p className="text-xs text-[#9C9C9C] mt-1">(klik om uit te schakelen)</p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Quiet Environment - Interactive */}
              <div 
                onClick={() => setQuietEnvironmentConfirmed(!quietEnvironmentConfirmed)} 
                className={`flex items-start gap-5 group cursor-pointer p-4 -m-2 rounded-xl transition-all duration-300 border border-transparent ${
                  quietEnvironmentConfirmed 
                    ? 'bg-[#FF2B2B]/5 border-[#FF2B2B]/20' 
                    : 'hover:bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className={`mt-0.5 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  quietEnvironmentConfirmed 
                    ? 'bg-[#FF2B2B] shadow-[0_0_30px_rgba(237,28,36,0.5)]' 
                    : 'bg-white/5 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}>
                  {quietEnvironmentConfirmed ? (
                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1 text-left pt-2">
                  <p className="text-base text-white font-medium leading-relaxed">
                    {quietEnvironmentConfirmed ? 'Rustige omgeving bevestigd' : 'Ja, ik zit op een rustige omgeving zonder achtergrondgeluiden'}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Language Selection - Interactive */}
              <div className={`p-4 -m-2 rounded-xl transition-all duration-300 border border-transparent ${
                selectedLanguage 
                  ? 'bg-[#FF2B2B]/5 border-[#FF2B2B]/20' 
                  : ''
              }`}>
                <div className="flex items-start gap-5">
                  <div className={`mt-0.5 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    selectedLanguage 
                      ? 'bg-[#FF2B2B] shadow-[0_0_30px_rgba(237,28,36,0.5)]' 
                      : 'bg-white/5'
                  }`}>
                    {selectedLanguage ? (
                      <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                    ) : (
                      <Globe className="w-6 h-6 text-white" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex-1 text-left pt-2">
                    <p className="text-base text-white font-medium leading-relaxed mb-4">
                      {selectedLanguage ? `Taal geselecteerd: ${selectedLanguage}` : 'Kies je voorkeurstaal voor het interview'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Nederlands', 'English', 'Français', 'Deutsch'].map(lang => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            selectedLanguage === lang 
                              ? 'bg-[#FF2B2B] text-white shadow-[0_0_20px_rgba(237,28,36,0.4)]' 
                              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Privacy Consent - Interactive */}
              <div 
                onClick={() => setPrivacyConsent(!privacyConsent)} 
                className={`flex items-start gap-5 group cursor-pointer p-4 -m-2 rounded-xl transition-all duration-300 border border-transparent ${
                  privacyConsent 
                    ? 'bg-[#FF2B2B]/5 border-[#FF2B2B]/20' 
                    : 'hover:bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className={`mt-0.5 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  privacyConsent 
                    ? 'bg-[#FF2B2B] shadow-[0_0_30px_rgba(237,28,36,0.5)]' 
                    : 'bg-white/5 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}>
                  {privacyConsent ? (
                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  ) : (
                    <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1 text-left pt-2">
                  <p className="text-base text-white font-medium leading-relaxed mb-2">
                    {privacyConsent ? 'Toestemming verleend' : 'Klik om toestemming te geven'}
                  </p>
                  <p className="text-xs text-[#9C9C9C] leading-relaxed">
                    Jouw privacy is belangrijk. Er worden geen stem- of beeldopnames gemaakt; alleen de transcriptie van het interview wordt anoniem verwerkt. Je antwoorden blijven volledig vertrouwelijk en worden uitsluitend gebruikt voor dit onderzoek.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Button */}
          <div className="space-y-4">
            <Button 
              onClick={handleStart} 
              disabled={isStarting || !privacyConsent || !micPermissionGranted || !quietEnvironmentConfirmed || !selectedLanguage} 
              className="px-12 py-6 bg-[#FF2B2B] hover:bg-[#FF2B2B]/90 text-white text-base font-bold tracking-wider uppercase shadow-[0_0_40px_rgba(237,28,36,0.4)] hover:shadow-[0_0_60px_rgba(237,28,36,0.6)] hover:scale-105 transition-all duration-300 border-none rounded-xl disabled:opacity-40 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {isStarting ? (
                <span className="flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Even instellen...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Start Interview
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
            
            {(!privacyConsent || !micPermissionGranted || !quietEnvironmentConfirmed || !selectedLanguage) && (
              <p className="text-xs text-[#9C9C9C]">
                Vul eerst alle stappen in de checklist in
              </p>
            )}
            
            <button 
              onClick={() => setStep(1)} 
              className="text-sm text-[#9C9C9C] hover:text-white transition-colors flex items-center gap-1 mx-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              Terug
            </button>
          </div>
        </div>
      </div>;
  }
  return null;
};