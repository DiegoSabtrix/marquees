import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Rental Terms & Conditions | MARQuees Lights and Events",
  description:
    "Review the rental terms for MARQuees Lights and Events illuminated marquee letters, numbers, pickup, delivery and setup.",
};

export default function TermsPage() {
  return <LegalPage page="terms" />;
}
