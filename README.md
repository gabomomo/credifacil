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
    simulator/ CreditWizard (4 pasos) + CreditSimulator (cuota en vivo)
    forms/     ContactForm (maquetado, se prellena con el lead)
    ui/        Button, Logo, Accordion, SectionHeading, Reveal, InstitutionLogo
  lib/
    site.ts           # ⚙️ Contacto, WhatsApp, correo y dominio (punto único de edición)
    lead.ts           # ⚙️ Datos del wizard + submitLead (punto único de conexión al backend)
    products.ts       # Datos de los 4 tipos de crédito (copy, rangos, tasa de ejemplo)
    institutions.ts   # Instituciones de Costa Rica (con logo placeholder)
    simulator.ts      # Cálculo de cuota (amortización francesa), colones y plazos
```

## Recorrido de la solicitud

El simulador vive **solo en `/simulador`** (la Home lo enlaza, no lo incrusta) y funciona
como un wizard de cuatro pasos:

```
1. Nombre + correo + aceptación de T&C
2. Tipo de crédito
3. Situación laboral (público / privado / independiente) + rango de ingresos
4. Monto y plazo aproximados
   ↓
Simulador con la cuota en vivo (se puede afinar monto y plazo)
   ├── "Solicitar con estas condiciones" → /contacto con el formulario ya prellenado
   └── "Enviarme esta simulación por correo" → submitLead()
```

Los datos viajan en **`sessionStorage`**, no en la URL: incluyen nombre, correo y rango de
ingresos, y en la URL quedarían registrados en el historial del navegador, en los
encabezados `Referer` y en cualquier herramienta de analítica. `ContactForm` los lee con
`useSyncExternalStore` (ver el comentario en `lead.ts`).

## Configurar Firebase

El sitio funciona **sin Firebase**: el simulador usa las tasas de ejemplo de `products.ts`
y las solicitudes se envían por correo. Configurarlo activa tres cosas: guardar las
solicitudes, el panel `/admin` y la tasa ponderada.

### 1. Crear el proyecto

1. Entrá a [console.firebase.google.com](https://console.firebase.google.com) → **Agregar
   proyecto**. Podés desactivar Google Analytics.
2. **Compilación → Firestore Database → Crear base de datos**. Elegí la ubicación
   `nam5` (o la más cercana) y **modo de producción** (las reglas de este repo lo cubren).
3. **Compilación → Authentication → Comenzar → Google** y activalo.
4. **⚙ Configuración del proyecto → Tus apps → Web (`</>`)**. Registrá la app y copiá el
   bloque `firebaseConfig`.

### 2. Conectar el código

```bash
cp env.example .env.local     # y pegá ahí los valores del paso 4
npm run dev
```

Para que el sitio publicado también los tenga, hay que agregarlos como *secrets* del
repositorio en GitHub (**Settings → Secrets and variables → Actions**) y pasarlos al paso
de build en `.github/workflows/deploy.yml`.

### 3. Publicar las reglas de seguridad

⚠️ **Esto no es opcional.** Sin las reglas de este repositorio, la base de datos queda
como la deje la consola, y `leads` contiene nombres, correos e ingresos de tus clientes.

```bash
npx firebase login
npx firebase use --add          # elegí tu proyecto
npx firebase deploy --only firestore:rules
```

### 4. Crear el primer administrador

Las reglas exigen ser `owner` para otorgar accesos, así que el primer registro va a mano:

1. Entrá a `/admin` y hacé login con Google. Vas a ver *"Tu cuenta no tiene acceso"* y,
   debajo, **tu identificador de usuario (uid)**. Copialo.
2. En la consola de Firebase → **Firestore Database → Iniciar colección**:
   - Colección: `admins`
   - ID del documento: **el uid que copiaste**
   - Campos: `email` (string, tu correo), `role` (string, `owner`),
     `createdAt` (timestamp, ahora)
3. Recargá `/admin`. Desde ahí ya podés dar acceso a otras personas.

### Modelo de datos

| Colección | Lectura | Escritura | Contenido |
|---|---|---|---|
| `leads` | solo admin | **cualquiera crea** | Solicitudes: datos personales |
| `institutions` | pública | solo admin | Bancos, cooperativas y mutuales |
| `offers` | pública | solo admin | Tasas y criterios por producto |
| `admins` | solo admin | solo `owner` | Quién entra al panel |

La asimetría de `leads` es el punto clave: el formulario público necesita **crear**, pero
nunca **leer**. Si esa regla se relaja, cualquiera puede descargar la base completa de
clientes.

### Pruebas

```bash
npm test           # 14 casos del ponderado (no necesita nada más)
npm run test:rules # 28 casos de las reglas de seguridad (requiere Java)
```

`test:rules` levanta el emulador de Firestore y **ataca las reglas**: intenta leer
solicitudes sin permiso, autoconcederse el rol de `owner`, falsificar la fecha de
creación, inyectar notas internas, forzar el estado y escribir campos fuera de la lista
blanca. Cada caso comprueba que la operación **falla**.

Conviene correrlo después de tocar `firestore.rules`: un error ahí no da ningún síntoma
visible, simplemente deja los datos accesibles.

El emulador necesita Java. Si no lo tenés:

```bash
brew install openjdk
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
```

> Nota: al correr las pruebas vas a ver mensajes `evaluation error` en el registro del
> emulador. No son un fallo de las reglas: Firestore evalúa dos veces toda escritura que
> use `serverTimestamp()` —antes y después de resolver el centinela— y la decisión válida
> es la segunda. Con un `Timestamp` normal no aparecen.

### La tasa ponderada

El simulador promedia las tasas de las instituciones **para las que la persona califica**,
según lo que declaró en el wizard (situación laboral e ingresos) y lo que pidió (monto y
plazo). Cada institución tiene un `weight` (1 = neutro) para dar más influencia a las que
tienen convenio.

Si ninguna oferta calza —o si Firebase no está configurado— cae a la `exampleRate` del
producto y la etiqueta cambia de *"Tasa ponderada"* a *"Tasa de ejemplo"*. Cada oferta
guarda `verifiedAt`, y pasados **60 días** el simulador avisa que las tasas necesitan
confirmarse.

## Identidad visual

- **Primario:** azul `#1e4dd8` · **Acento:** verde/teal `#10b981`
- Tipografías: **Plus Jakarta Sans** (títulos) + **Inter** (cuerpo)
- Tokens definidos en `src/app/globals.css` (`@theme`)

## ⚠️ Pendientes antes de producción (placeholders)

Esta primera entrega es de **diseño y estructura**. Falta conectar/verificar:

1. **Nada se guarda en un servidor.** ⚠️ El sitio usa `output: "export"`, así que **no
   puede tener API routes de Next.js**. Hoy:
   - `ContactForm` solo muestra un estado de éxito; no envía nada.
   - `submitLead()` en `lib/lead.ts` abre el cliente de correo del visitante con el
     resumen redactado y Credifácil en copia. **El lead llega solo si la persona
     presiona "enviar"**, y no queda registrado en ninguna base de datos.

   Para conectarlo de verdad basta con sustituir el cuerpo de `submitLead()` por un POST
   al servicio elegido (Formspree, Web3Forms, Supabase…): el resto de la app no cambia.

2. **No existe la página de términos y condiciones.** El paso 1 del wizard obliga a
   marcar "Acepto los términos y condiciones", pero ese texto no está publicado en ningún
   lado. Hace falta redactar los T&C y la política de privacidad **con asesoría legal**
   (Ley 8968) y enlazarlos desde la casilla. Pedir aceptación de algo que no se puede
   leer no se sostiene, menos en un sitio de intermediación financiera.
3. **Logos de instituciones:** son monogramas placeholder (`InstitutionLogo`). Reemplazar
   por logos oficiales y confirmar permisos de uso de marca.
4. **Tasas y montos:** las tasas de `products.ts` (`exampleRate`) son **ejemplos**, no ofertas
   reales. Verificar con cada institución antes de publicar cifras.
5. **Datos de contacto:** teléfono, WhatsApp y correo son placeholders. Ya están
   centralizados en **`src/lib/site.ts`**: cambiando `phoneDigits` y `email` ahí se
   actualizan Header, Footer, Contacto, los CTAs y la copia del correo de `submitLead()`.
6. **Logo de marca:** `src/components/ui/Logo.tsx` es un logo generado; sustituir por el
   oficial cuando exista.
7. **Dominio y metadata:** el dominio vive en `url` dentro de `src/lib/site.ts`
   (actualmente `https://credifacil.cr`); `layout.tsx` lo consume desde ahí.
8. **Rangos de ingreso sin validar:** los cinco tramos de `incomeOptions` en `lib/lead.ts`
   son una propuesta razonable para Costa Rica, no un criterio acordado con ninguna
   institución. Ajustarlos a los cortes que de verdad usan los analistas de crédito.

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
