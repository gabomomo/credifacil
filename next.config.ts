import type { NextConfig } from "next";

/**
 * Nombre del repositorio en GitHub. GitHub Pages sirve los "project pages" bajo
 * https://<usuario>.github.io/<repo>/, por eso necesitamos basePath en producción.
 * Si cambias el nombre del repo, actualiza esta constante.
 */
const repo = "credifacil";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Exporta el sitio como HTML/CSS/JS estático a la carpeta ./out
  output: "export",
  // GitHub Pages no puede optimizar imágenes en tiempo de ejecución
  images: { unoptimized: true },
  // Rutas como /ruta/index.html (mejor compatibilidad con GitHub Pages)
  trailingSlash: true,
  // Prefijo de ruta solo en producción (para el subdirectorio del repo)
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
};

export default nextConfig;
