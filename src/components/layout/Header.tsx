"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { products } from "@/lib/products";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

const nav = [
  { label: "Créditos", href: "/#productos" },
  { label: "Simulador", href: "/simulador" },
  { label: "Instituciones", href: "/instituciones" },
  { label: "Cómo funciona", href: "/como-funciona" },
  { label: "Contacto", href: "/contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container-x flex h-18 items-center justify-between py-3">
        <Link href="/" aria-label="Credifácil - Inicio" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-[0.95rem] font-medium text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={site.phone.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-accent-600 hover:text-accent-700"
          >
            <MessageCircle className="size-5" />
            WhatsApp
          </a>
          <ButtonLink href="/simulador" size="sm">
            Simular mi crédito
          </ButtonLink>
        </div>

        <button
          className="inline-flex size-11 items-center justify-center rounded-xl text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className={cn(
          "lg:hidden overflow-hidden bg-white border-b border-slate-200 transition-[max-height,opacity] duration-300",
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="container-x flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-ink hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4">
            {products.map((p) => (
              <Link
                key={p.slug}
                href={`/creditos/${p.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-ink-soft hover:bg-slate-50"
              >
                Crédito {p.name}
              </Link>
            ))}
            <ButtonLink href="/simulador" className="mt-2 w-full" onClick={() => setOpen(false)}>
              Simular mi crédito
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
