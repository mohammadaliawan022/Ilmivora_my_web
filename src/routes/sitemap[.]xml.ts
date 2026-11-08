import { createFileRoute } from "@tanstack/react-router";
import { getSubjectCounts } from "@/lib/data/mcq-repo";
import { SUBJECTS } from "@/lib/subjects";

const SITE_ORIGIN = "https://ilmivora-1.vercel.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let subjectCounts: Record<string, number> = {};
        try {
          subjectCounts = await getSubjectCounts();
        } catch {
          // Core informational pages remain discoverable if the database is temporarily unavailable.
        }

        const paths = [
          "/",
          "/subjects",
          "/study-guides",
          "/about",
          "/contact",
          "/privacy",
          "/terms",
          ...SUBJECTS.filter((subject) => (subjectCounts[subject.name] ?? 0) > 0).map((subject) =>
            subject.slug === "general-knowledge" ? "/general-knowledge" : `/subjects/${subject.slug}`,
          ),
        ];
        const urls = [...new Set(paths)].map((path) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
