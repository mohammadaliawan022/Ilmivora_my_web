import {
  Atom,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  Calculator,
  Code2,
  Cpu,
  Dumbbell,
  FlaskConical,
  Gavel,
  Globe2,
  GraduationCap,
  HardHat,
  HeartPulse,
  Landmark,
  Languages,
  Leaf,
  LineChart,
  Megaphone,
  Microscope,
  Moon,
  Newspaper,
  PenTool,
  PieChart,
  Receipt,
  Scale,
  ScrollText,
  Search,
  Settings2,
  Sigma,
  Sprout,
  TreePine,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type SubjectGroup =
  | "General"
  | "Sciences"
  | "Languages"
  | "Social Sciences"
  | "Business"
  | "Engineering"
  | "Professional";

export interface Subject {
  name: string;
  slug: string;
  icon: LucideIcon;
  group: SubjectGroup;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const RAW: Array<[string, LucideIcon, SubjectGroup]> = [
  ["General Knowledge", Globe2, "General"],
  ["Pakistan Studies", Landmark, "General"],
  ["Pakistan Affairs", ScrollText, "General"],
  ["Current Affairs", Newspaper, "General"],
  ["Islamic Studies", Moon, "General"],
  ["Computer Science", Cpu, "Sciences"],
  ["Everyday Science", Microscope, "Sciences"],
  ["Physics", Atom, "Sciences"],
  ["Chemistry", FlaskConical, "Sciences"],
  ["Biology", Leaf, "Sciences"],
  ["Mathematics", Sigma, "Sciences"],
  ["Statistics", PieChart, "Sciences"],
  ["English", Languages, "Languages"],
  ["Urdu", PenTool, "Languages"],
  ["English Literature", BookOpen, "Languages"],
  ["Psychology", Brain, "Social Sciences"],
  ["Sociology", Users, "Social Sciences"],
  ["Economics", LineChart, "Social Sciences"],
  ["Political Science", Building2, "Social Sciences"],
  ["International Relations", Globe2, "Social Sciences"],
  ["Judiciary and Law", Gavel, "Professional"],
  ["Pedagogy", GraduationCap, "Professional"],
  ["Agriculture", Sprout, "Professional"],
  ["Forestry", TreePine, "Professional"],
  ["Physical Education", Dumbbell, "Professional"],
  ["Finance", Wallet, "Business"],
  ["HRM", Briefcase, "Business"],
  ["Marketing", Megaphone, "Business"],
  ["Accounting", Calculator, "Business"],
  ["Auditing", Receipt, "Business"],
  ["Electrical Engineering", Zap, "Engineering"],
  ["Civil Engineering", HardHat, "Engineering"],
  ["Mechanical Engineering", Settings2, "Engineering"],
  ["Chemical Engineering", Scale, "Engineering"],
  ["Software Engineering", Code2, "Engineering"],
  ["Medical MCQs", HeartPulse, "Professional"],
];

export const SUBJECTS: Subject[] = RAW.map(([name, icon, group]) => ({
  name,
  slug: slugify(name),
  icon,
  group,
}));

export const SUBJECT_GROUPS: SubjectGroup[] = [
  "General",
  "Sciences",
  "Languages",
  "Social Sciences",
  "Business",
  "Engineering",
  "Professional",
];

export const POPULAR_SUBJECT_SLUGS = [
  "general-knowledge",
  "pakistan-studies",
  "islamic-studies",
  "current-affairs",
  "english",
  "computer-science",
  "everyday-science",
  "mathematics",
];

export const GK_SUBJECT = "General Knowledge";

export function getSubjectBySlug(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function getSubjectByName(name: string): Subject | undefined {
  const n = name.trim().toLowerCase();
  return SUBJECTS.find((s) => s.name.toLowerCase() === n);
}

export const SearchIcon = Search;
