export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="mx-auto max-w-4xl animate-pulse px-6 py-16">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-zinc-800/80 mx-auto mb-4" />
          <div className="h-8 w-48 rounded bg-zinc-800 mx-auto mb-2" />
          <div className="h-4 w-32 rounded bg-zinc-800/60 mx-auto" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex justify-center gap-4 mb-12">
          <div className="h-10 w-32 rounded-lg bg-zinc-800/60" />
          <div className="h-10 w-28 rounded-lg bg-zinc-800/60" />
        </div>
        
        {/* Resume sections skeleton */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-32 rounded bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-800/60" />
              <div className="h-4 w-5/6 rounded bg-zinc-800/60" />
            </div>
            
            <div className="space-y-3">
              <div className="h-6 w-28 rounded bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-zinc-800/60" />
                <div className="h-4 w-4/5 rounded bg-zinc-800/60" />
                <div className="h-4 w-3/4 rounded bg-zinc-800/60" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-24 rounded bg-zinc-800" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-zinc-800/60" />
                <div className="h-8 rounded bg-zinc-800/60" />
                <div className="h-8 rounded bg-zinc-800/60" />
                <div className="h-8 rounded bg-zinc-800/60" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-6 w-36 rounded bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-800/60" />
              <div className="h-4 w-2/3 rounded bg-zinc-800/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}