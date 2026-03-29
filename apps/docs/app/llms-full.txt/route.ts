import { createLlmsFullTxtRoute } from "@document0/core/llms";
import { source } from "@/lib/source";

export const { GET } = createLlmsFullTxtRoute(source, {
  title: "document0",
  description: "document0: documentation framework for building custom docs sites",
  baseUrl: "https://document0.dev",
});
