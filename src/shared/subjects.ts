import {
  Atom,
  BadgeCheck,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  Calculator,
  Camera,
  Code2,
  Cpu,
  Dumbbell,
  FileText,
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
  MessageSquare,
  Microscope,
  Moon,
  Newspaper,
  PawPrint,
  PenTool,
  PieChart,
  Pill,
  Puzzle,
  Receipt,
  Scale,
  ScrollText,
  Settings2,
  ShieldCheck,
  Sigma,
  Sprout,
  TreePine,
  Users,
  Vote,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { DOMAINS, TOP_LEVEL_CATEGORIES, getChildren, getDescendants } from "./categories";

/** Field of study (the "domain" column of the owner's catalogue). */
export type SubjectGroup = string;

export interface Subject {
  name: string;
  slug: string;
  icon: LucideIcon;
  group: SubjectGroup;
  /** Direct sub-sections. */
  sectionCount: number;
  /** All nested sections at any depth. */
  totalSections: number;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ICONS: Record<string, LucideIcon> = {
  "general-knowledge": Globe2,
  "pakistan-studies": Landmark,
  "pakistan-affairs": ScrollText,
  "current-affairs": Newspaper,
  "islamic-studies": Moon,
  "computer-science": Cpu,
  "everyday-science": Microscope,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Leaf,
  mathematics: Sigma,
  statistics: PieChart,
  english: Languages,
  urdu: PenTool,
  "english-literature": BookOpen,
  psychology: Brain,
  sociology: Users,
  economics: LineChart,
  "political-science": Building2,
  "international-relations": Globe2,
  "judiciary-and-law": Gavel,
  pedagogy: GraduationCap,
  agriculture: Sprout,
  forestry: TreePine,
  "physical-education": Dumbbell,
  finance: Wallet,
  hrm: Briefcase,
  marketing: Megaphone,
  accounting: Calculator,
  auditing: Receipt,
  "electrical-engineering": Zap,
  "civil-engineering": HardHat,
  "mechanical-engineering": Settings2,
  "chemical-engineering": Scale,
  "software-engineering": Code2,
  medical: HeartPulse,
  "asf-act-1975-mcqs": ShieldCheck,
  "botany-mcqs": Leaf,
  "business-communication-mcqs": MessageSquare,
  "business-maths-mcqs": Calculator,
  "computer-science-theory": Cpu,
  "election-officer-mcqs": Vote,
  "intelligence-test-mcqs": Puzzle,
  "management-mcqs": Briefcase,
  "pakistan-current-affairs-mcqs": Newspaper,
  "past-papers": FileText,
  "pharmaceutical-chemistry-mcqs": Pill,
  philosophy: Brain,
  "photography-mcqs": Camera,
  "reasoning-mcqs": Puzzle,
  "senior-auditor-mcqs": BadgeCheck,
  "world-current-affairs-mcqs": Globe2,
  "zoology-mcqs": PawPrint,
};

export const SUBJECTS: Subject[] = TOP_LEVEL_CATEGORIES.map((c) => ({
  name: c.name,
  slug: c.slug,
  icon: ICONS[c.slug] ?? BookOpen,
  group: c.domain,
  sectionCount: getChildren(c.name).length,
  totalSections: getDescendants(c.name).length,
}));

export const SUBJECT_GROUPS: SubjectGroup[] = DOMAINS;

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
export const GK_DOMAIN = "General Knowledge & Current Affairs";

export function getSubjectBySlug(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function getSubjectByName(name: string): Subject | undefined {
  const n = name.trim().toLowerCase();
  return SUBJECTS.find((s) => s.name.toLowerCase() === n);
}
