import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { StartScreen } from "@/components/StartScreen";
import interviewerImg from "@/assets/interviewer-with-logo.png";
import interviewerListening from "@/assets/interviewer-listening.png";
import redkiwiLogo from "@/assets/redkiwi-logo.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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
    if (transcript && !isListening && !isPaused) {
      handleSendMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, isPaused]);

  // Auto-listen after AI speaks
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && !isLoading && !isSpeaking && hasStarted && !isPaused) {
      // Speak the message first, then auto-start listening
      speak(lastMessage.content, () => {
        // Small delay before starting to listen
        setTimeout(() => {
          if (!isPaused) {
            startListening();
          }
        }, 500);
      });
    }
  }, [messages, isLoading, isPaused]);

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
    if (!textToSend || isLoading || isPaused) return;

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

  const togglePause = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant") {
        // Resume by starting to listen
        setTimeout(() => startListening(), 300);
      }
    } else {
      // Pause
      setIsPaused(true);
      stopSpeaking();
      stopListening();
    }
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  const currentStatus = isPaused
    ? "Gepauzeerd"
    : isLoading 
    ? "Aan het denken..." 
    : isSpeaking 
    ? "Aan het praten..." 
    : isListening 
    ? "Luisteren naar je antwoord..." 
    : "Klaar";

  // Choose image based on state
  const characterImage = isListening ? interviewerListening : interviewerImg;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex flex-col">
      {/* Header with logo */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <img src={redkiwiLogo} alt="Redkiwi" className="h-8" />
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePause}
              variant={isPaused ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  <span>Hervatten</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pauzeren</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Character Display */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto p-4">
        {/* Character */}
        <div className="relative mb-8">
          <div 
            className={`
              relative transition-all duration-300
              ${isSpeaking ? 'animate-[speaking-pulse_1s_ease-in-out_infinite]' : ''}
              ${!isSpeaking && !isListening ? 'animate-[idle-sway_4s_ease-in-out_infinite]' : ''}
              ${isListening ? 'animate-[subtle-bounce_2s_ease-in-out_infinite]' : ''}
              ${isPaused ? 'opacity-60' : 'opacity-100'}
            `}
          >
            <img
              src={characterImage}
              alt="AI Interviewer"
              className="w-full max-w-2xl rounded-2xl transition-all duration-500"
            />
            
            {/* Speaking Animation Overlay */}
            {isSpeaking && !isPaused && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
                <div className="absolute inset-0 rounded-2xl shadow-glow" />
              </>
            )}
            
            {/* Listening Indicator */}
            {isListening && !isPaused && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg animate-pulse">
                  <Mic className="h-4 w-4" />
                  <span className="text-sm font-medium">Aan het luisteren...</span>
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {isPaused && (
              <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-card p-4 rounded-lg shadow-lg">
                  <Pause className="h-12 w-12 text-muted-foreground" />
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
        <Card className="w-full max-w-2xl p-4 bg-card/90 backdrop-blur-sm shadow-soft">
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
