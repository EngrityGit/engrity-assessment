import type { JobRole } from "@/generated/prisma/client";

export interface QuizQ {
  q: string;
  options: string[];
  correct: number;
  why: string;
}

export interface LessonSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Lesson {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  diagram?: "pid-symbols" | "iso-example" | "line-number" | "wps-flow";
  sections: LessonSection[];
  tips: string[];
  terms: { term: string; def: string }[];
  quiz: QuizQ[];
}

export interface LearningModule {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  roles: JobRole[]; // roles this module is most relevant to (shown first)
  lessons: Lesson[];
}
