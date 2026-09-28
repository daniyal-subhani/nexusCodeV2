'use client';

import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO:
    // Validate reset token and update password
    // through Gateway → Auth Service.
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-slate-950 dark:bg-[#080B14] dark:text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block text-xl font-bold tracking-tight">
            Nexus
            <span className="text-violet-600 dark:text-violet-400">Core</span>
          </Link>
        </div>

        {/* Card */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#0D111C]">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-500/10">
              <LockKeyhole className="size-7 text-violet-600 dark:text-violet-400" />
            </div>
          </div>

          {/* Heading */}
          <div className="mt-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Create a new password for your NexusCore account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* New password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                New password
              </label>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  className="h-11 pr-11"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Confirm password
              </label>

              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  className="h-11 pr-11"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Your password should contain:
              </p>

              <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-500">
                <li>• At least 8 characters</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one number</li>
                <li>• At least one special character</li>
              </ul>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="h-11 w-full bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
            >
              Reset password
            </Button>
          </form>

          {/* Sign in */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
            Remember your password?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Security note */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          Your password is securely encrypted and never stored in plain text.
        </p>
      </div>
    </main>
  );
}
