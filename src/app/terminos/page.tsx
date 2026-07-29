import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y tratamiento de datos",
  description:
    "Cómo Credifácil recolecta, usa y protege tus datos personales, y bajo qué condiciones presta el servicio de comparación de créditos.",
};

/** Fecha larga en español para el encabezado del documento. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mt-12 font-display text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

const toc = [
  ["quienes", "1. Quién trata tus datos"],
  ["que-datos", "2. Qué datos recolectamos"],
  ["para-que", "3. Para qué los usamos"],
  ["con-quien", "4. Con quién los compartimos"],
  ["cuanto-tiempo", "5. Cuánto tiempo los conservamos"],
  ["derechos", "6. Tus derechos"],
  ["seguridad", "7. Seguridad"],
  ["servicio", "8. Condiciones del servicio"],
  ["cambios", "9. Cambios a este documento"],
];

export default function TerminosPage() {
  const { legal } = site;

  return (
    <div className="bg-mist">
      <section className="bg-brand-950 py-16 text-white">
        <div className="container-x max-w-3xl">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Términos y tratamiento de datos
          </h1>
          <p className="mt-4 text-brand-100">
            Última actualización: {formatDate(legal.lastUpdated)}
          </p>
        </div>
      </section>

      <div className="container-x max-w-3xl py-14">
        {/*
         * Aviso deliberadamente visible y no descartable. Este texto es un
         * borrador técnico, no un documento validado por una persona abogada:
         * mostrarlo como si fuera definitivo sería el peor resultado posible.
         */}
        <div className="flex items-start gap-3 rounded-2xl border-2 border-sun-400 bg-sun-50 p-5">
          <AlertTriangle className="mt-0.5 size-6 shrink-0 text-sun-600" />
          <div className="text-sm leading-relaxed text-ink">
            <p className="font-bold">Borrador pendiente de revisión legal</p>
            <p className="mt-1">
              Este texto cubre los elementos que exige la Ley 8968, pero{" "}
              <strong>no ha sido revisado por una persona profesional en derecho</strong> y
              contiene datos de identificación de ejemplo. No debe publicarse como
              definitivo ni usarse como base de un consentimiento válido hasta que se
              complete esa revisión y se inscriba la base de datos ante la PRODHAB.
            </p>
          </div>
        </div>

        <nav className="mt-10 rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
            Contenido
          </h2>
          <ol className="mt-4 space-y-2 text-sm">
            {toc.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-brand-700 hover:text-brand-800 hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-2">
          <Section id="quienes" title="1. Quién trata tus datos">
            <p>
              La persona responsable de la base de datos es{" "}
              <strong>{legal.entity}</strong>, cédula jurídica {legal.taxId}, con domicilio
              en {legal.address}. Para cualquier consulta sobre el tratamiento de tus datos
              podés escribirnos a{" "}
              <a href={site.email.mailto} className="text-brand-700 underline">
                {site.email.address}
              </a>{" "}
              o llamarnos al {site.phone.display}.
            </p>
            {legal.prodhabRegistration ? (
              <p>
                Nuestra base de datos está inscrita ante la Agencia de Protección de Datos
                de los Habitantes (PRODHAB) bajo el número {legal.prodhabRegistration}.
              </p>
            ) : (
              <p className="rounded-xl bg-sun-50 px-4 py-3 text-sm text-ink">
                <strong>Pendiente:</strong> la base de datos aún no está inscrita ante la
                Agencia de Protección de Datos de los Habitantes (PRODHAB). La Ley 8968
                obliga a inscribirla antes de operar con datos personales de terceros.
              </p>
            )}
          </Section>

          <Section id="que-datos" title="2. Qué datos recolectamos">
            <p>Cuando usás el simulador o el formulario de solicitud, recolectamos:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong>Identificación y contacto:</strong> nombre completo, correo
                electrónico y, si lo completás, número de teléfono o WhatsApp.
              </li>
              <li>
                <strong>Perfil crediticio declarado:</strong> situación laboral (asalariado
                del sector público, del sector privado o independiente) y el rango de
                ingreso mensual bruto que seleccionás.
              </li>
              <li>
                <strong>Interés de crédito:</strong> tipo de crédito, monto y plazo que
                indicás en el simulador.
              </li>
            </ul>
            <p>
              Todos estos datos los aportás vos voluntariamente. No consultamos tu récord
              crediticio, no accedemos a centrales de riesgo ni verificamos tus ingresos:
              el rango que seleccionás es una declaración tuya, no un dato comprobado.
            </p>
            <p>
              <strong>No pedimos datos sensibles.</strong> No solicitamos información sobre
              tu salud, origen étnico, convicciones religiosas, afiliación política o
              sindical, ni vida sexual. Tampoco pedimos números de tarjeta ni claves
              bancarias: si alguien te los pide a nombre de Credifácil, no somos nosotros.
            </p>
          </Section>

          <Section id="para-que" title="3. Para qué los usamos">
            <p>Usamos tus datos únicamente para:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Calcular y mostrarte una estimación de cuota.</li>
              <li>
                Enviarte por correo el resumen de tu simulación, cuando vos lo solicitás.
              </li>
              <li>
                Contactarte para darte asesoría y acompañarte en el trámite de tu solicitud.
              </li>
              <li>
                Preseleccionar las instituciones financieras cuyas condiciones se ajustan a
                lo que declaraste.
              </li>
            </ul>
            <p>
              <strong>No vendemos tus datos.</strong> No los cedemos a terceros con fines
              publicitarios ni los usamos para enviarte comunicaciones comerciales ajenas
              al trámite que iniciaste.
            </p>
          </Section>

          <Section id="con-quien" title="4. Con quién los compartimos">
            <p>
              Para gestionar tu solicitud necesitamos compartir tus datos con la o las{" "}
              <strong>instituciones financieras</strong> (bancos, cooperativas o mutuales)
              que elijas o que te recomendemos. Solo compartimos lo necesario para que
              evalúen tu caso, y solo después de que nos lo autorices.
            </p>
            <p>
              A partir de ese momento, cada institución trata tus datos bajo su propia
              política de privacidad y su propia responsabilidad. Credifácil no interviene
              en las decisiones de aprobación ni en el tratamiento posterior que haga la
              institución.
            </p>
            <p>
              También podríamos tener que entregar tus datos a una autoridad judicial o
              administrativa cuando una ley nos obligue.
            </p>
          </Section>

          <Section id="cuanto-tiempo" title="5. Cuánto tiempo los conservamos">
            <p>
              Conservamos tus datos mientras tu solicitud esté activa y hasta un máximo de{" "}
              <strong>doce meses</strong> después del último contacto, plazo en el que
              suele reactivarse el interés en un crédito. Cumplido ese plazo, los
              eliminamos.
            </p>
            <p>
              Si nos pedís que los borremos antes, lo hacemos sin condicionarlo a nada
              (ver la sección 6).
            </p>
          </Section>

          <Section id="derechos" title="6. Tus derechos">
            <p>La Ley 8968 te garantiza, en todo momento y sin costo, el derecho a:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong>Acceso:</strong> saber qué datos tuyos tenemos y qué hemos hecho
                con ellos.
              </li>
              <li>
                <strong>Rectificación:</strong> corregir los que estén equivocados,
                incompletos o desactualizados.
              </li>
              <li>
                <strong>Supresión:</strong> pedir que los eliminemos.
              </li>
              <li>
                <strong>Revocación del consentimiento:</strong> retirar tu autorización
                cuando querás, sin que eso afecte la legalidad de lo hecho antes.
              </li>
            </ul>
            <p>
              Para ejercer cualquiera de ellos, escribinos a{" "}
              <a href={site.email.mailto} className="text-brand-700 underline">
                {site.email.address}
              </a>
              . Te respondemos dentro de los cinco días hábiles siguientes. Si considerás
              que no atendimos bien tu solicitud, podés acudir a la{" "}
              <strong>Agencia de Protección de Datos de los Habitantes (PRODHAB)</strong>.
            </p>
          </Section>

          <Section id="seguridad" title="7. Seguridad">
            <p>
              Aplicamos medidas razonables para proteger tus datos: el sitio se sirve
              cifrado con HTTPS y el acceso a la información de solicitudes está restringido
              al personal que la necesita para atender tu caso.
            </p>
            <p>
              Ninguna medida es infalible. Si ocurriera una violación de seguridad que
              afecte tus datos, te lo comunicaremos y lo reportaremos a la PRODHAB conforme
              a la ley.
            </p>
          </Section>

          <Section id="servicio" title="8. Condiciones del servicio">
            <p>
              <strong>Credifácil no es una entidad financiera y no otorga créditos.</strong>{" "}
              Somos un servicio de comparación y acompañamiento: te ayudamos a entender tus
              opciones y a llegar preparado a la institución que elijas. No captamos
              ahorros ni intermediamos dinero.
            </p>
            <p>
              <strong>Las cifras del simulador son ilustrativas.</strong> Las tasas se
              calculan con valores de ejemplo y el resultado usa el sistema de cuota fija
              (amortización francesa). No incluyen seguros, comisiones de formalización,
              avalúos, timbres ni otros gastos. La cuota real puede diferir.
            </p>
            <p>
              <strong>Una simulación no es una oferta de crédito ni una aprobación.</strong>{" "}
              La decisión, las condiciones definitivas y la tasa aplicable dependen
              exclusivamente de cada institución financiera, según su propio análisis de tu
              perfil.
            </p>
            <p>
              <strong>Nuestro servicio de asesoría es gratuito para vos.</strong> No te
              cobramos por comparar, simular ni acompañarte en el trámite.
            </p>
            <p>
              Hacemos un esfuerzo razonable por mantener actualizada la información de las
              instituciones, pero las condiciones del mercado cambian: verificá siempre las
              cifras finales directamente con la institución antes de firmar.
            </p>
          </Section>

          <Section id="cambios" title="9. Cambios a este documento">
            <p>
              Podemos actualizar este documento cuando cambien nuestros servicios o la
              normativa aplicable. La fecha de la última actualización aparece al inicio. Si
              el cambio afecta de forma significativa cómo tratamos tus datos, te lo
              avisaremos por el correo que nos diste.
            </p>
          </Section>
        </div>

        <div className="mt-14 rounded-2xl bg-white p-6 shadow-soft">
          <p className="text-ink-soft">
            ¿Dudas sobre este documento o sobre tus datos? Escribinos a{" "}
            <a href={site.email.mailto} className="font-semibold text-brand-700 underline">
              {site.email.address}
            </a>{" "}
            o{" "}
            <Link href="/contacto" className="font-semibold text-brand-700 underline">
              contactanos por acá
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
