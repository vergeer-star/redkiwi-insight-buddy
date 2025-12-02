import { useState, useEffect, useRef } from "react";
import { StartScreen } from "@/components/StartScreen";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Share2, Mic } from "lucide-react";
import redkiwiLogo from "@/assets/redkiwi-logo-new.png";
import StreamingAvatar, { 
  AvatarQuality, 
  StreamingEvents, 
  TaskMode, 
  TaskType,
  VoiceEmotion 
} from "@heygen/streaming-avatar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
export const InterviewChat = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [heygenSessionId, setHeygenSessionId] = useState<string>(""); // HeyGen's actual session ID
  const [interviewId, setInterviewId] = useState<string>("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [isRedkiwiEmployee, setIsRedkiwiEmployee] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Array<{role: string, content: string}>>([]);
  
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const mediaStreamRef = useRef<HTMLVideoElement | null>(null);
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Fixed avatar configuration
  const AVATAR_ID = "Katya_Chair_Sitting_public";
  const AVATAR_NAME = "Maiya";
  const KNOWLEDGE_BASE_ID = "201fdd712b2440b6b6eb47bc5f9606b0";

  // Check if user is a RedKiwi employee
  useEffect(() => {
    const checkEmployee = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.email?.endsWith('@redkiwi.nl')) {
          setIsRedkiwiEmployee(true);
        }
      }
    };
    checkEmployee();
  }, []);

  useEffect(() => {
    if (!hasStarted || !interviewId) return;

    const initializeAvatar = async () => {
      try {
        setIsLoadingAvatar(true);
        console.log('[HEYGEN SDK] Initializing avatar...');

        // Get access token from our edge function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('heygen-token');
        
        if (tokenError || !tokenData?.data?.token) {
          console.error('[HEYGEN SDK] Token error:', tokenError);
          throw new Error('Failed to get HeyGen token');
        }
        
        console.log('[HEYGEN SDK] Token received');
        // Initialize avatar
        const avatar = new StreamingAvatar({ token: tokenData.data.token });
        avatarRef.current = avatar;

        // Set up video stream BEFORE other events
        avatar.on(StreamingEvents.STREAM_READY, (event) => {
          console.log('[HEYGEN SDK] Stream ready, attaching to video element');
          if (event.detail && mediaStreamRef.current) {
            mediaStreamRef.current.srcObject = event.detail;
            mediaStreamRef.current.onloadedmetadata = () => {
              mediaStreamRef.current?.play().catch(e => {
                console.error('[HEYGEN SDK] Error playing video:', e);
              });
            };
            console.log('[HEYGEN SDK] Video stream attached successfully');
          }
        });

        avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
          console.log('[HEYGEN SDK] Stream disconnected');
          if (mediaStreamRef.current) {
            mediaStreamRef.current.srcObject = null;
          }
        });

        // Set up event listeners BEFORE starting session
        avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
          console.log('[HEYGEN SDK] Avatar started talking', e);
          setIsAvatarSpeaking(true);
        });

        avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
          console.log('[HEYGEN SDK] Avatar stopped talking', e);
          setIsAvatarSpeaking(false);
          // Start listening when avatar stops talking
          if (!isListening) {
            console.log('[SPEECH] Starting to listen for user input');
            setTimeout(() => startListening(), 500);
          }
        });

        avatar.on(StreamingEvents.USER_START, (e) => {
          console.log('[HEYGEN SDK] User started talking', e);
        });

        avatar.on(StreamingEvents.USER_STOP, (e) => {
          console.log('[HEYGEN SDK] User stopped talking', e);
        });

        // Critical: Listen for ALL message events from HeyGen and save them
        avatar.on(StreamingEvents.USER_TALKING_MESSAGE, async (message) => {
          console.log('[HEYGEN SDK] User talking message received:', message);
          
          // Always try to extract and save the message
          const messageText = message?.message || message?.detail?.message || '';
          
          if (!messageText || !messageText.trim()) {
            console.log('[HEYGEN SDK] Empty or invalid user message, skipping');
            return;
          }

          const cleanMessage = messageText.trim();
          console.log('[HEYGEN SDK] Saving user message:', cleanMessage);

          try {
            const { error } = await supabase
              .from('interview_messages')
              .insert({
                interview_id: interviewId,
                role: 'user',
                content: cleanMessage,
                timestamp: new Date().toISOString()
              });

            if (error) {
              console.error('[HEYGEN SDK] ❌ Failed to save user message:', error);
            } else {
              console.log('[HEYGEN SDK] ✓ User message saved to database');
            }
          } catch (error) {
            console.error('[HEYGEN SDK] ❌ Exception saving user message:', error);
          }
        });

        avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, async (message) => {
          console.log('[HEYGEN SDK] Avatar talking message received:', message);
          
          // Always try to extract and save the message
          const messageText = message?.message || message?.detail?.message || '';
          
          if (!messageText || !messageText.trim()) {
            console.log('[HEYGEN SDK] Empty or invalid avatar message, skipping');
            return;
          }

          const cleanMessage = messageText.trim();
          console.log('[HEYGEN SDK] Saving avatar message:', cleanMessage);

          try {
            const { error } = await supabase
              .from('interview_messages')
              .insert({
                interview_id: interviewId,
                role: 'assistant',
                content: cleanMessage,
                timestamp: new Date().toISOString()
              });

            if (error) {
              console.error('[HEYGEN SDK] ❌ Failed to save avatar message:', error);
            } else {
              console.log('[HEYGEN SDK] ✓ Avatar message saved to database');
            }
          } catch (error) {
            console.error('[HEYGEN SDK] ❌ Exception saving avatar message:', error);
          }
        });

        // Start avatar session
        const sessionData = await avatar.createStartAvatar({
          quality: AvatarQuality.High,
          avatarName: AVATAR_ID,
          knowledgeBase: KNOWLEDGE_BASE_ID,
          voice: {
            rate: 1.0,
            emotion: VoiceEmotion.FRIENDLY
          },
          language: 'nl',
          disableIdleTimeout: false
        });

        console.log('[HEYGEN SDK] Session created:', sessionData);
        setHeygenSessionId(sessionData.session_id);
        
        // Request microphone permissions explicitly
        console.log('[HEYGEN SDK] Requesting microphone permissions');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('[HEYGEN SDK] Microphone access granted');
          // Stop the test stream, HeyGen SDK will handle the actual audio
          stream.getTracks().forEach(track => track.stop());
        } catch (micError) {
          console.error('[HEYGEN SDK] Microphone permission denied:', micError);
          toast({
            title: "Microfoon toegang vereist",
            description: "Geef toegang tot je microfoon om het interview te starten",
            variant: "destructive"
          });
          throw micError;
        }
        
        setIsLoadingAvatar(false);
        console.log('[HEYGEN SDK] Avatar initialized successfully');

        // Start the conversation with an initial greeting
        console.log('[HEYGEN SDK] Starting initial conversation');
        await avatar.speak({
          text: "Hallo! Welkom bij dit interview. Ik ben Maiya en ik ga je vandaag een aantal vragen stellen. Laten we beginnen. Kun je jezelf kort voorstellen?",
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC
        });
        
        console.log('[HEYGEN SDK] Greeting completed, ready for conversation');

      } catch (error) {
        console.error('[HEYGEN SDK] Error initializing avatar:', error);
        setIsLoadingAvatar(false);
        toast({
          title: "Fout",
          description: "Kon avatar niet laden",
          variant: "destructive"
        });
      }
    };

    initializeAvatar();

    return () => {
      console.log('[HEYGEN SDK] Cleaning up avatar');
      if (avatarRef.current) {
        avatarRef.current.stopAvatar();
        avatarRef.current = null;
      }
    };
  }, [hasStarted, interviewId]);

  // Handle speech recognition transcript
  useEffect(() => {
    if (transcript && !isAvatarSpeaking) {
      console.log('[SPEECH] User said:', transcript);
      handleUserSpeech(transcript);
      resetTranscript();
    }
  }, [transcript, isAvatarSpeaking]);

  const handleUserSpeech = async (userText: string) => {
    if (!userText.trim() || !interviewId) return;

    stopListening();
    console.log('[CONVERSATION] Processing user input:', userText);

    // Add to conversation history (only clean user text)
    const updatedMessages = [...conversationMessages, { role: 'user', content: userText }];
    setConversationMessages(updatedMessages);

    try {
      // Send to AI for response (edge function will save to DB)
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          messages: updatedMessages,
          interviewId: interviewId
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      // Parse streaming response to extract ONLY text content
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let cleanText = '';
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr) {
                  const data = JSON.parse(jsonStr);
                  const content = data.choices?.[0]?.delta?.content;
                  if (content && typeof content === 'string') {
                    cleanText += content;
                  }
                }
              } catch (e) {
                // Skip malformed JSON
              }
            }
          }
        }
      }

      console.log('[CONVERSATION] Clean AI response:', cleanText);

      if (!cleanText.trim()) {
        throw new Error('Geen tekstuele response ontvangen');
      }

      // Update conversation history with ONLY clean text
      setConversationMessages([...updatedMessages, { role: 'assistant', content: cleanText.trim() }]);

      // Make avatar speak ONLY the clean text (max 4900 chars)
      if (avatarRef.current) {
        const textToSpeak = cleanText.trim().substring(0, 4900);
        console.log('[AVATAR] Speaking text (length:', textToSpeak.length, '):', textToSpeak.substring(0, 100) + '...');
        await avatarRef.current.speak({
          text: textToSpeak,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC
        });
      }

    } catch (error) {
      console.error('[CONVERSATION] Error processing response:', error);
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Kon antwoord niet verwerken",
        variant: "destructive"
      });
      // Resume listening even on error
      startListening();
    }
  };

  const handleChecklistComplete = async () => {
    // Pre-generate IDs to avoid RLS SELECT on return
    const newInterviewId = crypto.randomUUID();
    const newSessionId = crypto.randomUUID();

    console.log('[INTERVIEW] Starting new interview:', { interviewId: newInterviewId, sessionId: newSessionId });

    // Set locally so UI and embed can initialize immediately
    setInterviewId(newInterviewId);
    setSessionId(newSessionId);
    setHasStarted(true);

    // Save interview session to the backend without requesting a representation
    try {
      console.log('[INTERVIEW] Saving interview to database');
      const { error } = await supabase
        .from('interviews')
        .insert({
          id: newInterviewId,
          session_id: newSessionId,
          avatar_name: AVATAR_NAME,
          avatar_url: AVATAR_ID,
          status: 'started',
        });

      if (error) {
        console.error('[INTERVIEW] Failed to save interview:', error);
        throw error;
      }
      console.log('[INTERVIEW] Interview saved successfully');
    } catch (error) {
      console.error('[INTERVIEW] Error saving interview:', error);
      toast({
        title: "Fout",
        description: "Kon interview sessie niet opslaan",
        variant: "destructive",
      });
    }
  };
  const handleEndInterview = async () => {
    console.log('[INTERVIEW] Ending interview:', interviewId);
    
    // Update interview status to completed
    if (interviewId) {
      try {
        console.log('[INTERVIEW] Updating interview status to completed');
        await supabase.from('interviews').update({
          status: 'completed',
          ended_at: new Date().toISOString()
        }).eq('id', interviewId);
        console.log('[INTERVIEW] Interview marked as completed');

        // Trigger AI analysis of the interview
        toast({
          title: "Interview beëindigd",
          description: "Je antwoorden worden nu geanalyseerd..."
        });

        // Analyze the interview based on stored messages
        const processInterview = async () => {
          try {
            console.log("[PROCESS] Starting interview processing");
            console.log(`[PROCESS] HeyGen session ID: ${heygenSessionId || 'none'}, Fallback: ${sessionId}`);
            
            // Call transcribe-audio edge function to fetch HeyGen recording
            console.log("[PROCESS] Attempting to fetch HeyGen recording for transcription");
            const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe-audio', {
              body: {
                interviewId,
                sessionId: heygenSessionId || sessionId,
                fallbackSessionId: sessionId
              }
            });

            if (transcribeError) {
              console.error('[PROCESS] Error transcribing interview:', transcribeError);
              toast({
                title: "Transcriptie fout",
                description: "Audio kon niet worden getranscribeerd",
                variant: "destructive"
              });
            } else {
              console.log('[PROCESS] Transcription completed:', transcribeData);
            }
            
            console.log('[PROCESS] Starting interview analysis');

            // Then analyze the interview
            const { data, error } = await supabase.functions.invoke('analyze-interview', {
              body: {
                interviewId
              }
            });

            if (error) {
              console.error('[PROCESS] Error analyzing interview:', error);
              toast({
                title: "Analyse fout",
                description: "Er is een fout opgetreden bij het analyseren",
                variant: "destructive"
              });
            } else {
              console.log('[PROCESS] Interview analysis completed:', data);
            }
          } catch (err) {
            console.error('[PROCESS] Error processing interview:', err);
          }
        };

        processInterview();
      } catch (error) {
        console.error('Error updating interview:', error);
      }
    }

    // Stop avatar
    if (avatarRef.current) {
      await avatarRef.current.stopAvatar();
    }
    
    // Show thank you page
    setShowThankYou(true);
  };

  const handleBack = () => {
    // Clean up interviewer widget without marking as completed
    const widget = document.getElementById("heygen-streaming-embed");
    if (widget) widget.remove();
    
    // Navigate back to homepage
    setHasStarted(false);
    setSessionId("");
    setInterviewId("");
  };
  const handleReturnToStart = () => {
    setShowThankYou(false);
    setHasStarted(false);
    setSessionId("");
    setInterviewId("");
  };
  if (showThankYou) {
    return <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Subtle diagonal pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        <div className="relative z-10 text-center px-8 max-w-2xl flex flex-col items-center">
          <a 
            href="https://www.redkiwi.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block transition-transform duration-300 hover:scale-110 mb-8"
          >
            <img src={redkiwiLogo} alt="RedKiwi Logo" className="h-24 mx-auto" />
          </a>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bedankt voor je deelname!
          </h1>
          
          <p className="text-xl text-white/80 mb-8">Je hebt succesvol deelgenomen aan een AI-Interview. Jouw antwoorden helpen Redkiwi verbeteren.</p>
          
          <div className="flex flex-col gap-4 items-center">
            <Button 
              onClick={() => {
                navigator.share({ 
                  title: 'AI Interview met RedKiwi', 
                  text: 'Doe mee met het AI Interview van RedKiwi!',
                  url: window.location.origin 
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.origin);
                  toast({ title: "Link gekopieerd!", description: "De link is naar je klembord gekopieerd." });
                });
              }}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Share2 size={20} />
              Deel deze website
            </Button>
            <Button 
              onClick={handleReturnToStart} 
              variant="ghost"
              className="text-white/60 hover:text-white/80 hover:bg-white/5 px-8 py-6 text-lg rounded-lg transition-all duration-300"
            >
              Terug naar start
            </Button>
          </div>
        </div>
      </div>;
  }
  if (!hasStarted) {
    return <StartScreen onStart={handleChecklistComplete} />;
  }
  return <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Loading Screen */}
      {isLoadingAvatar && (
        <div className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Maiya wordt geladen...</h2>
            <p className="text-white/60">Een moment geduld, het interview start zo</p>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <button onClick={handleBack} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white font-bold text-sm tracking-wide uppercase transition-all duration-300 hover:scale-105 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Terug
          </button>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center whitespace-nowrap">
              Interview met <span className="text-primary">{AVATAR_NAME}</span>
            </h2>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleEndInterview} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300">
              Eindig interview
            </Button>
          </div>
        </div>
      </div>

      {/* Tips Sidebar - positioned to the right of avatar */}
      <div className="fixed left-[calc(50%+420px)] top-1/2 -translate-y-1/2 z-[9990] w-72 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">
            Interview Tips
          </h3>
        </div>
        <ul className="text-white/80 text-sm space-y-3">
          <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Zorg dat er geen achtergrondgeluiden zijn</span>
          </li>
          <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Spreek duidelijk en articuleer goed</span>
          </li>
          <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Vergeet niet de juiste taal te selecteren</span>
          </li>
          <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Je kunt het interview altijd beëindigen via de knop rechtsboven</span>
          </li>
        </ul>
      </div>

      {/* Avatar Video */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] z-[9995]">
        <video
          ref={mediaStreamRef}
          autoPlay
          playsInline
          className="w-full h-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] object-cover"
        />
        
        {/* Status Indicators */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-white/80">Opnemen</span>
          </div>
          
          {isAvatarSpeaking && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary font-medium">Avatar spreekt...</span>
            </div>
          )}
          
          {isListening && !isAvatarSpeaking && (
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">Aan het luisteren...</span>
            </div>
          )}
        </div>
      </div>
    </div>;
};