import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
export const metadata: Metadata = {
  title: "MARQuees Lights and Events",
  description:
    "4-foot marquee letter rentals in Lawrenceville, Georgia, with local pickup and flat-rate delivery. Build your word, check availability and reserve online.",
  other: {
    "codex-preview": "development",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="6a83c5cafd1f04b14e20f9c9"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
