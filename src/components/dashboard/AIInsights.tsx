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
      <CardHeader className="border-b border-white/10 pb-3 md:pb-4 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
            <CardTitle className="text-white text-lg md:text-xl font-bold">AI Insights</CardTitle>
          </div>
          <span className="text-white/50 text-[10px] md:text-xs">
            Bijgewerkt: {formatLastUpdated()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-4 md:pt-6">
        {/* Mobile: Collapsible grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Belangrijkste trends */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80 font-medium text-sm md:text-base">
              <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>Trends</span>
            </div>
            <ul className="space-y-1 ml-5 md:ml-6">
              {insights.trends.map((trend, idx) => (
                <li key={idx} className="text-white/70 text-xs md:text-sm leading-relaxed">
                  • {trend}
                </li>
              ))}
            </ul>
          </div>

          {/* Opvallende uitschieters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80 font-medium text-sm md:text-base">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>Uitschieters</span>
            </div>
            <ul className="space-y-1 ml-5 md:ml-6">
              {insights.outliers.map((outlier, idx) => (
                <li key={idx} className="text-white/70 text-xs md:text-sm leading-relaxed">
                  • {outlier}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Weekanalyse */}
        <div className="p-3 md:p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs md:text-sm leading-relaxed">
            <span className="text-primary font-medium">Deze week: </span>
            {insights.weekSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
