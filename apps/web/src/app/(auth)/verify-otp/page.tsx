"use client";

import Link from "next/link";
import { ArrowLeft, MailCheck, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);

    setOtp(numericValue);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO:
    // Connect with Auth Service through Gateway.
    console.log("OTP:", otp);
  };

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
            Enter the 6-digit verification code we sent to your email address.
          </p>

          {/* Email */}
          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-200">
            daniyal@example.com
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7">
            <Input
              value={otp}
              onChange={(event) => handleOtpChange(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Enter 6-digit code"
              aria-label="Verification code"
              className="h-12 text-center text-lg font-semibold tracking-[0.5em]"
            />

            <Button
              type="submit"
              disabled={otp.length !== 6}
              className="mt-4 h-11 w-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
            >
              Verify email
            </Button>
          </form>

          {/* Resend */}
          <div className="mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Didn&apos;t receive the code?
            </p>

            <Button
              type="button"
              variant="ghost"
              className="mt-1 text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-500/10"
            >
              <RefreshCw className="size-4" />
              Resend code
            </Button>
          </div>

          {/* Change email */}
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
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
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    </main>
  );
}