import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";

interface AIInsightsProps {
  insights: {
    trends: string[];
    outliers: string[];
    weekSummary: string;
  };
  lastUpdated?: Date;
}

export function AIInsights({ insights, lastUpdated }: AIInsightsProps) {
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Nu';
    return new Date(lastUpdated).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-black/40 border-primary/30 backdrop-blur-xl hover:border-primary/60 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(227,6,19,0.3)] group">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <CardTitle className="text-white text-xl font-bold">AI Insights</CardTitle>
          </div>
          <span className="text-white/50 text-xs">
            Laatst bijgewerkt: {formatLastUpdated()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Belangrijkste trends */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/80 font-medium">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>Belangrijkste Trends</span>
          </div>
          <ul className="space-y-1.5 ml-6">
            {insights.trends.map((trend, idx) => (
              <li key={idx} className="text-white/70 text-sm leading-relaxed">
                • {trend}
              </li>
            ))}
          </ul>
        </div>

        {/* Opvallende uitschieters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/80 font-medium">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span>Opvallende Uitschieters</span>
          </div>
          <ul className="space-y-1.5 ml-6">
            {insights.outliers.map((outlier, idx) => (
              <li key={idx} className="text-white/70 text-sm leading-relaxed">
                • {outlier}
              </li>
            ))}
          </ul>
        </div>

        {/* Weekanalyse */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-sm leading-relaxed">
            <span className="text-primary font-medium">Deze week: </span>
            {insights.weekSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
