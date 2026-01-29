// src/components/exam/ReadAloudButton.tsx
// Read Aloud button with TTS and optional pre-recorded audio support

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  speak,
  stop,
  pause,
  resume,
  isSpeaking,
  isPaused,
  isTTSSupported,
  extractPlainTextFromContentBlocks,
} from "../../lib/textToSpeech";
import { getSignedMediaUrl } from "../../lib/mediaStorage";
import type { ContentBlock, QuestionOption } from "../../types/question";

interface ReadAloudButtonProps {
  // Content to read
  content?: ContentBlock[] | null;
  optionsData?: QuestionOption[] | null;

  // Alternative: plain text to read
  plainText?: string;

  // Pre-recorded audio path (optional)
  audioPath?: string | null;
  audioBucket?: string;

  // Styling
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;

  // Callbacks
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  content,
  optionsData,
  plainText,
  audioPath,
  audioBucket = "question-media",
  size = "md",
  variant = "secondary",
  className = "",
  onStart,
  onEnd,
  onError,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPausedState, setIsPausedState] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [useAudio, setUseAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine text to read
  const textToRead =
    plainText || extractPlainTextFromContentBlocks(content, optionsData);

  // Check if we have pre-recorded audio
  useEffect(() => {
    if (audioPath) {
      getSignedMediaUrl(audioBucket, audioPath).then((url) => {
        if (url) {
          setAudioUrl(url);
          setUseAudio(true);
        }
      });
    } else {
      setAudioUrl(null);
      setUseAudio(false);
    }
  }, [audioPath, audioBucket]);

  // Sync TTS state with component state
  useEffect(() => {
    if (!useAudio) {
      checkIntervalRef.current = setInterval(() => {
        setIsPlaying(isSpeaking());
        setIsPausedState(isPaused());
      }, 100);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [useAudio]);

  // Cleanup on unmount or when question changes
  useEffect(() => {
    return () => {
      handleStop();
    };
  }, [content, audioPath]);

  const handlePlayTTS = () => {
    if (!isTTSSupported()) {
      onError?.(new Error("Text-to-Speech is not supported in this browser"));
      return;
    }

    if (!textToRead) {
      onError?.(new Error("No text to read"));
      return;
    }

    const success = speak(textToRead, {
      onEnd: () => {
        setIsPlaying(false);
        setIsPausedState(false);
        onEnd?.();
      },
      onError: (err) => {
        setIsPlaying(false);
        setIsPausedState(false);
        onError?.(err);
      },
    });

    if (success) {
      setIsPlaying(true);
      onStart?.();
    }
  };

  const handlePlayAudio = () => {
    if (!audioRef.current || !audioUrl) return;

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        onStart?.();
      })
      .catch((err) => {
        onError?.(err);
      });
  };

  const handlePlay = () => {
    if (isPlaying && isPausedState) {
      // Resume
      if (useAudio && audioRef.current) {
        audioRef.current.play();
        setIsPausedState(false);
      } else {
        resume();
      }
    } else if (isPlaying) {
      // Pause
      if (useAudio && audioRef.current) {
        audioRef.current.pause();
        setIsPausedState(true);
      } else {
        pause();
        setIsPausedState(true);
      }
    } else {
      // Start
      if (useAudio) {
        handlePlayAudio();
      } else {
        handlePlayTTS();
      }
    }
  };

  const handleStop = () => {
    if (useAudio && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      stop();
    }
    setIsPlaying(false);
    setIsPausedState(false);
  };

  // Size classes
  const sizeClasses = {
    sm: "p-1.5 text-sm",
    md: "p-2 text-base",
    lg: "p-3 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Variant classes
  const variantClasses = {
    primary: isPlaying
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "bg-indigo-500 text-white hover:bg-indigo-600",
    secondary: isPlaying
      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: isPlaying
      ? "text-amber-600 hover:bg-amber-50"
      : "text-gray-600 hover:bg-gray-100",
  };

  // Don't render if TTS not supported and no audio
  if (!isTTSSupported() && !useAudio) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {/* Hidden audio element for pre-recorded audio */}
      {useAudio && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onEnded={() => {
            setIsPlaying(false);
            setIsPausedState(false);
            onEnd?.();
          }}
          onError={() => {
            setIsPlaying(false);
            onError?.(new Error("Audio playback failed"));
          }}
        />
      )}

      {/* Main play/pause button */}
      <motion.button
        onClick={handlePlay}
        className={`
          rounded-full transition-all flex items-center justify-center gap-2
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={
          isPlaying
            ? isPausedState
              ? "Resume reading"
              : "Pause reading"
            : "Read aloud"
        }
        title={
          isPlaying ? (isPausedState ? "Resume" : "Pause") : "Read Aloud 🔊"
        }
      >
        <AnimatePresence mode="wait">
          {isPlaying && !isPausedState ? (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Pause className={iconSizes[size]} />
            </motion.div>
          ) : isPlaying && isPausedState ? (
            <motion.div
              key="resume"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Play className={iconSizes[size]} />
            </motion.div>
          ) : (
            <motion.div
              key="speak"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Volume2 className={iconSizes[size]} />
            </motion.div>
          )}
        </AnimatePresence>

        {size !== "sm" && (
          <span className="hidden sm:inline">
            {isPlaying ? (isPausedState ? "Resume" : "Pause") : "Read Aloud"}
          </span>
        )}
      </motion.button>

      {/* Stop button (only show when playing) */}
      <AnimatePresence>
        {isPlaying && (
          <motion.button
            initial={{ opacity: 0, scale: 0, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: "auto" }}
            exit={{ opacity: 0, scale: 0, width: 0 }}
            onClick={handleStop}
            className={`
              rounded-full transition-all flex items-center justify-center
              ${sizeClasses[size]}
              bg-red-100 text-red-600 hover:bg-red-200
            `}
            aria-label="Stop reading"
            title="Stop"
          >
            <Square className={iconSizes[size]} fill="currentColor" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Speaking indicator animation */}
      <AnimatePresence>
        {isPlaying && !isPausedState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-0.5 ml-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-amber-500 rounded-full"
                animate={{
                  height: ["8px", "16px", "8px"],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadAloudButton;
