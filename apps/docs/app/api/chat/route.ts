import { createChatRoute } from "@registry/plugins/document0/openrouter-chat";
import { source } from "@/lib/source";

export const { POST } = createChatRoute({
  pages: () => source.getPages(),  // returns Promise<PageData[]>
  model: "openai/gpt-4o-mini", // fallback model
  maxPageChars: 4000,
});
