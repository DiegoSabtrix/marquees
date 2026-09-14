import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
export const metadata: Metadata = {
  title: "Marquee Letter Rentals in Atlanta & Lawrenceville, GA | MARQuees",
  description:
    "Rent illuminated 4-foot marquee letters, numbers and light-up signs for weddings, birthdays and events in Atlanta, Lawrenceville, Duluth, Norcross and Sandy Springs, GA. Check availability and book online.",
  keywords: [
    "marquee letters Atlanta",
    "marquee letter rentals Atlanta GA",
    "light up letters Lawrenceville GA",
    "marquee letters rental near me",
    "4 ft marquee letters",
    "4 foot marquee letters with lights",
    "wedding marquee letters Atlanta",
    "birthday light up letters",
    "marquee number rental",
    "marquee lights Duluth GA",
    "marquee letters Norcross GA",
    "marquee letters Sandy Springs GA",
    "illuminated event letters Georgia",
  ],
  alternates: { canonical: "https://marquees-lights-events.diego681936.chatgpt.site/" },
  openGraph: {
    title: "Marquee Letter Rentals in Atlanta & Lawrenceville, GA",
    description: "4-foot illuminated marquee letters and numbers for Atlanta-area celebrations. Check availability and reserve online.",
    type: "website",
    locale: "en_US",
    siteName: "MARQuees Lights and Events",
  },
  twitter: {
    card: "summary",
    title: "Marquee Letter Rentals in Atlanta & Lawrenceville, GA",
    description: "4-foot illuminated marquee letters and numbers for Atlanta-area celebrations.",
  },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  icons: { icon: "/brand/marquees-logo.png" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WN549WV4LJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', 'G-WN549WV4LJ');
gtag('config', 'AW-18419005508');`}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-886E4EGBEZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-marquees" strategy="afterInteractive">
          {`gtag('config', 'G-886E4EGBEZ');`}
        </Script>
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "MARQuees Lights and Events",
              description: "4-foot illuminated marquee letter and number rentals for events in Atlanta and Northeast Georgia.",
              url: "https://marquees-lights-events.diego681936.chatgpt.site/",
              telephone: "+1-404-671-3228",
              priceRange: "$$",
              areaServed: ["Atlanta, GA", "Lawrenceville, GA", "Duluth, GA", "Norcross, GA", "Sandy Springs, GA", "Dacula, GA", "Suwanee, GA", "Lilburn, GA", "Snellville, GA"],
              serviceType: ["Marquee letter rental", "Light up letter rental", "Event decor rental", "Marquee number rental"],
              knowsAbout: ["4 ft marquee letters", "wedding marquee letters", "birthday light up letters", "illuminated event signs"],
            }),
          }}
        />
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
