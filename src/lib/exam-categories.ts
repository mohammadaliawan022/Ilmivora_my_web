export interface ExamCategory {
  code: string;
  name: string;
  description: string;
}

export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    code: "PPSC",
    name: "Punjab Public Service Commission",
    description: "Lecturer, Tehsildar, Naib Tehsildar, Inspector and other provincial posts.",
  },
  {
    code: "FPSC",
    name: "Federal Public Service Commission",
    description: "CSS, federal ministries, Assistant Director and BPS-16 to 19 posts.",
  },
  {
    code: "NTS",
    name: "National Testing Service",
    description: "Educator, GAT, NAT and recruitment tests across Pakistan.",
  },
  {
    code: "Other",
    name: "Other Competitive Exams",
    description: "KPPSC, SPSC, BPSC, ETEA, PTS, OTS and departmental tests.",
  },
];
