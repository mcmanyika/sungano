import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClientProviders } from "@/components/layout/ClientProviders";
import { siteConfig } from "@/lib/data";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0F3D91",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`,
  },
  description:
    "Sungano yeVanhu – Ubumbano Lomphakathi (The People's Coalition) is a broad, voluntary and institution-based national coalition committed to constitutional democracy, the rule of law and the sovereignty of the people of Zimbabwe.",
  keywords: [
    "constitutional restoration",
    "democracy",
    "Zimbabwe",
    "People's Coalition",
    "civic participation",
    "rule of law",
    "constitutional democracy",
    "Sungano yeVanhu",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_ZW",
    url: siteConfig.url,
    title: siteConfig.name,
    description:
      "Restore the Constitution. Restore Our Democracy. Justice in the Courts. Sovereignty with the People. Peacefully. Lawfully. Together.",
    siteName: siteConfig.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description:
      "A People's Coalition committed to constitutional democracy, justice, and the sovereignty of the people of Zimbabwe.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
