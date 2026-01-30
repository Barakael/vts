type Props = {
  message?: string;
};

export default function FullscreenLoader({ message = 'Loading...' }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950/90 text-white">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
        <p className="text-sm uppercase tracking-[0.3em] text-white/70">{message}</p>
      </div>
    </div>
  );
}
