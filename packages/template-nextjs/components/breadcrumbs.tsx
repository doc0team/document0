import Link from "next/link";
import type { BreadcrumbItem } from "@document0/core";
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbSlot,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, i) => (
          <BreadcrumbSlot key={i}>
            {i > 0 && <BreadcrumbSeparator />}
            {i < items.length - 1 && item.url ? (
              <BreadcrumbLink asChild>
                <Link href={item.url}>{item.name}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.name}</BreadcrumbPage>
            )}
          </BreadcrumbSlot>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
