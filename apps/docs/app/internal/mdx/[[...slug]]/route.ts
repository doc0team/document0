import { getPageRawContent } from "@document0/core/llms";
import { source } from "@/lib/source";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const slugStr = slug?.join("/") ?? "";
  const content = await getPageRawContent(source, slugStr);

  if (!content) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(content, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
