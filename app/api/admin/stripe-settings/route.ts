import { cookieToken, validAdminToken } from "../../../../lib/admin-auth";
import { getStripeSettings, saveStripeSettings } from "../../../../db/store";
import { encryptStripeSecret, secretSummary } from "../../../../lib/stripe-settings";

type Mode="test"|"live";
const field=(mode:Mode,name:string)=>`${mode}_${name}`;

export async function GET(request:Request) {
  if(!await validAdminToken(cookieToken(request))) return Response.json({error:"Unauthorized"},{status:401});
  const settings=await getStripeSettings();
  const requestedMode=new URL(request.url).searchParams.get("mode");
  const activeMode=(settings?.active_mode||"test") as Mode;
  const mode=(requestedMode==="test"||requestedMode==="live"?requestedMode:activeMode) as Mode;
  const secret=await secretSummary((settings?.[field(mode,"secret_key_encrypted")] as string)||null);
  const webhook=await secretSummary((settings?.[field(mode,"webhook_secret_encrypted")] as string)||null);
  return Response.json({mode,activeMode,publishableKey:settings?.[field(mode,"publishable_key")]||"",secret,webhook,updatedAt:settings?.updated_at||null});
}

export async function PUT(request:Request) {
  if(!await validAdminToken(cookieToken(request))) return Response.json({error:"Unauthorized"},{status:401});
  const body=await request.json() as {mode:Mode;publishableKey?:string;secretKey?:string;webhookSecret?:string};
  if(!["test","live"].includes(body.mode)) return Response.json({error:"Invalid mode"},{status:400});
  const prefix=body.mode==="test"?"test":"live";
  if(body.publishableKey&&!body.publishableKey.startsWith(`pk_${prefix}_`)) return Response.json({error:`Publishable key must start with pk_${prefix}_`},{status:400});
  if(body.secretKey&&!body.secretKey.startsWith(`sk_${prefix}_`)) return Response.json({error:`Secret key must start with sk_${prefix}_`},{status:400});
  if(body.webhookSecret&&!body.webhookSecret.startsWith("whsec_")) return Response.json({error:"Webhook secret must start with whsec_"},{status:400});
  const existing=await getStripeSettings();
  const values:Record<string,unknown>={active_mode:body.mode,updated_at:new Date().toISOString()};
  values[field(body.mode,"publishable_key")]=body.publishableKey?.trim()||existing?.[field(body.mode,"publishable_key")]||null;
  if(body.secretKey) values[field(body.mode,"secret_key_encrypted")]=await encryptStripeSecret(body.secretKey);
  if(body.webhookSecret) values[field(body.mode,"webhook_secret_encrypted")]=await encryptStripeSecret(body.webhookSecret);
  const secretSaved=body.secretKey||existing?.[field(body.mode,"secret_key_encrypted")];
  if(!values[field(body.mode,"publishable_key")]||!secretSaved) return Response.json({error:`Add the ${body.mode} publishable and secret keys before activating this mode`},{status:400});
  await saveStripeSettings(values);
  return Response.json({ok:true});
}
