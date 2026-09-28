"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-white text-slate-950 transition-colors dark:bg-[#080B14] dark:text-white">
      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white"
            >
              Nexus<span className="text-violet-600 dark:text-violet-400">Core</span>
            </Link>

            <h1 className="mt-8 text-3xl font-bold tracking-tight">
              Login to your account
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Welcome back to NexusCore and get started.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-white/10 dark:bg-[#0D111C] dark:shadow-black/20 sm:p-8">
            <form className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-11 border-slate-200 bg-slate-50 pl-10 text-slate-950 placeholder:text-slate-400 focus-visible:ring-violet-500 dark:border-white/10 dark:bg-[#090C14] dark:text-white dark:placeholder:text-slate-600 dark:focus-visible:ring-violet-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="h-11 border-slate-200 bg-slate-50 pl-10 pr-10 text-slate-950 placeholder:text-slate-400 focus-visible:ring-violet-500 dark:border-white/10 dark:bg-[#090C14] dark:text-white dark:placeholder:text-slate-600 dark:focus-visible:ring-violet-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="h-11 w-full bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
              >
                Login
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />

              <span className="text-xs text-slate-400 dark:text-slate-500">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/5"
            >
              Continue with Google
            </Button>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {"Don't have an account?"}{" "}
              <Link
                href="/sign-up"
                className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}