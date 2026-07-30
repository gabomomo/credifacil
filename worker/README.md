# Worker de correo

Envía al visitante la simulación que hizo, usando **Brevo**. Se despliega en
Cloudflare Workers, aparte del sitio.

## Por qué existe

El sitio es estático: todo su código llega al navegador, así que no puede guardar
la clave de Brevo. Llamar a la API de Brevo desde el sitio expondría la clave y
cualquiera podría enviar correos desde tu cuenta.

Este Worker es el único lugar donde vive la clave. El sitio le manda los datos de
la simulación y él redacta y envía el correo.

> **Brevo por API, no por SMTP.** Cloudflare Workers solo habla HTTP, así que se
> usa la **API key** de Brevo, no la SMTP key.

## Protecciones

Es un endpoint público, así que:

1. Solo acepta `POST` desde los orígenes de `ALLOWED_ORIGINS`.
2. Valida cada campo: tipos, rangos y catálogos cerrados.
3. **Redacta el correo aquí.** Nunca acepta HTML, texto ni asunto del cliente.
   Sin esto sería un relé abierto para enviar spam con la marca de Credifácil; lo
   máximo que puede lograr alguien que abuse es enviarse *una simulación de
   Credifácil* a una dirección que elija.
4. Límite de **5 envíos por IP cada hora**, contados solo cuando el envío procede
   (una errata al escribir el correo no gasta el cupo).

`npm test` cubre estas cuatro capas con 18 casos, la mayoría intentando saltarlas.

## Configurar

### 1. Brevo

1. Creá la cuenta en [brevo.com](https://www.brevo.com) — el plan gratis da 300
   correos por día.
2. **Verificá el remitente**: *Senders, Domains & Dedicated IPs → Senders*. Sin un
   remitente verificado los envíos fallan.
3. Generá la clave en *SMTP & API → API Keys*. Es la **API key**, no la SMTP key.

### 2. Cloudflare

```bash
cd worker
npm install
npx wrangler login

# Límite por IP (opcional pero recomendado):
npx wrangler kv namespace create RATE_LIMIT_KV
# → pegá el id que devuelve en wrangler.jsonc

npx wrangler secret put BREVO_API_KEY   # pega la clave cuando lo pida
npx wrangler deploy
```

El despliegue imprime la URL del Worker, algo como
`https://credifacil-email.<tu-cuenta>.workers.dev`.

Revisá en `wrangler.jsonc` que `SENDER_EMAIL` sea el remitente que verificaste y
que `ALLOWED_ORIGINS` incluya tu dominio.

### 3. Conectar el sitio

En la raíz del proyecto, en `.env.local`:

```
NEXT_PUBLIC_EMAIL_ENDPOINT=https://credifacil-email.<tu-cuenta>.workers.dev
```

Y como *secret* del repositorio en GitHub (**Settings → Secrets and variables →
Actions**) con el mismo nombre, para que el sitio publicado también lo tenga.

## Si no está configurado

El botón sigue funcionando: cae a abrir el cliente de correo del visitante con el
resumen ya redactado, y el mensaje en pantalla dice exactamente eso. Nunca afirma
haber enviado un correo que no envió.

## Comandos

```bash
npm test           # 18 casos, sin red ni cuenta de Brevo
npm run dev        # Worker en local
npm run deploy     # publicar
npm run tail       # ver registros en vivo
```
