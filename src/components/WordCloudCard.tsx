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

// Brand perception keywords - focus on feelings, attitudes, associations, themes
const BRAND_PERCEPTION_KEYWORDS = new Set([
  // Trust & Reliability
  'vertrouwen', 'betrouwbaar', 'betrouwbaarheid', 'zekerheid', 'stabiliteit', 'consistent',
  
  // Innovation & Technology
  'innovatie', 'innovatief', 'vernieuwend', 'vooruitstrevend', 'modern', 'technologie',
  'ai', 'ai-focus', 'digitaal', 'digital', 'tech', 'technisch', 'automatisering',
  
  // Communication & Collaboration
  'communicatie', 'communiceren', 'samenwerking', 'samenwerken', 'contact', 'bereikbaar',
  'transparant', 'transparantie', 'open', 'openheid', 'duidelijk', 'helder',
  
  // Professionalism & Expertise
  'professioneel', 'professionaliteit', 'expertise', 'deskundig', 'deskundigheid', 
  'kwaliteit', 'vakmanschap', 'kundig', 'slim', 'intelligent',
  
  // Creativity & Design
  'creatief', 'creativiteit', 'design', 'ontwerp', 'mooi', 'stijlvol', 'origineel',
  
  // Customer Focus & Service
  'service', 'dienstverlening', 'klantgericht', 'persoonlijk', 'betrokken', 'betrokkenheid',
  'aandacht', 'zorg', 'support', 'hulpvaardig', 'vriendelijk',
  
  // Results & Performance
  'resultaat', 'resultaatgericht', 'succesvol', 'succes', 'effectief', 'efficiënt',
  'prestatie', 'groei', 'vooruitgang', 'impact',
  
  // Culture & Atmosphere
  'sfeer', 'werksfeer', 'cultuur', 'team', 'teamwork', 'gezellig', 'warm', 'prettig',
  'positief', 'energiek', 'dynamisch', 'jong', 'fris',
  
  // Values & Identity
  'waarden', 'identiteit', 'visie', 'missie', 'ambitie', 'ambitieus', 'gedreven',
  'passie', 'enthousiast', 'enthousiasme', 'trots',
  
  // Location & Identity
  'rotterdam', 'rotterdams', 'lokaal', 'regio', 'nederland', 'nederlands',
  
  // Negative perceptions (also important for brand research)
  'duur', 'prijzig', 'langzaam', 'traag', 'onduidelijk', 'verwarrend', 'complex',
  'afstandelijk', 'onpersoonlijk', 'star', 'bureaucratisch', 'ouderwets',
  
  // Emotions & Feelings
  'tevreden', 'tevredenheid', 'blij', 'positief', 'negatief', 'teleurgesteld',
  'gefrustreerd', 'vertrouwd', 'veilig', 'comfortabel', 'prettig', 'fijn', 'goed'
]);

// Synonym mapping - combine variants into one canonical word
const SYNONYM_MAP: Record<string, string> = {
  // Trust variants
  'betrouwbaar': 'vertrouwen',
  'betrouwbaarheid': 'vertrouwen',
  'vertrouwd': 'vertrouwen',
  'zekerheid': 'vertrouwen',
  
  // Innovation variants
  'innovatief': 'innovatie',
  'vernieuwend': 'innovatie',
  'vooruitstrevend': 'innovatie',
  
  // Communication variants
  'communiceren': 'communicatie',
  'contact': 'communicatie',
  'bereikbaar': 'communicatie',
  
  // Collaboration variants
  'samenwerken': 'samenwerking',
  'teamwork': 'samenwerking',
  
  // Transparency variants
  'transparantie': 'transparant',
  'openheid': 'transparant',
  'open': 'transparant',
  'duidelijk': 'transparant',
  'helder': 'transparant',
  
  // Professional variants
  'professionaliteit': 'professioneel',
  'deskundigheid': 'professioneel',
  'deskundig': 'professioneel',
  'kundig': 'professioneel',
  'vakmanschap': 'professioneel',
  'expertise': 'professioneel',
  
  // Creative variants
  'creativiteit': 'creatief',
  'origineel': 'creatief',
  
  // Service variants
  'dienstverlening': 'service',
  'hulpvaardig': 'service',
  'klantgericht': 'service',
  
  // Personal variants
  'betrokkenheid': 'betrokken',
  'aandacht': 'betrokken',
  
  // Result variants
  'resultaatgericht': 'resultaat',
  'succesvol': 'resultaat',
  'succes': 'resultaat',
  'effectief': 'resultaat',
  'impact': 'resultaat',
  
  // Efficiency variants
  'efficiënt': 'efficiëntie',
  
  // Culture variants
  'werksfeer': 'sfeer',
  'gezellig': 'sfeer',
  'prettig': 'sfeer',
  
  // Enthusiasm variants
  'enthousiasme': 'enthousiast',
  'passie': 'enthousiast',
  'gedreven': 'enthousiast',
  
  // Ambition variants
  'ambitieus': 'ambitie',
  
  // Technology variants
  'tech': 'technologie',
  'technisch': 'technologie',
  'digitaal': 'technologie',
  'digital': 'technologie',
  'automatisering': 'technologie',
  
  // Modern variants
  'fris': 'modern',
  'jong': 'modern',
  'dynamisch': 'modern',
  
  // Quality variants
  'mooi': 'kwaliteit',
  'stijlvol': 'kwaliteit',
  
  // Satisfaction variants
  'tevredenheid': 'tevreden',
  'blij': 'tevreden',
  'positief': 'tevreden',
  'fijn': 'tevreden',
  'goed': 'tevreden',
  
  // Friendly variants
  'warm': 'vriendelijk',
  
  // Rotterdam variants
  'rotterdams': 'rotterdam',
  
  // AI variants
  'ai-focus': 'ai'
};

// Common Dutch names to exclude
const COMMON_NAMES = new Set([
  'jan', 'piet', 'klaas', 'henk', 'johan', 'peter', 'mark', 'tom', 'bas',
  'jasper', 'robin', 'lars', 'tim', 'kevin', 'dennis', 'jeroen', 'martijn',
  'niels', 'rick', 'sander', 'joris', 'wouter', 'bart', 'daan', 'floris',
  'anne', 'lisa', 'emma', 'julia', 'sophie', 'laura', 'eva', 'anna', 'maria',
  'linda', 'kim', 'jessica', 'jennifer', 'mandy', 'sanne', 'marloes', 'anouk',
  'fleur', 'lotte', 'noor', 'iris', 'roos', 'mieke', 'els', 'marieke',
  'david', 'michael', 'john', 'james', 'robert', 'chris', 'paul', 'nick',
  'mike', 'alex', 'max', 'sam', 'ben', 'thomas', 'luke', 'jake', 'ryan',
  'redkiwi' // Also exclude company name itself
]);

// Expanded stop words - personal words, greetings, connecting words
const STOP_WORDS = new Set([
  // Dutch articles, prepositions, conjunctions
  'de', 'het', 'een', 'en', 'van', 'in', 'op', 'is', 'te', 'die', 'dat',
  'voor', 'met', 'als', 'aan', 'om', 'ook', 'naar', 'er', 'zijn', 'heeft',
  'bij', 'kan', 'meer', 'wel', 'niet', 'worden', 'maar', 'wat', 'zeer',
  'over', 'omdat', 'moet', 'alles', 'doen', 'door', 'tot', 'uit', 'onder',
  'tussen', 'tegen', 'binnen', 'buiten', 'sinds', 'tijdens', 'zonder',
  
  // Personal pronouns & words
  'je', 'jij', 'jou', 'jouw', 'ik', 'mij', 'mijn', 'we', 'wij', 'ons', 'onze',
  'ze', 'zij', 'hun', 'haar', 'hem', 'hij', 'me', 'u', 'uw',
  
  // Greetings & filler words
  'hoi', 'hallo', 'hey', 'hi', 'dag', 'doei', 'tot', 'ziens',
  'bedankt', 'graag', 'dank', 'prima', 'oké', 'okay', 'oke',
  'uhm', 'ehm', 'uh', 'ah', 'oh', 'nou', 'zeg', 'hè', 'hoor',
  'ja', 'nee', 'jawel', 'neen',
  
  // Common verbs (non-descriptive)
  'weet', 'denk', 'vind', 'ga', 'gaan', 'kom', 'komen', 'zie', 'zien',
  'zou', 'zouden', 'kunnen', 'moeten', 'willen', 'mogen', 'laten',
  'hebben', 'hadden', 'heb', 'hebt', 'had',
  'ben', 'bent', 'was', 'waren', 'wordt', 'werden', 'geworden',
  'zal', 'zullen', 'zou', 'zouden',
  'doe', 'doet', 'deed', 'deden', 'gedaan',
  'zeg', 'zegt', 'zei', 'zeiden', 'gezegd',
  'krijg', 'krijgt', 'kreeg', 'kregen', 'gekregen',
  'geef', 'geeft', 'gaf', 'gaven', 'gegeven',
  'maak', 'maakt', 'maakte', 'maakten', 'gemaakt',
  'neem', 'neemt', 'nam', 'namen', 'genomen',
  
  // Adverbs & quantifiers
  'dus', 'dan', 'nog', 'toch', 'alleen', 'even', 'heel', 'erg',
  'best', 'beetje', 'eigenlijk', 'gewoon', 'echt', 'veel', 'zelf',
  'daar', 'hier', 'waar', 'wanneer', 'waarom', 'hoe', 'wie',
  'welke', 'deze', 'dit', 'die', 'dat', 'zo', 'heel', 'erg',
  'altijd', 'nooit', 'vaak', 'soms', 'misschien', 'wellicht',
  'ongeveer', 'bijna', 'helemaal', 'zeker', 'natuurlijk', 'inderdaad',
  
  // English stop words
  'the', 'and', 'or', 'of', 'to', 'a', 'is', 'it', 'that', 'was', 'for',
  'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this', 'have',
  'from', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were',
  'we', 'when', 'your', 'can', 'said', 'there', 'use', 'an', 'each', 'which',
  'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out',
  'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make',
  'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more', 'write',
  'go', 'see', 'number', 'no', 'way', 'could', 'people', 'my', 'than',
  'first', 'been', 'call', 'who', 'its', 'now', 'find', 'long', 'down',
  'day', 'did', 'get', 'come', 'made', 'may', 'part', 'yes', 'yeah',
  
  // Generic interview words (not brand-specific)
  'vraag', 'vragen', 'antwoord', 'interview', 'gesprek', 'praten',
  'vertellen', 'verteld', 'verhaal', 'voorbeeld', 'bijvoorbeeld'
]);

// Improved circle packing algorithm with guaranteed no overlap
function packCircles(data: WordData[], width: number, height: number): (WordData & BubblePosition)[] {
  if (data.length === 0) return [];
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minR = 30;
  const maxR = 70;
  const padding = 6;
  
  // Calculate radii based on value
  const circles: (WordData & BubblePosition)[] = data.map(d => ({
    ...d,
    r: minR + (d.value / maxValue) * (maxR - minR),
    x: 0,
    y: 0
  }));
  
  // Sort by size descending for better packing
  circles.sort((a, b) => b.r - a.r);
  
  // Check if circle collides with any placed circle
  const collides = (circle: BubblePosition, placed: BubblePosition[]): boolean => {
    for (const other of placed) {
      const dx = circle.x - other.x;
      const dy = circle.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < circle.r + other.r + padding) {
        return true;
      }
    }
    return false;
  };
  
  // Check if circle is within bounds
  const inBounds = (circle: BubblePosition): boolean => {
    return circle.x - circle.r >= padding &&
           circle.x + circle.r <= width - padding &&
           circle.y - circle.r >= padding &&
           circle.y + circle.r <= height - padding;
  };
  
  const placed: (WordData & BubblePosition)[] = [];
  
  // Place first circle in center
  if (circles.length > 0) {
    circles[0].x = width / 2;
    circles[0].y = height / 2;
    placed.push(circles[0]);
  }
  
  // Place remaining circles using spiral placement with collision detection
  for (let i = 1; i < circles.length; i++) {
    const circle = circles[i];
    let bestPosition: { x: number; y: number } | null = null;
    let bestDistance = Infinity;
    
    // Try spiral positions from center outward
    for (let radius = 0; radius < Math.max(width, height) / 2; radius += 5) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        const x = width / 2 + radius * Math.cos(angle);
        const y = height / 2 + radius * Math.sin(angle);
        
        const testCircle = { ...circle, x, y };
        
        if (inBounds(testCircle) && !collides(testCircle, placed)) {
          const distFromCenter = Math.sqrt(
            Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2)
          );
          
          if (distFromCenter < bestDistance) {
            bestDistance = distFromCenter;
            bestPosition = { x, y };
          }
        }
      }
      
      // If we found a position in this radius ring, use it
      if (bestPosition) break;
    }
    
    if (bestPosition) {
      circle.x = bestPosition.x;
      circle.y = bestPosition.y;
      placed.push(circle);
    }
    // If no position found, skip this circle (don't add overlapping)
  }
  
  return placed;
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
      // Use canonical words after synonym mapping
      const wordFrequency: Record<string, { count: number; interviewIds: Set<string> }> = {};

      // Helper to get canonical word
      const getCanonicalWord = (word: string): string => {
        return SYNONYM_MAP[word] || word;
      };

      // Process all user messages - only keep brand perception relevant words
      messages?.forEach(msg => {
        const cleanWords = msg.content
          .toLowerCase()
          .replace(/[.,!?;:()\[\]{}"'@#$%^&*+=<>~/\\|`]/g, ' ')
          .split(/\s+/)
          .filter(word => {
            if (word.length < 2) return false;
            if (STOP_WORDS.has(word)) return false;
            if (COMMON_NAMES.has(word)) return false;
            // Only include if it's a brand perception keyword
            const canonical = getCanonicalWord(word);
            return BRAND_PERCEPTION_KEYWORDS.has(word) || BRAND_PERCEPTION_KEYWORDS.has(canonical);
          });

        cleanWords.forEach(word => {
          // Map to canonical word
          const canonicalWord = getCanonicalWord(word);
          
          if (!wordFrequency[canonicalWord]) {
            wordFrequency[canonicalWord] = { count: 0, interviewIds: new Set() };
          }
          wordFrequency[canonicalWord].count++;
          wordFrequency[canonicalWord].interviewIds.add(msg.interview_id);
        });
      });

      // Add themes with higher weight (also map to canonical)
      interviews?.forEach(interview => {
        interview.themes?.forEach((theme: string) => {
          const cleanTheme = theme.toLowerCase().trim();
          if (cleanTheme.length > 2 && !STOP_WORDS.has(cleanTheme) && !COMMON_NAMES.has(cleanTheme)) {
            const canonicalTheme = getCanonicalWord(cleanTheme);
            // Only add if it's a relevant brand perception word
            if (BRAND_PERCEPTION_KEYWORDS.has(cleanTheme) || BRAND_PERCEPTION_KEYWORDS.has(canonicalTheme)) {
              if (!wordFrequency[canonicalTheme]) {
                wordFrequency[canonicalTheme] = { count: 0, interviewIds: new Set() };
              }
              wordFrequency[canonicalTheme].count += 2; // Weight themes slightly higher
              wordFrequency[canonicalTheme].interviewIds.add(interview.id);
            }
          }
        });
      });

      // Filter to brand perception relevant words only
      const relevantWords = Object.entries(wordFrequency)
        .filter(([word, data]) => {
          // Must be a brand perception keyword and mentioned at least twice
          return BRAND_PERCEPTION_KEYWORDS.has(word) && data.count >= 2;
        })
        .map(([text, data]) => ({
          text,
          value: data.count,
          interviewIds: Array.from(data.interviewIds)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 25); // Top 25 brand perception words

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

  const handleBubbleClick = (word: string, interviewIds: string[]) => {
    if (interviewIds.length > 0) {
      navigate(`/interview/${interviewIds[0]}?highlight=${encodeURIComponent(word)}`);
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
                  onClick={() => handleBubbleClick(bubble.text, bubble.interviewIds)}
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
                  onClick={() => handleBubbleClick(bubble.text, bubble.interviewIds)}
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
