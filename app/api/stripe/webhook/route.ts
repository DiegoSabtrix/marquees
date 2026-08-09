import { getStripeSettings, markPayment } from "../../../../db/store";
import { decryptStripeSecret, safeSecretMatch } from "../../../../lib/stripe-settings";

async function hmac(secret:string,payload:string) {
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(payload)))].map(x=>x.toString(16).padStart(2,"0")).join("");
}

export async function POST(request:Request) {
  const raw=await request.text(); const header=request.headers.get("stripe-signature")||"";
  const parts=Object.fromEntries(header.split(",").map(part=>part.split("=",2))) as Record<string,string>;
  if(!parts.t||!parts.v1) return new Response("Invalid signature",{status:400});
  const settings=await getStripeSettings();
  const encryptedSecrets=[settings?.test_webhook_secret_encrypted,settings?.live_webhook_secret_encrypted].filter(Boolean) as string[];
  if(!encryptedSecrets.length) return new Response("Webhook not configured",{status:503});
  let valid=false;
  for(const encrypted of encryptedSecrets) { const secret=await decryptStripeSecret(encrypted); const expected=await hmac(secret,`${parts.t}.${raw}`); if(safeSecretMatch(expected,parts.v1)) { valid=true; break; } }
  if(!valid||Math.abs(Date.now()/1000-Number(parts.t))>300) return new Response("Invalid signature",{status:400});
  const event=JSON.parse(raw) as {type:string;data:{object:{id:string;payment_status?:string;amount_total?:number}}};
  if(event.type==="checkout.session.completed"&&event.data.object.payment_status==="paid") await markPayment(event.data.object.id,"Paid",(event.data.object.amount_total||0)/100);
  if(event.type==="checkout.session.expired") await markPayment(event.data.object.id,"Expired",0,"Checkout expired");
  return Response.json({received:true});
}
