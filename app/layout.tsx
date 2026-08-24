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
      <head>
        <script
          id="meta-pixel"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '4695129254098489');
fbq('track', 'PageView');`,
          }}
        />
      </head>
      <body>
        {children}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=4695129254098489&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
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
