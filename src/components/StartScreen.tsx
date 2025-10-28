import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import redkiwiLogo from "@/assets/redkiwi-logo.png";
import heroAnimation from "@/assets/hero-animation.gif";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      <div className="relative max-w-4xl w-full space-y-16 text-center">
        {/* Hero Animation */}
        <img 
          src={heroAnimation} 
          alt="AI Animation" 
          className="h-48 md:h-64 mx-auto"
        />
        
        {/* Hero Title */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-wide leading-[0.95]">
            WELCOME TO AN<br />
            <span className="text-primary">AI-DRIVEN</span> INTERVIEW<br />
            <span className="text-lg md:text-2xl font-normal lowercase flex items-center justify-center gap-2 mt-4">
              powered by 
              <span className="inline-flex items-center bg-black px-4 py-2 rounded-md">
                <img src={redkiwiLogo} alt="Redkiwi" className="h-6" />
              </span>
            </span>
          </h1>
        </div>

        {/* Checklist Card */}
        <Card className="max-w-xl mx-auto p-8 bg-white/[0.02] backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_48px_rgba(237,28,36,0.15)] transition-all duration-300">
          <p className="text-base text-white/80 mb-6 leading-relaxed">
            Deel je ervaring met onze AI-interviewer. Een persoonlijk gesprek van 5-10 minuten via spraak.
          </p>
          <ul className="space-y-5 text-left">
            <li className="flex items-start gap-4 group">
              <div className="mt-0.5 w-5 h-5 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/90 font-medium leading-relaxed">Zorg dat je microfoon aanstaat</span>
            </li>
            <li className="flex items-start gap-4 group">
              <div className="mt-0.5 w-5 h-5 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/90 font-medium leading-relaxed">Kies een rustige omgeving</span>
            </li>
            <li className="flex items-start gap-4 group">
              <div className="mt-0.5 w-5 h-5 rounded-sm bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/90 font-medium leading-relaxed">
                <strong className="text-secondary">Kies eerst je taal</strong> in de avatar (rechtsonder)
              </span>
            </li>
          </ul>
        </Card>

        {/* CTA Button */}
        <Button 
          onClick={onStart}
          className="px-16 py-6 bg-secondary hover:bg-secondary/90 text-black text-xs font-black tracking-[0.15em] uppercase shadow-[0_0_40px_rgba(197,255,0,0.4)] hover:shadow-[0_0_60px_rgba(197,255,0,0.6)] hover:scale-105 transition-all duration-300 border-none rounded"
        >
          Start Interview
        </Button>
      </div>
    </div>
  );
};
