"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense,useEffect,useState } from "react";

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

function ConfirmationContent(){
  const params=useSearchParams(),sessionId=params.get("session_id"),[state,setState]=useState<"checking"|"paid"|"pending"|"error">("checking"),[bookingId,setBookingId]=useState("");
  useEffect(()=>{if(!sessionId){setState("error");return}fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`,{cache:"no-store"}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error();setBookingId(data.bookingId||"");setState(data.paid?"paid":"pending");if(data.paid){const key=`meta-purchase:${sessionId}`;if(!sessionStorage.getItem(key)){window.fbq?.("track","Purchase",{value:Number(data.amount||0),currency:data.currency||"USD",content_type:"service",content_name:"Marquee letter rental booking",order_id:data.bookingId||""});sessionStorage.setItem(key,"1")}}}).catch(()=>setState("error"))},[sessionId]);
  return <main className="confirm"><div><p className="eyebrow">MARQUEES LIGHTS & EVENTS</p><i>{state==="paid"?"✓":"✦"}</i><h1>{state==="checking"?"VERIFYING PAYMENT…":state==="paid"?"BOOKING CONFIRMED!":state==="pending"?"PAYMENT PROCESSING":"WE COULDN'T VERIFY PAYMENT"}</h1><p>{state==="paid"?"Your payment was received and your event is now in our system.":state==="checking"?"Please keep this page open.":state==="pending"?"Stripe is still processing your payment. We will update your booking automatically.":"Your card may not have been charged. Contact us if you need assistance."}</p>{bookingId&&<section><small>BOOKING NUMBER</small><b>{bookingId}</b><hr/><small>STATUS</small><h2>{state==="paid"?"PAID · NEW REQUEST":"PAYMENT PENDING"}</h2></section>}<p>Questions? Call or text <a href="tel:+14046713228">404-671-3228</a>.</p><Link className="btn gold" href="/">BACK TO HOME</Link></div></main>;
}

export default function Confirmed(){
  return <Suspense fallback={<main className="confirm"><div><p className="eyebrow">MARQUEES LIGHTS & EVENTS</p><h1>VERIFYING PAYMENT…</h1></div></main>}><ConfirmationContent/></Suspense>;
}
