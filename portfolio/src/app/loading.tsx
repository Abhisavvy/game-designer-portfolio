export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
      <div className="mx-auto max-w-3xl animate-pulse px-6 py-16">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 rounded-full bg-zinc-800/80 mx-auto mb-6" />
          <div className="h-8 w-64 rounded bg-zinc-800 mx-auto mb-4" />
          <div className="h-4 w-96 rounded bg-zinc-800/60 mx-auto" />
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-48 rounded bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-800/60" />
          <div className="h-4 w-5/6 rounded bg-zinc-800/60" />
          <div className="h-4 w-4/5 rounded bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}