import Link from "next/link";
import { MailCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-slate-950 dark:bg-[#080B14] dark:text-white">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Link
          href="/"
          className="inline-block text-xl font-bold tracking-tight"
        >
          Nexus
          <span className="text-violet-600 dark:text-violet-400">Core</span>
        </Link>

        {/* Card */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#0D111C]">
          {/* Icon */}
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-500/10">
            <MailCheck className="size-8 text-violet-600 dark:text-violet-400" />
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>

          {/* Description */}
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            We&apos;ve sent a verification link to your email address. Please
            check your inbox and click the link to verify your account.
          </p>

          {/* Email */}
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            daniyal@example.com
          </div>

          {/* Resend */}
          <Button
            variant="outline"
            className="mt-6 w-full border-slate-200 bg-white dark:border-white/10 dark:bg-transparent"
          >
            <RefreshCw className="size-4" />
            Resend verification email
          </Button>

          {/* Change email */}
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-500">
            Wrong email?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              Create another account
            </Link>
          </p>
        </div>

        {/* Back */}
        <Link
          href="/sign-in"
          className="mt-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          ← Back to sign in
        </Link>
      </div>
    </main>
  );
}