import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const rawHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const host = rawHost?.replace(/[^a-zA-Z0-9.:-]/g, "") || "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol === "http" ? "http" : host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return {
    title: "IM2026 Service Switchboard",
    description: "Discover where your transferable skills could serve Australia next.",
    metadataBase: new URL(origin),
    openGraph: {
      title: "IM2026 Service Switchboard",
      description: "Your skills. Australia's public services. More possible paths.",
      type: "website",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1536,
          height: 1024,
          alt: "IM2026 Service Switchboard share card showing a central profile branching to Australian public-service pathways",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "IM2026 Service Switchboard",
      description: "See where your skills could serve Australia next.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
