import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion, type FaqItem } from "@/components/ui/Accordion";

const generalFaqs: FaqItem[] = [
  {
    q: "¿Credifácil es un banco?",
    a: "No. Somos un comparador y servicio de asesoría que te conecta con bancos, cooperativas y mutuales de Costa Rica. No prestamos dinero directamente: te ayudamos a encontrar y gestionar la mejor opción para tu perfil.",
  },
  {
    q: "¿Cuánto cuesta usar Credifácil?",
    a: "Nada. La comparación, el simulador y la asesoría son totalmente gratuitos para vos, sin compromiso de contratar.",
  },
  {
    q: "¿Las tasas y cuotas que muestran son reales?",
    a: "Los montos y cuotas del simulador son ejemplos ilustrativos para orientarte. La tasa final depende de cada institución, tu perfil crediticio y las condiciones vigentes al momento de tu solicitud.",
  },
  {
    q: "¿Qué necesito para empezar?",
    a: "Solo tus datos básicos y el tipo de crédito que buscas. A partir de ahí, un asesor te indica qué documentos reunir según la institución y el producto.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Usamos tu información únicamente para gestionar tu solicitud y ponerte en contacto con las instituciones. No la vendemos ni la compartimos con terceros sin tu consentimiento.",
  },
];

export function Faq() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="¿Dudas? Las resolvemos 💬"
          description="Y si te queda alguna en el tintero, escríbenos por WhatsApp: te respondemos rapidito."
        />
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion items={generalFaqs} />
        </div>
      </div>
    </section>
  );
}
