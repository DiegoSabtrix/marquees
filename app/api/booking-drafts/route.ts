import { saveDraft } from "../../../db/store";

export async function POST(request:Request) {
  try {
    const body=await request.json();
    const id=await saveDraft({id:body.id,step:Number(body.step)||1,data:body.data||{},total:Number(body.total)||0});
    return Response.json({id});
  } catch(error) { console.error("Draft save failed",error); return Response.json({error:"Could not save progress"},{status:503}); }
}
