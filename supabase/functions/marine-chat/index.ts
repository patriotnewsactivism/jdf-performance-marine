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
  
  // CRITICAL/URGENT indicators (immediate hot lead)
  const criticalIndicators = [
    "broke down", "broken", "blew up", "not working", "won't start", "stopped working",
    "emergency", "need help", "problem", "issue", "repair", "fix", "damaged", "failed"
  ];
  
  // Hot lead indicators
  const hotIndicators = [
    "need service", "schedule", "appointment", "when can you", "how much",
    "quote", "pricing", "available", "book", "asap", "urgent", "soon",
    "this week", "interested in", "ready to", "want to get", "service"
  ];
  
  // Confirmation words (user agreeing to service)
  const confirmationIndicators = [
    "yes", "yeah", "yep", "sure", "ok", "okay", "definitely", 
    "absolutely", "please", "sounds good", "let's do it"
  ];
  
  // Warm lead indicators
  const warmIndicators = [
    "tell me more", "what do you", "looking for", "considering",
    "thinking about", "might need", "planning", "next season",
    "in the future", "eventually", "curious about"
  ];
  
  // Count indicators
  let criticalCount = 0;
  let hotCount = 0;
  let confirmationCount = 0;
  let warmCount = 0;
  
  criticalIndicators.forEach(indicator => {
    if (conversationText.includes(indicator)) criticalCount++;
  });
  
  hotIndicators.forEach(indicator => {
    if (conversationText.includes(indicator)) hotCount++;
  });
  
  confirmationIndicators.forEach(indicator => {
    // Check for standalone confirmations (not part of longer words)
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    if (regex.test(conversationText)) confirmationCount++;
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

  // HOT LEAD: Critical issues (engine problems, breakdowns, etc.) are ALWAYS hot
  if (criticalCount >= 1) {
    score = "hot";
    notes = `🔥 URGENT: Customer has critical equipment issue requiring immediate attention. ${hasContactInfo ? 'Contact info collected.' : '⚠️ MISSING CONTACT INFO!'}`;
    requiresFollowUp = true;
  }
  // HOT LEAD: Any clear service request or interest in their line of work should be treated as hot
  else if (hotCount >= 1) {
    score = "hot";
    notes = `Customer is asking about core services with ${hotCount} strong intent signal${hotCount > 1 ? 's' : ''}. ${hasContactInfo ? 'Contact info collected.' : '⚠️ MISSING CONTACT INFO!'}`;
    requiresFollowUp = true;
  }
  // HOT LEAD: User confirmed interest (said "yes" after service discussion)
  else if (confirmationCount >= 1 && warmCount >= 1) {
    score = "hot";
    notes = `🔥 Customer confirmed interest in service. ${hasContactInfo ? 'Contact info collected.' : '⚠️ MISSING CONTACT INFO!'}`;
    requiresFollowUp = true;
  }
  // WARM LEAD: Multiple warm indicators with or without contact info
  else if (warmCount >= 1) {
    score = "warm";
    notes = `Customer researching services. ${hasContactInfo ? `Has provided ${hasName ? 'name and ' : ''}contact details.` : '⚠️ Contact info not collected yet - guide them to share it.'}`;
    requiresFollowUp = true;
  }
  // COLD LEAD: General browsing
  else {
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
  personaName: string,
  supabaseClient: any
) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const BUSINESS_EMAIL = Deno.env.get("BUSINESS_EMAIL") || "patriotnewsactivism@gmail.com"; // Testing email - change to JDFperformancemarine@gmail.com for production
  const BUSINESS_PHONE = Deno.env.get("BUSINESS_PHONE") || "845-787-4241";
  
  // Create a summary of the conversation
  const recentMessages = messages.slice(-6); // Last 6 messages
  const conversationSummary = recentMessages
    .map(m => `${m.role === 'user' ? 'Customer' : personaName}: ${m.content}`)
    .join('\n\n');
  
  const urgencyEmoji = leadQual.score === 'hot' ? '🔥🔥🔥' : '⚠️';
  const timeFrame = leadQual.score === 'hot' ? '⏰ RESPOND WITHIN 2 HOURS' : 'Follow up today';
  const subject = `${urgencyEmoji} ${leadQual.score.toUpperCase()} Lead - ${userInfo.name || 'New Customer'} - ${timeFrame}`;
  
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
            <strong>${m.role === 'user' ? '👤 Customer' : '🤝 ${personaName}'}:</strong><br>
            ${m.content}
          </div>
        `).join('')}
      </div>
    </div>
    
    ${leadQual.requiresFollowUp ? `
      <div style="text-align: center; margin: 30px 0; background: ${leadQual.score === 'hot' ? '#fee2e2' : '#fef3c7'}; padding: 20px; border-radius: 10px; border: 3px solid ${leadQual.score === 'hot' ? '#dc2626' : '#f59e0b'};">
        <p style="font-size: 22px; font-weight: bold; color: ${leadQual.score === 'hot' ? '#dc2626' : '#f59e0b'}; margin: 0 0 10px 0;">⏰ ${leadQual.score === 'hot' ? 'URGENT - ACTION REQUIRED NOW' : 'Action Required Today'}</p>
        <p style="font-size: 16px; margin: 0; color: #1f2937;">${leadQual.score === 'hot' ? 'Contact this lead within 2 hours for best results!' : 'Follow up with this lead today.'}</p>
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
  
  // Send email notification IMMEDIATELY if Resend API key is configured
  // HOT leads always get notified, WARM leads only if they require follow-up
  if (RESEND_API_KEY && (leadQual.score === 'hot' || (leadQual.score === 'warm' && leadQual.requiresFollowUp))) {
    try {
      console.log(`🚨 Sending ${leadQual.score.toUpperCase()} lead notification to ${BUSINESS_EMAIL}`, {
        customerName: userInfo.name,
        hasEmail: !!userInfo.email,
        hasPhone: !!userInfo.phone,
        leadScore: leadQual.score,
      });
      
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
      
      console.log(`✅ ${leadQual.score.toUpperCase()} lead notification sent successfully:`, emailResult);
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
    }
  } else if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured - lead saved but no email notification sent');
  }
  
  // Note: For SMS, you would integrate Twilio here
  // Keeping it simple for now - email notifications are the priority
}

// Add variation to responses to make them feel more human
function addResponseVariation(response: string): string {
  const fillers = [
    "", "", "", "",
    "Absolutely - ",
    "Great question! ",
    "Happy to jump in. ",
    "Sure thing - ",
    "Of course! ",
  ];

  const empathyTouches = [
    "",
    " I know how important it is to feel confident before you get back on the water.",
    " I really want this to feel easy for you.",
    " We care about keeping you out on the Hudson with peace of mind.",
    " You're not alone in this - our crew has your back.",
  ];

  const closings = [
    "", "", "", "",
    " Feel free to ask if you have any other questions!",
    " Let me know if you need anything else!",
    " Is there anything else I can help you with?",
    " I'm right here if something else pops up.",
  ];

  const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
  const randomEmpathy = empathyTouches[Math.floor(Math.random() * empathyTouches.length)];
  const randomClosing = closings[Math.floor(Math.random() * closings.length)];

  const segments = [randomFiller, response, randomEmpathy, randomClosing].filter(Boolean);
  const combined = segments.join("").replace(/ {2,}/g, " ");
  return combined.trim();
}

function ensureUniqueResponse(response: string, history: ChatMessage[], personaName: string): string {
  const normalized = response.trim().toLowerCase();
  const previousNormalized = history
    .filter((m) => m.role === "assistant")
    .map((m) => m.content.trim().toLowerCase());

  if (!previousNormalized.includes(normalized)) {
    return response;
  }

  const differentiators = [
    ` ${personaName} here, and I'm jotting all of this down for you.`,
    " I completely understand how stressful this can feel, and I'm on it.",
    " I'm going to flag this for the team with extra notes so nothing gets missed.",
    " I truly appreciate you sharing that detail - I'll make sure it gets the attention it deserves.",
    " You're in good hands with our crew, and I'm keeping an eye on every detail.",
  ];

  for (const addition of differentiators) {
    if (!addition) continue;
    if (response.includes(addition.trim())) continue;
    const augmented = `${response}${addition}`;
    if (!previousNormalized.includes(augmented.trim().toLowerCase())) {
      return augmented;
    }
  }

  const fallback = `${response} ${personaName} is here for you.`;
  if (previousNormalized.includes(fallback.trim().toLowerCase())) {
    return `${response} I'm right here for you.`;
  }
  return fallback;
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
    const personaPayload = payload?.persona || {};
    const persona = {
      firstName: typeof personaPayload.firstName === "string" && personaPayload.firstName.trim() ? personaPayload.firstName.trim() : "Jordan",
      role: typeof personaPayload.role === "string" && personaPayload.role.trim() ? personaPayload.role.trim() : "Service Specialist",
      tagline: typeof personaPayload.tagline === "string" && personaPayload.tagline.trim() ? personaPayload.tagline.trim() : "Here to help every step of the way",
    } as const;

    const message = typeof messageRaw === "string" ? messageRaw : "";
    const historyArray: Array<{ role: string; content: string }> = Array.isArray(historyRaw)
      ? historyRaw
      : [];

    console.log("Message:", message.substring(0, 50), "History length:", historyArray.length, "Persona:", persona.firstName);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
      console.error("No language model API keys configured");
      return new Response(
        JSON.stringify({
          response: "I'm sorry, our online support assistant isn't fully configured yet. Please call 845-787-4241 or email JDFperformancemarine@gmail.com and we'll take great care of you right away.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enhanced system prompt for persona-driven, empathetic lead qualification
    const systemPrompt = `You are ${persona.firstName}, the ${persona.role} at J.D.F. Performance Marine, a premier high-performance marine service shop in New Windsor, NY on the Hudson River.

YOUR IDENTITY & TONE:
- You are ${persona.firstName} speaking as a trusted human teammate. Never refer to yourself as AI, automated, virtual, or a bot.
- Lead with warmth, curiosity, and empathy. Sound like a caring professional who genuinely wants to help.
- ${persona.tagline}.
- Mirror the customer's urgency and emotions. Acknowledge frustrations, excitement, or concerns in plain language.

CONVERSATION MISSION:
Your primary job is to collect contact information (name, phone, email) from anyone showing interest in services while providing helpful, specific guidance about J.D.F. Performance Marine.

CONVERSATION FLOW:
1. If you do not yet know their name, ask for it warmly (the widget opens with a greeting that already requests their name, so follow up politely if they do not provide it).
2. Once you have a name, immediately use it and dig into their needs with thoughtful follow-up questions.
3. As soon as a service need or urgency is expressed, guide the conversation toward collecting phone and email so the team can respond quickly.
   - For repairs or urgent issues: show empathy first, then ask for the best phone number so the team can reach out right away.
   - For quotes or scheduling: reinforce that a specialist will follow up personally, then request phone and email together when it feels natural.
4. After securing phone and email, confirm what you captured and set expectations based on urgency (e.g., urgent = within a couple hours, otherwise same day).
5. If they hesitate to share contact info, explain the benefit (faster personalized help, no need to wait on hold) and gently try again later in the chat.
6. Never let a conversation end with a warm or hot lead without gathering both phone AND email unless the user flatly refuses.

SERVICE KNOWLEDGE:
- 30+ years of specialized marine mechanical expertise.
- Focus on high-performance service and racing, Mercury Racing/MerCruiser, Yamaha & Kawasaki Jet Ski service (2- and 4-stroke).
- Services include performance builds, repowers, outdrive rebuilds, diagnostics, winterizing & shrink wrap, dockside service, transportation, and more.
- Contact: Phone 845-787-4241, Email JDFperformancemarine@gmail.com, Instagram @jdf_marine, Location New Windsor, NY.

STYLE REQUIREMENTS:
- Give concrete, scenario-specific answers rather than generic statements.
- Use plain language with natural contractions, varied sentence lengths, and occasional marine-specific expertise.
- Always sound empathetic: acknowledge emotions, reassure them, and keep the dialogue collaborative.
- Vary your phrasing from message to message; avoid repeating the same sentences verbatim. Each reply must feel handcrafted.
- Keep most responses to 2-4 sentences unless deeper detail is needed.

LEAD QUALIFICATION SIGNALS:
- HOT: breakdowns, urgent repairs, ready-to-schedule conversations, pricing/quote requests.
- WARM: researching options, future planning, detailed service questions.
- COLD: casual browsing, general curiosity.

CONTACT CAPTURE REMINDERS:
- HOT lead or urgent issue: collect phone immediately, then email. Confirm timing for follow-up.
- WARM lead: collect contact info before ending conversation; offer proactive help.
- If user already provided one piece of info, politely request the other shortly after.

ETHICS & GUARANTEES:
- Never fabricate availability; instead, promise a prompt follow-up from the human team.
- Encourage direct contact only after you have the customer's info.
- If unsure, admit it and offer to have the team confirm when they reach out.

Remember: You're ${persona.firstName}, a compassionate, knowledgeable human from J.D.F. Performance Marine. Guide the conversation smoothly, gather the details the team needs, and make every answer feel personal.`;

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
    aiResponse = ensureUniqueResponse(aiResponse, messages, persona.firstName);

    // Extract user information from the conversation
    const allMessages = [...messages, { role: "assistant" as const, content: aiResponse }];
    const userInfo = extractUserInfo(allMessages);
    
    // Qualify the lead
    const leadQualification = qualifyLead(allMessages, userInfo);
    
    // SMART CONTACT INFO PROMPTING: Check if we should be collecting contact info
    const hasName = !!userInfo.name;
    const hasEmail = !!userInfo.email;
    const hasPhone = !!userInfo.phone;
    const messageCount = historyArray.length + 1; // Number of user messages
    
    // Check if user confirmed interest (said yes, ok, sure, etc.)
    const lastUserMessage = message.toLowerCase().trim();
    const confirmationWords = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'definitely', 'absolutely', 'please', 'interested'];
    const userConfirmedInterest = confirmationWords.some(word => lastUserMessage === word || lastUserMessage.startsWith(word + ' ') || lastUserMessage.endsWith(' ' + word));
    
    // Check if we just collected both phone and email - add confirmation message
    const justGotPhone = hasPhone && !hasEmail && message.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
    const justGotEmail = hasEmail && message.includes('@');
    
    // If we just got both pieces of info, add appropriate confirmation
    if (hasName && hasPhone && hasEmail && (justGotPhone || justGotEmail)) {
      const userName = userInfo.name || 'there';
      if (leadQualification.score === 'hot') {
        aiResponse += `\n\nPerfect! I have your information. Our service team will reach out to you within a couple hours to get you taken care of. Is there anything else I can help you understand in the meantime?`;
      } else {
        aiResponse += `\n\nGreat! I have your contact details. Our team will follow up with you soon. Is there anything else I can help you with?`;
      }
    }
    // Override AI response if they confirmed interest but we don't have contact info
    else if (userConfirmedInterest && hasName && (!hasPhone || !hasEmail)) {
      if (!hasPhone && !hasEmail) {
        aiResponse = `Perfect! Let me have our service manager reach out to you directly. What's the best phone number to reach you at?`;
      } else if (!hasEmail) {
        aiResponse = `Great! And what's your email address so we can send you confirmation and details?`;
      } else if (!hasPhone) {
        aiResponse = `Excellent! And what's the best phone number to contact you at?`;
      }
    }
    // If hot/warm lead but missing contact info after several messages, prompt
    else if ((leadQualification.score === 'hot' || leadQualification.score === 'warm') && 
             hasName && messageCount >= 3 && (!hasPhone || !hasEmail)) {
      if (!hasPhone && !hasEmail) {
        // Add contact request to end of response
        aiResponse += `\n\nSo I can have our team follow up with you directly, what's the best phone number to reach you?`;
      } else if (!hasEmail) {
        aiResponse += ` And what's your email address for confirmation?`;
      } else if (!hasPhone) {
        aiResponse += ` What's the best number to call you at?`;
      }
    }
    
    console.log("Lead qualification:", leadQualification);
    console.log("User info extracted:", userInfo);

    // Save or update conversation in database for warm/hot leads
    if (leadQualification.score !== 'cold' || userInfo.email || userInfo.phone || userInfo.name) {
      try {
        // Check if conversation exists (use maybeSingle to avoid error when not found)
        const { data: existingConvo } = await supabase
          .from('conversations')
          .select('id')
          .eq('session_id', sessionId)
          .maybeSingle();

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
        // For HOT leads, send notification even without full contact info (to alert about missed opportunity)
        const shouldNotify = conversationId && leadQualification.requiresFollowUp && 
          (leadQualification.score === 'hot' || (userInfo.email || userInfo.phone));
        
        if (shouldNotify) {
          // Check if notification already sent (use maybeSingle to avoid error when not found)
          const { data: existingNotification } = await supabase
            .from('lead_notifications')
            .select('id')
            .eq('conversation_id', conversationId)
            .maybeSingle();

          if (!existingNotification) {
            await sendLeadNotification(
              conversationId,
              userInfo,
              leadQualification,
              allMessages,
              persona.firstName,
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
