import type { JobRole } from "@/generated/prisma/client";
import type { LearningModule, Lesson } from "./types";
import { PID_MODULE, ISO_MODULE } from "./content-drawings";
import { MTR_MODULE, WPS_MODULE, NDT_MODULE, SAFETY_MODULE } from "./content-quality";

export type { LearningModule, Lesson, QuizQ } from "./types";

export const MODULES: LearningModule[] = [PID_MODULE, ISO_MODULE, MTR_MODULE, WPS_MODULE, NDT_MODULE, SAFETY_MODULE];

export const ALL_LESSONS: (Lesson & { moduleSlug: string })[] = MODULES.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, moduleSlug: m.slug }))
);

export function getModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const m = getModule(moduleSlug);
  const l = m?.lessons.find((x) => x.slug === lessonSlug);
  return m && l ? { module: m, lesson: l } : null;
}

export function modulesForRole(role: JobRole | null | undefined) {
  if (!role) return MODULES;
  const mine = MODULES.filter((m) => m.roles.includes(role));
  const rest = MODULES.filter((m) => !m.roles.includes(role));
  return [...mine, ...rest];
}

export function nextLesson(moduleSlug: string, lessonSlug: string) {
  const idx = ALL_LESSONS.findIndex((l) => l.moduleSlug === moduleSlug && l.slug === lessonSlug);
  const n = ALL_LESSONS[idx + 1];
  return n ? { moduleSlug: n.moduleSlug, lessonSlug: n.slug, title: n.title } : null;
}
