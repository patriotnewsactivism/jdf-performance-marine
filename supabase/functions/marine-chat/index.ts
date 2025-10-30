import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function toGeminiContents(messages: ChatMessage[]) {
  // Convert OpenAI-like messages to Gemini contents format
  const system = messages.find((m) => m.role === "system");
  const rest = messages.filter((m) => m.role !== "system");
  const contents = rest.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const systemInstruction = system
    ? { role: "system", parts: [{ text: system.content }] }
    : undefined;
  return { contents, systemInstruction } as const;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const messageRaw = payload?.message;
    const historyRaw = payload?.history;

    const message = typeof messageRaw === "string" ? messageRaw : "";
    const historyArray: Array<{ role: string; content: string }> = Array.isArray(historyRaw)
      ? historyRaw
      : [];

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
      console.error("No AI API keys configured in Supabase function secrets");
      return new Response(
        JSON.stringify({
          response: "I apologize, but the AI chatbot is not fully configured yet. Please contact us directly at 845-787-4241 or email JDFperformancemarine@gmail.com for assistance. We're here to help!",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an intelligent, knowledgeable, and engaging AI assistant for J.D.F. Performance Marine, a premier high-performance marine service shop in New Windsor, NY on the beautiful Hudson River.

COMPANY EXPERTISE:
- 30+ years of specialized marine mechanical expertise
- Elite focus on high-performance marine service and racing
- Certified specialists in MerCruiser and Mercury Racing products
- Expert service for Yamaha and Kawasaki Jet Skis (2-stroke & 4-stroke)
- Located in the Hudson Valley, serving weekend warriors to serious speed enthusiasts

CONTACT INFORMATION:
- Phone: 845-787-4241 (for quotes and appointments)
- Email: JDFperformancemarine@gmail.com
- Instagram: @jdf_marine (latest projects and updates)
- Location: New Windsor, NY - Right on the Hudson River

COMPREHENSIVE SERVICES:

Performance & Racing:
- High-Performance / Race Engine Building & Upgrades
- Custom Performance Boat Setup and Precision Dialing In
- Custom Rigging for optimal performance
- EFI Conversions for modern efficiency

Engine & Drive Services:
- Complete Repowers
- Outdrive Rebuilds & Performance Upgrades
- Professional Engine and Drive Oil Changes
- Expert Tune-Ups

Diagnostics & Repairs:
- Advanced Mercury / MerCruiser Diagnostics
- Yamaha & Kawasaki Jetski service (2-stroke/4-stroke)
- Maintenance & Repairs: Impellers, Bellows, Transom Assemblies, Engine Alignments, etc.

Boat & PWC Care:
- Hull, Interior, and Electronic Upgrades
- Professional Winterizing & Shrinkwrap (Boat and PWC)
- Comprehensive Water Testing
- Boat / PWC Transportation

Specialty Convenience:
- Dockside Service (we come to you!)

YOUR INTELLIGENT ASSISTANT CAPABILITIES:
1. Provide context-aware recommendations based on customer needs
2. Ask clarifying questions to understand their specific situation
3. Explain technical concepts in accessible language
4. Suggest appropriate services based on symptoms they describe
5. Provide maintenance tips and preventative care advice
6. Share insights about performance optimization
7. Guide them through seasonal preparation (winterizing, spring prep)
8. Help them understand the difference between service levels

CONVERSATION STYLE:
- Be genuinely helpful and enthusiastic about marine performance
- Ask intelligent follow-up questions to better understand their needs
- Provide specific recommendations, not generic responses
- Use technical knowledge appropriately (explain when needed)
- Be conversational and engaging, but always professional
- Keep responses concise yet informative (2-4 sentences ideal)
- Always encourage them to call for detailed quotes or appointments
- Demonstrate expertise while being approachable

IMPORTANT: You're not just answering FAQs - you're an intelligent assistant who can:
- Diagnose potential issues based on symptoms
- Recommend services based on boat type, usage, and goals
- Provide seasonal advice
- Explain the "why" behind recommendations
- Help them make informed decisions

Remember: You represent a premium, expert service with decades of experience. Be confident, knowledgeable, and genuinely helpful.`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...historyArray.map((msg) => ({
        role: (msg.role === "assistant" ? "assistant" : "user") as ChatMessage["role"],
        content: String(msg.content ?? ""),
      })),
      { role: "user", content: message },
    ];

    let aiResponse = "";

    if (OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", response.status, errorText);
        throw new Error(`OpenAI request failed: ${response.status}`);
      }

      const data = await response.json();
      aiResponse = data?.choices?.[0]?.message?.content ?? "";
    } else if (GEMINI_API_KEY) {
      const { contents, systemInstruction } = toGeminiContents(messages);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", response.status, errorText);
        throw new Error(`Gemini request failed: ${response.status}`);
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts;
      aiResponse = Array.isArray(parts)
        ? parts.map((p: { text?: string }) => p?.text ?? "").join("")
        : "";
    }
    
    // If we still don't have a response, provide a fallback
    if (!aiResponse || aiResponse.trim() === "") {
      aiResponse = "I apologize, but I couldn't generate a response. Please contact us directly at 845-787-4241 or email JDFperformancemarine@gmail.com for assistance.";
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in marine-chat function:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
