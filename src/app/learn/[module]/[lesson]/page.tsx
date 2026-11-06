import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import LessonDiagram from "@/components/learning/LessonDiagram";
import LessonQuiz from "@/components/learning/LessonQuiz";
import { getLesson, nextLesson } from "@/lib/learning";

export default async function LessonPage({ params }: { params: Promise<{ module: string; lesson: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { module: mSlug, lesson: lSlug } = await params;
  const found = getLesson(mSlug, lSlug);
  if (!found) notFound();
  const { module: m, lesson } = found;
  const n = nextLesson(mSlug, lSlug);

  return (
    <AppShell width="max-w-3xl">
      <Link href="/learn" className="text-sm font-semibold text-brand hover:underline">← Learning hub</Link>
      <div className="mb-6 mt-2 anim-fade-up">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">{m.icon} {m.title} · {lesson.minutes} min</p>
        <h1 className="text-3xl font-extrabold tracking-tight">{lesson.title}</h1>
        <p className="mt-1 text-ink/70">{lesson.summary}</p>
      </div>

      {lesson.diagram && <LessonDiagram kind={lesson.diagram} />}

      <div className="space-y-5">
        {lesson.sections.map((s) => (
          <section key={s.heading} className="card prose-lesson p-6 anim-fade-up">
            <h2 className="mb-3 text-lg font-extrabold">{s.heading}</h2>
            {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
          </section>
        ))}

        <section className="card-accent p-6">
          <h2 className="mb-3 text-lg font-extrabold">💡 Pro tips</h2>
          <ul className="space-y-2 text-sm">{lesson.tips.map((t) => <li key={t} className="rounded-[15px] bg-white px-4 py-2.5">{t}</li>)}</ul>
        </section>

        <section className="card p-6">
          <h2 className="mb-3 text-lg font-extrabold">Key terms</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {lesson.terms.map((t) => (
              <div key={t.term} className="card-soft p-3">
                <dt className="text-sm font-extrabold text-brand">{t.term}</dt>
                <dd className="text-sm text-ink/80">{t.def}</dd>
              </div>
            ))}
          </dl>
        </section>

        {session.user.role === "CANDIDATE" ? (
          <LessonQuiz lessonSlug={lesson.slug} questions={lesson.quiz} next={n ? { href: `/learn/${n.moduleSlug}/${n.lessonSlug}`, title: n.title } : null} />
        ) : (
          <p className="alert alert-info">Quizzes are for candidate accounts.</p>
        )}
        <p className="text-center text-xs text-ink/60">Stuck on something? Tap the ✨ button for the AI Coach — it explains concepts but never answers live test questions.</p>
      </div>
    </AppShell>
  );
}
