"use client";

import { Check, Clipboard } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tabs as Primitive } from "@base-ui/react/tabs";
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

export interface CodeBlockProps extends ComponentProps<"figure"> {
  icon?: ReactNode;
  allowCopy?: boolean;
  keepBackground?: boolean;
  viewportProps?: HTMLAttributes<HTMLElement>;
  "data-line-numbers"?: boolean;
  "data-line-numbers-start"?: number;
  Actions?: (props: { className?: string; children?: ReactNode }) => ReactNode;
}

const TabsContext = createContext<{
  containerRef: RefObject<HTMLDivElement | null>;
  nested: boolean;
} | null>(null);

export function Pre(props: ComponentProps<"pre">) {
  return (
    <pre {...props} className={twMerge("min-w-full w-max *:flex *:flex-col m-0 border-0 rounded-none bg-transparent p-0", props.className)}>
      {props.children}
    </pre>
  );
}

export function CodeBlock({
  ref,
  title,
  allowCopy = true,
  keepBackground = false,
  icon,
  viewportProps = {},
  children,
  Actions = (props) => <div {...props} className={twMerge("empty:hidden", props.className)} />,
  ...props
}: CodeBlockProps) {
  const inTab = use(TabsContext) !== null;
  const areaRef = useRef<HTMLDivElement>(null);

  return (
    <figure
      ref={ref}
      dir="ltr"
      tabIndex={-1}
      {...props}
      className={twMerge(
        inTab ? "bg-secondary -mx-px -mb-px last:rounded-b-xl" : "my-4 bg-card rounded-xl",
        keepBackground && "bg-[var(--shiki-light-bg)] dark:bg-[var(--shiki-dark-bg)]",
        "shiki relative border shadow-sm not-prose overflow-hidden text-sm",
        props.className,
      )}
    >
      {title ? (
        <div className="flex text-muted-foreground items-center gap-2 h-9.5 border-b px-4">
          {typeof icon === "string" ? (
            <div
              className="[&_svg]:size-3.5"
              dangerouslySetInnerHTML={{ __html: icon }}
            />
          ) : (
            icon
          )}
          <figcaption className="flex-1 truncate">{title}</figcaption>
          {Actions({
            className: "-me-2",
            children: allowCopy && <CopyButton containerRef={areaRef} />,
          })}
        </div>
      ) : (
        Actions({
          className:
            "absolute top-2 right-2 z-2 backdrop-blur-lg rounded-lg text-muted-foreground",
          children: allowCopy && <CopyButton containerRef={areaRef} />,
        })
      )}
      <div
        ref={areaRef}
        {...viewportProps}
        role="region"
        tabIndex={0}
        className={twMerge(
          "text-[0.8125rem] leading-relaxed px-4 py-3.5 overflow-auto max-h-[600px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          viewportProps.className,
        )}
        style={
          {
            "--padding-right": !title ? "calc(var(--spacing) * 8)" : undefined,
            counterSet: props["data-line-numbers"]
              ? `line ${Number(props["data-line-numbers-start"] ?? 1) - 1}`
              : undefined,
            ...viewportProps.style,
          } as object
        }
      >
        {children}
      </div>
    </figure>
  );
}

function CopyButton({
  className,
  containerRef,
  ...props
}: ComponentProps<"button"> & {
  containerRef: RefObject<HTMLElement | null>;
}) {
  const [checked, onClick] = useCopyButton(() => {
    const pre = containerRef.current?.getElementsByTagName("pre").item(0);
    if (!pre) return;
    const clone = pre.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
      node.replaceWith("\n");
    });
    void navigator.clipboard.writeText(clone.textContent ?? "");
  });

  return (
    <button
      type="button"
      data-checked={checked || undefined}
      className={twMerge(
        "inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:text-accent-foreground data-[checked]:text-accent-foreground",
        className,
      )}
      aria-label={checked ? "Copied Text" : "Copy Text"}
      onClick={onClick}
      {...props}
    >
      {checked ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
    </button>
  );
}

export function CodeBlockTabs({ ref, className, ...props }: ComponentProps<typeof Primitive.Root>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nested = use(TabsContext) !== null;

  return (
    <Primitive.Root
      ref={(node) => {
        (containerRef as any).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as any).current = node;
      }}
      className={(s) =>
        twMerge(
          "bg-card rounded-xl border",
          !nested && "my-4",
          typeof className === "function" ? className(s) : className,
        )
      }
      {...props}
    >
      <TabsContext
        value={useMemo(() => ({ containerRef, nested }), [nested])}
      >
        {props.children}
      </TabsContext>
    </Primitive.Root>
  );
}

export function CodeBlockTabsList({ className, ...props }: ComponentProps<typeof Primitive.List>) {
  return (
    <Primitive.List
      className={(s) =>
        twMerge(
          "flex flex-row px-2 overflow-x-auto text-muted-foreground",
          typeof className === "function" ? className(s) : className,
        )
      }
      {...props}
    >
      {props.children}
    </Primitive.List>
  );
}

export function CodeBlockTabsTrigger({
  children,
  className,
  ...props
}: ComponentProps<typeof Primitive.Tab>) {
  return (
    <Primitive.Tab
      className={(s) =>
        twMerge(
          "relative group inline-flex text-sm font-medium text-nowrap items-center transition-colors gap-2 px-2 py-1.5 [&_svg]:size-3.5",
          s.active ? "text-primary" : "hover:text-accent-foreground",
          typeof className === "function" ? className(s) : className,
        )
      }
      {...props}
    >
      <div className="absolute inset-x-2 bottom-0 h-px group-data-[active]:bg-primary" />
      {children}
    </Primitive.Tab>
  );
}

export function CodeBlockTab(props: ComponentProps<typeof Primitive.Panel>) {
  return <Primitive.Panel {...props} />;
}
