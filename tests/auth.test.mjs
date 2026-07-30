/**
 * Verifica el alta de usuarios contra el emulador de Firebase Auth.
 * El caso crítico: crear una cuenta NO debe cerrar la sesión de quien la crea.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth, connectAuthEmulator, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
} from "firebase/auth";

const cfg = { apiKey: "demo", authDomain: "demo", projectId: "demo-auth", appId: "demo" };

function makeAuth(name) {
  const app = initializeApp(cfg, name);
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  return { app, auth };
}

test("crear un usuario en una instancia SECUNDARIA no toca la sesión principal", async () => {
  const principal = makeAuth("principal");

  // El administrador inicia sesión.
  await createUserWithEmailAndPassword(principal.auth, "jefe@credifacil.cr", "clave-jefe");
  await signOut(principal.auth);
  await signInWithEmailAndPassword(principal.auth, "jefe@credifacil.cr", "clave-jefe");
  assert.equal(principal.auth.currentUser?.email, "jefe@credifacil.cr");

  // Da de alta a alguien, como hace withSecondaryAuth().
  const secundaria = makeAuth("alta-1");
  const cred = await createUserWithEmailAndPassword(
    secundaria.auth, "nueva@credifacil.cr", "clave-nueva");
  const nuevoUid = cred.user.uid;
  await deleteApp(secundaria.app);

  // Lo que importa: el administrador sigue siendo él.
  assert.equal(principal.auth.currentUser?.email, "jefe@credifacil.cr",
    "la sesión del administrador fue reemplazada");
  assert.ok(nuevoUid, "no se obtuvo el uid del usuario nuevo");

  // Y la cuenta nueva sirve.
  const tercera = makeAuth("verificacion");
  const login = await signInWithEmailAndPassword(
    tercera.auth, "nueva@credifacil.cr", "clave-nueva");
  assert.equal(login.user.uid, nuevoUid);
  await deleteApp(tercera.app);
  await deleteApp(principal.app);
});

test("crear un usuario en la instancia PRINCIPAL sí la secuestra (por eso existe el aparte)", async () => {
  const { app, auth } = makeAuth("contraejemplo");
  await createUserWithEmailAndPassword(auth, "a@credifacil.cr", "clave-aaa");
  await signOut(auth);
  await signInWithEmailAndPassword(auth, "a@credifacil.cr", "clave-aaa");
  assert.equal(auth.currentUser?.email, "a@credifacil.cr");

  await createUserWithEmailAndPassword(auth, "b@credifacil.cr", "clave-bbb");
  assert.equal(auth.currentUser?.email, "b@credifacil.cr",
    "se esperaba el secuestro de sesión que withSecondaryAuth evita");
  await deleteApp(app);
});

test("no se puede repetir un correo ya registrado", async () => {
  const { app, auth } = makeAuth("duplicado");
  await createUserWithEmailAndPassword(auth, "repe@credifacil.cr", "clave-123");
  await assert.rejects(
    () => createUserWithEmailAndPassword(auth, "repe@credifacil.cr", "otra-clave"),
    (e) => e.code === "auth/email-already-in-use",
  );
  await deleteApp(app);
});

test("rechaza contraseñas de menos de 6 caracteres", async () => {
  const { app, auth } = makeAuth("debil");
  await assert.rejects(
    () => createUserWithEmailAndPassword(auth, "debil@credifacil.cr", "12345"),
    (e) => e.code === "auth/weak-password",
  );
  await deleteApp(app);
});

test("no se entra con contraseña incorrecta", async () => {
  const { app, auth } = makeAuth("malaclave");
  await createUserWithEmailAndPassword(auth, "real@credifacil.cr", "correcta-1");
  await signOut(auth);
  await assert.rejects(() => signInWithEmailAndPassword(auth, "real@credifacil.cr", "adivinada"));
  await deleteApp(app);
});
