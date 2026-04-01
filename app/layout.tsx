import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AdminProvider } from "@/components/providers/AdminProvider";
import { Toaster } from "@/components/ui/sonner";
import { AtmosphereProvider } from "@/components/atmosphere/AtmosphereProvider";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { getMoodOverrides, getCustomPresets } from "@/lib/getMoodPresets";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeff Thompson",
  description: "Lighting designer and software creator",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [moodOverrides, customPresets] = await Promise.all([
    getMoodOverrides(),
    getCustomPresets(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <AdminProvider>
            <AtmosphereProvider moodOverrides={moodOverrides} customPresets={customPresets}>
              {children}
              <FloatingNav />
            </AtmosphereProvider>
            <Toaster />
          </AdminProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <PageViewTracker />
      </body>
    </html>
  );
}
