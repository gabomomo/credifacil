import Link from "next/link";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { products } from "@/lib/products";

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-950 text-slate-300">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo variant="white" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Comparamos créditos de los principales bancos y cooperativas de Costa Rica
            para que elijas la mejor opción y te acompañamos gratis en todo el proceso.
          </p>
          <a
            href="https://wa.me/50600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600"
          >
            <MessageCircle className="size-4" />
            Escríbenos por WhatsApp
          </a>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Créditos
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {products.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/creditos/${p.slug}`}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Crédito {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Credifácil
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/simulador" className="text-slate-400 hover:text-white">Simulador</Link></li>
            <li><Link href="/instituciones" className="text-slate-400 hover:text-white">Instituciones aliadas</Link></li>
            <li><Link href="/como-funciona" className="text-slate-400 hover:text-white">Cómo funciona</Link></li>
            <li><Link href="/contacto" className="text-slate-400 hover:text-white">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-accent-400" />
              <span className="text-slate-400">+506 0000 0000</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-accent-400" />
              <span className="text-slate-400">hola@credifacil.cr</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 shrink-0 text-accent-400" />
              <span className="text-slate-400">San José, Costa Rica</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Credifácil. Todos los derechos reservados.</p>
          <p className="max-w-2xl leading-relaxed">
            Las tasas, cuotas y montos mostrados son ejemplos ilustrativos y no
            constituyen una oferta de crédito. Toda solicitud está sujeta a aprobación
            de la institución financiera correspondiente.
          </p>
        </div>
      </div>
    </footer>
  );
}
