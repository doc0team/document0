import { createSearchRoute } from "@document0/core/search";
import { source } from "@/lib/source";

export const { GET } = createSearchRoute(source);
