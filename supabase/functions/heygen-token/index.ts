import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for session validation
    let sessionId: string | null = null;
    let interviewId: string | null = null;
    
    try {
      const body = await req.json();
      sessionId = body.sessionId || null;
      interviewId = body.interviewId || null;
    } catch {
      // Body parsing failed, continue without session validation
    }

    // Validate that this is for a legitimate interview session
    if (interviewId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Verify the interview exists and is active
      const { data: interview, error } = await supabase
        .from('interviews')
        .select('id, status, session_id')
        .eq('id', interviewId)
        .single();
      
      if (error || !interview) {
        console.error("Invalid interview ID:", interviewId, error);
        return new Response(
          JSON.stringify({ error: "Invalid interview session" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify session_id matches if provided
      if (sessionId && interview.session_id !== sessionId) {
        console.error("Session ID mismatch for interview:", interviewId);
        return new Response(
          JSON.stringify({ error: "Session validation failed" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Reject if interview is already completed
      if (interview.status === 'completed' || interview.status === 'analyzed') {
        console.error("Interview already completed:", interviewId);
        return new Response(
          JSON.stringify({ error: "Interview session has ended" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Token request validated for interview:", interviewId);
    } else {
      // For backwards compatibility during interview creation, allow without interviewId
      // but log for monitoring
      console.warn("HeyGen token requested without interview context - allowing for interview creation");
    }

    const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");
    
    if (!HEYGEN_API_KEY) {
      throw new Error("HEYGEN_API_KEY is not configured");
    }

    console.log("Requesting HeyGen token...");

    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen token error:", response.status, errorText);
      throw new Error(`Failed to get HeyGen token: ${response.status}`);
    }

    const data = await response.json();
    console.log("HeyGen token received successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in heygen-token function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
