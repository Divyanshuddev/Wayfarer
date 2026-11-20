"use client";

import { Check, Mic, Pause, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcript: string) => void;
}

export function VoiceRecorder({ onTranscriptionComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulated animated audio waveform
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 36;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        let height = 4;
        if (isRecording && !isPaused) {
          const time = Date.now() * 0.005;
          const noise = Math.sin(time + i * 0.4) * 0.5 + 0.5;
          height = Math.max(4, noise * (canvas.height - 8));
        }

        ctx.fillStyle = isRecording
          ? "rgba(168, 85, 247, 0.85)"
          : "rgba(107, 114, 128, 0.3)";
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;
        ctx.fillRect(x + 1, y, barWidth - 2, height);
      }

      animId = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();
    return () => cancelAnimationFrame(animId);
  }, [isRecording, isPaused]);

  // Timer counter
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioUrl(null);
    setTranscript("");
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    // Create simulated recording blob url
    const simulatedAudio = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    setAudioUrl(simulatedAudio);

    // Auto-transcribe simulation / whisper
    transcribeAudio();
  };

  const transcribeAudio = () => {
    setIsTranscribing(true);
    setTimeout(() => {
      const simulatedTranscripts = [
        "Met with Alex at the roastery. We were discussing vector embeddings and how temporal decay should be factored into retrieval models. Remind me to send him the prototype by Friday.",
        "Just walked through Giou-ji temple after the rain. The moss garden had this profound stillness that felt almost alive. Remember the gardener mentioning 120 moss species.",
        "Idea for interface design: Negative space shouldn't just be white emptiness; it acts like musical silence between notes, giving memory space to breathe.",
      ];
      const selected = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
      setTranscript(selected);
      onTranscriptionComplete(selected);
      setIsTranscribing(false);
    }, 1200);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 rounded-xl bg-[#11101b] border border-[#232038] space-y-4">
      {/* Waveform Visualization */}
      <div className="relative h-16 w-full bg-[#0a0912] rounded-lg border border-[#1d1b2e] flex items-center justify-center px-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={360}
          height={60}
          className="w-full h-full"
        />
        <div className="absolute top-2 right-3 flex items-center gap-1.5 text-xs font-mono-retro text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/50">
          <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-rose-500 animate-ping" : "bg-gray-500"}`} />
          <span>{formatTime(recordingTime)}</span>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 py-2 px-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>Record Voice Note</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={pauseRecording}
              className="p-2.5 rounded-full bg-[#1e1c2e] hover:bg-[#28253e] text-purple-300 border border-purple-500/30 transition-all"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 py-2 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Finish & Transcribe</span>
            </button>
          </>
        )}

        {audioUrl && !isRecording && (
          <button
            type="button"
            onClick={startRecording}
            className="p-2 rounded-full bg-[#181628] text-gray-400 hover:text-gray-200"
            title="Record again"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Transcription Status & Output */}
      {isTranscribing && (
        <div className="flex items-center justify-center gap-2 text-xs font-mono-retro text-purple-400 animate-pulse py-2">
          <Volume2 className="w-4 h-4" />
          <span>Whisper-1 Transcribing audio stream...</span>
        </div>
      )}

      {transcript && !isTranscribing && (
        <div className="p-3 rounded-lg bg-[#0e0d16] border border-purple-900/40 text-xs text-gray-300 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono-retro text-purple-400">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Transcribed via Whisper
            </span>
            <span>Audio attached</span>
          </div>
          <p className="italic font-serif leading-relaxed text-gray-200">
            &ldquo;{transcript}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
