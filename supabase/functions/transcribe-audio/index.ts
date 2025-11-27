import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interviewId, audioUrl, audioData, sessionId, fallbackSessionId } = await req.json();

    console.log('Transcribe request:', {
      interviewId,
      hasAudioUrl: !!audioUrl,
      hasAudioData: !!audioData,
      sessionId,
      fallbackSessionId
    });

    if (!interviewId) {
      throw new Error('Interview ID is required');
    }

    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    if (!HEYGEN_API_KEY) {
      throw new Error('HeyGen API key not configured');
    }

    console.log('Starting transcription for interview:', interviewId);

    // If we have a sessionId but no audio, try to fetch from HeyGen
    let audioToTranscribe: Blob | null = null;
    let audioSourceUrl: string | null = null;

    if (sessionId && !audioUrl && !audioData) {
      console.log('Attempting to fetch HeyGen recording for session:', sessionId);
      
      // Try to get the recording from HeyGen API
      // Note: Adjust these endpoints based on HeyGen's actual API
      const sessionToTry = [sessionId, fallbackSessionId].filter(Boolean);
      
      for (const sid of sessionToTry) {
        try {
          console.log(`Trying HeyGen session ID: ${sid}`);
          
          // First try to get session info
          const sessionInfoResponse = await fetch(`https://api.heygen.com/v1/streaming.get`, {
            method: 'POST',
            headers: {
              'X-Api-Key': HEYGEN_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ session_id: sid })
          });

          if (sessionInfoResponse.ok) {
            const sessionInfo = await sessionInfoResponse.json();
            console.log('HeyGen session info:', sessionInfo);
            
            // Check if recording is available
            if (sessionInfo.data?.recording_url || sessionInfo.data?.video_url) {
              const recordingUrl = sessionInfo.data.recording_url || sessionInfo.data.video_url;
              console.log('Found recording URL:', recordingUrl);
              audioSourceUrl = recordingUrl;
              const audioResponse = await fetch(recordingUrl);
              audioToTranscribe = await audioResponse.blob();
              console.log('Successfully fetched HeyGen recording');
              break;
            } else {
              console.log('Session exists but no recording URL yet:', sessionInfo);
            }
          } else {
            const errorText = await sessionInfoResponse.text();
            console.log(`HeyGen session fetch failed (${sessionInfoResponse.status}):`, errorText);
          }
        } catch (error) {
          console.log('Error fetching HeyGen session:', sid, error);
        }
      }
      
      if (!audioToTranscribe) {
        console.warn('Could not fetch HeyGen recording from any session ID');
      }
    }

    // Prepare audio for HeyGen API
    let audioBlob: Blob;
    
    if (audioToTranscribe) {
      // Use the audio we fetched from HeyGen
      audioBlob = audioToTranscribe;
    } else if (audioData) {
      // Convert base64 to blob
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      audioBlob = new Blob([bytes], { type: 'audio/webm' });
    } else if (audioUrl) {
      // Fetch audio from URL
      const audioResponse = await fetch(audioUrl);
      audioBlob = await audioResponse.blob();
      audioSourceUrl = audioUrl;
    } else {
      console.log('No audio source provided, skipping transcription');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No audio source available',
          message: 'Interview has no audio to transcribe'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Send to HeyGen transcription API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('language', 'nl'); // Dutch language

    const heygenResponse = await fetch('https://api.heygen.com/v1/audio/transcribe', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
      body: formData,
    });

    if (!heygenResponse.ok) {
      const errorText = await heygenResponse.text();
      console.error('HeyGen API error:', errorText);
      throw new Error(`HeyGen API error: ${heygenResponse.status} - ${errorText}`);
    }

    const transcriptionResult = await heygenResponse.json();
    console.log('Transcription result:', transcriptionResult);

    // Save transcription to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: transcription, error: dbError } = await supabase
      .from('interview_transcriptions')
      .insert({
        interview_id: interviewId,
        audio_url: audioSourceUrl || audioUrl || null,
        transcription_text: transcriptionResult.text || '',
        segments: transcriptionResult.segments || [],
        timestamps: transcriptionResult.timestamps || {},
        confidence: transcriptionResult.confidence || null,
        metadata: {
          language: transcriptionResult.language || 'nl',
          duration: transcriptionResult.duration || null,
          raw_response: transcriptionResult,
          session_id: sessionId || null
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Transcription saved successfully:', transcription.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transcription,
        message: 'Transcription completed and saved'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});