import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

interface Segment {
  speaker?: string;
  text: string;
  start_time?: number;
  end_time?: number;
  confidence?: number;
}

interface Transcription {
  id: string;
  transcription_text: string;
  segments?: Segment[];
  audio_url?: string;
  confidence?: number;
  created_at: string;
  metadata?: {
    language?: string;
    duration?: number;
  };
}

interface TranscriptionViewerProps {
  transcription: Transcription;
}

export default function TranscriptionViewer({ transcription }: TranscriptionViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const downloadSRT = () => {
    if (!transcription.segments || transcription.segments.length === 0) {
      // Simple SRT with single segment
      const srt = `1\n00:00:00,000 --> 00:00:10,000\n${transcription.transcription_text}\n`;
      const blob = new Blob([srt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription_${transcription.id}.srt`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Generate SRT from segments
    const srt = transcription.segments
      .map((segment, idx) => {
        const start = formatTime(segment.start_time || 0);
        const end = formatTime(segment.end_time || 0);
        return `${idx + 1}\n${start} --> ${end}\n${segment.text}\n`;
      })
      .join('\n');

    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${transcription.id}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadVTT = () => {
    if (!transcription.segments || transcription.segments.length === 0) {
      const vtt = `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n${transcription.transcription_text}`;
      const blob = new Blob([vtt], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription_${transcription.id}.vtt`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const vtt = `WEBVTT\n\n${transcription.segments
      .map((segment) => {
        const start = formatTime(segment.start_time || 0);
        const end = formatTime(segment.end_time || 0);
        return `${start} --> ${end}\n${segment.text}`;
      })
      .join('\n\n')}`;

    const blob = new Blob([vtt], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${transcription.id}.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const json = JSON.stringify(transcription, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${transcription.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Audio Transcriptie</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={downloadSRT}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              SRT
            </Button>
            <Button
              onClick={downloadVTT}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              VTT
            </Button>
            <Button
              onClick={downloadJSON}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Audio Player */}
        {transcription.audio_url && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="icon"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <audio
                ref={audioRef}
                src={transcription.audio_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <div className="flex-1">
                <div className="text-white/70 text-sm mb-1">
                  Audio Opname
                  {transcription.metadata?.duration && (
                    <span className="ml-2">
                      ({Math.floor(transcription.metadata.duration / 60)}:
                      {String(Math.floor(transcription.metadata.duration % 60)).padStart(2, '0')})
                    </span>
                  )}
                </div>
                {transcription.confidence && (
                  <div className="text-white/50 text-xs">
                    Betrouwbaarheid: {Math.round(transcription.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Transcription */}
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-3">Volledige Tekst</h3>
          <div className="p-4 bg-black/30 rounded-lg">
            <p className="text-white/80 leading-relaxed whitespace-pre-line">
              {transcription.transcription_text}
            </p>
          </div>
        </div>

        {/* Segments with Timestamps */}
        {transcription.segments && transcription.segments.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">Tijdstempels & Segmenten</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transcription.segments.map((segment, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg transition-colors ${
                    segment.start_time && segment.end_time && 
                    currentTime >= segment.start_time && 
                    currentTime <= segment.end_time
                      ? 'bg-primary/20 border-l-4 border-primary'
                      : 'bg-white/5 border-l-4 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    {segment.start_time !== undefined && (
                      <span className="text-primary text-xs font-mono">
                        {formatTime(segment.start_time)}
                      </span>
                    )}
                    {segment.speaker && (
                      <span className="text-white/70 text-xs font-semibold">
                        {segment.speaker}
                      </span>
                    )}
                    {segment.confidence !== undefined && (
                      <span className="text-white/50 text-xs">
                        {Math.round(segment.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 text-sm">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-white/50 text-xs">
            <div>Taal: {transcription.metadata?.language || 'Nederlands'}</div>
            <div>Gemaakt: {new Date(transcription.created_at).toLocaleString('nl-NL')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}