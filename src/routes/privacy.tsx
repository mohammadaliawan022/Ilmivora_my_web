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
    links: [{ rel: "canonical", href: "https://ilmivora-1.vercel.app/privacy" }],
  }),
  component: () => (
    <InfoPage eyebrow="Legal" title="Privacy Policy">
      <p className="text-sm">Last updated: <time dateTime="2026-11-09">9 November 2026</time>.</p>
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
      <h2>Advertising and cookies</h2>
      <p>
        Ilmivora does not currently display Google AdSense ads. If advertising is enabled, Google and
        other advertising partners may use cookies or similar technologies to deliver and measure ads.
        Google may use information about visits to this and other websites to provide personalised ads.
        You can manage Google personalised advertising in <a className="text-primary underline" href="https://adssettings.google.com/">Google Ads Settings</a>.
      </p>
      <p>
        Before enabling personalised advertising for visitors in the European Economic Area, the United
        Kingdom or Switzerland, Ilmivora will use a Google-certified consent management platform that
        supports the IAB Transparency and Consent Framework, and will request consent where required.
      </p>
      <p>
        If other ad networks are enabled, this policy will identify them and explain their relevant
        cookie and opt-out choices. This policy will be updated when advertising is configured.
      </p>
      <h2>Your choices</h2>
      <p>
        You can remove locally stored test history by clearing Ilmivora's site data in your browser.
        Account deletion is not currently available through a self-service setting on the site.
      </p>
    </InfoPage>
  ),
});
