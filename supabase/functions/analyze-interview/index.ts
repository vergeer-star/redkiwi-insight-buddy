import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    const origin = req.headers.get('origin') || '';
    const isDevEnvironment = origin.includes('lovable.app') || origin.includes('localhost');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Verify the user's token (skip strict validation in dev environment)
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    // In dev environment, allow access if token validation fails but log warning
    if (authError || !user) {
      if (isDevEnvironment) {
        console.warn('Dev environment: Auth validation failed but proceeding:', authError?.message);
      } else {
        console.error('Auth error:', authError);
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // In production, verify user is a Redkiwi employee
    if (!isDevEnvironment && user && !user.email?.endsWith('@redkiwi.nl')) {
      console.error('Access denied: non-Redkiwi email', user.email);
      return new Response(
        JSON.stringify({ error: 'Access denied: Redkiwi employees only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated:', isDevEnvironment ? 'Dev environment' : user?.email);

    const { interviewId } = await req.json();
    
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all messages for this interview
    const { data: messages, error: messagesError } = await supabase
      .from('interview_messages')
      .select('role, content, timestamp')
      .eq('interview_id', interviewId)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      console.warn('No messages found for this interview - storing neutral analysis');
      const fallback = {
        sentiment: 'neutral',
        themes: [] as string[],
        summary: 'Geen transcript gevonden; automatische analyse niet mogelijk. Interview gemarkeerd als neutraal.'
      };

      const { error: updateEmptyErr } = await supabase
        .from('interviews')
        .update({
          sentiment: fallback.sentiment,
          themes: fallback.themes,
          summary: fallback.summary,
          analyzed_at: new Date().toISOString()
        })
        .eq('id', interviewId);

      if (updateEmptyErr) {
        console.error('Error updating empty analysis:', updateEmptyErr);
      }

      return new Response(
        JSON.stringify({ success: true, analysis: fallback, warning: 'no_messages' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Prepare conversation text for analysis
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'Gebruiker' : 'Interviewer'}: ${m.content}`)
      .join('\n\n');

    console.log('Analyzing interview with', messages.length, 'messages');

    // Call Lovable AI for analysis using tool calling for structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Je bent een expert in merkperceptie-onderzoek voor Redkiwi. 
Analyseer het interview en bepaal:
1. Het algemene sentiment (positive, neutral, of negative)
2. Belangrijkste thema's die aan bod komen (bijv: innovatie, design, toegankelijkheid, prijs, service, expertise, kwaliteit, communicatie)
3. Een beknopte samenvatting van de belangrijkste inzichten`
          },
          {
            role: 'user',
            content: `Analyseer dit interview gesprek:\n\n${conversationText}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_interview',
              description: 'Analyze interview sentiment, themes and generate summary',
              parameters: {
                type: 'object',
                properties: {
                  sentiment: {
                    type: 'string',
                    enum: ['positive', 'neutral', 'negative'],
                    description: 'Overall sentiment of the interview'
                  },
                  themes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of main themes discussed (e.g., innovatie, design, toegankelijkheid, prijs, service)'
                  },
                  summary: {
                    type: 'string',
                    description: 'Concise summary of key insights from the interview (max 200 words)'
                  }
                },
                required: ['sentiment', 'themes', 'summary'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_interview' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    // Extract the analysis from tool call
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Parsed analysis:', analysis);

    // Update interview with analysis results
    const { error: updateError } = await supabase
      .from('interviews')
      .update({
        sentiment: analysis.sentiment,
        themes: analysis.themes,
        summary: analysis.summary,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', interviewId);

    if (updateError) {
      console.error('Error updating interview:', updateError);
      throw updateError;
    }

    console.log('Interview analyzed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: {
          sentiment: analysis.sentiment,
          themes: analysis.themes,
          summary: analysis.summary
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-interview function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});