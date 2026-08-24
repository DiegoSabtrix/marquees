import { getBookingForCrm, getPaymentAttemptBySession, getStripeSettings, markPayment } from "../../../../db/store";
import { decryptStripeSecret } from "../../../../lib/stripe-settings";
import { notifyCrm } from "../../../../lib/crm-webhook";

export async function GET(request:Request) {
  const sessionId=new URL(request.url).searchParams.get("session_id");
  if(!sessionId) return Response.json({error:"Missing session"},{status:400});
  const attempt=await getPaymentAttemptBySession(sessionId);
  const settings=await getStripeSettings(); const mode=(attempt?.mode||settings?.active_mode||"test") as "test"|"live";
  const encrypted=settings?.[`${mode}_secret_key_encrypted`] as string|undefined;
  if(!encrypted) return Response.json({error:"Stripe is not configured"},{status:503});
  const secret=await decryptStripeSecret(encrypted);
  const response=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{Authorization:`Bearer ${secret}`}});
  const session=await response.json() as {payment_status?:string;amount_total?:number;client_reference_id?:string};
  if(!response.ok) return Response.json({error:"Unable to verify payment"},{status:502});
  const paid=session.payment_status==="paid";
  const payment=await markPayment(sessionId,paid?"Paid":"Pending",paid?(session.amount_total||0)/100:0);
  const bookingId=payment.bookingId||session.client_reference_id||"";
  const amount=(session.amount_total||0)/100;
  if(paid&&payment.transitionedToPaid&&bookingId) {
    const booking=await getBookingForCrm(bookingId);
    if(booking) await notifyCrm({stage:"booking_paid",eventId:`paid:${bookingId}`,bookingId,data:booking,total:amount,paymentStatus:"Paid"});
  }
  return Response.json({paid,bookingId,amount,currency:"USD"});
}
