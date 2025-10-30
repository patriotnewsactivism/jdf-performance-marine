import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface LeadQualification {
  score: "cold" | "warm" | "hot";
  notes: string;
  requiresFollowUp: boolean;
}

function toGeminiContents(messages: ChatMessage[]) {
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

// Extract user information from conversation
function extractUserInfo(messages: ChatMessage[]): UserInfo {
  const info: UserInfo = {};
  const conversationText = messages.map(m => m.content).join(" ").toLowerCase();
  
  // Extract email using regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatch = conversationText.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    info.email = emailMatch[0];
  }
  
  // Extract phone number (various formats)
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = conversationText.match(phoneRegex);
  if (phoneMatch && phoneMatch.length > 0) {
    info.phone = phoneMatch[0].replace(/\D/g, ''); // Clean to digits only
  }
  
  // Look for name patterns - check for explicit mentions
  const namePatterns = [
    /(?:my name is|i'm|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+here/gi,
  ];
  
  for (const pattern of namePatterns) {
    const matches = conversationText.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 1) {
        info.name = match[1].trim();
        break;
      }
    }
    if (info.name) break;
  }
  
  return info;
}

// Qualify lead based on conversation content
function qualifyLead(messages: ChatMessage[], userInfo: UserInfo): LeadQualification {
  const conversationText = messages.map(m => m.content).join(" ").toLowerCase();
  
  // Hot lead indicators
  const hotIndicators = [
    "need service", "schedule", "appointment", "when can you", "how much",
    "quote", "pricing", "available", "book", "asap", "urgent", "soon",
    "this week", "interested in", "ready to", "want to get"
  ];
  
  // Warm lead indicators
  const warmIndicators = [
    "tell me more", "what do you", "looking for", "considering",
    "thinking about", "might need", "planning", "next season",
    "in the future", "eventually"
  ];
  
  // Count indicators
  let hotCount = 0;
  let warmCount = 0;
  
  hotIndicators.forEach(indicator => {
    if (conversationText.includes(indicator)) hotCount++;
  });
  
  warmIndicators.forEach(indicator => {
    if (conversationText.includes(indicator)) warmCount++;
  });
  
  // Has contact info bonus
  const hasContactInfo = !!(userInfo.email || userInfo.phone);
  const hasName = !!userInfo.name;
  
  // Determine lead score
  let score: "cold" | "warm" | "hot" = "cold";
  let notes = "";
  let requiresFollowUp = false;
  
  if (hotCount >= 2 && hasContactInfo) {
    score = "hot";
    notes = `Customer expressing immediate interest with ${hotCount} strong buying signals. Has provided contact information.`;
    requiresFollowUp = true;
  } else if ((hotCount >= 1 && hasContactInfo) || (warmCount >= 2 && hasContactInfo)) {
    score = "warm";
    notes = `Customer showing interest with ${hotCount + warmCount} indicators. Has provided ${hasName ? 'name and ' : ''}contact details.`;
    requiresFollowUp = true;
  } else if (warmCount >= 1 || hotCount >= 1) {
    score = "warm";
    notes = `Customer asking relevant questions but hasn't provided contact info yet.`;
    requiresFollowUp = false;
  } else {
    score = "cold";
    notes = "General inquiry or casual browsing.";
    requiresFollowUp = false;
  }
  
  return { score, notes, requiresFollowUp };
}

// Send notification for hot/warm leads
async function sendLeadNotification(
  conversationId: string,
  userInfo: UserInfo,
  leadQual: LeadQualification,
  messages: ChatMessage[],
  supabaseClient: any
) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const BUSINESS_EMAIL = Deno.env.get("BUSINESS_EMAIL") || "JDFperformancemarine@gmail.com";
  const BUSINESS_PHONE = Deno.env.get("BUSINESS_PHONE") || "845-787-4241";
  
  // Create a summary of the conversation
  const recentMessages = messages.slice(-6); // Last 6 messages
  const conversationSummary = recentMessages
    .map(m => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`)
    .join('\n\n');
  
  const urgencyEmoji = leadQual.score === 'hot' ? '🔥🔥🔥' : '⚠️';
  const subject = `${urgencyEmoji} ${leadQual.score.toUpperCase()} Lead Alert - ${userInfo.name || 'New Customer'}`;
  
  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .score-hot { background: #dc2626; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold; }
    .score-warm { background: #ea580c; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold; }
    .info-section { background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .contact-info { background: white; padding: 15px; border-left: 4px solid #1e40af; margin: 10px 0; }
    .conversation { background: #f9fafb; padding: 15px; margin: 15px 0; border-radius: 5px; max-height: 400px; overflow-y: auto; }
    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .user-message { background: #dbeafe; }
    .ai-message { background: #e5e7eb; }
    .cta-button { background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 New Lead Alert</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">J.D.F. Performance Marine</p>
    </div>
    
    <div class="info-section">
      <h2>Lead Score: <span class="score-${leadQual.score}">${leadQual.score.toUpperCase()}</span></h2>
      <p><strong>Assessment:</strong> ${leadQual.notes}</p>
      <p><strong>Follow-up Required:</strong> ${leadQual.requiresFollowUp ? '✅ YES - Contact ASAP' : '❌ No'}</p>
    </div>
    
    <div class="info-section">
      <h2>Customer Information</h2>
      ${userInfo.name ? `<div class="contact-info"><strong>Name:</strong> ${userInfo.name}</div>` : ''}
      ${userInfo.email ? `<div class="contact-info"><strong>Email:</strong> <a href="mailto:${userInfo.email}">${userInfo.email}</a></div>` : ''}
      ${userInfo.phone ? `<div class="contact-info"><strong>Phone:</strong> <a href="tel:${userInfo.phone}">${userInfo.phone}</a></div>` : ''}
      ${!userInfo.name && !userInfo.email && !userInfo.phone ? '<p style="color: #dc2626;">⚠️ No contact information provided yet</p>' : ''}
    </div>
    
    <div class="info-section">
      <h2>Conversation Excerpt</h2>
      <div class="conversation">
        ${recentMessages.map(m => `
          <div class="message ${m.role === 'user' ? 'user-message' : 'ai-message'}">
            <strong>${m.role === 'user' ? '👤 Customer' : '🤖 AI Assistant'}:</strong><br>
            ${m.content}
          </div>
        `).join('')}
      </div>
    </div>
    
    ${leadQual.requiresFollowUp ? `
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 18px; font-weight: bold; color: #dc2626;">⏰ Action Required</p>
        <p>Contact this lead within 1 hour for best conversion rate!</p>
      </div>
    ` : ''}
    
    <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">
      <p><strong>Quick Actions:</strong></p>
      ${userInfo.email ? `<a href="mailto:${userInfo.email}" class="cta-button">📧 Send Email</a>` : ''}
      ${userInfo.phone ? `<a href="tel:${userInfo.phone}" class="cta-button">📞 Call Now</a>` : ''}
    </div>
    
    <div style="margin-top: 30px; padding: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px;">
      <p><strong>Conversation ID:</strong> ${conversationId}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
  
  // Send email notification if Resend API key is configured
  if (RESEND_API_KEY && (leadQual.score === 'hot' || (leadQual.score === 'warm' && leadQual.requiresFollowUp))) {
    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "JDF Marine Leads <leads@jdfmarine.com>",
          to: BUSINESS_EMAIL,
          subject: subject,
          html: emailBody,
        }),
      });
      
      const emailResult = await emailResponse.json();
      
      // Log notification in database
      await supabaseClient
        .from('lead_notifications')
        .insert({
          conversation_id: conversationId,
          notification_type: 'email',
          sent_to: BUSINESS_EMAIL,
          status: emailResponse.ok ? 'sent' : 'failed',
          error_message: !emailResponse.ok ? JSON.stringify(emailResult) : null,
        });
      
      console.log('Email notification result:', emailResult);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }
  
  // Note: For SMS, you would integrate Twilio here
  // Keeping it simple for now - email notifications are the priority
}

// Add variation to responses to make them feel more human
function addResponseVariation(response: string): string {
  // Add occasional conversational fillers (sparingly)
  const fillers = [
    "", "", "", "", // Most responses have no filler (80% chance)
    "Absolutely! ", "Great question! ", "I'd be happy to help with that. ",
    "Sure thing! ", "Of course! "
  ];
  
  const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
  
  // Sometimes add a friendly closing (20% chance)
  const closings = [
    "", "", "", "", // Most responses have no special closing
    " Feel free to ask if you have any other questions!", 
    " Let me know if you need anything else!",
    " Is there anything else I can help you with?"
  ];
  
  const randomClosing = closings[Math.floor(Math.random() * closings.length)];
  
  return randomFiller + response + randomClosing;
}

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Request received:`, req.method, req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json().catch((e) => {
      console.error("Failed to parse request body:", e);
      return {};
    });
    
    const messageRaw = payload?.message;
    const historyRaw = payload?.history;
    const sessionId = payload?.sessionId || crypto.randomUUID();

    const message = typeof messageRaw === "string" ? messageRaw : "";
    const historyArray: Array<{ role: string; content: string }> = Array.isArray(historyRaw)
      ? historyRaw
      : [];

    console.log("Message:", message.substring(0, 50), "History length:", historyArray.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
      console.error("No AI API keys configured");
      return new Response(
        JSON.stringify({
          response: "I apologize, but the AI chatbot is not fully configured yet. Please contact us directly at 845-787-4241 or email JDFperformancemarine@gmail.com for assistance. We're here to help!",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enhanced system prompt for lead qualification
    const systemPrompt = `You are an intelligent, knowledgeable, and engaging AI assistant for J.D.F. Performance Marine, a premier high-performance marine service shop in New Windsor, NY on the beautiful Hudson River.

CRITICAL LEAD QUALIFICATION MISSION:
Your primary goal is to build genuine rapport, qualify leads naturally, and collect contact information WITHOUT being pushy. You are a skilled conversationalist who makes people WANT to share their information.

INFORMATION GATHERING STRATEGY (Natural & Conversational):
1. FIRST INTERACTION: Introduce yourself warmly and ask who you're speaking with
   - Example: "Hi there! I'm the AI assistant for J.D.F. Performance Marine. Who do I have the pleasure of helping today?"
   - Be genuinely interested and friendly

2. ONCE YOU HAVE THEIR NAME: Use it naturally in conversation to build rapport
   - Example: "Great to meet you, [Name]! So what brings you here today?"

3. WHEN THE CONVERSATION SHOWS INTEREST: Naturally offer to send information
   - Example: "That's perfect for what we offer! I'd love to send you some specific details. What's the best email to reach you at?"
   - Or: "Let me get you a personalized quote. Where should I send it?"

4. FOR HOT LEADS: Suggest a callback or appointment
   - Example: "This sounds time-sensitive! Would you like me to have our service manager give you a call? What's the best number to reach you?"

5. VARY YOUR APPROACH: Never use the exact same phrasing twice. Be genuinely conversational.

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

CONVERSATION STYLE:
- Be genuinely helpful and enthusiastic about marine performance
- Ask intelligent follow-up questions to better understand their needs
- Provide specific recommendations, not generic responses
- Use technical knowledge appropriately (explain when needed)
- Be conversational and engaging, but always professional
- Keep responses concise yet informative (2-4 sentences ideal, occasionally longer if needed)
- VARY your responses - use different phrasings, expressions, and structures
- Write like a real person having a conversation, not a robot
- Use occasional contractions, natural language, and varied sentence structures
- Always encourage them to call for detailed quotes or appointments

LEAD QUALIFICATION SIGNALS (Identify but don't be pushy):
HOT LEADS: Immediate need, timeline mentioned, asking for quotes/pricing, ready to schedule
WARM LEADS: Researching options, asking detailed questions, future planning, considering services
COLD LEADS: General curiosity, vague inquiries, just browsing

Remember: You represent a premium, expert service with decades of experience. Be confident, knowledgeable, genuinely helpful, and make collecting information feel like a natural part of providing excellent service.`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...historyArray.map((msg) => ({
        role: (msg.role === "assistant" ? "assistant" : "user") as ChatMessage["role"],
        content: String(msg.content ?? ""),
      })),
      { role: "user", content: message },
    ];

    let aiResponse = "";

    // Get AI response
    if (OPENAI_API_KEY) {
      console.log("Using OpenAI API");
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.85, // Increased for more variation
            max_tokens: 500,
            presence_penalty: 0.6, // Encourage diverse responses
            frequency_penalty: 0.6, // Reduce repetition
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("OpenAI API Error:", response.status, errorText);
          throw new Error(`OpenAI request failed: ${response.status}`);
        }

        const data = await response.json();
        aiResponse = data?.choices?.[0]?.message?.content ?? "";
      } catch (error) {
        console.error("OpenAI API exception:", error);
        throw error;
      }
    } else if (GEMINI_API_KEY) {
      console.log("Using Gemini API");
      try {
        const { contents, systemInstruction } = toGeminiContents(messages);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction,
            generationConfig: { 
              temperature: 0.85, 
              maxOutputTokens: 500,
              topP: 0.95, // More randomness for variety
            },
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
      } catch (error) {
        console.error("Gemini API exception:", error);
        throw error;
      }
    }
    
    if (!aiResponse || aiResponse.trim() === "") {
      aiResponse = "I apologize, but I couldn't generate a response. Please contact us directly at 845-787-4241 or email JDFperformancemarine@gmail.com for assistance.";
    }

    // Add subtle variation to make responses feel more human
    aiResponse = addResponseVariation(aiResponse);

    // Extract user information from the conversation
    const allMessages = [...messages, { role: "assistant" as const, content: aiResponse }];
    const userInfo = extractUserInfo(allMessages);
    
    // Qualify the lead
    const leadQualification = qualifyLead(allMessages, userInfo);
    
    console.log("Lead qualification:", leadQualification);
    console.log("User info extracted:", userInfo);

    // Save or update conversation in database for warm/hot leads
    if (leadQualification.score !== 'cold' || userInfo.email || userInfo.phone || userInfo.name) {
      try {
        // Check if conversation exists
        const { data: existingConvo } = await supabase
          .from('conversations')
          .select('id')
          .eq('session_id', sessionId)
          .single();

        const conversationData = {
          session_id: sessionId,
          user_name: userInfo.name,
          user_email: userInfo.email,
          user_phone: userInfo.phone,
          lead_score: leadQualification.score,
          lead_notes: leadQualification.notes,
          follow_up_required: leadQualification.requiresFollowUp,
          messages: allMessages.filter(m => m.role !== 'system'),
          conversation_summary: leadQualification.notes,
        };

        let conversationId;

        if (existingConvo) {
          // Update existing conversation
          await supabase
            .from('conversations')
            .update(conversationData)
            .eq('id', existingConvo.id);
          conversationId = existingConvo.id;
        } else {
          // Create new conversation
          const { data: newConvo } = await supabase
            .from('conversations')
            .insert(conversationData)
            .select('id')
            .single();
          conversationId = newConvo?.id;
        }

        // Send notification for hot/warm leads that require follow-up
        if (conversationId && leadQualification.requiresFollowUp && 
            (userInfo.email || userInfo.phone)) {
          
          // Check if notification already sent
          const { data: existingNotification } = await supabase
            .from('lead_notifications')
            .select('id')
            .eq('conversation_id', conversationId)
            .single();

          if (!existingNotification) {
            await sendLeadNotification(
              conversationId,
              userInfo,
              leadQualification,
              allMessages,
              supabase
            );

            // Mark notification as sent
            await supabase
              .from('conversations')
              .update({ notification_sent: true })
              .eq('id', conversationId);
          }
        }

        console.log("Conversation saved successfully");
      } catch (error) {
        console.error("Error saving conversation:", error);
        // Don't fail the request if saving fails
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        sessionId: sessionId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in marine-chat function:", error);
    
    const fallbackMessage = "I apologize, but I'm experiencing technical difficulties. Please contact us directly at 845-787-4241 or email JDFperformancemarine@gmail.com for assistance. We're here to help!";
    
    return new Response(JSON.stringify({ 
      response: fallbackMessage,
      error: error instanceof Error ? error.message : "An error occurred"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
