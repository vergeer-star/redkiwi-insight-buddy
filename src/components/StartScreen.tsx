import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import redkiwiLogo from "@/assets/redkiwi-logo.png";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle diagonal lines pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      <Card className="relative max-w-3xl w-full p-10 md:p-16 text-center bg-black border-2 border-primary/20 shadow-[0_0_80px_rgba(237,28,36,0.3)]">
        <img 
          src={redkiwiLogo} 
          alt="Redkiwi" 
          className="h-12 mx-auto mb-12"
        />
        
        <div className="inline-block px-5 py-2 bg-primary/10 border border-primary/40 rounded-sm text-xs font-bold tracking-widest text-primary mb-8 uppercase">
          Merkperceptie Onderzoek
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-white uppercase tracking-tight leading-tight">
          WELCOME TO REDKIWI.<br />
          <span className="text-primary">AI DRIVEN</span> DIGITAL AGENCY
        </h1>
        
        <p className="text-base md:text-lg text-white/80 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
          Welkom! Ik ben je AI-interviewer en ga met je in gesprek over 
          hoe jij Redkiwi ervaart. Het gesprek duurt ongeveer 5-10 minuten 
          en verloopt volledig via spraak.
        </p>

        <div className="bg-card/50 backdrop-blur-sm rounded-sm p-8 mb-12 text-left border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative">
            <h2 className="font-black text-sm text-white mb-6 uppercase tracking-widest">Setup Checklist</h2>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-4 group">
                <span className="text-primary text-xl font-bold mt-0 group-hover:scale-110 transition-transform">✓</span>
                <span className="font-medium">Zorg dat je microfoon aanstaat</span>
              </li>
              <li className="flex items-start gap-4 group">
                <span className="text-primary text-xl font-bold mt-0 group-hover:scale-110 transition-transform">✓</span>
                <span className="font-medium">Zoek een rustige plek zonder achtergrondgeluid</span>
              </li>
              <li className="flex items-start gap-4 group">
                <span className="text-secondary text-xl font-bold mt-0 group-hover:scale-110 transition-transform">✓</span>
                <span className="font-medium"><strong className="text-secondary">Kies eerst je taal</strong> in de avatar (rechtsonder) voordat je begint</span>
              </li>
              <li className="flex items-start gap-4 group">
                <span className="text-primary text-xl font-bold mt-0 group-hover:scale-110 transition-transform">✓</span>
                <span className="font-medium">Het gesprek verloopt automatisch - gewoon praten!</span>
              </li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={onStart}
          size="lg"
          className="text-sm px-14 py-7 bg-secondary hover:bg-secondary/90 text-black font-black tracking-widest uppercase shadow-[0_0_40px_rgba(197,255,0,0.5)] hover:shadow-[0_0_60px_rgba(197,255,0,0.7)] transition-all duration-300 border-none rounded-sm"
        >
          Start Interview
        </Button>
      </Card>
    </div>
  );
};
