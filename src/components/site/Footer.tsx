import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-navy text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-foreground/70">
            MCQ preparation for PPSC, FPSC, NTS and other competitive examinations in Pakistan.
          </p>
          <p className="mt-6 text-left font-urdu text-lg text-navy-foreground/50" dir="rtl" lang="ur">
            علم ہی طاقت ہے
          </p>
        </div>
        <FooterCol
          title="Prepare"
          links={[
            { to: "/subjects", label: "All Subjects" },
            { to: "/practice", label: "Practice Test" },
            { to: "/exam", label: "Exam Mode" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { to: "/login", label: "Log in / Sign up" },
            { to: "/dashboard", label: "My Dashboard" },
            { to: "/search", label: "Search MCQs" },
            { to: "/submit-mcq", label: "Submit an MCQ" },
          ]}
        />
        <FooterCol
          title="Ilmivora"
          links={[
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/privacy", label: "Privacy Policy" },
            { to: "/terms", label: "Terms" },
          ]}
        />
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-foreground/60 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Ilmivora. All rights reserved.</span>
          <span>Made for aspirants across Pakistan.</span>
        </div>
      </div>
    </footer>
  );
}

type FooterLink = {
  to:
    | "/subjects"
    | "/practice"
    | "/exam"
    | "/login"
    | "/dashboard"
    | "/search"
    | "/submit-mcq"
    | "/about"
    | "/contact"
    | "/privacy"
    | "/terms";
  label: string;
};

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-navy-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
