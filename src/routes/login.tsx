import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";

type Search = { tab?: "login" | "signup" };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: s["tab"] === "signup" ? "signup" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log in or Sign up — Ilmivora" },
      {
        name: "description",
        content: "Create a free Ilmivora account to save test results and track your exam preparation.",
      },
      { property: "og:title", content: "Log in to Ilmivora" },
      { property: "og:description", content: "Save results and track your preparation." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { tab } = Route.useSearch();
  const [pending, setPending] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setTimeout(() => {
      setPending(false);
      toast.info("Accounts are being set up", {
        description: "Sign-in opens soon. Your test results are saved on this device meanwhile.",
      });
    }, 400);
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-hero p-12 text-navy-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden />
        <Logo inverted className="relative" />
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">
            Your preparation,
            <br />
            all in one place.
          </h2>
          <ul className="mt-8 space-y-3 text-navy-foreground/80">
            {[
              "Save every practice test and exam result",
              "Track subject-wise performance over time",
              "Pick up where you left off on any device",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-violet" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-urdu text-2xl text-navy-foreground/40" dir="rtl" lang="ur">
          محنت کا پھل میٹھا ہوتا ہے
        </p>
      </aside>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Tabs defaultValue={tab ?? "login"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Log in to continue your preparation.</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Field id="login-email" label="Email" type="email" autoComplete="email" />
                <Field id="login-password" label="Password" type="password" autoComplete="current-password" />
                <Button type="submit" className="w-full" size="lg" disabled={pending}>
                  Log in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Free forever for students.</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Field id="signup-name" label="Full name" autoComplete="name" />
                <Field id="signup-email" label="Email" type="email" autoComplete="email" />
                <Field id="signup-password" label="Password" type="password" autoComplete="new-password" minLength={8} />
                <Button type="submit" variant="brand" className="w-full" size="lg" disabled={pending}>
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} required className="h-11" {...props} />
    </div>
  );
}
