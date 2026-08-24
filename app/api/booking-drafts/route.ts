import { saveDraft } from "../../../db/store";
import { notifyCrm } from "../../../lib/crm-webhook";

export async function POST(request:Request) {
  try {
    const body=await request.json();
    const id=await saveDraft({id:body.id,step:Number(body.step)||1,data:body.data||{},total:Number(body.total)||0});
    if(Number(body.step)>=5&&body.data?.email&&body.data?.customerName) {
      await notifyCrm({stage:"lead_created",eventId:`lead:${id}`,draftId:id,data:body.data,total:Number(body.total)||0,paymentStatus:"Lead"});
    }
    return Response.json({id});
  } catch(error) { console.error("Draft save failed",error); return Response.json({error:"Could not save progress"},{status:503}); }
}
