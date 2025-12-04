import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface WordData {
  text: string;
  value: number;
  interviewIds: string[];
}

interface BubblePosition {
  x: number;
  y: number;
  r: number;
}

// Keywords relevant to brand perception research
const BRAND_PERCEPTION_KEYWORDS = new Set([
  // Positive perceptions
  'innovatief', 'professioneel', 'betrouwbaar', 'creatief', 'modern', 'vriendelijk',
  'kwaliteit', 'expertise', 'vertrouwen', 'samenwerking', 'resultaat', 'succesvol',
  'efficiënt', 'deskundig', 'betrokken', 'persoonlijk', 'flexibel', 'enthousiast',
  'ambitieus', 'gedreven', 'open', 'transparant', 'eerlijk', 'kundig', 'slim',
  
  // Negative perceptions
  'duur', 'langzaam', 'onduidelijk', 'afstandelijk', 'star', 'bureaucratisch',
  'onpersoonlijk', 'traag', 'ingewikkeld', 'complex', 'verwarrend',
  
  // Brand attributes
  'merk', 'imago', 'reputatie', 'uitstraling', 'identiteit', 'waarden', 'cultuur',
  'visie', 'missie', 'communicatie', 'service', 'dienstverlening',
  
  // Emotions & feelings
  'gevoel', 'ervaring', 'tevreden', 'blij', 'trots', 'teleurgesteld', 'gefrustreerd',
  'enthousiast', 'positief', 'negatief', 'neutraal', 'prettig', 'fijn', 'goed',
  
  // Work-related
  'werksfeer', 'collega', "collega's", 'team', 'sfeer', 'werkomgeving', 'kantoor',
  'projecten', 'klanten', 'opdrachten', 'werk', 'baan', 'carrière', 'groei',
  'ontwikkeling', 'leren', 'training', 'coaching', 'feedback', 'support',
  
  // Company specific
  'redkiwi', 'bureau', 'agency', 'digitaal', 'digital', 'marketing', 'design',
  'development', 'strategie', 'concept', 'campagne', 'website', 'app', 'platform'
]);

// Common Dutch names to exclude
const COMMON_NAMES = new Set([
  'jan', 'piet', 'klaas', 'henk', 'johan', 'peter', 'mark', 'tom', 'bas',
  'jasper', 'robin', 'lars', 'tim', 'kevin', 'dennis', 'jeroen', 'martijn',
  'niels', 'rick', 'sander', 'joris', 'wouter', 'bart', 'daan', 'floris',
  'anne', 'lisa', 'emma', 'julia', 'sophie', 'laura', 'eva', 'anna', 'maria',
  'linda', 'kim', 'jessica', 'jennifer', 'mandy', 'sanne', 'marloes', 'anouk',
  'fleur', 'lotte', 'noor', 'iris', 'roos', 'mieke', 'els', 'marieke',
  'david', 'michael', 'john', 'james', 'robert', 'chris', 'paul', 'nick',
  'mike', 'alex', 'max', 'sam', 'ben', 'thomas', 'luke', 'jake', 'ryan'
]);

// Stop words to always exclude
const STOP_WORDS = new Set([
  'de', 'het', 'een', 'en', 'van', 'in', 'op', 'is', 'te', 'die', 'dat',
  'voor', 'met', 'als', 'aan', 'om', 'ook', 'naar', 'er', 'zijn', 'heeft',
  'bij', 'kan', 'meer', 'wel', 'niet', 'worden', 'maar', 'wat', 'zeer',
  'je', 'ik', 'we', 'ze', 'hij', 'zij', 'me', 'mij', 'ons', 'hun', 'ja',
  'nee', 'nou', 'dus', 'dan', 'nog', 'toch', 'alleen', 'even', 'heel',
  'best', 'beetje', 'eigenlijk', 'gewoon', 'echt', 'veel', 'zelf', 'daar',
  'hier', 'waar', 'wanneer', 'waarom', 'hoe', 'wie', 'welke', 'deze', 'dit',
  'the', 'and', 'or', 'of', 'to', 'a', 'is', 'it', 'that', 'was', 'for',
  'hallo', 'bedankt', 'graag', 'dank', 'prima', 'oké', 'okay', 'uhm', 'ehm',
  'uh', 'ah', 'oh', 'nou', 'zeg', 'weet', 'denk', 'vind', 'ga', 'gaan',
  'kom', 'komen', 'zou', 'zouden', 'kunnen', 'moeten', 'willen', 'mogen',
  'hebben', 'hadden', 'ben', 'bent', 'was', 'waren', 'wordt', 'werden'
]);

// Simple circle packing algorithm
function packCircles(data: WordData[], width: number, height: number): (WordData & BubblePosition)[] {
  if (data.length === 0) return [];
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minR = 35;
  const maxR = 90;
  
  // Calculate radii based on value
  const circles = data.map(d => ({
    ...d,
    r: minR + (d.value / maxValue) * (maxR - minR),
    x: width / 2,
    y: height / 2
  }));
  
  // Sort by size descending for better packing
  circles.sort((a, b) => b.r - a.r);
  
  // Place first circle in center
  if (circles.length > 0) {
    circles[0].x = width / 2;
    circles[0].y = height / 2;
  }
  
  // Place remaining circles using spiral placement
  for (let i = 1; i < circles.length; i++) {
    let placed = false;
    let angle = 0;
    let radius = 0;
    const angleStep = 0.5;
    const radiusStep = 3;
    
    while (!placed && radius < Math.max(width, height)) {
      const x = width / 2 + radius * Math.cos(angle);
      const y = height / 2 + radius * Math.sin(angle);
      
      // Check collision with all placed circles
      let collision = false;
      for (let j = 0; j < i; j++) {
        const dx = x - circles[j].x;
        const dy = y - circles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = circles[i].r + circles[j].r + 4; // 4px gap
        
        if (dist < minDist) {
          collision = true;
          break;
        }
      }
      
      // Check bounds
      if (!collision && x - circles[i].r > 0 && x + circles[i].r < width &&
          y - circles[i].r > 0 && y + circles[i].r < height) {
        circles[i].x = x;
        circles[i].y = y;
        placed = true;
      }
      
      angle += angleStep;
      if (angle > Math.PI * 2) {
        angle = 0;
        radius += radiusStep;
      }
    }
    
    // If couldn't place, put somewhere visible
    if (!placed) {
      circles[i].x = 50 + Math.random() * (width - 100);
      circles[i].y = 50 + Math.random() * (height - 100);
    }
  }
  
  return circles;
}

export function WordCloudCard() {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const containerWidth = 800;
  const containerHeight = 500;

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      // Fetch all user messages with interview_id
      const { data: messages, error } = await supabase
        .from('interview_messages')
        .select('content, interview_id')
        .eq('role', 'user');

      if (error) throw error;

      // Also fetch themes from interviews
      const { data: interviews, error: interviewError } = await supabase
        .from('interviews')
        .select('id, themes')
        .is('deleted_at', null);

      if (interviewError) throw interviewError;

      // Process text to create word frequency with interview tracking
      const wordFrequency: Record<string, { count: number; interviewIds: Set<string> }> = {};

      // Process all user messages - only keep brand perception relevant words
      messages?.forEach(msg => {
        const cleanWords = msg.content
          .toLowerCase()
          .replace(/[.,!?;:()\[\]{}"']/g, ' ')
          .split(/\s+/)
          .filter(word => {
            if (word.length < 3) return false;
            if (STOP_WORDS.has(word)) return false;
            if (COMMON_NAMES.has(word)) return false;
            return true;
          });

        cleanWords.forEach(word => {
          if (!wordFrequency[word]) {
            wordFrequency[word] = { count: 0, interviewIds: new Set() };
          }
          wordFrequency[word].count++;
          wordFrequency[word].interviewIds.add(msg.interview_id);
        });
      });

      // Add themes with higher weight
      interviews?.forEach(interview => {
        interview.themes?.forEach((theme: string) => {
          const cleanTheme = theme.toLowerCase().trim();
          if (cleanTheme.length > 2 && !STOP_WORDS.has(cleanTheme)) {
            if (!wordFrequency[cleanTheme]) {
              wordFrequency[cleanTheme] = { count: 0, interviewIds: new Set() };
            }
            wordFrequency[cleanTheme].count += 3; // Weight themes higher
            wordFrequency[cleanTheme].interviewIds.add(interview.id);
          }
        });
      });

      // Filter to only brand perception relevant words OR words mentioned 3+ times
      const relevantWords = Object.entries(wordFrequency)
        .filter(([word, data]) => {
          const isRelevant = BRAND_PERCEPTION_KEYWORDS.has(word);
          const isFrequent = data.count >= 3;
          return isRelevant || isFrequent;
        })
        .map(([text, data]) => ({
          text,
          value: data.count,
          interviewIds: Array.from(data.interviewIds)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20); // Top 20 words

      setWords(relevantWords);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  const packedBubbles = useMemo(() => 
    packCircles(words, containerWidth, containerHeight),
    [words]
  );

  // Color palette based on primary (red) with varying opacity/saturation
  const getColor = (value: number, maxValue: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.7) return 'hsl(356, 94%, 46%)'; // Primary red
    if (intensity > 0.5) return 'hsl(356, 80%, 55%)';
    if (intensity > 0.3) return 'hsl(356, 60%, 65%)';
    return 'hsl(356, 40%, 75%)';
  };

  const handleBubbleClick = (interviewIds: string[]) => {
    if (interviewIds.length > 0) {
      navigate(`/interview/${interviewIds[0]}`);
    }
  };

  const maxValue = Math.max(...words.map(w => w.value), 1);

  return (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="text-white text-xl font-bold">Kernwoorden Merkperceptie</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="h-[500px] flex items-center justify-center text-white/50">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Laden...
            </div>
          </div>
        ) : words.length > 0 ? (
          <div className="relative" style={{ width: containerWidth, height: containerHeight, margin: '0 auto' }}>
            <svg width={containerWidth} height={containerHeight} className="overflow-visible">
              {packedBubbles.map((bubble, index) => (
                <g 
                  key={bubble.text}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => handleBubbleClick(bubble.interviewIds)}
                  onMouseEnter={() => setHoveredWord(bubble.text)}
                  onMouseLeave={() => setHoveredWord(null)}
                  style={{
                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                  }}
                >
                  <circle
                    cx={bubble.x}
                    cy={bubble.y}
                    r={bubble.r}
                    fill={getColor(bubble.value, maxValue)}
                    className={`transition-all duration-300 ${
                      hoveredWord === bubble.text 
                        ? 'opacity-100 filter drop-shadow-[0_0_20px_rgba(227,6,19,0.6)]' 
                        : 'opacity-85 hover:opacity-100'
                    }`}
                    style={{
                      transform: hoveredWord === bubble.text ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: `${bubble.x}px ${bubble.y}px`
                    }}
                  />
                  <text
                    x={bubble.x}
                    y={bubble.y - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white font-bold pointer-events-none"
                    style={{ 
                      fontSize: Math.max(10, bubble.r / 4),
                    }}
                  >
                    {bubble.text}
                  </text>
                  <text
                    x={bubble.x}
                    y={bubble.y + bubble.r / 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white/70 pointer-events-none"
                    style={{ 
                      fontSize: Math.max(9, bubble.r / 5),
                    }}
                  >
                    {bubble.value}
                  </text>
                </g>
              ))}
            </svg>
            
            {/* Hover tooltip */}
            {hoveredWord && (() => {
              const bubble = packedBubbles.find(b => b.text === hoveredWord);
              if (!bubble) return null;
              return (
                <div 
                  className="absolute bg-black/95 border border-primary/50 rounded-lg px-4 py-3 z-50 shadow-lg cursor-pointer"
                  onMouseEnter={() => setHoveredWord(bubble.text)}
                  onMouseLeave={() => setHoveredWord(null)}
                  onClick={() => handleBubbleClick(bubble.interviewIds)}
                  style={{
                    left: Math.min(bubble.x + bubble.r + 10, containerWidth - 200),
                    top: Math.max(bubble.y - 40, 10),
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <p className="text-white font-bold text-sm">{bubble.text}</p>
                  <p className="text-white/70 text-xs mt-1">
                    {bubble.value}x genoemd in {bubble.interviewIds.length} interview{bubble.interviewIds.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-primary text-xs mt-2 flex items-center gap-1 hover:underline">
                    <span>→</span> Klik om transcriptie te bekijken
                  </p>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="h-[500px] flex items-center justify-center text-white/50">
            Geen relevante kernwoorden gevonden
          </div>
        )}
      </CardContent>
    </Card>
  );
}
