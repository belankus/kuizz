import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider>{children}</SidebarProvider>
            <Toaster richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
