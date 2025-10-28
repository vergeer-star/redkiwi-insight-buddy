import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import redkiwiLogo from "@/assets/redkiwi-logo.png";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Futuristic background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,59,59,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,59,59,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <Card className="relative max-w-2xl w-full p-8 md:p-12 text-center bg-card/50 backdrop-blur-xl border-primary/20 shadow-[0_0_60px_rgba(255,59,59,0.3)]">
        <img 
          src={redkiwiLogo} 
          alt="Redkiwi" 
          className="h-14 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(255,59,59,0.5)]"
        />
        
        <div className="inline-block px-4 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs font-mono text-primary mb-6">
          AI-DRIVEN MERKPERCEPTIE ONDERZOEK
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent">
          Merkperceptie Interview
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Welkom! Ik ben je AI-interviewer en ga met je in gesprek over 
          hoe jij Redkiwi ervaart. Het gesprek duurt ongeveer 5-10 minuten 
          en verloopt volledig via spraak.
        </p>

        <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left border border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <h2 className="font-mono text-sm text-secondary">SETUP CHECKLIST</h2>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3 group">
                <span className="text-primary mt-0.5 group-hover:scale-110 transition-transform">⚡</span>
                <span>Zorg dat je microfoon aanstaat</span>
              </li>
              <li className="flex items-start gap-3 group">
                <span className="text-primary mt-0.5 group-hover:scale-110 transition-transform">🎯</span>
                <span>Zoek een rustige plek zonder achtergrondgeluid</span>
              </li>
              <li className="flex items-start gap-3 group">
                <span className="text-secondary mt-0.5 group-hover:scale-110 transition-transform">🌐</span>
                <span><strong className="text-secondary">Kies eerst je taal</strong> in de avatar (rechtsonder) voordat je begint</span>
              </li>
              <li className="flex items-start gap-3 group">
                <span className="text-primary mt-0.5 group-hover:scale-110 transition-transform">💬</span>
                <span>Het gesprek verloopt automatisch - gewoon praten!</span>
              </li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={onStart}
          size="lg"
          className="text-lg px-12 py-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-[0_0_40px_rgba(255,59,59,0.4)] hover:shadow-[0_0_60px_rgba(255,59,59,0.6)] transition-all duration-300 border border-primary/30 font-semibold"
        >
          <span className="mr-2">▶</span> Start Interview
        </Button>
      </Card>
    </div>
  );
};
