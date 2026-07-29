import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Panel de administración",
  // El panel no debe aparecer en buscadores. No es una medida de seguridad
  // —el acceso lo controlan Firebase Auth y las reglas de Firestore— pero
  // evita que la ruta se indexe y atraiga intentos de acceso.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
