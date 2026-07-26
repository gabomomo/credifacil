import { cn } from "@/lib/cn";
import { Star4 } from "@/components/ui/Doodles";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700",
            align === "center" && "mx-auto",
          )}
        >
          <Star4 className="size-3.5 text-sun-400" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{description}</p>
      )}
    </div>
  );
}
