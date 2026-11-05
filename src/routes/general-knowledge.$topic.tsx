import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/general-knowledge/$topic")({
  beforeLoad: () => {
    throw redirect({ to: "/general-knowledge" });
  },
});
