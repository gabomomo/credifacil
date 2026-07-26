# Credifácil

Sitio web para comparar y promover créditos de diversas instituciones financieras de
Costa Rica (bancos, cooperativas y mutuales). Incluye simulador de crédito, páginas por
tipo de producto y captura de solicitudes.

Construido con **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**.

## Cómo correr el proyecto

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
npm run build      # build de producción
npm run start      # servir el build
```

## Estructura

```
src/
  app/
    page.tsx                 # Home
    simulador/               # Simulador dedicado
    creditos/[slug]/         # Página por producto (hipotecario, personal, vehiculo, pyme)
    instituciones/           # Instituciones aliadas
    como-funciona/           # Explicación del proceso
    contacto/                # Formulario de solicitud
    layout.tsx globals.css   # Layout global, fuentes y design tokens
  components/
    layout/    Header, Footer
    home/      Secciones de la Home (Hero, ProductGrid, HowItWorks, ...)
    simulator/ CreditSimulator (componente interactivo)
    forms/     ContactForm (maquetado)
    ui/        Button, Logo, Accordion, SectionHeading, Reveal, InstitutionLogo
  lib/
    products.ts       # Datos de los 4 tipos de crédito (copy, rangos, tasa de ejemplo)
    institutions.ts   # Instituciones de Costa Rica (con logo placeholder)
    simulator.ts      # Cálculo de cuota (amortización francesa) y formato de colones
```

## Identidad visual

- **Primario:** azul `#1e4dd8` · **Acento:** verde/teal `#10b981`
- Tipografías: **Plus Jakarta Sans** (títulos) + **Inter** (cuerpo)
- Tokens definidos en `src/app/globals.css` (`@theme`)

## ⚠️ Pendientes antes de producción (placeholders)

Esta primera entrega es de **diseño y estructura**. Falta conectar/verificar:

1. **Formularios sin backend:** `ContactForm` solo muestra un estado de éxito; no envía
   datos. Conectar a WhatsApp/email o base de datos (ej. Supabase, o un endpoint propio).
2. **Logos de instituciones:** son monogramas placeholder (`InstitutionLogo`). Reemplazar
   por logos oficiales y confirmar permisos de uso de marca.
3. **Tasas y montos:** las tasas de `products.ts` (`exampleRate`) son **ejemplos**, no ofertas
   reales. Verificar con cada institución antes de publicar cifras.
4. **Número de WhatsApp y datos de contacto:** actualmente `+506 0000 0000` y
   `hola@credifacil.cr` (placeholders) en Header, Footer, Contacto y CTAs.
5. **Logo de marca:** `src/components/ui/Logo.tsx` es un logo generado; sustituir por el
   oficial cuando exista.
6. **Dominio y metadata:** `siteUrl` en `layout.tsx` apunta a `https://credifacil.cr`.

## Aviso legal

Los montos, cuotas y tasas mostrados son ilustrativos y no constituyen una oferta de
crédito. Toda solicitud queda sujeta a aprobación de la institución financiera.
