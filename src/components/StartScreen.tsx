import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import redkiwiLogo from "@/assets/redkiwi-logo.png";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center shadow-soft">
        <img 
          src={redkiwiLogo} 
          alt="Redkiwi" 
          className="h-12 mx-auto mb-8"
        />
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Merkperceptie Interview
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Welkom! Ik ben je AI-interviewer en ga met je in gesprek over 
          hoe jij Redkiwi ervaart. Het gesprek duurt ongeveer 5-10 minuten 
          en verloopt volledig via spraak.
        </p>

        <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold mb-3">Voordat we beginnen:</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Zorg dat je microfoon aanstaat</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Zoek een rustige plek zonder achtergrondgeluid</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Het gesprek verloopt automatisch - gewoon praten!</span>
            </li>
          </ul>
        </div>

        <Button 
          onClick={onStart}
          size="lg"
          className="text-lg px-8 py-6 shadow-glow hover:shadow-glow transition-all"
        >
          Start Interview
        </Button>
      </Card>
    </div>
  );
};
