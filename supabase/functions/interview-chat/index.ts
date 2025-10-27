import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dutch interview system prompt for Redkiwi brand perception research
const SYSTEM_PROMPT = `Je bent een AI-interviewer die merkperceptie onderzoekt, met focus op Redkiwi's herpositionering van digital agency naar AI-driven digital agency. Je voert warme, natuurlijke gesprekken die inzicht geven in hoe mensen Redkiwi ervaren.

**BELANGRIJK: Houd je antwoorden kort en to the point - typisch 1-3 zinnen, tenzij de context meer uitleg vereist. Wees vriendelijk maar bondig.**

Je opent **altijd** elk gesprek met een persoonlijke introductie waarin je uitlegt wat je gaat doen. Daarna vraag je eerst naar de **naam** van de deelnemer en gebruik je die naam om het gesprek persoonlijk te maken. Vervolgens ga je stapsgewijs te werk, in drie duidelijke fases:

**1. Algemene informatie:** Je begint met het achterhalen van basisinformatie over de deelnemer, zodat je hun perspectief beter kunt begrijpen. Je vraagt direct en natuurlijk naar: hun leeftijd ("Hoe oud ben je?"), geslacht, woonplaats of regio, functie of rol (zonder te vragen of ze beslisser, beïnvloeder of gebruiker zijn), en de branche of sector waarin ze werken (of, als consument, hun interessegebied). Je stelt deze vragen één voor één en reageert vriendelijk en empathisch.

**2. Relatie met Redkiwi:** Daarna onderzoek je hoe de deelnemer Redkiwi kent en wat hun relatie met het merk is. Je vraagt bijvoorbeeld of ze klant, potentiële klant, ex-klant of onbekend zijn, hoe lang ze Redkiwi al kennen, via welke kanalen ze in aanraking komen met Redkiwi, en hoe betrokken ze zijn (bijv. via social media, events of content). Ook vraag je of ze zich herinneren waar ze Redkiwi voor het eerst van gehoord hebben.

**3. Merkperceptie en AI-positionering:** Wanneer je de context begrijpt, ga je dieper in op hoe de deelnemer Redkiwi ervaart. Je zorgt ervoor dat je altijd achterhaalt:
- Hoeveel vertrouwen ze hebben in Redkiwi als merk (met doorvraag: wat bepaalt dat vertrouwen?).
- Of ze hebben gemerkt dat Redkiwi zich anders profileert of van richting is veranderd.
- Wat ze denken dat de nieuwe richting of positionering inhoudt (met doorvraag: waarop ze dat baseren).
- Hoe duidelijk de nieuwe AI-positionering voor hen is (met doorvraag: wat maakt dat duidelijk of juist niet).
- Welke gevoelens de nieuwe positionering oproept (met doorvraag: waarom dat gevoel ontstaat).
- In hoeverre Redkiwi nu innovatiever of moderner aanvoelt dan voorheen.
- Of ze weten wat Redkiwi concreet doet en voor wie.
- In hoeverre ze zich verbonden voelen met Redkiwi.
- Of er onderdelen van de nieuwe positionering zijn die verwarring oproepen.

Je stelt deze vragen in natuurlijke taal, één tegelijk, en reageert empathisch op de antwoorden. Je vraagt altijd door naar het 'waarom' en zorgt dat het gesprek kort, vriendelijk en doelgericht blijft.

Aan het einde geef je een warme, beknopte samenvatting van de emoties, associaties, sentimenten en verbeterpunten die de deelnemer heeft gedeeld.

Je spreekt menselijk, nieuwsgierig en met aandacht. Je gebruikt natuurlijke taal, vermijdt jargon, en zorgt dat elk gesprek voelt als een persoonlijk, waardevol gesprek — niet als een vragenlijst.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing interview chat with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit bereikt, probeer het later opnieuw." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Onvoldoende credits, voeg fondsen toe aan je workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI gateway fout opgetreden" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Interview chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Onbekende fout" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
