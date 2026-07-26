import fs from "node:fs";
import path from "node:path";

/**
 * Detecta qué logos existen en /public/logos (server-only).
 * Coloca los archivos oficiales como /public/logos/<key>.svg (o .png/.webp)
 * usando el `key` de cada institución en institutions.ts.
 */
const dir = path.join(process.cwd(), "public", "logos");

let files: string[] = [];
try {
  files = fs.readdirSync(dir);
} catch {
  files = [];
}

/** Devuelve la ruta pública del logo si existe un archivo para ese key, o null. */
export function logoSrc(key: string): string | null {
  const match = files.find((f) => f.replace(/\.[^.]+$/, "") === key);
  return match ? `/logos/${match}` : null;
}
