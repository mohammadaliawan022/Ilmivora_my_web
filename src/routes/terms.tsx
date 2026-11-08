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
    links: [{ rel: "canonical", href: "https://ilmivora-1.vercel.app/terms" }],
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
        Questions and explanations are educational material and may contain errors or become outdated.
        Confirm important facts, eligibility requirements, deadlines and examination rules with the
        relevant official source. Ilmivora is independent and is not affiliated with an examination
        commission or government body. Using the site does not guarantee an examination result.
      </p>
      <h2>Accounts</h2>
      <p>Keep your login details secure. We may suspend accounts that misuse the service.</p>
    </InfoPage>
  ),
});
