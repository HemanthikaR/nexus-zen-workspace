import { useCallback, useRef, useState } from "react";

export type StreamMode = "email" | "notes" | "planner" | "research";

export function useGenerateStream() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (mode: StreamMode, prompt: string, options?: Record<string, string | boolean>) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setError(null);
      setText("");
      setIsStreaming(true);
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, prompt, options }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const msg = await res.text().catch(() => "Request failed");
          if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
          if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
          throw new Error(msg || `Request failed (${res.status})`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setText(acc);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
      } finally {
        setIsStreaming(false);
      }
    },
    [],
  );

  const stop = useCallback(() => controllerRef.current?.abort(), []);
  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setText("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return { text, setText, isStreaming, error, run, stop, reset };
}
