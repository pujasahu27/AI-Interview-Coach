export type ExperienceBucket = "fresher" | "0-1" | "1-3" | "3-5" | "5-8" | "8+";
export type InterviewFocus =
  | "technical"
  | "behavioral"
  | "mixed"
  | "system_design"
  | "coding"
  | "hr_round";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export const EXPERIENCE_BUCKETS: { value: ExperienceBucket; label: string; years: number }[] = [
  { value: "fresher", label: "Fresher", years: 0 },
  { value: "0-1", label: "0–1 years", years: 1 },
  { value: "1-3", label: "1–3 years", years: 2 },
  { value: "3-5", label: "3–5 years", years: 4 },
  { value: "5-8", label: "5–8 years", years: 6 },
  { value: "8+", label: "8+ years", years: 10 },
];

export const INTERVIEW_FOCUS_OPTIONS: { value: InterviewFocus; label: string }[] = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioural" },
  { value: "mixed", label: "Mixed" },
  { value: "system_design", label: "System Design" },
  { value: "coding", label: "Coding" },
  { value: "hr_round", label: "HR Round" },
];

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export const ROLE_EXAMPLES = [
  ".NET Backend Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "React Developer",
  "Java Developer",
  "Python Developer",
  "DevOps Engineer",
  "Data Analyst",
  "AI Engineer",
  "Product Manager",
];

export const COMPANY_EXAMPLES = [
  "Microsoft",
  "Amazon",
  "Google",
  "Meta",
  "Netflix",
  "Apple",
  "Oracle",
  "Accenture",
  "TCS",
  "Infosys",
  "Coforge",
];

export function bucketToYears(bucket: ExperienceBucket): number {
  return EXPERIENCE_BUCKETS.find((b) => b.value === bucket)?.years ?? 0;
}

export function nearestExperienceBucket(years: number): ExperienceBucket {
  if (years <= 0) return "fresher";
  if (years <= 1) return "0-1";
  if (years <= 3) return "1-3";
  if (years <= 5) return "3-5";
  if (years <= 8) return "5-8";
  return "8+";
}

export function isExperienceBucket(value: unknown): value is ExperienceBucket {
  return typeof value === "string" && EXPERIENCE_BUCKETS.some((b) => b.value === value);
}

export function isInterviewFocus(value: unknown): value is InterviewFocus {
  return typeof value === "string" && INTERVIEW_FOCUS_OPTIONS.some((o) => o.value === value);
}

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && DIFFICULTY_OPTIONS.some((o) => o.value === value);
}
