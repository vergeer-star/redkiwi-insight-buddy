import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPITileProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  gradient?: string;
}

export function KPITile({ title, value, icon: Icon, trend, gradient = "from-white/10 to-white/5" }: KPITileProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend > 0) return "text-green-400";
    if (trend < 0) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <Card className={`bg-gradient-to-br ${gradient} border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] group relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6 relative z-10">
        <CardTitle className="text-white/60 text-[10px] md:text-xs font-medium tracking-wide uppercase leading-tight">{title}</CardTitle>
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
      </CardHeader>
      <CardContent className="relative z-10 p-3 md:p-6 pt-0">
        <div className="flex items-end justify-between gap-1">
          <div className="text-xl md:text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
            {value}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 md:gap-1 text-xs md:text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
