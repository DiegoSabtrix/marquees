import { cookieToken, validAdminToken } from "../../../../lib/admin-auth";
import { listAdminRecords, updateBookingStatus } from "../../../../db/store";

export async function GET(request:Request) {
  if (!await validAdminToken(cookieToken(request))) return Response.json({error:"Unauthorized"},{status:401});
  try { return Response.json(await listAdminRecords()); }
  catch (error) { console.error("Admin records failed", error); return Response.json({error:"Database unavailable"},{status:503}); }
}

export async function PATCH(request:Request) {
  if (!await validAdminToken(cookieToken(request))) return Response.json({error:"Unauthorized"},{status:401});
  const {id,status}=await request.json();
  const allowed=["New request","In service","Ready for pickup","Picked up","Completed","Cancelled","Awaiting payment"];
  if(!id||!allowed.includes(status)) return Response.json({error:"Invalid update"},{status:400});
  await updateBookingStatus(id,status);
  return Response.json({ok:true});
}
