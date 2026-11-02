import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Ilmivora" },
      { name: "description", content: "The terms that apply when you use Ilmivora." },
      { property: "og:title", content: "Terms of Use — Ilmivora" },
      { property: "og:description", content: "Terms for using Ilmivora." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Legal" title="Terms of Use">
      <p>By using Ilmivora you agree to these terms.</p>
      <h2>Use of content</h2>
      <p>
        MCQs and explanations are provided for personal exam preparation. Please do not copy or
        redistribute them in bulk.
      </p>
      <h2>Accuracy</h2>
      <p>
        We work hard to keep questions accurate, but always confirm critical facts with official
        sources. Report any errors and we'll correct them.
      </p>
      <h2>Accounts</h2>
      <p>Keep your login details secure. We may suspend accounts that misuse the service.</p>
    </InfoPage>
  ),
});
