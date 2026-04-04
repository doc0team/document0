import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NavItem {
  name: string;
  url: string;
}

interface PageNavigationProps {
  previous: NavItem | null;
  next: NavItem | null;
}

export function PageNavigation({ previous, next }: PageNavigationProps) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Page navigation" className="mt-12 grid grid-cols-2 gap-4">
      {previous ? (
        <Link href={previous.url} className="group">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-3 p-4">
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Previous</p>
                <p className="text-sm font-medium">{previous.name}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={next.url} className="group">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center justify-end gap-3 p-4 text-right">
              <div>
                <p className="text-xs text-muted-foreground">Next</p>
                <p className="text-sm font-medium">{next.name}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
