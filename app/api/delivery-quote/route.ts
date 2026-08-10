import { quoteDelivery } from "../../../lib/delivery";

export async function POST(request:Request) {
  try {
    const quote=await quoteDelivery(await request.json());
    return Response.json(quote);
  } catch(error) {
    return Response.json({error:error instanceof Error?error.message:"Unable to calculate delivery distance."},{status:400});
  }
}
