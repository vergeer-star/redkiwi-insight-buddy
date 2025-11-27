import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interviewId } = await req.json();
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');

    if (!HEYGEN_API_KEY) {
      throw new Error('HEYGEN_API_KEY is not configured');
    }

    console.log('Creating HeyGen session for interview:', interviewId);

    // Create a streaming session with HeyGen
    const response = await fetch('https://api.heygen.com/v1/streaming.new', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quality: 'high',
        avatar_id: 'Kristin_public_2_20240108',
        voice: {
          voice_id: '1bd001e7e50f421d891986aad5158bc8',
          rate: 1.0
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen API error:', response.status, errorText);
      throw new Error(`HeyGen API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('HeyGen session created successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in heygen-session function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
