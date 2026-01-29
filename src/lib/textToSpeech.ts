// src/lib/textToSpeech.ts
// Text-to-Speech utility for Read Aloud functionality
// Uses Web Speech API (speechSynthesis)

import type { ContentBlock, QuestionOption } from "../types/question";

// ============================================
// TEXT EXTRACTION
// ============================================

/**
 * Extract plain text from content blocks for TTS
 * Ignores images, shapes, grids but includes captions and text
 */
export function extractPlainTextFromContentBlocks(
  content: ContentBlock[] | null | undefined,
  optionsData?: QuestionOption[] | null,
): string {
  const textParts: string[] = [];

  // Extract text from content blocks
  if (content && Array.isArray(content)) {
    for (const block of content) {
      const text = extractTextFromBlock(block);
      if (text) {
        textParts.push(text);
      }
    }
  }

  // Extract text from options
  if (optionsData && Array.isArray(optionsData)) {
    textParts.push("The options are:");
    for (const option of optionsData) {
      const optionText = extractTextFromOption(option);
      if (optionText) {
        textParts.push(`Option ${option.id}: ${optionText}`);
      }
    }
  }

  return textParts.join(". ").replace(/\.\./g, ".").trim();
}

/**
 * Extract text from a single content block
 */
function extractTextFromBlock(block: ContentBlock): string | null {
  switch (block.type) {
    case "text":
      return block.content;

    case "image":
      // Include alt text or caption if available
      if (block.caption) return `Image: ${block.caption}`;
      if (block.alt && block.alt !== "Question illustration")
        return `Image showing ${block.alt}`;
      return null;

    case "table":
      // Read table caption if available
      if (block.caption) return `Table: ${block.caption}`;
      return "A table is shown";

    case "fraction":
      return `${block.numerator} over ${block.denominator}`;

    case "math":
      // Try to make LaTeX readable
      return convertLatexToSpeech(block.latex);

    case "number-line":
      return `A number line from ${block.min} to ${block.max}`;

    case "grid":
      return "A grid is shown";

    case "chart":
      if (block.title) return `Chart: ${block.title}`;
      return `A ${block.chartType} chart is shown`;

    case "clock":
      return `A clock showing ${block.hours}:${String(block.minutes).padStart(2, "0")}`;

    case "money":
      return `${block.amount} dollars`;

    case "tally":
      return `${block.count} tally marks`;

    case "shape":
      return `A ${block.shapeType} shape`;

    default:
      return null;
  }
}

/**
 * Extract text from an option
 */
function extractTextFromOption(option: QuestionOption): string | null {
  // Direct text
  if (option.text) {
    return option.text;
  }

  // Rich content in option
  if (option.content && Array.isArray(option.content)) {
    const texts = option.content
      .map((block) => extractTextFromBlock(block as ContentBlock))
      .filter(Boolean);
    return texts.join(" ") || null;
  }

  // Image-only option
  if (option.imageUrl) {
    return "An image";
  }

  return null;
}

/**
 * Convert basic LaTeX to spoken text
 */
function convertLatexToSpeech(latex: string): string {
  return latex
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "$1 over $2")
    .replace(/\\times/g, "times")
    .replace(/\\div/g, "divided by")
    .replace(/\\pm/g, "plus or minus")
    .replace(/\\sqrt\{([^}]+)\}/g, "square root of $1")
    .replace(/\^2/g, " squared")
    .replace(/\^3/g, " cubed")
    .replace(/\^(\d+)/g, " to the power of $1")
    .replace(/[{}\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================
// SPEECH SYNTHESIS
// ============================================

interface TTSState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentUtterance: SpeechSynthesisUtterance | null;
  onEnd: (() => void) | null;
}

const ttsState: TTSState = {
  isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
  isSpeaking: false,
  isPaused: false,
  currentUtterance: null,
  onEnd: null,
};

/**
 * Check if Text-to-Speech is supported
 */
export function isTTSSupported(): boolean {
  return ttsState.isSupported;
}

/**
 * Get available voices, preferring English ones
 */
export function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!ttsState.isSupported) return null;

  const voices = window.speechSynthesis.getVoices();

  // Prefer Australian English
  let voice = voices.find((v) => v.lang === "en-AU");

  // Fall back to any English
  if (!voice) {
    voice = voices.find((v) => v.lang.startsWith("en-"));
  }

  // Fall back to default
  if (!voice && voices.length > 0) {
    voice = voices.find((v) => v.default) || voices[0];
  }

  return voice || null;
}

/**
 * Speak text using Web Speech API
 */
export function speak(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  },
): boolean {
  if (!ttsState.isSupported) {
    console.warn("Text-to-Speech is not supported in this browser");
    return false;
  }

  // Stop any current speech
  stop();

  if (!text.trim()) {
    return false;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice
    const voice = getPreferredVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Set options
    utterance.rate = options?.rate ?? 0.9; // Slightly slower for kids
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 1;

    // Event handlers
    utterance.onstart = () => {
      ttsState.isSpeaking = true;
      ttsState.isPaused = false;
    };

    utterance.onend = () => {
      ttsState.isSpeaking = false;
      ttsState.isPaused = false;
      ttsState.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (event) => {
      ttsState.isSpeaking = false;
      ttsState.isPaused = false;
      ttsState.currentUtterance = null;
      console.error("TTS Error:", event.error);
      options?.onError?.(new Error(event.error));
    };

    // Store reference
    ttsState.currentUtterance = utterance;
    ttsState.onEnd = options?.onEnd || null;

    // Speak!
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error("Error starting speech:", err);
    return false;
  }
}

/**
 * Stop speaking
 */
export function stop(): void {
  if (!ttsState.isSupported) return;

  window.speechSynthesis.cancel();
  ttsState.isSpeaking = false;
  ttsState.isPaused = false;
  ttsState.currentUtterance = null;
}

/**
 * Pause speaking
 */
export function pause(): void {
  if (!ttsState.isSupported || !ttsState.isSpeaking) return;

  window.speechSynthesis.pause();
  ttsState.isPaused = true;
}

/**
 * Resume speaking
 */
export function resume(): void {
  if (!ttsState.isSupported || !ttsState.isPaused) return;

  window.speechSynthesis.resume();
  ttsState.isPaused = false;
}

/**
 * Toggle pause/resume
 */
export function togglePause(): void {
  if (ttsState.isPaused) {
    resume();
  } else {
    pause();
  }
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  return ttsState.isSpeaking;
}

/**
 * Check if currently paused
 */
export function isPaused(): boolean {
  return ttsState.isPaused;
}

/**
 * Get current TTS state
 */
export function getTTSState(): {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
} {
  return {
    isSpeaking: ttsState.isSpeaking,
    isPaused: ttsState.isPaused,
    isSupported: ttsState.isSupported,
  };
}

// Initialize voices (they load asynchronously in some browsers)
if (ttsState.isSupported) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
