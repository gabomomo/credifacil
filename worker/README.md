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

## Estado

Ya desplegado en `https://credifacil-email.innovomedia-account.workers.dev`,
con el KV del límite creado y el sitio apuntando ahí (`.env.local` y el secret
del repositorio).

**Falta un solo paso: la clave de Brevo.** Sin ella el Worker responde 502 y el
sitio cae al cliente de correo del visitante.

## Lo que falta hacer

### 1. Verificar el remitente en Brevo

*Senders, Domains & Dedicated IPs → Senders*. Sin un remitente verificado, Brevo
rechaza los envíos.

`SENDER_EMAIL` en `wrangler.jsonc` está en `gmonestel@gmail.com` como
**provisional**, porque el dominio `credifacil.cr` todavía no está disponible.
Cuando lo tengas, verificá el dominio en Brevo y cambiá ese valor.

### 2. Cargar la clave

En *SMTP & API → API Keys* generá una **API key** (no la SMTP key) y:

```bash
cd worker
npx wrangler secret put BREVO_API_KEY   # pega la clave cuando la pida
npx wrangler deploy
```

> El comando pide la clave por consola y la guarda cifrada en Cloudflare. **No la
> pegues en un archivo del repositorio ni la compartas por chat**: a diferencia
> de la configuración de Firebase, que es pública por diseño, esta clave permite
> enviar correos en tu nombre.

### Si cambia la URL del Worker

Actualizá `NEXT_PUBLIC_EMAIL_ENDPOINT` en `.env.local` y el secret homónimo del
repositorio (**Settings → Secrets and variables → Actions**).

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
