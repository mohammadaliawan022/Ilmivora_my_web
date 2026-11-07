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
        Your account name and email address are handled by the authentication service. Test attempts
        are stored in this browser on this device and are not currently synced to your account. MCQs
        you submit, including an optional display name, are saved for admin review; approved questions
        may be shown publicly.
      </p>
      <h2>How we use it</h2>
      <p>Your information is used only to provide and improve the service. We do not sell personal data.</p>
      <h2>Your choices</h2>
      <p>
        You can remove locally stored test history by clearing Ilmivora's site data in your browser.
        Account deletion is not currently available through a self-service setting on the site.
      </p>
    </InfoPage>
  ),
});
