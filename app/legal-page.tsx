"use client";

import Link from "next/link";
import { useState } from "react";

type Language = "en" | "es";
type Section = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};
type PolicyCopy = {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
  contact: string;
};
type PageName = "terms" | "privacy";

const policies: Record<PageName, Record<Language, PolicyCopy>> = {
  terms: {
    en: {
      title: "Rental Terms & Conditions",
      updated: "Last updated: October 24, 2026",
      intro:
        "These terms cover rentals of illuminated marquee letters, numbers and symbols, plus related delivery and setup from MARQuees Lights and Events. A website request is not a confirmed reservation. Your reservation is confirmed only after we confirm availability and send you written confirmation or a rental agreement, and you complete any payment required in that confirmation.",
      sections: [
        {
          heading: "1. Reservations, inventory and pricing",
          paragraphs: [
            "Please provide accurate event, contact and delivery information. Inventory is limited and remains subject to availability until we confirm your reservation in writing. A selection shown as available on the website is not a final inventory guarantee.",
            "The website currently lists 4-foot letters at $55 each for up to 24 hours, a 10% discount on the letter subtotal for eligible orders of four or more letters, and local delivery with setup for $75 on eligible orders. Any access charge, tax, discount, deposit, balance or other fee that applies to your event will be shown at checkout or in your written confirmation. The confirmed order total and payment schedule control. Prices and offers may change before a reservation is confirmed.",
          ],
        },
        {
          heading: "2. Payment, changes and cancellations",
          paragraphs: [
            "Payment is processed through Stripe. Your checkout or written confirmation will state the amount due and when it is due. A reservation is not paid or secured until the required payment has been successfully processed.",
            "Contact us as soon as possible if you need to change or cancel a reservation. Any cancellation, refund, rescheduling or transfer terms for your event will be provided in writing with your reservation details before you pay.",
          ],
        },
        {
          heading: "3. Delivery, pickup and event access",
          paragraphs: [
            "You are responsible for giving us the correct event address, access instructions and event timing, and for arranging permission to use the venue and display area. Delivery is available only in the areas and for the orders we confirm. Delivery and setup do not include services that are not listed in your order confirmation.",
            "For pickup, follow the pickup and return instructions, times and location provided with your confirmed reservation. Please make sure the vehicle and people collecting the rental can safely transport and handle the selected items. We will confirm delivery availability, setup and any applicable fee with you before payment.",
          ],
        },
        {
          heading: "4. Safe use and care of the marquee letters",
          paragraphs: [
            "The marquee letters are electrical décor and are not waterproof. Use them only as directed, on a stable and dry surface, with access to a safe electrical outlet. They must be kept away from rain, standing water, sprinklers, moisture and unsafe wind. Outdoor displays need a dry, covered location and a backup indoor or protected plan.",
          ],
          bullets: [
            "Do not climb, sit, hang items from, move, open, alter or repair the letters or their wiring.",
            "Keep children and guests from handling the equipment, and keep cords and displays clear of walkways, exits, heat and other hazards.",
            "Stop using the display and contact us if it becomes wet, unstable, damaged or unsafe.",
          ],
        },
        {
          heading: "5. Equipment care and damage",
          paragraphs: [
            "Please handle the marquee letters and electrical components carefully, keep them dry, and contact us promptly if an item is lost or damaged. Any responsibility or repair, replacement or cleaning charge for your rental will be described in writing before you pay.",
            "Please confirm that your venue allows the display and that a safe, dry setup area and power source are available. Follow the setup instructions provided with your reservation.",
          ],
        },
        {
          heading: "6. Weather and event conditions",
          paragraphs: [
            "The marquee letters are not waterproof, so outdoor events need a dry, covered setup area. Contact us if weather or venue conditions change so we can review the available options with you. Any weather-related cancellation or rescheduling terms will be provided in writing with your reservation details before you pay.",
          ],
        },
        {
          heading: "7. Website information and disclaimer",
          paragraphs: [
            "Website descriptions and photos are provided to help you plan your event; displays may vary by inventory and event setup. Availability, final pricing, delivery or pickup details, and event-specific rental terms are confirmed in writing before your reservation is complete. Nothing on this page changes rights or responsibilities that apply under the law.",
          ],
        },
        {
          heading: "8. Questions and updates",
          paragraphs: [
            "We aim to keep website descriptions, prices and availability useful and current, but details may change. Your written reservation details will confirm the selected items, dates, fees and event-specific terms. Contact us with questions or to discuss a change to your reservation.",
          ],
        },
      ],
      contact:
        "Questions about your rental or these terms? Call or text MARQuees Lights and Events at +1 404-671-3228.",
    },
    es: {
      title: "Términos y condiciones de alquiler",
      updated: "Última actualización: 24 de octubre de 2026",
      intro:
        "Estos términos aplican al alquiler de letras, números y símbolos marquee iluminados, así como a los servicios relacionados de entrega y montaje de MARQuees Lights and Events. Una solicitud enviada por el sitio web no confirma una reserva. La reserva queda confirmada únicamente cuando confirmamos la disponibilidad por escrito mediante una confirmación o contrato de alquiler, y se completa el pago requerido allí.",
      sections: [
        {
          heading: "1. Reservas, inventario y precios",
          paragraphs: [
            "Proporcione información correcta del evento, contacto y entrega. El inventario es limitado y está sujeto a disponibilidad hasta que confirmemos la reserva por escrito. Que el sitio web muestre una selección como disponible no garantiza el inventario final.",
            "Actualmente el sitio muestra letras de 4 pies a $55 cada una por hasta 24 horas, un descuento del 10% sobre el subtotal de letras para pedidos elegibles de cuatro o más, y entrega local con montaje por $75 para pedidos elegibles. Cargos de acceso, impuestos, descuentos, depósitos, saldos u otros cargos aplicables aparecerán al pagar o en la confirmación escrita. El total y el calendario de pago confirmados controlan la reserva. Los precios y promociones pueden cambiar antes de confirmar una reserva.",
          ],
        },
        {
          heading: "2. Pagos, cambios y cancelaciones",
          paragraphs: [
            "Los pagos se procesan mediante Stripe. La pantalla de pago o la confirmación escrita indicará el monto y la fecha de pago. La reserva no queda pagada ni asegurada hasta que se procese correctamente el pago requerido.",
            "Contáctenos lo antes posible si necesita cambiar o cancelar una reserva. Los términos de cancelación, reembolso, cambio de fecha o transferencia de su evento se le entregarán por escrito junto con los detalles de la reserva antes del pago.",
          ],
        },
        {
          heading: "3. Entrega, recogida y acceso al evento",
          paragraphs: [
            "Usted debe proporcionarnos la dirección correcta del evento, instrucciones de acceso y horarios, y obtener el permiso del lugar para usar el espacio de exhibición. La entrega está disponible solo en las zonas y para los pedidos que confirmemos. La entrega y el montaje no incluyen servicios que no estén indicados en la confirmación.",
            "Para recoger el alquiler, siga las instrucciones, horarios y ubicación de recogida y devolución que acompañen la reserva confirmada. Asegúrese de que el vehículo y las personas que recojan los artículos puedan transportarlos y manipularlos de forma segura. Confirmaremos con usted la disponibilidad de entrega, el montaje y cualquier cargo aplicable antes del pago.",
          ],
        },
        {
          heading: "4. Uso seguro y cuidado de las letras",
          paragraphs: [
            "Las letras marquee son decoración eléctrica y no son impermeables. Úselas únicamente según las instrucciones, sobre una superficie estable y seca, con acceso a un tomacorriente seguro. Deben mantenerse lejos de lluvia, agua acumulada, aspersores, humedad y vientos peligrosos. Para eventos al aire libre se necesita un lugar seco y cubierto y un plan alternativo bajo techo o protegido.",
          ],
          bullets: [
            "No se suba, siente ni cuelgue objetos de las letras. No las mueva, abra, modifique ni repare, ni manipule el cableado.",
            "Evite que niños e invitados manipulen el equipo. Mantenga cables y exhibidores fuera de pasillos, salidas, fuentes de calor y otros peligros.",
            "Deje de usar el exhibidor y contáctenos si se moja, se vuelve inestable, se daña o deja de ser seguro.",
          ],
        },
        {
          heading: "5. Cuidado del equipo y daños",
          paragraphs: [
            "Manipule las letras marquee y sus componentes eléctricos con cuidado, manténgalos secos y contáctenos pronto si un artículo se pierde o daña. Cualquier responsabilidad o cargo por reparación, reemplazo o limpieza de su alquiler se describirá por escrito antes del pago.",
            "Confirme que el lugar del evento permite la exhibición y que hay un área seca y segura y una fuente de electricidad adecuada. Siga las instrucciones de montaje que acompañan su reserva.",
          ],
        },
        {
          heading: "6. Clima y condiciones del evento",
          paragraphs: [
            "Las letras marquee no son impermeables, así que los eventos al aire libre necesitan un área seca y cubierta. Contáctenos si cambian el clima o las condiciones del lugar para revisar las opciones disponibles. Los términos de cancelación o cambio de fecha por clima se entregarán por escrito junto con los detalles de la reserva antes del pago.",
          ],
        },
        {
          heading: "7. Información del sitio y aviso",
          paragraphs: [
            "Las descripciones y fotos del sitio se ofrecen para ayudarle a planear su evento; los exhibidores pueden variar según el inventario y el montaje. La disponibilidad, el precio final, los detalles de entrega o recogida y los términos específicos del alquiler se confirman por escrito antes de completar su reserva. Nada en esta página cambia los derechos o responsabilidades que apliquen conforme a la ley.",
          ],
        },
        {
          heading: "8. Preguntas y cambios",
          paragraphs: [
            "Procuramos mantener útiles y actualizadas las descripciones, precios y disponibilidad del sitio, pero los detalles pueden cambiar. Los detalles escritos de su reserva confirmarán los artículos seleccionados, fechas, cargos y términos específicos del evento. Contáctenos si tiene preguntas o necesita hablar sobre un cambio en su reserva.",
          ],
        },
      ],
      contact:
        "¿Tiene preguntas sobre su alquiler o estos términos? Llame o envíe un mensaje de texto a MARQuees Lights and Events al +1 404-671-3228.",
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      updated: "Last updated: October 24, 2026",
      intro:
        "MARQuees Lights and Events respects your privacy. This policy explains what information we collect through our website, booking process and communications, how we use it, and the choices available to you.",
      sections: [
        {
          heading: "1. Information we collect",
          paragraphs: ["Depending on how you interact with us, we may collect:"],
          bullets: [
            "Contact and reservation details such as your name, email address, phone number, event date and time, selected letters or symbols, event type, venue, display location, delivery address and ZIP code, access details, and notes you choose to send.",
            "Messages and information you provide when you call, text, use the website chat, or contact us about a quote, reservation, payment or customer service.",
            "Payment and transaction details such as the amount, payment status and transaction reference. Online card payments are handled by Stripe; we do not receive or store your full card number through this website.",
            "Technical and usage information such as browser or device details, pages visited, referral or campaign information, and interactions with the booking flow. Cookies, pixels and similar technologies may collect some of this information.",
          ],
        },
        {
          heading: "2. How we use information",
          paragraphs: [
            "We use information to respond to inquiries, check availability, prepare and manage reservations, coordinate delivery or pickup, process payments, provide customer support, maintain our records, protect the website, understand how visitors use the site, and measure or improve our marketing.",
            "We may send service-related communications about an inquiry, reservation, payment, delivery or rental. We send promotional messages only where permitted and with any consent required by law. You can ask us to stop marketing messages at any time.",
          ],
        },
        {
          heading: "3. Cookies, analytics and advertising",
          paragraphs: [
            "Our website uses Google Analytics and Meta Pixel, and may use a LeadConnector chat widget. These tools can use cookies, pixels or similar technologies to understand site visits, remember interactions, measure advertising and help respond to chats. Your browser may also save booking progress and campaign details in local or session storage so the reservation flow can work.",
            "You can adjust your browser settings to limit or block cookies and similar technologies. Some site features may not work as expected if you do. Analytics and advertising providers may receive technical identifiers and information about your activity on our website under their own privacy policies. Depending on where you live, this activity may be considered targeted advertising or sharing under privacy laws. Contact us if you want to ask about opting out of such use.",
          ],
        },
        {
          heading: "4. How we share information",
          paragraphs: [
            "We may share information with service providers who help us host and secure the site, manage booking records and customer communications, provide chat, analyze site use, measure advertising, or process payments. Stripe, Google, Meta and chat or customer-management providers process information under their own terms and privacy practices.",
            "We may also disclose information if reasonably necessary to comply with law, respond to valid legal process, protect people or property, enforce an agreement, or support a business transfer. We do not exchange personal information for money. Because this site uses analytics and advertising technologies, disclosures through those tools may be treated as sharing or sale under some state privacy laws.",
          ],
        },
        {
          heading: "5. How long we keep information and security",
          paragraphs: [
            "We keep information for as long as reasonably needed to respond to you, fulfill a reservation, maintain business and tax records, resolve disputes, and meet legal obligations. We then delete or securely dispose of it when it is no longer needed, subject to lawful retention requirements.",
            "We use reasonable safeguards designed to protect information. No website, transmission or storage method can be guaranteed completely secure.",
          ],
        },
        {
          heading: "6. Your choices and privacy requests",
          paragraphs: [
            "Depending on your location and applicable law, you may be able to request access to, correction of, or deletion of personal information, or object to certain uses. You can also ask us to stop promotional communications. To make a request, call or text us at +1 404-671-3228. We may need to verify your request before acting on it.",
          ],
        },
        {
          heading: "7. Children",
          paragraphs: [
            "This website is intended for adults arranging event rentals. It is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child provided information to us, contact us so we can review and delete it where appropriate.",
          ],
        },
        {
          heading: "8. Changes to this policy",
          paragraphs: [
            "We may update this policy as our website or business practices change. The updated version will appear on this page with a new last-updated date.",
          ],
        },
      ],
      contact:
        "For privacy questions or requests, contact MARQuees Lights and Events by calling or texting +1 404-671-3228.",
    },
    es: {
      title: "Política de privacidad",
      updated: "Última actualización: 24 de octubre de 2026",
      intro:
        "MARQuees Lights and Events respeta su privacidad. Esta política explica qué información recopilamos por nuestro sitio web, proceso de reserva y comunicaciones, cómo la usamos y qué opciones tiene.",
      sections: [
        {
          heading: "1. Información que recopilamos",
          paragraphs: ["Según cómo interactúe con nosotros, podemos recopilar:"],
          bullets: [
            "Datos de contacto y reserva como nombre, correo electrónico, teléfono, fecha y hora del evento, letras o símbolos seleccionados, tipo de evento, lugar, ubicación del exhibidor, dirección y código postal de entrega, detalles de acceso y las notas que decida enviarnos.",
            "Mensajes e información que proporcione al llamarnos, escribirnos, usar el chat del sitio o contactarnos por una cotización, reserva, pago o servicio al cliente.",
            "Datos del pago y de la transacción como monto, estado del pago y referencia. Los pagos en línea con tarjeta son procesados por Stripe; este sitio no recibe ni almacena el número completo de su tarjeta.",
            "Información técnica y de uso, como detalles del navegador o dispositivo, páginas visitadas, referencia o campaña e interacciones con el proceso de reserva. Cookies, píxeles y tecnologías similares pueden recopilar parte de esta información.",
          ],
        },
        {
          heading: "2. Cómo usamos la información",
          paragraphs: [
            "Usamos la información para responder consultas, revisar disponibilidad, preparar y administrar reservas, coordinar entregas o recogidas, procesar pagos, brindar atención al cliente, mantener nuestros registros, proteger el sitio, entender su uso y medir o mejorar nuestro mercadeo.",
            "Podemos enviar comunicaciones relacionadas con una consulta, reserva, pago, entrega o alquiler. Enviamos mensajes promocionales únicamente cuando la ley lo permite y con el consentimiento que la ley exija. Puede pedirnos que detengamos los mensajes promocionales en cualquier momento.",
          ],
        },
        {
          heading: "3. Cookies, analítica y publicidad",
          paragraphs: [
            "Nuestro sitio usa Google Analytics y Meta Pixel, y puede usar un widget de chat de LeadConnector. Estas herramientas pueden utilizar cookies, píxeles o tecnologías similares para entender las visitas, recordar interacciones, medir publicidad y ayudar a responder chats. Su navegador también puede guardar el progreso de la reserva y datos de campaña en almacenamiento local o de sesión para que funcione el proceso de reserva.",
            "Puede cambiar la configuración del navegador para limitar o bloquear cookies y tecnologías similares. Algunas funciones del sitio podrían no funcionar como se espera. Los proveedores de analítica y publicidad pueden recibir identificadores técnicos e información sobre su actividad en el sitio conforme a sus propias políticas de privacidad. Dependiendo de dónde viva, esa actividad podría considerarse publicidad dirigida o intercambio de información bajo leyes de privacidad. Contáctenos si desea preguntar cómo excluirse de ese uso.",
          ],
        },
        {
          heading: "4. Cómo compartimos la información",
          paragraphs: [
            "Podemos compartir información con proveedores que nos ayudan a alojar y proteger el sitio, administrar reservas y comunicaciones con clientes, ofrecer chat, analizar el uso del sitio, medir publicidad o procesar pagos. Stripe, Google, Meta y los proveedores de chat o gestión de clientes procesan información según sus propios términos y políticas de privacidad.",
            "También podemos divulgar información cuando sea razonablemente necesario para cumplir la ley, responder a un proceso legal válido, proteger a personas o bienes, hacer cumplir un acuerdo o facilitar una transferencia comercial. No intercambiamos información personal por dinero. Como este sitio usa tecnologías de analítica y publicidad, las divulgaciones mediante esas herramientas podrían considerarse intercambio o venta bajo algunas leyes estatales de privacidad.",
          ],
        },
        {
          heading: "5. Tiempo de conservación y seguridad",
          paragraphs: [
            "Conservamos la información durante el tiempo razonablemente necesario para responderle, cumplir una reserva, mantener registros comerciales y tributarios, resolver disputas y cumplir obligaciones legales. Después la eliminamos o destruimos de forma segura cuando deja de ser necesaria, sujeto a los períodos legales de conservación.",
            "Usamos medidas razonables para proteger la información. Ningún sitio, transmisión o método de almacenamiento puede garantizar seguridad total.",
          ],
        },
        {
          heading: "6. Sus opciones y solicitudes de privacidad",
          paragraphs: [
            "Según su ubicación y la ley aplicable, usted puede solicitar acceso, corrección o eliminación de información personal, u oponerse a ciertos usos. También puede pedirnos que detengamos las comunicaciones promocionales. Para enviar una solicitud, llámenos o escríbanos al +1 404-671-3228. Es posible que debamos verificar la solicitud antes de atenderla.",
          ],
        },
        {
          heading: "7. Menores",
          paragraphs: [
            "Este sitio está dirigido a adultos que organizan alquileres para eventos. No está dirigido a menores de 13 años y no recopilamos deliberadamente información personal de menores de 13. Si cree que un menor nos proporcionó información, contáctenos para revisarla y eliminarla cuando corresponda.",
          ],
        },
        {
          heading: "8. Cambios a esta política",
          paragraphs: [
            "Podemos actualizar esta política cuando cambien el sitio o nuestras prácticas comerciales. La versión actualizada aparecerá en esta página con una nueva fecha de actualización.",
          ],
        },
      ],
      contact:
        "Para preguntas o solicitudes de privacidad, contacte a MARQuees Lights and Events llamando o escribiendo al +1 404-671-3228.",
    },
  },
};

export default function LegalPage({ page }: { page: PageName }) {
  const [language, setLanguage] = useState<Language>("en");
  const copy = policies[page][language];
  return (
    <main className="legalPage">
      <header className="legalNav">
        <Link className="legalBrand" href="/" aria-label="MARQuees Lights and Events home">
          <img src="/brand/marquees-logo.png" alt="MARQuees Lights and Events" />
        </Link>
        <div className="legalNavLinks">
          <Link href="/terms" aria-current={page === "terms" ? "page" : undefined}>
            {language === "en" ? "Terms" : "Términos"}
          </Link>
          <Link href="/privacy" aria-current={page === "privacy" ? "page" : undefined}>
            {language === "en" ? "Privacy" : "Privacidad"}
          </Link>
        </div>
        <a className="legalPhone" href="tel:+14046713228">
          +1 404-671-3228
        </a>
        <div className="legalLanguage" aria-label="Choose language">
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>
            English
          </button>
          <button type="button" aria-pressed={language === "es"} onClick={() => setLanguage("es")}>
            Español
          </button>
        </div>
      </header>
      <article className="legalContent">
        <p className="eyebrow">MARQUEES LIGHTS AND EVENTS</p>
        <h1>{copy.title}</h1>
        <p className="legalUpdated">{copy.updated}</p>
        <div className="legalNotice">
          <p>{copy.intro}</p>
        </div>
        {copy.sections.map((section) => (
          <section className="legalSection" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
          </section>
        ))}
        <aside className="legalContact">
          <h2>{language === "en" ? "Contact us" : "Contáctenos"}</h2>
          <p>{copy.contact}</p>
          <a href="tel:+14046713228">
            {language === "en" ? "Call or text" : "Llame o escriba"} +1 404-671-3228
          </a>
        </aside>
      </article>
      <footer className="legalFooter">
        <Link href="/">MARQuees Lights and Events</Link>
        <div>
          <Link href="/terms">
            {language === "en" ? "Rental Terms & Conditions" : "Términos y condiciones"}
          </Link>
          <Link href="/privacy">
            {language === "en" ? "Privacy Policy" : "Política de privacidad"}
          </Link>
        </div>
      </footer>
    </main>
  );
}
