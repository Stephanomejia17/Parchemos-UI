"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-64 items-center justify-center p-6 text-center">
      <div className="rounded-3xl border border-border bg-surface p-8">
        <p className="font-semibold text-foreground">No pudimos cargar el menú.</p>
        <button type="button" onClick={reset} className="mt-4 min-h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground transition duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary">Reintentar</button>
      </div>
    </div>
  );
}
