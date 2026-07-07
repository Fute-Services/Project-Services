import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fute Softwares - App Distribution Portal",
  description: "Deliver apps to your clients, simply and securely.",
  appleWebApp: {
    title: "Fute Softwares",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); }); }`}
        </Script>
      </body>
    </html>
  );
}
