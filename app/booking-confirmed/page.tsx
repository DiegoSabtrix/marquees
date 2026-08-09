"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Confirmed(){const params=useSearchParams();const id=params.get("id")||"Pending";return <main className="confirm"><div><p className="eyebrow">MARQUEES LIGHTS & EVENTS</p><i>✦</i><h1>REQUEST RECEIVED!</h1><p>Your event request is now in our system.</p><section><small>REQUEST NUMBER</small><b>{id}</b><hr/><small>STATUS</small><h2>NEW REQUEST</h2><p>Payment has not been collected yet.</p></section><h3>What happens next?</h3><p>Our team will review your event and contact you with availability and payment instructions.</p><Link className="btn gold" href="/">BACK TO HOME</Link></div></main>}
