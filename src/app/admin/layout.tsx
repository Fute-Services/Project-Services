import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Script id="register-sw" strategy="afterInteractive">
        {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js', { scope: '/admin/' }); }); }`}
      </Script>
    </>
  );
}
