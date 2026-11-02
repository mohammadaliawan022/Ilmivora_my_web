import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Ilmivora" },
      { name: "description", content: "How Ilmivora collects, uses and protects your information." },
      { property: "og:title", content: "Privacy Policy — Ilmivora" },
      { property: "og:description", content: "How we handle your data." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Legal" title="Privacy Policy">
      <p>This policy explains what information Ilmivora collects and how it is used.</p>
      <h2>Information we collect</h2>
      <p>
        When you create an account we store your name, email address and your test results so you can
        track your progress. Before you sign in, results are kept only on your own device.
      </p>
      <h2>How we use it</h2>
      <p>Your information is used only to provide and improve the service. We do not sell personal data.</p>
      <h2>Your choices</h2>
      <p>You can request deletion of your account and data at any time by contacting us.</p>
    </InfoPage>
  ),
});
