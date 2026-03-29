"use client";

import { Breadcrumbs } from "../../../../registry/ui/document0/breadcrumbs/Breadcrumbs";

const mockBreadcrumbs = [
  { name: "Docs", url: "#" },
  { name: "Components", url: "#" },
  { name: "Breadcrumbs" },
];

export function BreadcrumbsPreview() {
  return <Breadcrumbs items={mockBreadcrumbs} />;
}
