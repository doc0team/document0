"use client";

import { Accordion as Primitive } from "@base-ui/react/accordion";
import { Check, ChevronRight, LinkIcon } from "lucide-react";
import {
  type ComponentProps,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

function useCopyButton(
  onCopy: () => void | Promise<void>,
): [checked: boolean, onClick: MouseEventHandler] {
  const [checked, setChecked] = useState(false);
  const callbackRef = useRef(onCopy);
  const timeoutRef = useRef<number | null>(null);
  callbackRef.current = onCopy;

  const onClick: MouseEventHandler = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    const res = Promise.resolve(callbackRef.current());
    void res.then(() => {
      setChecked(true);
      timeoutRef.current = window.setTimeout(() => setChecked(false), 1500);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return [checked, onClick];
}

/**
 * Accordion group with URL hash linking and copy-link support.
 *
 * Ported from fumadocs-ui (Base UI variant).
 *
 * Usage:
 * ```tsx
 * <Accordions>
 *   <Accordion title="Is this free?">
 *     Yes, it's completely free and open-source.
 *   </Accordion>
 *   <Accordion title="Can I customize it?">
 *     Absolutely — all components are fully customizable.
 *   </Accordion>
 * </Accordions>
 * ```
 */
export function Accordions({
  ref,
  className,
  defaultValue,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<string[]>(
    (defaultValue as string[]) ?? [],
  );

  useEffect(() => {
    const id = window.location.hash.substring(1);
    const element = rootRef.current;
    if (!element || id.length === 0) return;

    const selected = document.getElementById(id);
    if (!selected || !element.contains(selected)) return;
    const val = selected.getAttribute("data-accordion-value");
    if (val) setValue((prev) => [val, ...prev]);
  }, []);

  return (
    <Primitive.Root
      ref={(node) => {
        (rootRef as any).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as any).current = node;
      }}
      value={value}
      onValueChange={(v) => setValue(v as string[])}
      className={(s) =>
        twMerge(
          "divide-y divide-border overflow-hidden rounded-lg border bg-card",
          typeof className === "function" ? className(s) : className,
        )
      }
      {...props}
    />
  );
}

export function Accordion({
  title,
  id,
  value = String(title),
  children,
  ...props
}: Omit<ComponentProps<typeof Primitive.Item>, "value" | "title"> & {
  title: string | ReactNode;
  value?: string;
}) {
  return (
    <Primitive.Item value={value} {...props}>
      <Primitive.Header
        id={id}
        data-accordion-value={value}
        render={<div />}
        className="scroll-m-24 flex flex-row items-center text-card-foreground font-medium has-[:focus-visible]:bg-accent"
      >
        <Primitive.Trigger
          className="group flex flex-1 items-center gap-2 px-3 py-2.5 text-start focus-visible:outline-none"
        >
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-90" />
          {title}
        </Primitive.Trigger>
        {id ? <CopyButton id={id} /> : null}
      </Primitive.Header>
      <Primitive.Panel
        className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0"
      >
        <div className="px-4 pb-2 text-[0.9375rem]">
          {children}
        </div>
      </Primitive.Panel>
    </Primitive.Item>
  );
}

function CopyButton({ id }: { id: string }) {
  const [checked, onClick] = useCopyButton(() => {
    const url = new URL(window.location.href);
    url.hash = id;
    return navigator.clipboard.writeText(url.toString());
  });

  return (
    <button
      type="button"
      aria-label="Copy Link"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md p-2 me-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {checked ? <Check className="size-3.5" /> : <LinkIcon className="size-3.5" />}
    </button>
  );
}
