import { institutions } from "@/lib/institutions";

const stats = [
  { value: `${institutions.length}+`, label: "Instituciones aliadas" },
  { value: "4", label: "Tipos de crédito" },
  { value: "24 h", label: "Tiempo de respuesta" },
  { value: "₡0", label: "Costo de la asesoría" },
];

export function Stats() {
  return (
    <section className="bg-brand-950 py-14">
      <div className="container-x grid grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-4xl font-extrabold text-white sm:text-5xl">
              {s.value}
            </p>
            <p className="mt-2 text-sm font-medium text-brand-200">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
