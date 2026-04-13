"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarContent } from "@/components/sidebar";
import type { TreeNode } from "@document0/core";

export function MobileSidebar({ tree }: { tree: TreeNode[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="px-4 pt-4 text-sm font-semibold">Navigation</SheetTitle>
        <ScrollArea className="h-full px-3 py-4">
          <SidebarContent tree={tree} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
