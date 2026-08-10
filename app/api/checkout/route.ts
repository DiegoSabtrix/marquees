import { createPendingBooking, createPaymentAttempt, attachStripeSession, failPaymentAttempt, getStripeSettings } from "../../../db/store";
import { decryptStripeSecret } from "../../../lib/stripe-settings";

function publicOrigin(request:Request) {
  const configured=process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/,"");
  if(configured) return configured;
  const forwardedHost=request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host=forwardedHost||request.headers.get("host")?.trim();
  const forwardedProto=request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol=forwardedProto||"https";
  if(host&&!/^(?:localhost|127\.0\.0\.1)(?::|$)/i.test(host)) return `${protocol}://${host}`;
  return "https://www.atlantamarqueeletters.com";
}

export async function POST(request:Request) {
  try {
    const body=await request.json();
    if(!body.draftId||!body.data?.email||!body.data?.customerName||!body.data?.eventDate) return Response.json({error:"Complete all reservation details first"},{status:400});
    const settings=await getStripeSettings();
    if(!settings) return Response.json({error:"Online payment is not configured yet. Please contact us at 404-671-3228."},{status:503});
    const mode=(settings.active_mode||"test") as "test"|"live";
    const encrypted=settings[`${mode}_secret_key_encrypted`] as string|undefined;
    if(!encrypted) return Response.json({error:`Stripe ${mode} mode is not configured yet. Please contact us at 404-671-3228.`},{status:503});
    const secret=await decryptStripeSecret(encrypted);
    const bookingId=await createPendingBooking(body.data,body.draftId);
    const amount=Math.round(Number(body.total)*100);
    if(!Number.isFinite(amount)||amount<50) return Response.json({error:"Invalid payment amount"},{status:400});
    const attemptId=await createPaymentAttempt({bookingId,draftId:body.draftId,mode,amount:amount/100,status:"Creating checkout"});
    const origin=publicOrigin(request);
    const params=new URLSearchParams();
    params.set("mode","payment"); params.set("success_url",`${origin}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`); params.set("cancel_url",`${origin}/?payment=cancelled&draft=${encodeURIComponent(body.draftId)}#book`);
    params.set("customer_email",body.data.email); params.set("client_reference_id",bookingId);
    params.set("line_items[0][price_data][currency]","usd"); params.set("line_items[0][price_data][unit_amount]",String(amount)); params.set("line_items[0][price_data][product_data][name]",`${body.data.phrase} marquee letter rental`); params.set("line_items[0][quantity]","1");
    params.set("metadata[booking_id]",bookingId); params.set("metadata[draft_id]",body.draftId); params.set("payment_intent_data[metadata][booking_id]",bookingId);
    let stripe:Response;
    try { stripe=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/x-www-form-urlencoded","Idempotency-Key":attemptId},body:params}); }
    catch { await failPaymentAttempt(attemptId,"Stripe network error"); return Response.json({error:"Stripe is temporarily unavailable. Please try again."},{status:502}); }
    const stripeText=await stripe.text();
    const result=(stripeText?JSON.parse(stripeText):{}) as {id?:string;url?:string;error?:{message?:string}};
    if(!stripe.ok||!result.id||!result.url) { const message=result.error?.message||"Stripe could not start checkout"; await failPaymentAttempt(attemptId,message); return Response.json({error:message},{status:502}); }
    await attachStripeSession(attemptId,result.id);
    return Response.json({url:result.url});
  } catch(error) {
    console.error("Checkout failed",error);
    const message=error instanceof Error?error.message:"";
    const configurationError=/PostgreSQL|DATABASE_URL|not configured|Database binding/i.test(message);
    return Response.json({error:configurationError?"Online booking is temporarily unavailable while payment setup is completed. Please call or text 404-671-3228.":"We could not start secure payment. Please try again or call 404-671-3228."},{status:503});
  }
}
