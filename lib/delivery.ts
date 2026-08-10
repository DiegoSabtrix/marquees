const ORIGIN_COORDINATES = { latitude: 33.9562, longitude: -83.9879 };
const BASE_DELIVERY_FEE = 75;

export type DeliveryQuote = {
  miles: number;
  baseFee: number;
  additionalMiles: number;
  additionalFee: number;
  totalFee: number;
  eligibility: "standard" | "extended" | "call";
  source: "geoapify" | "census-openstreetmap";
  verifiedAddress: string;
  latitude: number;
  longitude: number;
};

type AddressInput = {address?:string;address2?:string;city?:string;state?:string;zip?:string};

function priceQuote(distanceMeters:number, source:DeliveryQuote["source"], location:{verifiedAddress:string;latitude:number;longitude:number}):DeliveryQuote {
  const miles=Math.round((distanceMeters/1609.344)*10)/10;
  const additionalMiles=miles>20?Math.ceil(miles-20):0;
  const additionalFee=additionalMiles*3;
  return {miles,baseFee:BASE_DELIVERY_FEE,additionalMiles,additionalFee,totalFee:BASE_DELIVERY_FEE+additionalFee,eligibility:miles<=20?"standard":miles<=40?"extended":"call",source,...location};
}

function destinationText(input:AddressInput){
  return [input.address,input.address2,input.city,input.state,input.zip,"USA"].filter(Boolean).join(", ");
}

function validateInput(input:AddressInput){
  const address=String(input.address||"").trim(),city=String(input.city||"").trim(),state=String(input.state||"").trim(),zip=String(input.zip||"").trim();
  if(!address||!city||state!=="GA"||!/^\d{5}$/.test(zip)) throw new Error("Enter a complete Georgia delivery address.");
}

async function geoapifyQuote(input:AddressInput,apiKey:string){
  const geocode=new URL("https://api.geoapify.com/v1/geocode/search");
  geocode.searchParams.set("text",destinationText(input));geocode.searchParams.set("format","json");geocode.searchParams.set("filter","countrycode:us");geocode.searchParams.set("limit","1");geocode.searchParams.set("apiKey",apiKey);
  const geoResponse=await fetch(geocode,{signal:AbortSignal.timeout(10000)});
  if(!geoResponse.ok) throw new Error("Address verification is temporarily unavailable.");
  const geo=await geoResponse.json();const match=geo.results?.[0];
  if(!match||!Number.isFinite(Number(match.lat))||!Number.isFinite(Number(match.lon))) throw new Error("We could not verify that address. Select a suggested address and try again.");
  if(String(match.state_code||"").toUpperCase()!=="GA") throw new Error("Delivery is currently available only in Georgia.");
  const latitude=Number(match.lat),longitude=Number(match.lon);
  const route=new URL("https://api.geoapify.com/v1/routing");
  route.searchParams.set("waypoints",`${ORIGIN_COORDINATES.latitude},${ORIGIN_COORDINATES.longitude}|${latitude},${longitude}`);route.searchParams.set("mode","drive");route.searchParams.set("format","json");route.searchParams.set("apiKey",apiKey);
  const routeResponse=await fetch(route,{signal:AbortSignal.timeout(10000)});if(!routeResponse.ok) throw new Error("Driving distance is temporarily unavailable.");
  const routeData=await routeResponse.json();const meters=Number(routeData.results?.[0]?.distance);
  if(!meters) throw new Error("No driving route was found for this address.");
  return priceQuote(meters,"geoapify",{verifiedAddress:String(match.formatted||destinationText(input)),latitude,longitude});
}

async function censusQuote(input:AddressInput){
  const search=new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
  search.searchParams.set("address",destinationText(input));search.searchParams.set("benchmark","Public_AR_Current");search.searchParams.set("format","json");
  const geoResponse=await fetch(search,{signal:AbortSignal.timeout(10000)});if(!geoResponse.ok) throw new Error("Address verification is temporarily unavailable.");
  const geo=await geoResponse.json();const match=geo.result?.addressMatches?.[0];
  if(!match?.coordinates) throw new Error("We could not verify that address. Check the street, city and ZIP code.");
  const latitude=Number(match.coordinates.y),longitude=Number(match.coordinates.x);
  const route=`https://router.project-osrm.org/route/v1/driving/${ORIGIN_COORDINATES.longitude},${ORIGIN_COORDINATES.latitude};${longitude},${latitude}?overview=false&alternatives=false&steps=false`;
  const routeResponse=await fetch(route,{headers:{"User-Agent":"MARQuees-Lights-Events/1.0 (info@sabtrix.com)"},signal:AbortSignal.timeout(10000)});if(!routeResponse.ok) throw new Error("Driving distance is temporarily unavailable.");
  const routeData=await routeResponse.json();const meters=Number(routeData.routes?.[0]?.distance);if(!meters) throw new Error("No driving route was found for this address.");
  return priceQuote(meters,"census-openstreetmap",{verifiedAddress:String(match.matchedAddress||destinationText(input)),latitude,longitude});
}

export async function quoteDelivery(input:AddressInput){
  validateInput(input);
  const apiKey=process.env.GEOAPIFY_API_KEY?.trim();
  return apiKey?geoapifyQuote(input,apiKey):censusQuote(input);
}
