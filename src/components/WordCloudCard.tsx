import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactWordcloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

export function WordCloudCard() {
  const [words, setWords] = useState<Array<{ text: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedkiwiExperiences();
  }, []);

  const fetchRedkiwiExperiences = async () => {
    try {
      // Fetch all interview messages
      const { data: messages, error } = await supabase
        .from('interview_messages')
        .select('content, role, interview_id')
        .eq('role', 'user')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Group messages by interview to find context
      const interviewMessages = messages?.reduce((acc, msg) => {
        if (!acc[msg.interview_id]) {
          acc[msg.interview_id] = [];
        }
        acc[msg.interview_id].push(msg.content);
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Find answers related to "Hoe ervaar je Redkiwi?" or similar questions
      const redkiwiAnswers: string[] = [];
      
      Object.values(interviewMessages).forEach((msgs) => {
        // Look for the question and get the next user message
        for (let i = 0; i < msgs.length - 1; i++) {
          const msg = msgs[i].toLowerCase();
          if (msg.includes('hoe ervaar je redkiwi') || 
              msg.includes('ervaring met redkiwi') ||
              msg.includes('wat vind je van redkiwi')) {
            // Get the next message as the answer
            if (msgs[i + 1]) {
              redkiwiAnswers.push(msgs[i + 1]);
            }
          }
        }
      });

      // Process text to create word frequency
      const wordFrequency: Record<string, number> = {};
      const stopWords = new Set([
        'de', 'het', 'een', 'en', 'van', 'in', 'op', 'is', 'te', 'die', 'dat',
        'voor', 'met', 'als', 'aan', 'om', 'ook', 'naar', 'er', 'zijn', 'heeft',
        'bij', 'kan', 'meer', 'wel', 'niet', 'worden', 'maar', 'wat', 'zeer',
        'je', 'ik', 'we', 'ze', 'hij', 'zij', 'me', 'mij', 'ons', 'hun',
        'redkiwi', 'red', 'kiwi', 'the', 'and', 'or', 'of'
      ]);

      redkiwiAnswers.forEach(answer => {
        // Split by words and clean
        const cleanWords = answer
          .toLowerCase()
          .replace(/[.,!?;:()\[\]{}]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3 && !stopWords.has(word));

        cleanWords.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
      });

      // Convert to word cloud format
      const wordCloudData = Object.entries(wordFrequency)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50); // Top 50 words

      setWords(wordCloudData);
    } catch (error) {
      console.error('Error fetching Redkiwi experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    rotations: 2,
    rotationAngles: [-90, 0] as [number, number],
    fontSizes: [20, 80] as [number, number],
    colors: ['#FF2B2B', '#FF5555', '#FF7777', '#FF9999', '#FFBBBB'],
    enableTooltip: true,
    deterministic: true,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: 'bold',
    padding: 2,
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Kernwoorden: "Hoe ervaar je Redkiwi?"</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-white/50">
            Laden...
          </div>
        ) : words.length > 0 ? (
          <div className="h-[400px]">
            <ReactWordcloud 
              words={words} 
              options={options}
            />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-white/50">
            Geen data beschikbaar voor word cloud
          </div>
        )}
      </CardContent>
    </Card>
  );
}
