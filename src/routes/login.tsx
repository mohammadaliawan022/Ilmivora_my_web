import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { isCurrentUserAdmin, signInWithPassword, signUpWithPassword } from "@/shared/supabase";

type LoginTab = "login" | "signup";
type Search = { tab?: LoginTab | undefined };

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
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LoginTab>(tab ?? "login");
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      if (activeTab === "signup") {
        const session = await signUpWithPassword(email, password, name);
        if (!session) {
          toast.success("Account created", { description: "Check your email to confirm your account, then log in." });
          setActiveTab("login");
          return;
        }
      } else {
        await signInWithPassword(email, password);
      }
      const isAdmin = await isCurrentUserAdmin();
      if (isAdmin) {
        toast.success("Signed in");
        await navigate({ to: "/admin" });
      } else {
        toast.success(activeTab === "signup" ? "Account created" : "Signed in", {
          description: "Your account is ready. Admin tools require an Ilmivora admin account.",
        });
        await navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setPending(false);
    }
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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LoginTab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Log in to continue your preparation.</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Field id="login-email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <PasswordField id="login-password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} />
                <Button type="submit" className="w-full" size="lg" disabled={pending}>
                  {pending ? "Signing in…" : "Log in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Free forever for students.</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Field id="signup-name" label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                <Field id="signup-email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <PasswordField id="signup-password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} />
                <Button type="submit" variant="brand" className="w-full" size="lg" disabled={pending}>
                  {pending ? "Creating account…" : "Create account"}
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

function PasswordField({
  id,
  visible,
  onToggle,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Password</Label>
      <div className="relative">
        <Input
          id={id}
          required
          className="h-11 pr-11"
          type={visible ? "text" : "password"}
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
