import { useQuery } from "@tanstack/react-query";
import { subjectIntroQuery } from "@/lib/data/queries";

/** Admin-written cover image + introduction shown above a subject's MCQs. */
export function SubjectIntro({ slug, name }: { slug: string; name: string }) {
  const { data } = useQuery(subjectIntroQuery(slug));
  if (!data || (!data.image_url && !data.intro)) return null;
  const paragraphs = (data.intro ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <section
      aria-label={`About ${name}`}
      className="card-surface mt-8 grid gap-6 overflow-hidden p-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      {data.image_url && (
        <img
          src={data.image_url}
          alt={data.image_alt ?? name}
          className={`h-56 w-full object-cover md:h-full md:min-h-64 ${paragraphs.length ? "" : "md:col-span-2"}`}
        />
      )}
      {paragraphs.length > 0 && (
        <div className={`space-y-3 p-6 md:py-8 ${data.image_url ? "md:pl-0" : "md:col-span-2"}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">About this subject</p>
          <h2 className="text-2xl font-bold">Introduction to {name}</h2>
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
