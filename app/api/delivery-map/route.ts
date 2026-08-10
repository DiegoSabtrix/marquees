const ORIGIN="Downtown Lawrenceville, Lawrenceville, GA 30046";

export async function GET(request:Request){
  const params=new URL(request.url).searchParams;
  const lat=Number(params.get("lat")),lon=Number(params.get("lon"));
  if(!Number.isFinite(lat)||!Number.isFinite(lon))return new Response("Invalid map coordinates",{status:400});
  const key=(process.env.GOOGLE_MAPS_EMBED_API_KEY||process.env.GOOGLE_MAPS_API_KEY||"").trim();
  if(key){
    const map=new URL("https://www.google.com/maps/embed/v1/directions");
    map.searchParams.set("key",key);map.searchParams.set("origin",ORIGIN);map.searchParams.set("destination",`${lat},${lon}`);map.searchParams.set("mode","driving");map.searchParams.set("units","imperial");map.searchParams.set("language","en");map.searchParams.set("region","us");
    return Response.redirect(map,302);
  }
  const map=new URL("https://www.openstreetmap.org/export/embed.html");
  map.searchParams.set("bbox",`${lon-.035},${lat-.025},${lon+.035},${lat+.025}`);map.searchParams.set("layer","mapnik");map.searchParams.set("marker",`${lat},${lon}`);
  return Response.redirect(map,302);
}
