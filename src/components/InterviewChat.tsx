import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { StartScreen } from "@/components/StartScreen";
import interviewerImg from "@/assets/interviewer-clean.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle voice recognition transcript - auto send when done
  useEffect(() => {
    if (transcript && !isListening) {
      handleSendMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening]);

  // Auto-listen after AI speaks
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && !isLoading && !isSpeaking && hasStarted) {
      // Speak the message first, then auto-start listening
      speak(lastMessage.content, () => {
        // Small delay before starting to listen
        setTimeout(() => {
          startListening();
        }, 500);
      });
    }
  }, [messages, isLoading]);

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Er is een fout opgetreden");
      }

      if (!resp.body) throw new Error("Geen response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || isLoading) return;

    stopSpeaking(); // Stop any current speech
    stopListening(); // Stop listening

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleStart = async () => {
    setHasStarted(true);
    // Start with initial greeting
    await handleSendMessage("Hallo!");
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  const currentStatus = isLoading 
    ? "Aan het denken..." 
    : isSpeaking 
    ? "Aan het praten..." 
    : isListening 
    ? "Luisteren naar je antwoord..." 
    : "Klaar";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex flex-col items-center justify-center p-4">
      {/* Main Character Display */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full">
        {/* Character */}
        <div className="relative mb-8">
          <div 
            className={`
              relative transition-all duration-300 
              ${isSpeaking ? 'scale-105' : 'scale-100'}
            `}
          >
            <img
              src={interviewerImg}
              alt="AI Interviewer"
              className="w-full max-w-2xl rounded-2xl"
            />
            
            {/* Speaking Animation Overlay */}
            {isSpeaking && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
                <div className="absolute inset-0 rounded-2xl shadow-glow" />
              </>
            )}
            
            {/* Listening Indicator */}
            {isListening && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg animate-pulse">
                  <Mic className="h-4 w-4" />
                  <span className="text-sm font-medium">Aan het luisteren...</span>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="text-center mt-6">
            <p className="text-lg font-medium text-muted-foreground">
              {currentStatus}
            </p>
          </div>
        </div>

        {/* Transcript Display */}
        <Card className="w-full max-w-2xl p-4 bg-card/80 backdrop-blur">
          <div className="max-h-32 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Het gesprek begint zo...
              </p>
            ) : (
              <div className="space-y-2">
                {messages.slice(-3).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-sm ${
                      msg.role === "user" 
                        ? "text-right text-foreground" 
                        : "text-left text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">
                      {msg.role === "user" ? "Jij: " : "Interviewer: "}
                    </span>
                    <span>{msg.content}</span>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>
      </div>
    </div>
  );
};
