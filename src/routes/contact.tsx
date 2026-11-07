import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ilmivora" },
      { name: "description", content: "Submit a correction to an Ilmivora MCQ for admin review." },
      { property: "og:title", content: "Contact Ilmivora" },
      { property: "og:description", content: "Reach the Ilmivora team." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Contact" title="Contact us" description="Send a question correction for review.">
      <p>
        Found an error in a question? Send a corrected version for review and our team can check it
        before it appears on the site.
      </p>
      <Button asChild>
        <Link to="/submit-mcq">
          Submit a correction <ArrowRight />
        </Link>
      </Button>
    </InfoPage>
  ),
});
