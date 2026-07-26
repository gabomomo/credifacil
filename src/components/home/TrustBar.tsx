import { institutions } from "@/lib/institutions";
import { InstitutionLogo } from "@/components/ui/InstitutionLogo";

export function TrustBar() {
  return (
    <section className="border-y border-slate-100 bg-white py-10">
      <div className="container-x">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
          Comparamos las mejores condiciones entre bancos, mutuales y cooperativas
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
          {institutions.map((inst) => (
            <div
              key={inst.name}
              className="flex items-center gap-2.5 opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              title={inst.name}
            >
              <InstitutionLogo institution={inst} className="size-9 text-xs" />
              <span className="hidden text-sm font-semibold text-ink-soft sm:inline">
                {inst.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
