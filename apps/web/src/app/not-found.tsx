import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>

      <p className="mt-4 text-slate-500">
        {"The page you're looking for doesn't exist."}
      </p>

      <Link
        href="/"
        className="mt-6 text-violet-600 hover:underline"
      >
        Go back home
      </Link>
    </div>
  );
}