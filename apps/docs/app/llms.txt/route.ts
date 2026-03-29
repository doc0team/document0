import { createLlmsTxtRoute } from "@document0/core/llms";
import { source } from "@/lib/source";

export const { GET } = createLlmsTxtRoute(source, {
  title: "document0",
  description: "document0: documentation framework for building custom docs sites",
  baseUrl: "https://document0.dev",
});
