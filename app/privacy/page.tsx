import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | MARQuees Lights and Events",
  description:
    "Learn how MARQuees Lights and Events collects, uses and protects information through its website and booking process.",
};

export default function PrivacyPage() {
  return <LegalPage page="privacy" />;
}
