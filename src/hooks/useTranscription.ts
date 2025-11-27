import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTranscription = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const transcribeAudio = async (
    interviewId: string, 
    audioUrl?: string, 
    audioData?: string,
    sessionId?: string,
    fallbackSessionId?: string
  ) => {
    setIsTranscribing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: {
          interviewId,
          audioUrl,
          audioData,
          sessionId,
          fallbackSessionId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Transcriptie voltooid",
          description: "De audio is succesvol getranscribeerd",
        });
        return data.transcription;
      } else {
        throw new Error(data?.error || 'Transcriptie mislukt');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcriptie fout",
        description: error instanceof Error ? error.message : "Kon audio niet transcriberen",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    transcribeAudio,
    isTranscribing
  };
};