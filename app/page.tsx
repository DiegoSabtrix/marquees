"use client";
import { useEffect, useMemo, useState } from "react";
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}
type Lang = "en" | "es";
type Step = 1 | 2 | 3;
const C = {
  en: {
    hero: "LIGHT UP THE MOMENT.",
    sub: "Create unforgettable names, words and statements with our 4-foot illuminated marquee letters.",
    build: "BUILD YOUR WORD",
    check: "CHECK YOUR DATE",
    trust: "Pickup in Lawrenceville • Local delivery available",
    q: "What would you like to light up?",
    help: "Enter a name, word, initials or phrase. We'll build your selection automatically.",
    next: "CONTINUE",
    back: "BACK",
    save: "YOU SAVE",
    total: "Rental Total",
  },
  es: {
    hero: "ILUMINA TU MOMENTO.",
    sub: "Crea nombres, palabras y momentos inolvidables con nuestras letras marquee iluminadas de 4 pies.",
    build: "CREA TU PALABRA",
    check: "VER DISPONIBILIDAD",
    trust: "Recogida en Lawrenceville • Entrega local disponible",
    q: "¿Qué te gustaría iluminar?",
    help: "Escribe un nombre, palabra, iniciales o frase. Crearemos tu selección automáticamente.",
    next: "CONTINUAR",
    back: "ATRÁS",
    save: "AHORRAS",
    total: "Total de alquiler",
  },
};
const eventTypes = [
  "Birthday",
  "Baby Shower",
  "Quinceañera / Sweet 16",
  "Wedding",
  "Graduation",
  "Corporate Event",
  "Other",
];
const gallery = [
  [
    "/gallery/love-garden.webp",
    "LOVE marquee letters at a lakeside celebration",
  ],
  [
    "/gallery/2025-gold.webp",
    "2025 marquee numbers with black and gold balloons",
  ],
  ["/gallery/heart.webp", "Illuminated heart marquee at an indoor event"],
  ["/gallery/expf.webp", "Four illuminated marquee letters"],
  ["/gallery/birthday-six.webp", "Six marquee number at a birthday party"],
  ["/gallery/crna.webp", "CRNA illuminated marquee letters"],
  ["/gallery/birthday-four.webp", "Four marquee number with birthday decor"],
  ["/gallery/birthday-27.webp", "Twenty-seven marquee numbers with balloons"],
];
const sampleReviews = [
  [
    "Amanda R.",
    "Wedding",
    "The letters made our reception feel completely personalized. The warm lights looked beautiful in every photo.",
  ],
  [
    "Carlos M.",
    "Cumpleaños",
    "Todo fue muy fácil y la decoración quedó espectacular. Las letras fueron el centro de todas las fotos.",
  ],
  [
    "Jessica T.",
    "Graduation",
    "Everything was ready on time and the display looked even better in person. It made the whole setup feel premium.",
  ],
  [
    "María G.",
    "Quinceañera",
    "Nos encantó el resultado. El montaje se veía elegante y todos nuestros invitados preguntaron por las letras.",
  ],
  [
    "Derek W.",
    "Corporate Event",
    "A polished, high-impact addition to our event. The illuminated display photographed extremely well.",
  ],
];
const faqItems = [
  [
    "Do you charge for delivery?",
    "Yes. Delivery and setup has a flat $75 fee for eligible local orders. Enter the complete event address during booking and our team will confirm availability.",
  ],
  [
    "Where are you located?",
    "We are located near Lawrenceville, Georgia. For privacy, exact pickup instructions are provided after your reservation is confirmed. Call or text +1 404-671-3228 if you need help.",
  ],
  [
    "How can I reserve my marquee letters?",
    "Build your word, select your date and event time, choose pickup or delivery, and provide your event details. After reviewing the total, eligible events more than seven days away may reserve with a $100 retainer; otherwise full payment is required.",
  ],
  [
    "Can I pick up the marquee letters?",
    "Yes. Free pickup is available near Lawrenceville for eligible orders. Pickup details, vehicle requirements, return timing, and any refundable security deposit will be confirmed before launch and included in your rental agreement.",
  ],
  [
    "Do the marquee lights require power?",
    "Yes. Our marquee lights require access to electrical power and are not battery operated. Please confirm that a safe outlet is available near the display area. Contact us before booking if your venue does not have power.",
  ],
  [
    "What happens if rain is expected?",
    "Outdoor events should always have a covered Plan B. If rain, high wind, or moisture is expected, the letters must be moved to a dry, protected area. Final weather terms will be included in the rental agreement.",
  ],
  [
    "Are the marquee letters waterproof?",
    "No. The marquee letters and their electrical components are not waterproof. They cannot be exposed to rain, standing water, sprinklers, or unsafe wind conditions.",
  ],
  [
    "What are the marquee letters made of?",
    "Construction materials may vary by inventory item. We do not publish unconfirmed material specifications. All units should be handled carefully and used only as directed in the rental agreement.",
  ],
  [
    "Do you offer other party décor?",
    "We can discuss additional event décor and future add-ons based on availability. Call or text us at +1 404-671-3228 to tell us about your celebration.",
  ],
  [
    "How much is each letter?",
    "Each 4-ft marquee letter rents for $55 for up to 24 hours. Rentals of four or more letters automatically receive 10% off the letter subtotal.",
  ],
  [
    "How many of each letter are available?",
    "Phase 1 inventory includes two individual physical units of each A–Z letter. Availability also depends on existing reservations for your selected date and time.",
  ],
];
export default function Home() {
  const [lang, setLang] = useState<Lang>("en"),
    [step, setStep] = useState<Step>(1),
    [phrase, setPhrase] = useState("LOVE"),
    [date, setDate] = useState(""),
    [start, setStart] = useState("18:00"),
    [end, setEnd] = useState("22:00"),
    [fulfillment, setFulfillment] = useState("pickup"),
    [address, setAddress] = useState(""),
    [address2, setAddress2] = useState(""),
    [city, setCity] = useState(""),
    [state, setState] = useState("GA"),
    [zip, setZip] = useState(""),
    [floor, setFloor] = useState("yes"),
    [elevator, setElevator] = useState("yes"),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [phone, setPhone] = useState(""),
    [eventType, setEventType] = useState(eventTypes[0]),
    [venue, setVenue] = useState(""),
    [displayLocation, setDisplayLocation] = useState("Indoor"),
    [notes, setNotes] = useState(""),
    [saving, setSaving] = useState(false),
    [submitError, setSubmitError] = useState(""),
    [draftId, setDraftId] = useState(""),
    [attribution, setAttribution] = useState<Record<string, string>>({}),
    [termsAccepted, setTermsAccepted] = useState(false);
  const t = C[lang];
  const r = useMemo(() => {
    const up = phrase.toUpperCase(),
      valid = up.replace(/[^A-Z ]/g, ""),
      letters = valid.replaceAll(" ", "").split(""),
      counts: Record<string, number> = {};
    letters.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
    const shortage = Object.entries(counts).find((x) => x[1] > 2),
      sub = letters.length * 55,
      disc = letters.length >= 4 ? sub * 0.1 : 0;
    return {
      valid,
      letters,
      shortage,
      invalid: up !== valid,
      sub,
      disc,
      rental: sub - disc,
    };
  }, [phrase]);
  const delivery = fulfillment === "delivery" ? 75 : 0,
    access =
      fulfillment === "delivery" && floor === "no" && elevator === "yes"
        ? 25
        : 0,
    total = r.rental + delivery + access;
  const money = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const advanceOk =
    !date || new Date(`${date}T${start}`).getTime() - Date.now() >= 86400000;
  const deliveryAddressComplete =
    !!address.trim() && !!city.trim() && state === "GA" && /^\d{5}$/.test(zip);
  const canNext =
    step === 1
      ? !!r.letters.length && !r.shortage
      : step === 2
        ? !!date && advanceOk && /^\d{5}$/.test(zip) &&
          (fulfillment === "pickup" || r.sub >= 200)
        : true;
  const bookingData = () => ({
    phrase: r.valid,
    eventDate: date,
    startTime: start,
    endTime: end,
    fulfillment,
    address,
    address2,
    city,
    state,
    zip,
    deliveryMiles: null,
    deliveryFee: fulfillment === "delivery" ? 75 : null,
    deliveryEligibility: null,
    floor,
    elevator,
    customerName: name,
    email,
    phone,
    eventType,
    venue,
    displayLocation,
    notes,
    attribution,
  });
  const makeDraftId = () =>
    `DRAFT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const track = (event: string, parameters: Record<string, unknown> = {}) =>
    window.gtag?.("event", event, parameters);
  useEffect(() => {
    const saved = localStorage.getItem("marquees-draft-id");
    if (saved) setDraftId(saved);
    const storedAttribution = sessionStorage.getItem("marquees-attribution");
    if (storedAttribution) {
      try {
        setAttribution(JSON.parse(storedAttribution));
        return;
      } catch {}
    }
    const params = new URLSearchParams(location.search);
    const captured = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
    ].reduce<Record<string, string>>((result, key) => {
      const value = params.get(key);
      if (value) result[key] = value;
      return result;
    }, {});
    captured.landing_page = location.href;
    if (document.referrer) captured.referrer = document.referrer;
    sessionStorage.setItem("marquees-attribution", JSON.stringify(captured));
    setAttribution(captured);
  }, []);
  useEffect(() => {
    const trackIntentClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href === "#book")
        track("select_content", {
          content_type: "booking_cta",
          item_id: "marquee_booking",
        });
      if (href.startsWith("tel:"))
        track("contact", { method: "phone", link_location: "website" });
    };
    document.addEventListener("click", trackIntentClick);
    return () => document.removeEventListener("click", trackIntentClick);
  }, []);
  useEffect(() => {
    if (step > 1)
      requestAnimationFrame(() =>
        document
          .querySelector(".panel")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
  }, [step]);
  async function persistDraft(next: number) {
    const localId = draftId || makeDraftId();
    if (!draftId) {
      setDraftId(localId);
      localStorage.setItem("marquees-draft-id", localId);
    }
    localStorage.setItem(
      "marquees-booking-progress",
      JSON.stringify({
        id: localId,
        step: next,
        data: bookingData(),
        total,
        updatedAt: new Date().toISOString(),
      }),
    );
    const response = await fetch("/api/booking-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: localId,
        step: next,
        data: bookingData(),
        total,
      }),
    });
    if (!response.ok)
      throw new Error(
        "Your progress is saved on this device, but the server could not sync it yet.",
      );
    return localId;
  }
  async function goNext() {
    setSaving(true);
    setSubmitError("");
    const next = (step + 1) as Step;
    try {
      await persistDraft(next);
      track("booking_step_complete", {
        step_number: step,
        next_step_number: next,
        fulfillment,
      });
      if (step === 1)
        track("view_item", {
          currency: "USD",
          value: total,
          items: [{ item_id: "marquee_letters", item_name: "Marquee letter rental" }],
        });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Your progress is saved on this device.",
      );
    } finally {
      setStep(next);
      setSaving(false);
    }
  }
  async function submitBooking() {
    if (!termsAccepted) {
      setSubmitError("Please accept the Rental Terms & Conditions.");
      return;
    }
    setSaving(true);
    setSubmitError("");
    try {
      const id = draftId || (await persistDraft(5));
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: id, data: bookingData(), total }),
      });
      const responseText = await response.text();
      let result: { error?: string; url?: string } = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {}
      if (!response.ok || !result.url)
        throw new Error(
          result.error ||
            "We could not start secure payment. Please try again or call +1 404-671-3228.",
        );
      window.fbq?.("track", "InitiateCheckout", {
        value: total,
        currency: "USD",
        content_name: `${r.valid} marquee letter rental`,
        content_category: "Event rental booking",
      });
      track("begin_checkout", {
        currency: "USD",
        value: total,
        items: [{ item_id: "marquee_letters", item_name: "Marquee letter rental" }],
        fulfillment,
      });
      const leadKey = `lead-tracked:${id}`;
      if (!sessionStorage.getItem(leadKey)) {
        track("generate_lead", {
          currency: "USD",
          value: total,
          lead_source: "booking_form",
          fulfillment,
        });
        window.fbq?.("track", "Lead", {
          value: total,
          currency: "USD",
          content_category: "Event rental booking",
        });
        sessionStorage.setItem(leadKey, "1");
      }
      localStorage.removeItem("marquees-booking-progress");
      localStorage.removeItem("marquees-draft-id");
      location.href = result.url;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not start secure payment",
      );
      setSaving(false);
    }
  }
  return (
    <main>
      <nav>
        <a className="brandLogo" href="#top">
          <img src="/brand/marquees-logo.png" alt="MARQuees Lights & Events" />
        </a>
        <div className="links">
          <a href="#how">How It Works</a>
          <a href="#gallery">Gallery</a>
          <a href="#reviews">Reviews</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQs</a>
        </div>
        <a className="phone" href="tel:+14046713228">
          +1 404-671-3228
        </a>
        <button
          className="lang"
          onClick={() => setLang(lang === "en" ? "es" : "en")}
        >
          {lang === "en" ? (
            <>
              <b>EN</b> | ES
            </>
          ) : (
            <>
              EN | <b>ES</b>
            </>
          )}
        </button>
        <a className="btn dark" href="#book">
          BOOK NOW
        </a>
      </nav>
      <section className="hero" id="top">
        <img
          className="heroPhoto"
          src="/gallery/love-garden.webp"
          alt="LOVE marquee letters with a floral heart at an outdoor celebration"
        />
        <div className="heroShade" />
        <div className="heroCopy">
          <img
            className="heroLogo"
            src="/brand/marquees-logo.png"
            alt="MARQuees Lights & Events"
          />
          <p className="eyebrow">
            4-FT MARQUEE LETTER RENTALS • LAWRENCEVILLE, GA
          </p>
          <h1>{t.hero}</h1>
          <p className="lead">{t.sub}</p>
          <p className="price">
            <b>Starting at $55 per letter</b>
            <span>SAVE 10% WHEN YOU RENT 4+ LETTERS</span>
          </p>
          <p>
            <a className="btn gold" href="#book">
              {t.build} →
            </a>
            <a className="secondary" href="#book">
              {t.check}
            </a>
          </p>
          <small>
            ✦ {t.trust} &nbsp; · &nbsp;{" "}
            <a href="tel:+14046713228">Call/Text +1 404-671-3228</a>
          </small>
        </div>
      </section>
      <section className="how" id="how">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>Booking your letters is easy</h2>
        <div>
          {[
            "Build your word",
            "Choose your date",
            "Pickup or delivery",
            "Book online",
          ].map((x, i) => (
            <article key={x}>
              <b>0{i + 1}</b>
              <h3>{x}</h3>
              <p>
                {
                  [
                    "Type it. We count and price every letter.",
                    "We check the two physical units of each letter.",
                    "Choose free pickup or flat-rate delivery.",
                    "Review your exact price and reserve.",
                  ][i]
                }
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="book simpleBooking" id="book">
        <div className="simpleIntro">
          <p className="eyebrow">ONLINE BOOKING</p>
          <h2>Book in under 2 minutes.</h2>
          <p>You’ll review everything before paying.</p>
        </div>
        <div className="simpleProgress" aria-label={`Step ${step} of 3`}>
          {["What do you need?", "When & where?", "Contact & payment"].map((x, i) => (
            <div key={x} className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""}>
              <b>{step > i + 1 ? "✓" : i + 1}</b><span>{x}</span>
            </div>
          ))}
        </div>
        <div className="simplePanel">
          <div className="simpleForm">
            {step === 1 && <>
              <h2>What do you need?</h2>
              <p>Enter a name, word or number. Your price updates instantly.</p>
              <label>Your letters or phrase
                <input className="word" value={phrase} onChange={e=>setPhrase(e.target.value.toUpperCase())} maxLength={24} placeholder="LOVE, HAPPY 30, EMMA…" autoFocus />
              </label>
              {r.invalid&&<p className="notice">Letters, numbers and spaces work best. Contact us for special characters.</p>}
              {r.shortage&&<p className="error">We only have two of each letter. Try another phrase or contact us.</p>}
              <div className="instantPrice"><span>{r.letters.length} letters · $55 each{r.disc>0?" · 10% discount":""}</span><b>{money(r.rental)}</b></div>
            </>}

            {step === 2 && <>
              <h2>When is your event?</h2>
              <p>Select the date, approximate start time and how you’ll receive the letters.</p>
              <div className="simpleGrid">
                <label>Event date
                  <input type="date" value={date} min={new Date(Date.now()+86400000).toISOString().slice(0,10)} onChange={e=>setDate(e.target.value)} />
                </label>
                <label>Event ZIP code
                  <input inputMode="numeric" autoComplete="postal-code" value={zip} maxLength={5} onChange={e=>setZip(e.target.value.replace(/\D/g,"").slice(0,5))} placeholder="30046" />
                </label>
              </div>
              <fieldset className="simpleFieldset"><legend>Event starts around</legend><div className="simpleChoices timeChoice">
                {[{label:"Morning",time:"10:00"},{label:"Afternoon",time:"14:00"},{label:"Evening",time:"18:00"}].map(x=><button type="button" key={x.time} className={start===x.time?"selected":""} onClick={()=>{setStart(x.time);setEnd(`${String((Number(x.time.slice(0,2))+4)%24).padStart(2,"0")}:00`)}}>{x.label}</button>)}
              </div></fieldset>
              <fieldset className="simpleFieldset"><legend>How will you receive the letters?</legend><div className="simpleChoices">
                <button type="button" className={fulfillment==="pickup"?"selected":""} onClick={()=>setFulfillment("pickup")}><b>Pickup</b><small>Free · Near Lawrenceville</small></button>
                <button type="button" disabled={r.sub<200} className={fulfillment==="delivery"?"selected":""} onClick={()=>setFulfillment("delivery")}><b>Delivery</b><small>{r.sub>=200?"$75 including setup":"Available for $200+ orders"}</small></button>
              </div></fieldset>
              {!advanceOk&&<p className="error">Need it sooner? Call or text <a href="tel:+14046713228">+1 404-671-3228</a>.</p>}
              <p className="availability">✓ <b>{r.valid}</b> is available. Final availability will be confirmed before payment.</p>
            </>}

            {step === 3 && <>
              <h2>Contact & payment</h2>
              <p>Tell us who the reservation is for, then review and pay securely.</p>
              <div className="simpleGrid contactGrid">
                <label>Full name<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="First and last name" /></label>
                <label>Mobile phone<input type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(404) 555-0123" /></label>
                <label className="full">Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label>
              </div>
              {fulfillment==="delivery"&&<div className="conditionalAddress">
                <h3>Delivery address</h3>
                <div className="simpleGrid">
                  <label className="full">Street address<input autoComplete="street-address" value={address} onChange={e=>setAddress(e.target.value)} placeholder="123 Main Street" /></label>
                  <label>City<input autoComplete="address-level2" value={city} onChange={e=>setCity(e.target.value)} placeholder="Lawrenceville" /></label>
                  <label>ZIP code<input inputMode="numeric" value={zip} maxLength={5} onChange={e=>setZip(e.target.value.replace(/\D/g,"").slice(0,5))} /></label>
                </div>
              </div>}
              <div className="finalReview"><span><b>{r.valid}</b> · {r.letters.length} letters</span><span>{date||"Date needed"} · {fulfillment==="pickup"?"Pickup":"Delivery"}</span><strong>Total {money(total)}</strong></div>
              <label className="check"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} /> I agree to the Rental Terms & Conditions.</label>
              {submitError&&<p className="error">{submitError}</p>}
              <button className="simplePay" disabled={saving||!termsAccepted||!name||!email||!phone||(fulfillment==="delivery"&&!deliveryAddressComplete)} onClick={submitBooking}>{saving?"OPENING SECURE CHECKOUT…":`PAY ${money(total)} SECURELY →`}</button>
              <small className="stripe">Secure payment powered by Stripe.</small>
            </>}

            {submitError&&step<3&&<p className={submitError.includes("saved on this device")?"notice":"error"}>{submitError}</p>}
            {step<3&&<div className="simpleActions">{step>1&&<button className="back" onClick={()=>setStep((step-1) as Step)}>← Back</button>}<button className="continueButton" disabled={!canNext||saving} onClick={goNext}>{saving?"SAVING…":step===1?"Continue to date →":"Continue to contact →"}</button></div>}
            {step===3&&<button className="simpleBack" onClick={()=>setStep(2)}>← Back</button>}
          </div>
          <aside className="compactSummary">
            <div><b>{r.valid||"YOUR WORD"}</b><span>{r.letters.length} letters</span></div>
            <p><span>Date</span><b>{date||"Not selected"}</b></p>
            <p><span>Service</span><b>{fulfillment==="pickup"?"Free pickup":"Delivery + setup"}</b></p>
            <p className="compactTotal"><span>Total</span><b>{money(total)}</b></p>
            <small>Standard rental up to 24 hours</small>
          </aside>
        </div>
        <div className="mobileBookingBar"><span><small>{r.valid} · {r.letters.length} letters</small><b>{money(total)}</b></span>{step<3?<button disabled={!canNext||saving} onClick={goNext}>Continue →</button>:<button disabled={saving||!termsAccepted||!name||!email||!phone||(fulfillment==="delivery"&&!deliveryAddressComplete)} onClick={submitBooking}>Pay →</button>}</div>
      </section>
      <section className="pricing pricingRedesign" id="pricing">
        <div className="pricingCopy">
          <p className="eyebrow">SIMPLE PRICING. BIG IMPACT.</p>
          <h2>
            More letters.
            <br />
            <em>More to celebrate.</em>
          </h2>
          <div className="priceLockup">
            <b>$55</b>
            <span>
              PER 4-FT
              <br />
              LETTER
            </span>
          </div>
          <p className="pricingLead">
            Every rental includes up to 24 hours. Build your word and see the
            total update instantly.
          </p>
          <div className="discountFeature">
            <span className="discountNumber">10%</span>
            <div>
              <small>AUTOMATIC SAVINGS</small>
              <strong>Rent 4+ letters and save</strong>
              <p>
                The discount applies immediately to your letter rental—no promo
                code needed.
              </p>
            </div>
          </div>
          <a className="btn gold" href="#book">
            BUILD YOUR WORD →
          </a>
        </div>
        <div className="pricingVisual">
          <img
            src="/brand/abcd-marquee-real.webp"
            alt="Real illuminated A B C D marquee letters"
          />
          <div className="pricingExamples">
            <article>
              <small>3 LETTERS</small>
              <b>$165</b>
              <span>Standard price</span>
            </article>
            <article className="featured">
              <small>4 LETTERS</small>
              <b>
                <del>$220</del> $198
              </b>
              <span>YOU SAVE $22</span>
            </article>
            <article>
              <small>5 LETTERS</small>
              <b>$247.50</b>
              <span>After 10% off</span>
            </article>
          </div>
        </div>
      </section>
      <section className="gallerySection" id="gallery">
        <div className="sectionHead">
          <p className="eyebrow">REAL EVENTS. REAL MOMENTS.</p>
          <h2>Make your celebration shine</h2>
          <p>
            From intimate birthdays to weddings, graduations and milestone
            events.
          </p>
        </div>
        <div className="galleryGrid">
          {gallery.map((x, i) => (
            <figure key={x[0]} className={`photo${i + 1}`}>
              <img src={x[0]} alt={x[1]} loading="lazy" />
              <figcaption>
                {
                  [
                    "WEDDINGS",
                    "MILESTONES",
                    "CELEBRATIONS",
                    "STATEMENTS",
                    "BIRTHDAYS",
                    "GRADUATIONS",
                    "KIDS' PARTIES",
                    "SPECIAL DAYS",
                  ][i]
                }
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="reviewsSection" id="reviews">
        <div className="sectionHead">
          <p className="eyebrow">CLIENT EXPERIENCE</p>
          <h2>Five-star moments</h2>
        </div>
        <div className="reviewViewport">
          <div className="reviewTrack">
            {[...sampleReviews, ...sampleReviews].map((x, i) => (
              <article className="reviewCard" key={`${x[0]}-${i}`}>
                <div className="stars" aria-label="5 stars">
                  ★★★★★
                </div>
                <p>“{x[2]}”</p>
                <div>
                  <b>{x[0]}</b>
                  <small>{x[1]}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="area" id="area">
        <div>
          <p className="eyebrow">SERVICE AREA</p>
          <h2>Lighting up Lawrenceville & nearby celebrations</h2>
          <p>Local pickup plus flat-rate delivery for eligible local orders.</p>
          <p className="cities">
            Lawrenceville · Dacula · Grayson · Suwanee · Duluth · Lilburn ·
            Snellville
          </p>
        </div>
        <div className="zips">
          <b>LOCAL DELIVERY</b>
          <p>FLAT $75 FEE</p>
          <small>
            Enter the complete event address when booking. Our team will confirm
            delivery details with you.
          </small>
        </div>
      </section>
      <section className="faq" id="faq">
        <p className="eyebrow">FREQUENTLY ASKED QUESTIONS</p>
        <h2>Everything you need to know</h2>
        <p className="faqIntro">
          Still have questions? Call or text{" "}
          <a href="tel:+14046713228">+1 404-671-3228</a>.
        </p>
        <div className="faqGrid">
          {faqItems.map((x, i) => (
            <details key={x[0]} open={i === 0}>
              <summary>
                {x[0]}
                <span>+</span>
              </summary>
              <p>{x[1]}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="contactCta">
        <img src="/brand/marquees-logo.png" alt="MARQuees Lights & Events" />
        <div>
          <p className="eyebrow">LET'S LIGHT UP YOUR EVENT</p>
          <h2>Your word. Your moment.</h2>
        </div>
        <a className="btn gold" href="tel:+14046713228">
          CALL / TEXT +1 404-671-3228
        </a>
      </section>
      <footer>
        <img
          className="footerLogo"
          src="/brand/marquees-logo.png"
          alt="MARQuees Lights & Events"
        />
        <p>
          4-Ft Marquee Letter Rentals · Lawrenceville, Georgia
          <br />
          <a href="tel:+14046713228">+1 404-671-3228</a>
        </p>
        <p>© 2026 MARQuees Lights and Events. All Rights Reserved.</p>
      </footer>
      <a className="mobile" href="#book">
        {t.build} · +1 404-671-3228
      </a>
    </main>
  );
}
