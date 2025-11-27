import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SentimentProgressProps {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export function SentimentProgress({ positive, neutral, negative, total }: SentimentProgressProps) {
  const positivePercent = total > 0 ? (positive / total) * 100 : 0;
  const neutralPercent = total > 0 ? (neutral / total) * 100 : 0;
  const negativePercent = total > 0 ? (negative / total) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300">
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="text-white text-xl font-bold">Sentimentverdeling</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Positief */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-medium">Positief</span>
            <span className="text-green-400 font-bold">{positive} ({positivePercent.toFixed(0)}%)</span>
          </div>
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              style={{ width: `${positivePercent}%` }}
            />
          </div>
        </div>

        {/* Neutraal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-medium">Neutraal</span>
            <span className="text-yellow-400 font-bold">{neutral} ({neutralPercent.toFixed(0)}%)</span>
          </div>
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
              style={{ width: `${neutralPercent}%` }}
            />
          </div>
        </div>

        {/* Negatief */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-medium">Negatief</span>
            <span className="text-red-400 font-bold">{negative} ({negativePercent.toFixed(0)}%)</span>
          </div>
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              style={{ width: `${negativePercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
