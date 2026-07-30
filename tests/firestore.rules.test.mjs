/**
 * Pruebas de las reglas de Firestore.
 *
 * Están escritas como ataques: cada caso intenta hacer algo que NO debería
 * poder hacerse. Una regla mal escrita no produce ningún error visible —
 * simplemente deja los datos accesibles— así que la única forma de saber que
 * funciona es intentar romperla.
 */
import test, { before, after } from "node:test";
import fs from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc, getDoc, setDoc, addDoc, collection, deleteDoc, updateDoc,
  getDocs, serverTimestamp, Timestamp,
} from "firebase/firestore";

let env;

const OWNER = "uid-owner";
const EDITOR = "uid-editor";
const VIEWER = "uid-viewer";
const RANDO = "uid-cualquiera";

/** Solicitud mínima válida tal como la envía el sitio público. */
function validLead(over = {}) {
  return {
    name: "Ana Rojas",
    email: "ana@ejemplo.com",
    phone: "8888 7777",
    product: "hipotecario",
    amount: 50_000_000,
    months: 240,
    source: "wizard",
    status: "nuevo",
    createdAt: serverTimestamp(),
    ...over,
  };
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-credifacil",
    firestore: {
      rules: fs.readFileSync(
        new URL("../firestore.rules", import.meta.url),
        "utf8",
      ),
      host: "127.0.0.1",
      port: 8080,
    },
  });

  // Sembrar los admins saltándose las reglas, como haría la consola.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "admins", OWNER), { email: "o@x.cr", role: "owner", createdAt: Timestamp.now() });
    await setDoc(doc(db, "admins", EDITOR), { email: "e@x.cr", role: "editor", createdAt: Timestamp.now() });
    await setDoc(doc(db, "admins", VIEWER), { email: "v@x.cr", role: "viewer", createdAt: Timestamp.now() });
    await setDoc(doc(db, "leads", "lead-existente"), {
      name: "Previo", email: "p@x.cr", phone: "8888 0000", product: "personal",
      amount: 1_000_000, months: 24, source: "contacto",
      status: "nuevo", createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, "institutions", "bn"), { name: "Banco Nacional", active: true });
    await setDoc(doc(db, "offers", "of1"), { institutionId: "bn", product: "hipotecario" });
  });
});

after(async () => { await env?.cleanup(); });

const anon = () => env.unauthenticatedContext().firestore();
const as = (uid) => env.authenticatedContext(uid).firestore();

// ---------- Lo crítico: nadie lee las solicitudes ----------

test("un visitante anónimo NO puede leer una solicitud", async () => {
  await assertFails(getDoc(doc(anon(), "leads", "lead-existente")));
});

test("un visitante anónimo NO puede listar la colección de solicitudes", async () => {
  await assertFails(getDocs(collection(anon(), "leads")));
});

test("alguien autenticado pero sin ser admin TAMPOCO puede leerlas", async () => {
  await assertFails(getDoc(doc(as(RANDO), "leads", "lead-existente")));
  await assertFails(getDocs(collection(as(RANDO), "leads")));
});

test("un admin sí puede leerlas", async () => {
  await assertSucceeds(getDocs(collection(as(VIEWER), "leads")));
});

// ---------- Creación pública, pero validada ----------

test("un visitante anónimo SÍ puede enviar una solicitud válida", async () => {
  await assertSucceeds(addDoc(collection(anon(), "leads"), validLead()));
});

test("acepta la solicitud con los campos opcionales del wizard", async () => {
  await assertSucceeds(addDoc(collection(anon(), "leads"), validLead({
    phone: "8888 8888", employment: "privado", income: "r3",
    monthlyPayment: 390520, annualRate: 8.5, message: "Hola",
  })));
});

test("rechaza un estado distinto de 'nuevo' (nadie se autoasigna 'cerrado')", async () => {
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ status: "cerrado" })));
});

test("rechaza que el cliente escriba notas internas", async () => {
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ notes: "nota falsa" })));
});

test("rechaza una fecha falsificada: createdAt lo pone el servidor", async () => {
  await assertFails(addDoc(collection(anon(), "leads"),
    validLead({ createdAt: Timestamp.fromDate(new Date("2020-01-01")) })));
});

test("rechaza campos desconocidos (lista blanca)", async () => {
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ isAdmin: true })));
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ basura: "x" })));
});

test("rechaza valores fuera de catálogo", async () => {
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ product: "cripto" })));
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ employment: "rey" })));
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ income: "r99" })));
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ source: "otro" })));
});

test("rechaza textos desmesurados (no es un buzón de basura)", async () => {
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ name: "x".repeat(200) })));
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ message: "x".repeat(5000) })));
});

test("rechaza correos con forma inválida y montos absurdos", async () => {
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ email: "sin-arroba" })));
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ amount: -5 })));
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ months: 9999 })));
});

test("rechaza una solicitud SIN telefono (un lead sin contacto no sirve)", async () => {
  const sinTelefono = validLead();
  delete sinTelefono.phone;
  await assertFails(addDoc(collection(anon(), "leads"), sinTelefono));
});

test("rechaza un telefono demasiado corto para ser real", async () => {
  await assertFails(addDoc(collection(anon(), "leads"), validLead({ phone: "123" })));
});

test("rechaza una solicitud incompleta", async () => {
  await assertFails(addDoc(collection(anon(), "leads"), { name: "Solo nombre" }));
});

// ---------- Modificación y borrado ----------

test("un anónimo no puede modificar ni borrar solicitudes", async () => {
  await assertFails(updateDoc(doc(anon(), "leads", "lead-existente"), { status: "cerrado" }));
  await assertFails(deleteDoc(doc(anon(), "leads", "lead-existente")));
});

// ---------- Completar la propia solicitud desde el sitio publico ----------

test("el visitante puede completar su solicitud (afinar monto, agregar mensaje)", async () => {
  const ref = await addDoc(collection(anon(), "leads"), validLead());
  await assertSucceeds(updateDoc(doc(anon(), "leads", ref.id), {
    amount: 75_000_000, months: 300, message: "Quiero comprar casa usada",
    phone: "8888 7777",
  }));
});

test("NO puede ascender su propia solicitud a otro estado", async () => {
  const ref = await addDoc(collection(anon(), "leads"), validLead());
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { status: "cerrado" }));
});

test("NO puede escribir notas internas al completar", async () => {
  const ref = await addDoc(collection(anon(), "leads"), validLead());
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { notes: "nota falsa" }));
});

test("NO puede reescribir el nombre ni el correo de una solicitud", async () => {
  const ref = await addDoc(collection(anon(), "leads"), validLead());
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { name: "Otro" }));
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { email: "otro@x.cr" }));
});

test("NO puede dejar la solicitud sin telefono al completarla", async () => {
  const ref = await addDoc(collection(anon(), "leads"), validLead());
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { phone: "" }));
});

test("NO puede tocar una solicitud que un asesor ya gestiono", async () => {
  const ref = await addDoc(collection(anon(), "leads"), validLead());
  // El asesor la toma...
  await assertSucceeds(updateDoc(doc(as(EDITOR), "leads", ref.id), { status: "contactado" }));
  // ...y desde ahi el visitante ya no la modifica.
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { amount: 1_000_000 }));
});

test("NO puede colar valores absurdos al completar", async () => {
  const ref = await addDoc(collection(anon(), "leads"), validLead());
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { amount: -1 }));
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { months: 9999 }));
  await assertFails(updateDoc(doc(anon(), "leads", ref.id), { message: "x".repeat(5000) }));
});

test("un viewer no puede modificar (es solo lectura)", async () => {
  await assertFails(updateDoc(doc(as(VIEWER), "leads", "lead-existente"), { status: "cerrado" }));
});

test("un editor sí puede cambiar el estado", async () => {
  await assertSucceeds(updateDoc(doc(as(EDITOR), "leads", "lead-existente"), { status: "contactado" }));
});

test("solo un owner puede borrar solicitudes", async () => {
  await assertFails(deleteDoc(doc(as(EDITOR), "leads", "lead-existente")));
  await assertSucceeds(deleteDoc(doc(as(OWNER), "leads", "lead-existente")));
});

// ---------- Catálogo: público para leer, admin para escribir ----------

test("cualquiera puede leer instituciones y ofertas", async () => {
  await assertSucceeds(getDoc(doc(anon(), "institutions", "bn")));
  await assertSucceeds(getDocs(collection(anon(), "offers")));
});

test("un anónimo NO puede alterar las tasas", async () => {
  await assertFails(setDoc(doc(anon(), "offers", "of1"), { annualRate: 0.1 }));
  await assertFails(setDoc(doc(anon(), "institutions", "falsa"), { name: "Mía" }));
});

test("un viewer tampoco escribe el catálogo; un editor sí", async () => {
  await assertFails(setDoc(doc(as(VIEWER), "offers", "of1"), { annualRate: 9 }));
  await assertSucceeds(setDoc(doc(as(EDITOR), "offers", "of1"), { annualRate: 9 }));
});

// ---------- Escalada de privilegios ----------

test("alguien sin permiso NO puede leer quiénes son los admins", async () => {
  await assertFails(getDocs(collection(anon(), "admins")));
  await assertFails(getDocs(collection(as(RANDO), "admins")));
});

test("NADIE puede autoconcederse acceso al panel", async () => {
  await assertFails(setDoc(doc(as(RANDO), "admins", RANDO), {
    email: "cualquiera@x.cr", role: "owner", createdAt: Timestamp.now(),
  }));
});

test("un editor no puede ascenderse a owner", async () => {
  await assertFails(updateDoc(doc(as(EDITOR), "admins", EDITOR), { role: "owner" }));
});

test("un viewer no puede otorgar acceso a nadie", async () => {
  await assertFails(setDoc(doc(as(VIEWER), "admins", "nuevo"), {
    email: "n@x.cr", role: "editor", createdAt: Timestamp.now(),
  }));
});

test("un owner sí puede otorgar y revocar acceso", async () => {
  await assertSucceeds(setDoc(doc(as(OWNER), "admins", "uid-nuevo"), {
    email: "n@x.cr", role: "editor", createdAt: Timestamp.now(),
  }));
  await assertSucceeds(deleteDoc(doc(as(OWNER), "admins", "uid-nuevo")));
});

test("un owner NO puede eliminarse a sí mismo (no dejar el panel sin dueño)", async () => {
  await assertFails(deleteDoc(doc(as(OWNER), "admins", OWNER)));
});

// ---------- Cierre por defecto ----------

test("una colección no contemplada queda cerrada", async () => {
  await assertFails(getDoc(doc(anon(), "loquesea", "x")));
  await assertFails(setDoc(doc(as(OWNER), "loquesea", "x"), { a: 1 }));
});
