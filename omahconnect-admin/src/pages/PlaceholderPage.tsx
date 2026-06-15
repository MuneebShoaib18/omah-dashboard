interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{description}</p>
      <p className="mt-6 text-sm text-slate-400">
        This module is ready to be connected to your backend API.
      </p>
    </div>
  );
}
