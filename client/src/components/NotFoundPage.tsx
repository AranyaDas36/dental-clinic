import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="container-page flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-sm tracking-[0.2em] uppercase text-[var(--color-muted-text)]">404</p>
      <h1 className="text-4xl">Page not found</h1>
      <p className="max-w-md text-[var(--color-muted-text)]">
        The page you requested does not exist on this clinic website.
      </p>
      <Link
        to="/"
        className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 py-2.5 text-white"
      >
        Back to home
      </Link>
    </main>
  );
}
