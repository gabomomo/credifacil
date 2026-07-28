/**
 * Configuración central del sitio: datos de contacto, dominio y horario.
 *
 * ⚠️ TODOS los valores marcados como PLACEHOLDER deben reemplazarse por datos
 * reales antes de publicar. Cambiándolos aquí se actualizan automáticamente el
 * Header, el Footer, la página de Contacto y todos los CTA de WhatsApp.
 */

/** PLACEHOLDER — número real de WhatsApp/teléfono, solo dígitos con código de país. */
const phoneDigits = "50600000000";

/** PLACEHOLDER — correo de contacto. */
const email = "hola@credifacil.cr";

/** PLACEHOLDER — dominio definitivo del sitio (sin barra final). */
const url = "https://credifacil.cr";

/**
 * Formatea "50688887777" como "+506 8888 7777" para mostrar en pantalla.
 * Si el número no calza con el formato de 8 dígitos de Costa Rica, se devuelve
 * con el prefijo "+" sin agrupar.
 */
function formatCR(digits: string): string {
  const match = /^506(\d{4})(\d{4})$/.exec(digits);
  return match ? `+506 ${match[1]} ${match[2]}` : `+${digits}`;
}

export const site = {
  name: "Credifácil",
  url,
  /** Ciudad/país que se muestra en el footer. */
  location: "San José, Costa Rica",
  /** Horario de atención mostrado en la página de contacto. */
  hours:
    "Lunes a viernes de 8:00 a. m. a 6:00 p. m. · Sábados de 9:00 a. m. a 1:00 p. m.",
  phone: {
    /** Solo dígitos, para construir enlaces. */
    digits: phoneDigits,
    /** Versión legible para mostrar en pantalla. */
    display: formatCR(phoneDigits),
    /** Enlace para llamar. */
    tel: `tel:+${phoneDigits}`,
    /** Enlace directo al chat de WhatsApp. */
    whatsapp: `https://wa.me/${phoneDigits}`,
  },
  email: {
    address: email,
    mailto: `mailto:${email}`,
  },
} as const;
