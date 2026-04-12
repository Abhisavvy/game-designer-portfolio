export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="mx-auto max-w-3xl animate-pulse px-6 py-16">
        {/* Hero skeleton */}
        <div className="h-48 md:h-64 rounded-xl bg-zinc-800/80 mb-8" />
        
        {/* Title and metadata skeleton */}
        <div className="mb-8">
          <div className="h-8 w-2/3 rounded bg-zinc-800 mb-4" />
          <div className="flex gap-4 mb-4">
            <div className="h-6 w-24 rounded-full bg-zinc-800/60" />
            <div className="h-6 w-20 rounded-full bg-zinc-800/60" />
            <div className="h-6 w-28 rounded-full bg-zinc-800/60" />
          </div>
        </div>
        
        {/* Content blocks skeleton */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-6 w-32 rounded bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-800/60" />
            <div className="h-4 w-5/6 rounded bg-zinc-800/60" />
            <div className="h-4 w-4/5 rounded bg-zinc-800/60" />
          </div>
          
          <div className="space-y-4">
            <div className="h-6 w-40 rounded bg-zinc-800" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 rounded bg-zinc-800/60" />
              <div className="h-32 rounded bg-zinc-800/60" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="h-6 w-36 rounded bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-800/60" />
            <div className="h-4 w-3/4 rounded bg-zinc-800/60" />
          </div>
        </div>
      </div>
    </div>
  );
}