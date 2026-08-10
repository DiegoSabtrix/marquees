import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "MARQuees Lights and Events",
  description:
    "4-foot marquee letter rentals in Lawrenceville, Georgia, with local pickup and flat-rate delivery. Build your word, check availability and reserve online.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
