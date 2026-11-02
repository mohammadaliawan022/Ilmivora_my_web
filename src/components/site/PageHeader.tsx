import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-hero text-navy-foreground">
      <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden />
      <div className="container-page relative py-12 md:py-16">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-foreground/60">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base text-navy-foreground/75 md:text-lg">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
