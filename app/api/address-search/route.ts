export async function GET(request:Request){
  const key=process.env.GEOAPIFY_API_KEY?.trim();
  const q=new URL(request.url).searchParams.get("q")?.trim()||"";
  if(q.length<4)return Response.json({suggestions:[],configured:true});
  try{
    if(!key){
      const url=new URL("https://photon.komoot.io/api/");
      url.searchParams.set("q",q);url.searchParams.set("limit","5");url.searchParams.set("lang","en");url.searchParams.set("lat","33.9562");url.searchParams.set("lon","-83.9879");url.searchParams.set("bbox","-85.7,30.3,-80.8,35.1");
      const response=await fetch(url,{headers:{"User-Agent":"MARQuees-Lights-Events/1.0 (info@sabtrix.com)"},signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error();
      const data=await response.json();
      const suggestions=(data.features||[]).filter((x:any)=>x.properties?.state==="Georgia"&&x.properties?.street&&x.properties?.housenumber).map((x:any)=>({
        label:[x.properties.housenumber,x.properties.street,x.properties.city,x.properties.state,x.properties.postcode].filter(Boolean).join(", "),address:[x.properties.housenumber,x.properties.street].filter(Boolean).join(" "),city:x.properties.city||x.properties.county||"",state:"GA",zip:x.properties.postcode||"",latitude:x.geometry.coordinates[1],longitude:x.geometry.coordinates[0]
      }));
      return Response.json({suggestions,configured:true,provider:"photon"});
    }
    const url=new URL("https://api.geoapify.com/v1/geocode/autocomplete");
    url.searchParams.set("text",q);url.searchParams.set("format","json");url.searchParams.set("filter","countrycode:us");url.searchParams.set("bias","proximity:-83.9879,33.9562");url.searchParams.set("limit","5");url.searchParams.set("apiKey",key);
    const response=await fetch(url,{signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error();
    const data=await response.json();
    const suggestions=(data.results||[]).filter((x:any)=>String(x.state_code||"").toUpperCase()==="GA"&&x.street&&x.housenumber).map((x:any)=>({
      label:x.formatted,address:[x.housenumber,x.street].filter(Boolean).join(" "),city:x.city||x.county||"",state:"GA",zip:x.postcode||"",latitude:x.lat,longitude:x.lon
    }));
    return Response.json({suggestions,configured:true,provider:"geoapify"});
  }catch{return Response.json({suggestions:[],configured:true},{status:502})}
}
