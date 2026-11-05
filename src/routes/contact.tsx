import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ilmivora" },
      { name: "description", content: "Get in touch with the Ilmivora team about MCQs, corrections or partnerships." },
      { property: "og:title", content: "Contact Ilmivora" },
      { property: "og:description", content: "Reach the Ilmivora team." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Contact" title="Contact us" description="We'd love to hear from you.">
      <p>
        Found an error in a question or interested in working with us? Reach
        out and we'll get back to you.
      </p>
      <h2>Email</h2>
      <p>Contact details will be published here soon.</p>
    </InfoPage>
  ),
});
