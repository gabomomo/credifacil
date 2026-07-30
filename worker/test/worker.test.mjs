/**
 * Pruebas del Worker de correo.
 *
 * Como es un endpoint público, la mayoría de los casos son intentos de abuso:
 * enviar desde otro origen, colar HTML propio, disparar valores absurdos o
 * saturarlo. Cada uno debe rebotar.
 */
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const ORIGIN = "https://gabomomo.github.io";

/** Captura lo que el Worker le manda a Brevo, sin salir a la red. */
let brevoCalls = [];
let brevoStatus = 201;

globalThis.fetch = async (url, init) => {
  brevoCalls.push({ url, init, body: JSON.parse(init.body) });
  return new Response(JSON.stringify({ messageId: "x" }), { status: brevoStatus });
};

/** KV en memoria, para probar el límite por IP. */
function memoryKV() {
  const store = new Map();
  return {
    get: async (k) => store.get(k) ?? null,
    put: async (k, v) => void store.set(k, v),
  };
}

let env;
beforeEach(() => {
  brevoCalls = [];
  brevoStatus = 201;
  env = {
    ALLOWED_ORIGINS: `${ORIGIN},http://localhost:3000`,
    SITE_NAME: "Credifácil",
    SITE_URL: "https://gabomomo.github.io/credifacil/",
    SENDER_EMAIL: "hola@credifacil.cr",
    BREVO_API_KEY: "clave-de-prueba",
    RATE_LIMIT_KV: memoryKV(),
  };
});

const validPayload = (over = {}) => ({
  name: "Ana Rojas",
  email: "ana@ejemplo.com",
  product: "hipotecario",
  employment: "privado",
  income: "r3",
  amount: 60_000_000,
  months: 240,
  monthlyPayment: 520_694,
  annualRate: 8.5,
  ...over,
});

function post(body, { origin = ORIGIN, ip = "1.2.3.4" } = {}) {
  return new Request("https://worker.dev/", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json", "CF-Connecting-IP": ip },
    body: JSON.stringify(body),
  });
}

// ---------- Método y origen ----------

test("responde al preflight CORS", async () => {
  const res = await worker.fetch(
    new Request("https://worker.dev/", { method: "OPTIONS", headers: { Origin: ORIGIN } }),
    env,
  );
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), ORIGIN);
});

test("rechaza GET", async () => {
  const res = await worker.fetch(
    new Request("https://worker.dev/", { method: "GET", headers: { Origin: ORIGIN } }),
    env,
  );
  assert.equal(res.status, 405);
});

test("rechaza un origen no autorizado", async () => {
  const res = await worker.fetch(post(validPayload(), { origin: "https://sitio-malicioso.com" }), env);
  assert.equal(res.status, 403);
  assert.equal(brevoCalls.length, 0, "no debe llegar a Brevo");
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), null);
});

// ---------- Validación ----------

test("envía con un cuerpo válido", async () => {
  const res = await worker.fetch(post(validPayload()), env);
  assert.equal(res.status, 200);
  assert.equal(brevoCalls.length, 1);

  const { url, init, body } = brevoCalls[0];
  assert.equal(url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(init.headers["api-key"], "clave-de-prueba");
  assert.equal(body.to[0].email, "ana@ejemplo.com");
  assert.equal(body.sender.email, "hola@credifacil.cr");
  assert.match(body.subject, /simulación/i);
});

test("rechaza JSON malformado", async () => {
  const res = await worker.fetch(
    new Request("https://worker.dev/", {
      method: "POST",
      headers: { Origin: ORIGIN, "Content-Type": "application/json" },
      body: "{no es json",
    }),
    env,
  );
  assert.equal(res.status, 400);
  assert.equal(brevoCalls.length, 0);
});

test("rechaza correos con forma inválida", async () => {
  for (const email of ["sin-arroba", "", "a@b", "x".repeat(250) + "@y.cr"]) {
    const res = await worker.fetch(post(validPayload({ email })), env);
    assert.equal(res.status, 400, `deberia rechazar "${email.slice(0, 20)}"`);
  }
  assert.equal(brevoCalls.length, 0);
});

test("rechaza valores fuera de catálogo", async () => {
  for (const over of [
    { product: "cripto" },
    { employment: "rey" },
    { income: "r99" },
  ]) {
    const res = await worker.fetch(post(validPayload(over)), env);
    assert.equal(res.status, 400);
  }
  assert.equal(brevoCalls.length, 0);
});

test("rechaza números absurdos o no numéricos", async () => {
  for (const over of [
    { amount: -1 },
    { amount: 2_000_000_000 },
    { months: 0 },
    { months: 9999 },
    { annualRate: 500 },
    { monthlyPayment: "mucho" },
    { amount: Infinity },
    { months: NaN },
  ]) {
    const res = await worker.fetch(post(validPayload(over)), env);
    assert.equal(res.status, 400, `deberia rechazar ${JSON.stringify(over)}`);
  }
  assert.equal(brevoCalls.length, 0);
});

test("rechaza un nombre desmesurado o vacío", async () => {
  for (const name of ["", "   ", "x".repeat(200)]) {
    const res = await worker.fetch(post(validPayload({ name })), env);
    assert.equal(res.status, 400);
  }
});

test("acepta que falten situación laboral e ingresos", async () => {
  const p = validPayload();
  delete p.employment;
  delete p.income;
  const res = await worker.fetch(post(p), env);
  assert.equal(res.status, 200);
});

// ---------- Lo importante: no es un relé abierto ----------

test("IGNORA el HTML que mande el cliente: el correo lo redacta el Worker", async () => {
  await worker.fetch(
    post(
      validPayload({
        htmlContent: "<h1>Gane un iPhone</h1>",
        textContent: "spam",
        subject: "Asunto secuestrado",
      }),
    ),
    env,
  );
  const { body } = brevoCalls[0];
  assert.ok(!body.htmlContent.includes("Gane un iPhone"), "se coló HTML del cliente");
  assert.ok(!body.textContent.includes("spam"), "se coló texto del cliente");
  assert.match(body.subject, /simulación/i, "se coló el asunto del cliente");
  assert.match(body.htmlContent, /Cuota mensual estimada/);
});

test("no permite inyectar marcado a través del nombre", async () => {
  await worker.fetch(post(validPayload({ name: '<img src=x onerror="alert(1)">' })), env);
  const { body } = brevoCalls[0];
  assert.ok(!body.htmlContent.includes("<img"), "el nombre no fue escapado");
  assert.ok(body.htmlContent.includes("&lt;img"), "deberia aparecer escapado");
});

test("el remitente sale de la configuración, no del cliente", async () => {
  await worker.fetch(post(validPayload({ sender: { email: "atacante@mal.com" } })), env);
  assert.equal(brevoCalls[0].body.sender.email, "hola@credifacil.cr");
});

test("el correo lleva el descargo de que no es una oferta", async () => {
  await worker.fetch(post(validPayload()), env);
  const { body } = brevoCalls[0];
  assert.match(body.htmlContent, /No constituye una oferta/i);
  assert.match(body.textContent, /No constituye una oferta/i);
});

// ---------- Límite por IP ----------

test("corta a la sexta petición de la misma IP", async () => {
  for (let i = 0; i < 5; i++) {
    const res = await worker.fetch(post(validPayload(), { ip: "9.9.9.9" }), env);
    assert.equal(res.status, 200, `la petición ${i + 1} deberia pasar`);
  }
  const res = await worker.fetch(post(validPayload(), { ip: "9.9.9.9" }), env);
  assert.equal(res.status, 429);
  assert.equal(brevoCalls.length, 5, "la sexta no debe llegar a Brevo");
});

test("las peticiones inválidas NO gastan el límite del usuario", async () => {
  // Cinco erratas seguidas no deben dejar a nadie sin poder enviar.
  for (let i = 0; i < 5; i++) {
    const res = await worker.fetch(post(validPayload({ email: "mal" }), { ip: "7.7.7.7" }), env);
    assert.equal(res.status, 400);
  }
  const ok = await worker.fetch(post(validPayload(), { ip: "7.7.7.7" }), env);
  assert.equal(ok.status, 200, "el envío correcto tras varias erratas debe pasar");
});

test("el límite es por IP, no global", async () => {
  for (let i = 0; i < 5; i++) {
    await worker.fetch(post(validPayload(), { ip: "1.1.1.1" }), env);
  }
  const otra = await worker.fetch(post(validPayload(), { ip: "2.2.2.2" }), env);
  assert.equal(otra.status, 200);
});

// ---------- Fallos de Brevo ----------

test("si Brevo falla, devuelve error sin filtrar el detalle", async () => {
  brevoStatus = 401;
  const res = await worker.fetch(post(validPayload()), env);
  assert.equal(res.status, 502);
  const body = await res.json();
  assert.ok(!JSON.stringify(body).includes("clave-de-prueba"), "filtró la clave");
});
