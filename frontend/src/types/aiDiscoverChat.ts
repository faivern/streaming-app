import type { AiDiscoverResult } from "./aiDiscover";

export type ChatMessage =
  | { role: "user"; id: string; text: string }
  | {
      role: "ai";
      id: string;
      text: string;
      results: AiDiscoverResult[];
      query: string;
    }
  | {
      role: "error";
      id: string;
      errorStatus: number | undefined;
      retryAfterSeconds: number | null;
    }
  | { role: "loading"; id: string };
