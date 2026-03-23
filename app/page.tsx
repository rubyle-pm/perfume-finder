import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#eef2f7] px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
          Component Demo
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium leading-tight text-slate-900">
          Scent Statement Finder
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Discover your signature scent through our personalized quiz experience.
        </p>
        <Link
          href="/quiz-demo"
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-900 px-8 text-sm font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-slate-800"
        >
          View Quiz Component Demo
        </Link>
      </div>
    </main>
  );
}
