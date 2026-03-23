import type {
  OpenAPIPageData,
  OpenAPIParameter,
  OpenAPIResponse,
  OpenAPIRequestBody,
} from "@document0/core";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  HEAD: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  OPTIONS: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

function MethodBadge({ method }: { method: string }) {
  const colors = METHOD_COLORS[method] ?? METHOD_COLORS.GET;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide ${colors}`}
    >
      {method}
    </span>
  );
}

function EndpointPath({ path }: { path: string }) {
  const parts = path.split(/(\{[^}]+\})/);
  return (
    <code className="text-sm font-mono text-zinc-200">
      {parts.map((part, i) =>
        part.startsWith("{") ? (
          <span key={i} className="text-amber-400">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </code>
  );
}

function SchemaView({ schema, depth = 0 }: { schema: Record<string, unknown>; depth?: number }) {
  const type = schema.type as string | undefined;
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
  const items = schema.items as Record<string, unknown> | undefined;
  const required = (schema.required as string[]) ?? [];

  if (type === "object" && properties) {
    return (
      <div className={depth > 0 ? "ml-4 border-l border-zinc-800 pl-3" : ""}>
        {Object.entries(properties).map(([name, prop]) => {
          const propType = (prop.type as string) ?? "any";
          const isRequired = required.includes(name);
          return (
            <div key={name} className="py-1.5">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-zinc-200">{name}</code>
                <span className="text-xs text-zinc-500">{propType}</span>
                {isRequired && (
                  <span className="text-[10px] font-medium text-red-400">required</span>
                )}
              </div>
              {prop.description && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {prop.description as string}
                </p>
              )}
              {propType === "object" && prop.properties && (
                <SchemaView schema={prop} depth={depth + 1} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "array" && items) {
    return (
      <div>
        <span className="text-xs text-zinc-500">array of:</span>
        <SchemaView schema={items} depth={depth + 1} />
      </div>
    );
  }

  return <span className="text-xs text-zinc-500">{type ?? "any"}</span>;
}

function ParametersTable({ parameters }: { parameters: OpenAPIParameter[] }) {
  if (parameters.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Parameters</h3>
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900/60 text-xs text-zinc-500 uppercase tracking-wider">
              <th className="text-left px-4 py-2.5 font-medium">Name</th>
              <th className="text-left px-4 py-2.5 font-medium">In</th>
              <th className="text-left px-4 py-2.5 font-medium">Type</th>
              <th className="text-left px-4 py-2.5 font-medium">Required</th>
              <th className="text-left px-4 py-2.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {parameters.map((p) => (
              <tr key={`${p.in}-${p.name}`} className="text-zinc-300">
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-200">
                  {p.name}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                    {p.in}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-zinc-500">
                  {(p.schema.type as string) ?? "any"}
                </td>
                <td className="px-4 py-2.5">
                  {p.required ? (
                    <span className="text-xs text-red-400">yes</span>
                  ) : (
                    <span className="text-xs text-zinc-600">no</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-zinc-500 text-xs">
                  {p.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequestBodySection({ body }: { body: OpenAPIRequestBody }) {
  const contentTypes = Object.keys(body.content);
  const firstSchema = body.content[contentTypes[0]!]?.schema;
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">
        Request Body
        {body.required && (
          <span className="ml-2 text-[10px] font-medium text-red-400">required</span>
        )}
      </h3>
      {body.description && (
        <p className="text-sm text-zinc-500 mb-3">{body.description}</p>
      )}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            Content-Type
          </span>
          {contentTypes.map((ct) => (
            <span
              key={ct}
              className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-400"
            >
              {ct}
            </span>
          ))}
        </div>
        {firstSchema && <SchemaView schema={firstSchema} />}
      </div>
    </div>
  );
}

function ResponsesSection({ responses }: { responses: OpenAPIResponse[] }) {
  if (responses.length === 0) return null;

  const statusColor = (status: string) => {
    if (status.startsWith("2")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (status.startsWith("3")) return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    if (status.startsWith("4")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (status.startsWith("5")) return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Responses</h3>
      <div className="space-y-3">
        {responses.map((r) => {
          const contentTypes = r.content ? Object.keys(r.content) : [];
          const firstSchema = contentTypes.length > 0 ? r.content?.[contentTypes[0]!]?.schema : undefined;
          return (
            <div
              key={r.status}
              className="rounded-xl border border-zinc-800 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/40">
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${statusColor(r.status)}`}
                >
                  {r.status}
                </span>
                <span className="text-sm text-zinc-400">{r.description}</span>
              </div>
              {firstSchema && (
                <div className="px-4 py-3 border-t border-zinc-800">
                  <SchemaView schema={firstSchema} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function APIPage({ operation }: { operation: OpenAPIPageData }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        {operation.deprecated && (
          <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 mb-3">
            Deprecated
          </span>
        )}
        <div className="flex items-center gap-3 mb-2">
          <MethodBadge method={operation.method} />
          <EndpointPath path={operation.path} />
        </div>
        <h1 className="text-2xl font-bold text-white mt-3">{operation.summary}</h1>
        {operation.description && (
          <p className="mt-2 text-zinc-400 leading-relaxed">
            {operation.description}
          </p>
        )}
        {operation.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            {operation.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <ParametersTable parameters={operation.parameters} />
      {operation.requestBody && <RequestBodySection body={operation.requestBody} />}
      <ResponsesSection responses={operation.responses} />
    </div>
  );
}
