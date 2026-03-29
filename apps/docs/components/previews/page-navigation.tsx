"use client";

import { PageNavigation } from "../../../../registry/ui/document0/page-navigation/PageNavigation";

const mockPrevious = { name: "Installation", url: "#" };
const mockNext = { name: "Configuration", url: "#" };

export function PageNavigationPreview() {
  return <PageNavigation previous={mockPrevious} next={mockNext} />;
}
