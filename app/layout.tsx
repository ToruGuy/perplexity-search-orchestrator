import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

