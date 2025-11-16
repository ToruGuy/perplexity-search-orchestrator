import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Header } from "@/components/header";
import { Toaster } from "sonner";
import { AppProvider } from "@/lib/app-context";

export const metadata: Metadata = {
  title: "Perplexity Search Orchestrator",
  description: "Desktop app for scheduling and running automated Perplexity API searches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div className="flex h-screen">
            <aside className="w-64 border-r">
              <Nav />
            </aside>
            <div className="flex flex-1 flex-col">
              <Header />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}

