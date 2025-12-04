import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WordData {
  text: string;
  value: number;
}

export function WordCloudCard() {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      // Fetch all user messages from interviews
      const { data: messages, error } = await supabase
        .from('interview_messages')
        .select('content')
        .eq('role', 'user');

      if (error) throw error;

      // Also fetch themes from interviews
      const { data: interviews, error: interviewError } = await supabase
        .from('interviews')
        .select('themes')
        .is('deleted_at', null);

      if (interviewError) throw interviewError;

      // Process text to create word frequency
      const wordFrequency: Record<string, number> = {};
      const stopWords = new Set([
        'de', 'het', 'een', 'en', 'van', 'in', 'op', 'is', 'te', 'die', 'dat',
        'voor', 'met', 'als', 'aan', 'om', 'ook', 'naar', 'er', 'zijn', 'heeft',
        'bij', 'kan', 'meer', 'wel', 'niet', 'worden', 'maar', 'wat', 'zeer',
        'je', 'ik', 'we', 'ze', 'hij', 'zij', 'me', 'mij', 'ons', 'hun', 'ja',
        'nee', 'nou', 'dus', 'dan', 'nog', 'toch', 'alleen', 'even', 'heel',
        'best', 'beetje', 'eigenlijk', 'gewoon', 'echt', 'goed', 'veel', 'zelf',
        'the', 'and', 'or', 'of', 'to', 'a', 'is', 'it', 'that', 'was', 'for',
        'hallo', 'bedankt', 'graag', 'dank', 'prima', 'oké', 'okay'
      ]);

      // Process all user messages
      messages?.forEach(msg => {
        const cleanWords = msg.content
          .toLowerCase()
          .replace(/[.,!?;:()\[\]{}"']/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3 && !stopWords.has(word));

        cleanWords.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
      });

      // Add themes with higher weight
      interviews?.forEach(interview => {
        interview.themes?.forEach((theme: string) => {
          const cleanTheme = theme.toLowerCase().trim();
          if (cleanTheme.length > 2) {
            wordFrequency[cleanTheme] = (wordFrequency[cleanTheme] || 0) + 5; // Weight themes higher
          }
        });
      });

      // Convert to bubble format - top 30 words
      const wordCloudData = Object.entries(wordFrequency)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 30);

      setWords(wordCloudData);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate circle sizes based on value
  const maxValue = Math.max(...words.map(w => w.value), 1);
  const minSize = 40;
  const maxSize = 120;

  const getSize = (value: number) => {
    const normalized = value / maxValue;
    return minSize + normalized * (maxSize - minSize);
  };

  const colors = ['#E30613', '#FF4444', '#FF6666', '#FF8888', '#FFAAAA'];

  return (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="text-white text-xl font-bold">Kernwoorden uit Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-white/50">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Laden...
            </div>
          </div>
        ) : words.length > 0 ? (
          <div className="h-[400px] flex flex-wrap items-center justify-center gap-3 p-4 overflow-hidden">
            {words.map((word, index) => {
              const size = getSize(word.value);
              const colorIndex = Math.min(Math.floor((1 - word.value / maxValue) * colors.length), colors.length - 1);
              return (
                <div
                  key={word.text}
                  className="flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 cursor-default"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: colors[colorIndex],
                    opacity: 0.7 + (word.value / maxValue) * 0.3,
                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                  }}
                  title={`${word.text}: ${word.value}x genoemd`}
                >
                  <span 
                    className="text-white font-bold text-center px-1 truncate"
                    style={{ 
                      fontSize: Math.max(10, size / 5),
                      maxWidth: size - 8
                    }}
                  >
                    {word.text}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-white/50">
            Geen kernwoorden gevonden
          </div>
        )}
      </CardContent>
    </Card>
  );
}
