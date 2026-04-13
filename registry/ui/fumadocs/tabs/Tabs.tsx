"use client";

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tabs as Primitive } from "@base-ui/react/tabs";
import { twMerge } from "tailwind-merge";

type ChangeListener = (v: string) => void;
const listeners = new Map<string, Set<ChangeListener>>();

export interface TabsProps extends ComponentProps<typeof Primitive.Root> {
  groupId?: string;
  persist?: boolean;
  updateAnchor?: boolean;
  items?: string[];
  defaultIndex?: number;
  label?: ReactNode;
  children?: ReactNode;
}

const TabsContext = createContext<{
  valueToIdMap: Map<string, string>;
  items?: string[];
  collection: (string | symbol)[];
} | null>(null);

function useTabContext() {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error("You must wrap your component in <Tabs>");
  return ctx;
}

/**
 * Tabbed content container with groupId syncing, persistence, and URL hash support.
 *
 * Ported from fumadocs-ui (Base UI variant).
 *
 * Usage:
 * ```tsx
 * <Tabs items={["npm", "pnpm", "yarn"]}>
 *   <Tab>npm install foo</Tab>
 *   <Tab>pnpm add foo</Tab>
 *   <Tab>yarn add foo</Tab>
 * </Tabs>
 * ```
 */
export function Tabs({
  ref,
  className,
  groupId,
  persist = false,
  updateAnchor = false,
  items,
  label,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex]) : undefined,
  value: controlledValue,
  onValueChange: controlledOnChange,
  children,
  ...props
}: TabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const valueToIdMap = useMemo(() => new Map<string, string>(), []);
  const collection = useMemo<(string | symbol)[]>(() => [], []);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const setValueRaw = useCallback(
    (v: string) => {
      if (controlledOnChange) (controlledOnChange as (v: string) => void)(v);
      else setInternalValue(v);
    },
    [controlledOnChange],
  );

  const guardedSetValue = useCallback(
    (v: string) => {
      if (items && !items.some((item) => escapeValue(item) === v)) return;
      setValueRaw(v);
    },
    [items, setValueRaw],
  );

  useLayoutEffect(() => {
    if (!groupId) return;
    let previous = sessionStorage.getItem(groupId);
    if (persist) previous ??= localStorage.getItem(groupId);
    if (previous) guardedSetValue(previous);

    const groupListeners = listeners.get(groupId) ?? new Set();
    groupListeners.add(guardedSetValue);
    listeners.set(groupId, groupListeners);
    return () => {
      groupListeners.delete(guardedSetValue);
    };
  }, [groupId, persist, guardedSetValue]);

  useLayoutEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    for (const [val, id] of valueToIdMap.entries()) {
      if (id === hash) {
        setValueRaw(val);
        tabsRef.current?.scrollIntoView();
        break;
      }
    }
  }, [setValueRaw, valueToIdMap]);

  return (
    <Primitive.Root
      ref={tabsRef}
      className={(s) =>
        twMerge(
          "my-4 flex flex-col overflow-hidden rounded-xl border bg-secondary",
          typeof className === "function" ? className(s) : className,
        )
      }
      value={value}
      onValueChange={(v: string | number | null) => {
        const strVal = String(v);
        if (items && !items.some((item) => escapeValue(item) === strVal)) return;

        if (updateAnchor) {
          const id = valueToIdMap.get(strVal);
          if (id) window.history.replaceState(null, "", `#${id}`);
        }

        if (groupId) {
          const groupListeners = listeners.get(groupId);
          if (groupListeners) {
            for (const listener of groupListeners) listener(strVal);
          }
          sessionStorage.setItem(groupId, strVal);
          if (persist) localStorage.setItem(groupId, strVal);
        } else {
          setValueRaw(strVal);
        }
      }}
      {...props}
    >
      {items && (
        <Primitive.List className="flex gap-3.5 overflow-x-auto px-4 text-secondary-foreground">
          {label && <span className="flex items-center text-sm text-muted-foreground">{label}</span>}
          {items.map((item) => (
            <Primitive.Tab
              key={item}
              value={escapeValue(item)}
              className="inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent-foreground data-[active]:border-sky-400 data-[active]:text-sky-400"
            >
              {item}
            </Primitive.Tab>
          ))}
        </Primitive.List>
      )}
      <TabsContext value={useMemo(() => ({ valueToIdMap, items, collection }), [valueToIdMap, items, collection])}>
        {children}
      </TabsContext>
    </Primitive.Root>
  );
}

export function TabsList({ className, ...props }: ComponentProps<typeof Primitive.List>) {
  return (
    <Primitive.List
      className={(s) =>
        twMerge(
          "flex gap-3.5 overflow-x-auto px-4 text-secondary-foreground",
          typeof className === "function" ? className(s) : className,
        )
      }
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof Primitive.Tab>) {
  return (
    <Primitive.Tab
      className={twMerge(
        "inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent-foreground data-[active]:border-sky-400 data-[active]:text-sky-400",
        typeof className === "string" ? className : undefined,
      )}
      {...props}
    />
  );
}

export interface TabProps extends Omit<ComponentProps<typeof Primitive.Panel>, "value"> {
  value?: string;
}

export function Tab({ value, className, ...props }: TabProps) {
  const { items, collection } = useTabContext();
  const resolved =
    value ??
    // eslint-disable-next-line react-hooks/rules-of-hooks
    items?.at(useCollectionIndex(collection));

  if (!resolved) {
    throw new Error("Failed to resolve tab `value`. Pass a `value` prop to the Tab component.");
  }

  return (
    <Primitive.Panel
      value={escapeValue(resolved)}
      className={(s) =>
        twMerge(
          "rounded-xl bg-background p-4 text-[0.9375rem] outline-none",
          typeof className === "function" ? className(s) : className,
        )
      }
      {...props}
    >
      {props.children}
    </Primitive.Panel>
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof Primitive.Panel>) {
  return (
    <Primitive.Panel
      className={(s) =>
        twMerge(
          "rounded-xl bg-background p-4 text-[0.9375rem] outline-none",
          typeof className === "function" ? className(s) : className,
        )
      }
      {...props}
    >
      {props.children}
    </Primitive.Panel>
  );
}

function useCollectionIndex(collection: (string | symbol)[]) {
  const key = useId();

  useEffect(() => {
    return () => {
      const idx = collection.indexOf(key);
      if (idx !== -1) collection.splice(idx, 1);
    };
  }, [key, collection]);

  if (!collection.includes(key)) collection.push(key);
  return collection.indexOf(key);
}

function escapeValue(v: string): string {
  return v.toLowerCase().replace(/\s/, "-");
}
