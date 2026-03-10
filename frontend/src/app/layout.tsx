import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/QueryProvider";
import ErrorProvider from "@/providers/ErrorProvider";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.className} bg-gray-50 text-gray-900 transition-colors duration-200 ease-in-out dark:bg-gray-900 dark:text-gray-100`}
      >
        <QueryProvider>
          <ErrorProvider>
            <ThemeProvider>
              <TooltipProvider>
                <SidebarProvider>{children}</SidebarProvider>
                <Toaster richColors />
              </TooltipProvider>
            </ThemeProvider>
          </ErrorProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
