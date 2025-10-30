import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Generate a unique session ID for this conversation
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm the AI assistant for J.D.F. Performance Marine. Who do I have the pleasure of helping today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add a more human-like delay before "typing" starts (random between 800-1500ms)
      const initialDelay = 800 + Math.random() * 700;
      await new Promise(resolve => setTimeout(resolve, initialDelay));

      const { data, error } = await supabase.functions.invoke("marine-chat", {
        body: { 
          message: userMessage, 
          history: messages,
          sessionId: sessionId,
        },
      });

      if (error) throw error;
      
      // Check if the response contains an error
      if (data?.error) {
        throw new Error(data.error);
      }
      
      // Check if response is missing
      if (!data?.response) {
        throw new Error("No response received from AI assistant");
      }

      // Longer typing delay based on response length (more realistic)
      // Average typing speed: ~40 words per minute for thoughtful responses
      const wordCount = data.response.split(' ').length;
      const baseTypingTime = Math.min(wordCount * 150, 4000); // Cap at 4 seconds
      const randomVariation = Math.random() * 1000; // Add 0-1 second variation
      const typingDelay = baseTypingTime + randomVariation;
      
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      const errorMessage = error instanceof Error ? error.message : "Sorry, I'm having trouble responding. Please try again.";
      toast.error(errorMessage);
      
      // Add a fallback message to chat
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I apologize, but I'm experiencing technical difficulties. Please try again later or contact us directly at 845-787-4241 for immediate assistance." 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button - Fancy floating button with pulse animation */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse opacity-75"></div>
            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 rounded-full shadow-2xl shadow-primary/50 hover:shadow-primary/70 transition-all duration-300 hover:scale-110 bg-gradient-to-br from-primary via-primary to-secondary border-2 border-white/20 backdrop-blur-sm group overflow-hidden"
              size="icon"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <MessageCircle className="h-7 w-7 relative z-10 drop-shadow-lg" />
              <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Window - Glassmorphism design */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] z-50 animate-in slide-in-from-bottom-8 duration-300">
          <div className="h-full bg-gradient-to-br from-card/95 via-card/98 to-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden relative">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary via-primary to-secondary p-5 flex items-center justify-between text-primary-foreground shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-md"></div>
                  <MessageCircle className="h-6 w-6 relative z-10 drop-shadow-md" />
                </div>
                <div>
                  <h3 className="font-bold text-lg drop-shadow-sm">AI Marine Assistant</h3>
                  <p className="text-xs text-primary-foreground/90 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Smart & Ready to Help
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110 hover:rotate-90"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6 relative z-10" ref={scrollRef}>
              <div className="space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-in fade-in slide-in-from-bottom-4 duration-300`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-4"
                          : "bg-gradient-to-br from-muted to-muted/80 text-foreground border border-border/50"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <Sparkles className="h-3 w-3" />
                          <span className="text-xs font-semibold">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="bg-gradient-to-br from-muted to-muted/80 border border-border/50 rounded-2xl p-4 shadow-md">
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs font-semibold">AI Assistant</span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm relative z-10">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about marine services..."
                    disabled={isLoading}
                    className="pr-4 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-br from-primary to-secondary disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Powered by intelligent AI • Real-time assistance
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
