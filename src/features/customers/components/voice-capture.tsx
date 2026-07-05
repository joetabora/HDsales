"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VoiceCaptureProps {
  customerId: string;
  onComplete?: (result: { summary: string; extractedFacts: Record<string, string> }) => void;
}

export function VoiceCapture({ customerId, onComplete }: VoiceCaptureProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState<{
    transcript: string;
    summary: string;
    extractedFacts: Record<string, string>;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setProcessing(true);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("customerId", customerId);
        formData.append("audio", blob, "recording.webm");

        try {
          const res = await fetch("/api/voice", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            setResult({
              transcript: data.transcription,
              summary: data.extraction.summary,
              extractedFacts: data.extraction.extractedFacts,
            });
            onComplete?.({
              summary: data.extraction.summary,
              extractedFacts: data.extraction.extractedFacts,
            });
          }
        } finally {
          setProcessing(false);
          setDuration(0);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setResult(null);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      alert("Microphone access is required for voice capture.");
    }
  }

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="h-5 w-5 text-forge-accent" />
          Voice Capture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4 py-4">
          <motion.div
            animate={recording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={recording ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            <Button
              size="lg"
              variant={recording ? "destructive" : "default"}
              className="h-16 w-16 rounded-full"
              onClick={recording ? stopRecording : startRecording}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : recording ? (
                <Square className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </motion.div>

          {recording && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-sm font-mono text-forge-muted">{formatDuration(duration)}</span>
              <span className="text-xs text-forge-muted">Recording… tap to stop</span>
            </div>
          )}

          {!recording && !processing && !result && (
            <p className="text-xs text-forge-muted text-center max-w-xs">
              Record a walk-around note. Forge will transcribe and extract key facts automatically.
            </p>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 border-t border-forge-border pt-4"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-forge-muted mb-1">
                  Summary
                </p>
                <p className="text-sm text-forge-muted-foreground">{result.summary}</p>
              </div>

              {Object.keys(result.extractedFacts).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-forge-muted mb-2">
                    Extracted Facts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(result.extractedFacts).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-[10px]">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <details className="text-xs">
                <summary className="cursor-pointer text-forge-muted hover:text-forge-foreground">
                  View transcript
                </summary>
                <p className="mt-2 text-forge-muted-foreground leading-relaxed">{result.transcript}</p>
              </details>
            </motion.div>
          )}
        </AnimatePresence>

        {processing && (
          <div className="flex items-center justify-center gap-2 text-sm text-forge-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing voice note…
          </div>
        )}
      </CardContent>
    </Card>
  );
}
