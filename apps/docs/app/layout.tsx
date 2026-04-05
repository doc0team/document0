import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    template: "%s - document0",
    default: "document0",
  },
  description: "document0: documentation framework. File system source, page trees, MDX, and Shiki. Zero UI assumptions.",
  metadataBase: new URL("https://document0.dev"),
  openGraph: {
    siteName: "document0",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark font-sans", geist.variable)}>
      <head />
      <body className={GeistPixelSquare.variable}>
        {children}
      </body>
    </html>
  );
}
