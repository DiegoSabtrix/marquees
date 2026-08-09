"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Booking = { id:string; createdAt:string; eventDate:string; startTime:string; endTime:string; phrase:string; service:string; fulfillment:string; zip:string|null; floor:string|null; elevator:string|null; customerName:string; email:string; phone:string|null; eventType:string|null; venue:string|null; displayLocation:string|null; notes:string|null; total:number; amountPaid:number; paymentStatus:string; status:string; letterCount:number };
type SecretState = { configured:boolean; last4:string|null };
type StripeSettings = { activeMode:"test"|"live"; testPublishableKey:string; livePublishableKey:string; testSecret:SecretState; testWebhook:SecretState; liveSecret:SecretState; liveWebhook:SecretState; updatedAt:string|null };
type StripeForm = { activeMode:"test"|"live"; testPublishableKey:string; testSecretKey:string; testWebhookSecret:string; livePublishableKey:string; liveSecretKey:string; liveWebhookSecret:string };

const statuses = ["New request", "In service", "Ready for pickup", "Picked up", "Completed", "Cancelled"];
const emptySecret = { configured:false, last4:null };
const emptySettings: StripeSettings = { activeMode:"test", testPublishableKey:"", livePublishableKey:"", testSecret:emptySecret, testWebhook:emptySecret, liveSecret:emptySecret, liveWebhook:emptySecret, updatedAt:null };

function Logo() {
  return <img className="adminBrandLogo" src="/brand/marquees-logo.png" alt="Marquees Lights & Events" />;
}

export default function AdminPortal() {
  const [authenticated,setAuthenticated] = useState<boolean|null>(null);
  const [items,setItems] = useState<Booking[]>([]);
  const [username,setUsername] = useState("admin2026");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [query,setQuery] = useState("");
  const [statusFilter,setStatusFilter] = useState("All");
  const [dateFilter,setDateFilter] = useState("");
  const [selected,setSelected] = useState<Booking|null>(null);
  const [loading,setLoading] = useState(false);
  const [tab,setTab] = useState<"requests"|"stripe">("requests");
  const [stripe,setStripe] = useState<StripeSettings>(emptySettings);
  const [stripeForm,setStripeForm] = useState<StripeForm>({ activeMode:"test", testPublishableKey:"", testSecretKey:"", testWebhookSecret:"", livePublishableKey:"", liveSecretKey:"", liveWebhookSecret:"" });
  const [stripeMessage,setStripeMessage] = useState("");
  const [stripeSaving,setStripeSaving] = useState(false);

  const loadStripe = useCallback(async () => {
    const response = await fetch("/api/admin/stripe-settings", { cache:"no-store" });
    if (!response.ok) return;
    const data: StripeSettings = await response.json();
    setStripe(data);
    setStripeForm(current => ({ ...current, activeMode:data.activeMode, testPublishableKey:data.testPublishableKey, livePublishableKey:data.livePublishableKey, testSecretKey:"", testWebhookSecret:"", liveSecretKey:"", liveWebhookSecret:"" }));
  }, []);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/bookings", { cache:"no-store" });
    if (response.status === 401) { setAuthenticated(false); return; }
    if (response.ok) { setItems(await response.json()); setAuthenticated(true); void loadStripe(); }
  }, [loadStripe]);

  useEffect(() => { void load(); }, [load]);

  async function login(event:FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username,password}) });
    if (response.ok) { setPassword(""); await load(); } else setError("Incorrect username or password");
    setLoading(false);
  }

  async function logout() { await fetch("/api/admin/logout", { method:"POST" }); setItems([]); setAuthenticated(false); }
  async function changeStatus(id:string,status:string) { await fetch("/api/admin/bookings", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id,status}) }); setItems(current=>current.map(x=>x.id===id?{...x,status}:x)); setSelected(current=>current?.id===id?{...current,status}:current); }

  async function saveStripe(event:FormEvent) {
    event.preventDefault(); setStripeSaving(true); setStripeMessage("");
    const response = await fetch("/api/admin/stripe-settings", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(stripeForm) });
    const result = await response.json() as { error?:string };
    if (!response.ok) setStripeMessage(result.error || "Unable to save Stripe settings");
    else { setStripeMessage("Stripe settings saved securely."); await loadStripe(); }
    setStripeSaving(false);
  }

  const filtered = useMemo(() => items.filter(x => (statusFilter==="All"||x.status===statusFilter) && (!dateFilter||x.eventDate===dateFilter) && (!query||`${x.customerName} ${x.email} ${x.phone} ${x.phrase} ${x.id} ${x.eventType}`.toLowerCase().includes(query.toLowerCase()))), [items,statusFilter,dateFilter,query]);
  const money = (value:number) => value.toLocaleString("en-US", { style:"currency", currency:"USD" });
  const secretHint = (secret:SecretState) => secret.configured ? `Saved securely · ends in ${secret.last4 || "••••"}` : "Not configured";

  if (authenticated === null) return <main className="adminLoading">Loading secure portal…</main>;
  if (!authenticated) return <main className="adminLogin"><form onSubmit={login}><Logo/><p>MARQUEES LIGHTS & EVENTS</p><h1>Admin Portal</h1><span>Secure access for authorized staff only.</span><label>Username<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="loginError">{error}</div>}<button disabled={loading}>{loading?"SIGNING IN…":"SIGN IN"}</button><small>Protected session · Automatic logout after 8 hours</small></form></main>;

  return <main className="adminShell">
    <header><div><Logo/><span><b>MARQUEES</b><small>Operations Portal</small></span></div><button onClick={logout}>Log out ↗</button></header>
    <nav className="adminTabs"><button className={tab==="requests"?"active":""} onClick={()=>setTab("requests")}>Requests</button><button className={tab==="stripe"?"active":""} onClick={()=>setTab("stripe")}>Stripe settings</button></nav>
    {tab === "requests" ? <section className="adminContent">
      <div className="adminTitle"><div><p>OPERATIONS OVERVIEW</p><h1>Event requests</h1><span>Track leads, payments and service progress.</span></div><button onClick={load}>↻ Refresh</button></div>
      <div className="adminStats"><article><span>Total requests</span><b>{items.length}</b></article><article><span>Upcoming events</span><b>{items.filter(x=>x.eventDate>=new Date().toISOString().slice(0,10)&&x.status!=="Cancelled").length}</b></article><article><span>Collected</span><b>{money(items.reduce((sum,x)=>sum+x.amountPaid,0))}</b></article><article><span>Open services</span><b>{items.filter(x=>!["Completed","Cancelled"].includes(x.status)).length}</b></article></div>
      <div className="adminFilters"><input placeholder="Search customer, word, email or request…" value={query} onChange={e=>setQuery(e.target.value)}/><input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option>{statuses.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="adminTable"><table><thead><tr><th>Event date</th><th>Customer</th><th>Service</th><th>Total / Paid</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><b>{new Date(`${item.eventDate}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</b><small>{item.startTime}–{item.endTime}</small></td><td><b>{item.customerName}</b><small>{item.email}</small></td><td><b>{item.phrase}</b><small>{item.eventType||item.service}</small></td><td><b>{money(item.total)}</b><small>{money(item.amountPaid)} paid</small></td><td><select className={`statusSelect status-${item.status.replaceAll(" ","").toLowerCase()}`} value={item.status} onChange={e=>changeStatus(item.id,e.target.value)}>{statuses.map(x=><option key={x}>{x}</option>)}</select></td><td><button className="viewButton" onClick={()=>setSelected(item)}>View →</button></td></tr>)}</tbody></table>{!filtered.length&&<div className="emptyState">No requests match these filters.</div>}</div>
    </section> : <section className="adminContent stripeSettings">
      <div className="adminTitle"><div><p>SUPER ADMIN</p><h1>Stripe settings</h1><span>Manage test and production credentials without exposing secret keys.</span></div></div>
      <form onSubmit={saveStripe}>
        <div className="stripeMode"><div><b>Active payment environment</b><span>The website will use the selected environment for new payments.</span></div><div className="modeButtons"><button type="button" className={stripeForm.activeMode==="test"?"active":""} onClick={()=>setStripeForm(x=>({...x,activeMode:"test"}))}>Test</button><button type="button" className={stripeForm.activeMode==="live"?"active live":""} onClick={()=>setStripeForm(x=>({...x,activeMode:"live"}))}>Production</button></div></div>
        <div className="stripeSecurity">🔒 Secret keys are encrypted before storage and are never displayed again. Leave a secret field blank to keep its saved value.</div>
        <div className="stripeGrid">
          <fieldset><legend><span>TEST</span> Sandbox credentials</legend><label>Publishable key<input value={stripeForm.testPublishableKey} onChange={e=>setStripeForm(x=>({...x,testPublishableKey:e.target.value}))} placeholder="pk_test_…"/></label><label>Secret key<input type="password" value={stripeForm.testSecretKey} onChange={e=>setStripeForm(x=>({...x,testSecretKey:e.target.value}))} placeholder={stripe.testSecret.configured?"Enter a new key to replace it":"sk_test_…"}/><small>{secretHint(stripe.testSecret)}</small></label><label>Webhook signing secret<input type="password" value={stripeForm.testWebhookSecret} onChange={e=>setStripeForm(x=>({...x,testWebhookSecret:e.target.value}))} placeholder={stripe.testWebhook.configured?"Enter a new secret to replace it":"whsec_…"}/><small>{secretHint(stripe.testWebhook)}</small></label></fieldset>
          <fieldset className="liveCredentials"><legend><span>LIVE</span> Production credentials</legend><label>Publishable key<input value={stripeForm.livePublishableKey} onChange={e=>setStripeForm(x=>({...x,livePublishableKey:e.target.value}))} placeholder="pk_live_…"/></label><label>Secret key<input type="password" value={stripeForm.liveSecretKey} onChange={e=>setStripeForm(x=>({...x,liveSecretKey:e.target.value}))} placeholder={stripe.liveSecret.configured?"Enter a new key to replace it":"sk_live_…"}/><small>{secretHint(stripe.liveSecret)}</small></label><label>Webhook signing secret<input type="password" value={stripeForm.liveWebhookSecret} onChange={e=>setStripeForm(x=>({...x,liveWebhookSecret:e.target.value}))} placeholder={stripe.liveWebhook.configured?"Enter a new secret to replace it":"whsec_…"}/><small>{secretHint(stripe.liveWebhook)}</small></label></fieldset>
        </div>
        <div className="stripeSave"><span>{stripe.updatedAt?`Last updated ${new Date(stripe.updatedAt).toLocaleString()}`:"No credentials saved yet"}</span>{stripeMessage&&<b className={stripeMessage.includes("saved")?"ok":"bad"}>{stripeMessage}</b>}<button disabled={stripeSaving}>{stripeSaving?"Saving…":"Save Stripe settings"}</button></div>
      </form>
    </section>}
    {selected&&<div className="adminOverlay" onClick={()=>setSelected(null)}><aside onClick={e=>e.stopPropagation()}><button className="closeDetail" onClick={()=>setSelected(null)}>×</button><p className="eyebrow">{selected.id}</p><h2>{selected.customerName}</h2><div className="detailStatus"><span>Status</span><select value={selected.status} onChange={e=>changeStatus(selected.id,e.target.value)}>{statuses.map(x=><option key={x}>{x}</option>)}</select></div><h3>Event</h3><dl><div><dt>Date & time</dt><dd>{selected.eventDate}<br/>{selected.startTime}–{selected.endTime}</dd></div><div><dt>Service</dt><dd>{selected.phrase}<br/>{selected.service}</dd></div><div><dt>Event type</dt><dd>{selected.eventType||"—"}</dd></div><div><dt>Venue</dt><dd>{selected.venue||"—"}<br/>{selected.displayLocation}</dd></div><div><dt>Fulfillment</dt><dd>{selected.fulfillment}{selected.zip?` · ${selected.zip}`:""}</dd></div></dl><h3>Customer</h3><dl><div><dt>Name</dt><dd>{selected.customerName}</dd></div><div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div><div><dt>Phone</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone||"—"}</a></dd></div></dl><h3>Payment</h3><div className="paymentBox"><span>Total <b>{money(selected.total)}</b></span><span>Paid <b>{money(selected.amountPaid)}</b></span><small>{selected.paymentStatus}</small></div>{selected.notes&&<><h3>Notes</h3><p className="detailNotes">{selected.notes}</p></>}</aside></div>}
  </main>;
}
