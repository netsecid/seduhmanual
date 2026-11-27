import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ThemeProvider from "@/components/ThemeProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "seduhmanual",
  description: "V60 recipes and calculator with a step-by-step brew timer",
  applicationName: "seduhmanual",
  appleWebApp: {
    capable: true,
    title: "seduhmanual",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="auto"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      <body className="min-h-dvh">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('seduhmanual_theme');if(t){document.documentElement.dataset.theme=t}}catch(e){}})();`}
        </Script>
        <Script id="install-prompt-capture" strategy="beforeInteractive">
          {`window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__deferredInstallPrompt=e;window.dispatchEvent(new Event('installpromptready'));});`}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
