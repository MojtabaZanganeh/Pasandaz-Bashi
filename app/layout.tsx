import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "../components/ui/toaster";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "پس‌انداز باشی - محاسبه‌گر درآمد و هزینه‌ها",
  description: "محاسبه زمان کار مورد نیاز برای تأمین هزینه‌ها",
  keywords: ["محاسبه", "درآمد", "ساعت کاری", "صرفه‌جویی"],
  authors: [{ name: "Income Calculator Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "پس‌انداز باشی - محاسبه‌گر درآمد و هزینه‌ها",
    description: "محاسبه زمان کار مورد نیاز برای تأمین هزینه‌ها",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "پس‌انداز باشی - محاسبه‌گر درآمد و هزینه‌ها",
    description: "محاسبه زمان کار مورد نیاز برای تأمین هزینه‌ها",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="پس‌انداز باشی" />
      </head>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
