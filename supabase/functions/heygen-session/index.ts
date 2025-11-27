import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[DEBUG] heygen-session function called');
  
  if (req.method === 'OPTIONS') {
    console.log('[DEBUG] Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[DEBUG] Parsing request body');
    const { interviewId } = await req.json();
    console.log('[DEBUG] Interview ID:', interviewId);
    
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    console.log('[DEBUG] HEYGEN_API_KEY exists:', !!HEYGEN_API_KEY);

    if (!HEYGEN_API_KEY) {
      console.error('[ERROR] HEYGEN_API_KEY is not configured');
      throw new Error('HEYGEN_API_KEY is not configured');
    }

    console.log('[DEBUG] Creating HeyGen session for interview:', interviewId);

    const requestBody = {
      quality: 'high',
      avatar_id: 'Kristin_public_2_20240108',
      voice: {
        voice_id: '1bd001e7e50f421d891986aad5158bc8',
        rate: 1.0
      }
    };
    console.log('[DEBUG] Request body:', JSON.stringify(requestBody, null, 2));

    // Create a streaming session with HeyGen
    console.log('[DEBUG] Sending request to HeyGen API');
    const response = await fetch('https://api.heygen.com/v1/streaming.new', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[DEBUG] HeyGen API response status:', response.status);
    console.log('[DEBUG] HeyGen API response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ERROR] HeyGen API error response:', errorText);
      console.error('[ERROR] Status code:', response.status);
      
      // Parse error details if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.error('[ERROR] Parsed error:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error('[ERROR] Could not parse error as JSON');
      }
      
      throw new Error(`HeyGen API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DEBUG] HeyGen session created successfully');
    console.log('[DEBUG] Response data keys:', Object.keys(data));
    console.log('[DEBUG] Full response:', JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ERROR] Exception in heygen-session function:', error);
    console.error('[ERROR] Error type:', error?.constructor?.name);
    console.error('[ERROR] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name || 'Unknown'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
