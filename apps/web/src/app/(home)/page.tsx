import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white text-slate-950 dark:bg-[#080B14] dark:text-white">
      <Header />
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15" />

        <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Sparkles className="size-4 text-violet-500 dark:text-violet-400" />

            <span>Build smarter. Work together.</span>
          </div>

          {/* Heading */}
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            Your company&apos;s{" "}
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-blue-400">
              knowledge
            </span>
            , connected.
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
            Bring your documents, knowledge, conversations, and workflows
            together in one intelligent workspace built for modern teams.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 w-full bg-violet-600 px-6 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 sm:w-auto"
            >
              <Link href="/sign-up">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 w-full border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/5 sm:w-auto"
            >
              <Link href="#how-it-works">
                <Play className="size-4 fill-current" />
                See how it works
              </Link>
            </Button>
          </div>
        </div>

        {/* Product Preview */}
        <div className="mx-auto mt-16 max-w-6xl lg:mt-20">
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-violet-500/10 blur-2xl dark:from-violet-500/20 dark:via-blue-500/10 dark:to-violet-500/20" />

            {/* Browser frame */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl shadow-slate-300/30 dark:border-white/10 dark:bg-[#0D111C] dark:shadow-black/40">
              {/* Browser top bar */}
              <div className="flex h-11 items-center border-b border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-[#101521]">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>

                <div className="mx-auto hidden h-6 w-1/3 rounded-md bg-slate-100 dark:bg-white/5 sm:block" />
              </div>

              {/* Dashboard */}
              <div className="grid min-h-[420px] grid-cols-[180px_1fr]">
                {/* Sidebar */}
                <aside className="hidden border-r border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0A0E18] sm:block">
                  <div className="mb-8 flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-violet-600 dark:bg-violet-500" />

                    <span className="text-sm font-semibold">
                      NexusCore
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      "Dashboard",
                      "Documents",
                      "Knowledge",
                      "Chat",
                      "Notifications",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-lg px-3 py-2 text-xs ${
                          index === 0
                            ? "bg-violet-50 font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                            : "text-slate-500 dark:text-slate-500"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                {/* Main content */}
                <div className="p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-32 rounded bg-slate-300 dark:bg-white/10" />
                      <div className="mt-2 h-3 w-48 rounded bg-slate-200 dark:bg-white/5" />
                    </div>

                    <div className="size-8 rounded-full bg-slate-200 dark:bg-white/10" />
                  </div>

                  {/* Stats */}
                  <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      "Documents",
                      "Knowledge",
                      "Conversations",
                      "Team members",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#101521]"
                      >
                        <div className="h-2.5 w-16 rounded bg-slate-200 dark:bg-white/5" />
                        <div className="mt-3 h-5 w-10 rounded bg-slate-300 dark:bg-white/10" />
                        <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-600">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* AI panel */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#101521]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-violet-500 dark:text-violet-400" />

                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Ask your knowledge
                      </span>
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-[#0A0E18] dark:text-slate-500">
                      What is our company&apos;s refund policy?
                    </div>

                    <div className="mt-4 flex gap-3">
                      <div className="mt-1 size-6 shrink-0 rounded-full bg-violet-100 dark:bg-violet-500/10" />

                      <div className="space-y-2">
                        <div className="h-2.5 w-40 rounded bg-slate-200 dark:bg-white/10" />
                        <div className="h-2.5 w-64 max-w-full rounded bg-slate-200 dark:bg-white/10" />
                        <div className="h-2.5 w-48 rounded bg-slate-200 dark:bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}