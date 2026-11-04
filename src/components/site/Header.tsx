import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentAuthUser, signOut, subscribeToAuthChanges } from "@/lib/supabase";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/subjects", label: "Subjects" },
  { to: "/past-papers", label: "Past Papers" },
  { to: "/practice", label: "Practice" },
  { to: "/exam", label: "Exam Mode" },
  { to: "/submit-mcq", label: "Submit MCQ" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getCurrentAuthUser>>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshUser = () => {
      setUser(getCurrentAuthUser());
      setAuthReady(true);
    };
    refreshUser();
    return subscribeToAuthChanges(refreshUser);
  }, []);

  const logOut = () => {
    setAccountOpen(false);
    signOut();
    void navigate({ to: "/login" });
  };

  const accountName = user?.user_metadata?.full_name?.trim() || user?.email?.split("@")[0] || "Your account";
  const nameParts = accountName.split(/[\s._-]+/).filter(Boolean);
  const initials = nameParts.length > 1
    ? `${nameParts[0]?.[0] ?? ""}${nameParts[nameParts.length - 1]?.[0] ?? ""}`.toUpperCase()
    : accountName.slice(0, 2).toUpperCase();

  const accountMenu = user ? (
    <div
      className="relative ml-1"
      onMouseEnter={() => setAccountOpen(true)}
      onMouseLeave={() => setAccountOpen(false)}
      onFocusCapture={() => setAccountOpen(true)}
      onKeyDown={(event) => event.key === "Escape" && setAccountOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setAccountOpen(false);
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open account menu"
        aria-expanded={accountOpen}
        aria-controls="header-account-menu"
        onClick={() => setAccountOpen((open) => !open)}
        className="h-10 w-10 rounded-full bg-foreground text-xs font-bold text-background hover:bg-foreground/90 hover:text-background"
      >
        {initials || <UserRound aria-hidden="true" className="h-5 w-5" />}
      </Button>
      {accountOpen && (
        <div
          id="header-account-menu"
          className="absolute right-0 top-full z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
        >
          <div className="flex items-center gap-3 p-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-foreground text-lg font-bold text-background">
              {initials || <UserRound aria-hidden="true" className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{accountName}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-border py-2">
            <Link
              to="/dashboard"
              onClick={() => setAccountOpen(false)}
              className="block px-5 py-3 text-sm hover:bg-accent"
            >
              Your progress
            </Link>
            <Link
              to="/subjects"
              onClick={() => setAccountOpen(false)}
              className="block px-5 py-3 text-sm hover:bg-accent"
            >
              Browse subjects
            </Link>
            <Link
              to="/practice"
              onClick={() => setAccountOpen(false)}
              className="block px-5 py-3 text-sm hover:bg-accent"
            >
              Practice tests
            </Link>
            <Link
              to="/exam"
              onClick={() => setAccountOpen(false)}
              className="block px-5 py-3 text-sm hover:bg-accent"
            >
              Exam mode
            </Link>
            <Link
              to="/past-papers"
              onClick={() => setAccountOpen(false)}
              className="block px-5 py-3 text-sm hover:bg-accent"
            >
              Past papers
            </Link>
            <Link
              to="/submit-mcq"
              onClick={() => setAccountOpen(false)}
              className="block px-5 py-3 text-sm hover:bg-accent"
            >
              Submit an MCQ
            </Link>
          </div>
          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={logOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search" aria-label="Search MCQs">
              <Search />
            </Link>
          </Button>
          <ThemeToggle />
          {authReady && (user ? accountMenu : (
            <Button asChild className="ml-1 hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
          ))}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1 px-4" aria-label="Mobile">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    activeProps={{ className: "bg-accent" }}
                  >
                    {n.label}
                  </Link>
                ))}
                {user && (
                  <div className="my-2 border-t border-border pt-2">
                    <p className="truncate px-3 py-2 text-xs text-muted-foreground">{user.email}</p>
                    <button
                      type="button"
                      onClick={() => { setOpen(false); logOut(); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  Admin
                </Link>
                {authReady && !user && (
                  <Button asChild className="mt-3">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Log in / Sign up
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
