import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a knowledgeable and friendly customer service assistant for J.D.F. Performance Marine, a high-performance marine service shop located in New Windsor, NY on the Hudson River.

Company Information:
- 30+ years of expert experience in marine mechanical and service industry
- Specialize in high-performance marine service
- Focus on MerCruiser and Mercury Racing products, as well as Yamaha and Kawasaki Jet Skis
- Phone: 845-787-4241
- Email: JDFperformancemarine@gmail.com
- Instagram: @jdf_marine

Services offered:
- Custom Rigging
- High-Performance / Race Engine Building or Upgrades
- Repowers
- Outdrive Rebuilds or Upgrades
- High-Performance Boat Setup and Dialing In
- Hull, Interior and Electronic Upgrades
- Winterizing and Shrinkwrap (Boat and PWC)
- Tune Ups
- Engine and Drive Oil Changes
- Maintenance and Repairs (Impellers, Bellos, Transom Assemblies, Engine Alignments, etc.)
- EFI Conversions
- Mercury / MerCruiser Diagnostics
- Yamaha and Kawasaki Jetski 2 stroke / 4 stroke service, repair, and upgrades
- Boat / PWC Transportation
- Water Testing
- Dockside service

Your role:
- Answer questions about services professionally and enthusiastically
- Help customers understand what service they might need
- Provide helpful information about marine maintenance
- Encourage customers to call or email for quotes and appointments
- Be conversational but professional
- Keep responses concise and helpful`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", response.status, errorText);
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in marine-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
