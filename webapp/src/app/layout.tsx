import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import { Providers } from "@/components/providers/providers";
import { getSystemSettings } from "@/lib/actions/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();
  return {
    title: settings.site_name || "IMP 2026",
    description: "Hệ thống quản lý chương trình Mentoring IMP 2026",
    icons: {
      icon: settings.favicon || "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      data-ui-style="liquid-glass"
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
