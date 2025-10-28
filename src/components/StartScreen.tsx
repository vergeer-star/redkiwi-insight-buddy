import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import redkiwiLogo from "@/assets/redkiwi-logo.png";
import heroAnimation from "@/assets/hero-animation.gif";
import { ChevronRight } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  const [step, setStep] = useState(1);

  // Step 1: Hero with GIF
  if (step === 1) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        <div className="relative max-w-5xl w-full space-y-8 text-center">
          <img 
            src={heroAnimation} 
            alt="AI Animation" 
            className="h-96 md:h-[32rem] mx-auto cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => setStep(2)}
          />
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wide leading-tight">
              WELCOME TO AN<br />
              <span className="text-primary">AI-DRIVEN</span> INTERVIEW<br />
              <span className="text-sm md:text-lg font-normal lowercase flex items-center justify-center gap-2 mt-4">
                powered by 
                <span className="inline-flex items-center bg-black px-3 py-1.5 rounded-md">
                  <img src={redkiwiLogo} alt="Redkiwi" className="h-4 md:h-5" />
                </span>
              </span>
            </h1>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Instructions with checklist
  if (step === 2) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        <div className="relative max-w-3xl w-full space-y-12 text-center">
          <div className="space-y-4">
            <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/30 rounded text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
              Instructies
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-wide">
              VOOR WE BEGINNEN
            </h2>
          </div>

          <Card className="max-w-2xl mx-auto p-10 bg-white/[0.02] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Deel je ervaring met onze AI-interviewer. Een persoonlijk gesprek van 5-10 minuten via spraak.
            </p>
            <ul className="space-y-6 text-left">
              <li className="flex items-start gap-4 group">
                <div className="mt-0.5 w-6 h-6 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-base text-white/90 font-medium leading-relaxed">Zorg dat je microfoon aanstaat</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-0.5 w-6 h-6 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-base text-white/90 font-medium leading-relaxed">Kies een rustige omgeving</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-0.5 w-6 h-6 rounded-sm bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-base text-white/90 font-medium leading-relaxed">
                  <strong className="text-secondary">Kies eerst je taal</strong> in de avatar (rechtsonder)
                </span>
              </li>
            </ul>
          </Card>

          <Button 
            onClick={onStart}
            className="px-16 py-6 bg-secondary hover:bg-secondary/90 text-black text-xs font-black tracking-[0.15em] uppercase shadow-[0_0_40px_rgba(197,255,0,0.4)] hover:shadow-[0_0_60px_rgba(197,255,0,0.6)] hover:scale-105 transition-all duration-300 border-none rounded group"
          >
            Start Interview
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
