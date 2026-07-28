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
    site.ts           # ⚙️ Contacto, WhatsApp, correo y dominio (punto único de edición)
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
   datos. ⚠️ Ojo con la restricción: el sitio usa `output: "export"`, así que **no puede
   tener API routes de Next.js**. Las opciones viables son un servicio externo
   (Formspree, Web3Forms), una base de datos tipo Supabase, o armar un enlace
   `wa.me` con el mensaje prellenado (la única que no requiere cuenta ni clave).
2. **Logos de instituciones:** son monogramas placeholder (`InstitutionLogo`). Reemplazar
   por logos oficiales y confirmar permisos de uso de marca.
3. **Tasas y montos:** las tasas de `products.ts` (`exampleRate`) son **ejemplos**, no ofertas
   reales. Verificar con cada institución antes de publicar cifras.
4. **Datos de contacto:** teléfono, WhatsApp y correo son placeholders. Ya están
   centralizados en **`src/lib/site.ts`**: cambiando `phoneDigits` y `email` ahí se
   actualizan Header, Footer, Contacto y todos los CTAs de una sola vez.
5. **Logo de marca:** `src/components/ui/Logo.tsx` es un logo generado; sustituir por el
   oficial cuando exista.
6. **Dominio y metadata:** el dominio vive en `url` dentro de `src/lib/site.ts`
   (actualmente `https://credifacil.cr`); `layout.tsx` lo consume desde ahí.

### Notas de mantenimiento

- **`npm audit`** reporta 12 vulnerabilidades altas en `postcss` y `sharp`, dependencias
  transitivas de Next 16. **No corras `npm audit fix --force`**: intenta "arreglarlas"
  instalando `next@9.3.3`, un downgrade de siete versiones mayores. Ambas son de
  build-time y `sharp` ni se ejecuta (`images.unoptimized`), así que no afectan el sitio
  estático publicado.
- La carpeta **`asstes/`** (con el typo) duplica `src/assets/hero.png` — 1.5 MB que no se
  referencian desde ningún archivo. Se puede borrar.

## Aviso legal

Los montos, cuotas y tasas mostrados son ilustrativos y no constituyen una oferta de
crédito. Toda solicitud queda sujeta a aprobación de la institución financiera.
