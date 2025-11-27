import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import redkiwiLogo from "@/assets/redkiwi-logo.png";
import redkiwiLogoNew from "@/assets/redkiwi-logo-new.png";
import heygenLogoNew from "@/assets/heygen-logo-new.png";
import lovableLogo from "@/assets/lovable-logo-new.png";
import heroAnimation from "@/assets/hero-animation.gif";
import { ChevronRight, ChevronLeft, Mic, Volume2, Globe, Shield, CheckCircle2, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface StartScreenProps {
  onStart: (language: string) => void;
}
export const StartScreen = ({ onStart }: StartScreenProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isStarting, setIsStarting] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [quietEnvironmentConfirmed, setQuietEnvironmentConfirmed] = useState(false);
  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStart("Nederlands");
    }, 1500);
  };
  const scrollDown = () => {
    window.scrollBy({ top: 100, behavior: "smooth" });
  };

  const toggleMicPermission = async () => {
    if (micPermissionGranted && micStream) {
      // Turn off microphone
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
      setMicPermissionGranted(false);
    } else {
      // Request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMicStream(stream);
        setMicPermissionGranted(true);
        scrollDown();
      } catch (error) {
        console.error("Microphone permission denied:", error);
        alert('Microfoon toegang is nodig voor het interview. Klik op "Toestaan" wanneer je browser erom vraagt.');
      }
    }
  };

  // Step 1: Hero with GIF
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col p-4 relative overflow-hidden">
        {/* Background pattern - behind everything */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.02)_1px,transparent_1px)] bg-[size:80px_80px] z-0" />

        {/* Subtle login button in top right corner */}
        <button
          onClick={() => navigate("/auth")}
          className="fixed top-4 right-4 z-20 p-2 text-white/40 hover:text-white/80 transition-colors duration-300 group"
          aria-label="Inloggen"
        >
          <LogIn size={20} className="group-hover:scale-110 transition-transform duration-300" />
        </button>

        <div className="relative w-full flex-1 flex flex-col items-center justify-center space-y-8 z-10 animate-fade-in">
          {/* Main Logo / Animation - 45% of viewport width max */}
          <div className="relative w-[50%] md:w-[35%] max-w-md">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={heroAnimation}
                alt="AI Animation"
                className="w-full h-auto mx-auto"
              />
            </div>
          </div>

          {/* Headline - 64px spacing from logo */}
          <div className="w-full max-w-4xl text-center space-y-6 px-4">
            <div className="relative space-y-2">
              <h1
                className="text-[24px] md:text-[36px] lg:text-[42px] font-bold text-white tracking-wide leading-tight"
                style={{
                  textShadow: "0 2px 20px rgba(0, 0, 0, 0.5)",
                }}
              >
                WELCOME TO AN
                <br />
                <span className="text-primary">AI-DRIVEN</span> INTERVIEW
              </h1>

              {/* Subtle grey line - 50px wide */}
              <div className="w-[50px] h-px bg-[#222222] mx-auto mt-2" />
            </div>

            {/* START Button */}
            <Button
              onClick={() => setStep(2)}
              className="px-12 py-6 bg-primary hover:bg-primary/90 text-white text-lg font-bold tracking-wider uppercase shadow-[0_0_40px_rgba(227,6,19,0.4)] hover:shadow-[0_0_60px_rgba(227,6,19,0.6)] hover:scale-105 transition-all duration-300 border-none rounded-xl group relative overflow-hidden"
            >
              <span className="flex items-center gap-2">
                START
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </div>

        {/* Powered by section - at the bottom */}
        <div className="relative w-full flex flex-col items-center gap-0 pb-2 z-10">
          {/* Powered by text - 12px uppercase */}
          <p className="text-[12px] text-[#9C9C9C] font-medium tracking-[0.2em] uppercase">Powered by</p>

          {/* Logos - smaller size */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0.5">
            <a href="https://www.redkiwi.com/" target="_blank" rel="noopener noreferrer">
              <img
                src={redkiwiLogoNew}
                alt="Redkiwi"
                className="h-16 w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  imageRendering: "crisp-edges",
                }}
              />
            </a>
            <a href="https://www.redkiwi.com/partners/heygen/" target="_blank" rel="noopener noreferrer">
              <img
                src={heygenLogoNew}
                alt="HeyGen"
                className="h-16 w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  imageRendering: "crisp-edges",
                }}
              />
            </a>
            <a href="https://lovable.dev/" target="_blank" rel="noopener noreferrer">
              <img
                src={lovableLogo}
                alt="Lovable"
                className="h-12 w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  imageRendering: "crisp-edges",
                  mixBlendMode: "normal",
                }}
              />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Instructions with checklist
  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-4xl w-full space-y-4 text-center animate-fade-in">
          {/* Header Section */}
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              LET'S GET <span className="text-primary">STARTED</span>
            </h2>

            <div className="max-w-2xl mx-auto space-y-1">
              <p className="text-sm text-white/90 leading-relaxed">
                Een persoonlijk AI-gesprek van <strong className="text-white">5-10 minuten</strong> om je ervaring te
                delen.
              </p>
              <p className="text-xs text-[#9C9C9C]">
                Jouw antwoorden helpen ons beter te begrijpen hoe je ons merk beleeft.
              </p>
            </div>
          </div>

          {/* Checklist Card */}
          <Card className="max-w-2xl mx-auto p-4 md:p-6 bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-2xl transition-all duration-500">
            <div className="space-y-3">
              {/* Mic Permission - Interactive */}
              <div
                onClick={toggleMicPermission}
                className={`flex items-start gap-3 group cursor-pointer p-2 rounded-xl transition-all duration-300 border border-transparent ${micPermissionGranted ? "bg-primary/5 border-primary/20" : "hover:bg-white/[0.02] hover:border-white/10"}`}
              >
                <div
                  className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${micPermissionGranted ? "bg-primary shadow-[0_0_30px_rgba(227,6,19,0.5)]" : "bg-white/5 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"}`}
                >
                  {micPermissionGranted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  ) : (
                    <Mic className="w-5 h-5 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1 text-left pt-1">
                  <p className="text-sm text-white font-medium leading-relaxed">
                    {micPermissionGranted ? "Microfoon toegang verleend" : "Klik om microfoon toegang te geven"}
                  </p>
                  {micPermissionGranted && <p className="text-xs text-[#9C9C9C] mt-0.5">(klik om uit te schakelen)</p>}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Quiet Environment - Interactive */}
              <div
                onClick={() => {
                  setQuietEnvironmentConfirmed(!quietEnvironmentConfirmed);
                  scrollDown();
                }}
                className={`flex items-start gap-3 group cursor-pointer p-2 rounded-xl transition-all duration-300 border border-transparent ${quietEnvironmentConfirmed ? "bg-primary/5 border-primary/20" : "hover:bg-white/[0.02] hover:border-white/10"}`}
              >
                <div
                  className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${quietEnvironmentConfirmed ? "bg-primary shadow-[0_0_30px_rgba(227,6,19,0.5)]" : "bg-white/5 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"}`}
                >
                  {quietEnvironmentConfirmed ? (
                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1 text-left pt-1">
                  <p className="text-sm text-white font-medium leading-relaxed">
                    {quietEnvironmentConfirmed
                      ? "Rustige omgeving bevestigd"
                      : "Ja, ik zit op een rustige omgeving zonder achtergrondgeluiden"}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Privacy Consent - Interactive */}
              <div
                onClick={() => {
                  setPrivacyConsent(!privacyConsent);
                  scrollDown();
                }}
                className={`flex items-start gap-3 group cursor-pointer p-2 rounded-xl transition-all duration-300 border border-transparent ${privacyConsent ? "bg-primary/5 border-primary/20" : "hover:bg-white/[0.02] hover:border-white/10"}`}
              >
                <div
                  className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${privacyConsent ? "bg-primary shadow-[0_0_30px_rgba(227,6,19,0.5)]" : "bg-white/5 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"}`}
                >
                  {privacyConsent ? (
                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  ) : (
                    <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1 text-left pt-1">
                  <p className="text-sm text-white font-medium leading-relaxed mb-1">
                    {privacyConsent ? "Toestemming verleend" : "Klik om toestemming te geven"}
                  </p>
                  <p className="text-xs text-[#9C9C9C] leading-relaxed">
                    Jouw privacy is belangrijk. Er worden geen stem- of beeldopnames gemaakt; alleen de transcriptie van
                    het interview wordt anoniem verwerkt. Je antwoorden blijven volledig vertrouwelijk en worden
                    uitsluitend gebruikt voor dit onderzoek.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Button */}
          <div className="space-y-2">
            <Button
              onClick={handleStart}
              disabled={isStarting || !privacyConsent || !micPermissionGranted || !quietEnvironmentConfirmed}
              className="px-10 py-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold tracking-wider uppercase shadow-[0_0_40px_rgba(227,6,19,0.4)] hover:shadow-[0_0_60px_rgba(227,6,19,0.6)] hover:scale-105 transition-all duration-300 border-none rounded-xl disabled:opacity-40 disabled:cursor-not-allowed group relative overflow-hidden"
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

            {(!privacyConsent || !micPermissionGranted || !quietEnvironmentConfirmed) && (
              <p className="text-xs text-[#9C9C9C]">Vul eerst alle stappen in de checklist in</p>
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
      </div>
    );
  }
  return null;
};
