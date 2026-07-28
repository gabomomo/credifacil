import type { Metadata } from "next";
import { MessageCircle, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { AdvisorScene } from "@/components/illustrations/Scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto y solicitud",
  description:
    "Solicita tu crédito o pide asesoría gratuita. Un asesor de Credifácil te acompaña sin costo ni compromiso.",
};

const channels = [
  { icon: MessageCircle, label: "WhatsApp", value: site.phone.display, href: site.phone.whatsapp },
  { icon: Phone, label: "Teléfono", value: site.phone.display, href: site.phone.tel },
  { icon: Mail, label: "Correo", value: site.email.address, href: site.email.mailto },
];

export default function ContactoPage() {
  return (
    <div>
      <section className="bg-brand-950 py-16 text-white">
        <div className="container-x max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Da el primer paso hacia tu crédito
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Déjanos tus datos y un asesor te contacta para acompañarte, gratis y sin
            compromiso, en la búsqueda de tu mejor opción.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <AdvisorScene className="mb-6 w-full max-w-xs" />
            <h2 className="font-display text-2xl font-bold text-ink">Hablemos</h2>
            <p className="mt-3 text-ink-soft">
              Escríbenos por el canal que prefieras. Te respondemos rápido en horario de oficina.
            </p>

            <div className="mt-8 space-y-4">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <c.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-slate-500">{c.label}</span>
                    <span className="block font-semibold text-ink">{c.value}</span>
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-mist p-4 text-sm text-ink-soft">
              <Clock className="size-5 shrink-0 text-brand-600" />
              {site.hours}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
