import { Skeleton } from "@/components/ui/skeleton"

export default function BlogDetailLoading() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Skeleton className="h-8 w-40 mb-6" />
      
      <div className="mb-8">
        <Skeleton className="h-12 w-full max-w-[80%] mb-6" />
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Featured image skeleton */}
      <Skeleton className="w-full h-[400px] mb-10 rounded-xl" />

      {/* Blog content skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-[80%]" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-[90%]" />
        <Skeleton className="h-6 w-[85%]" />
      </div>

      {/* Related posts skeleton */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <Skeleton className="h-40 w-full mb-4 rounded" />
            <Skeleton className="h-6 w-[70%] mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <Skeleton className="h-40 w-full mb-4 rounded" />
            <Skeleton className="h-6 w-[70%] mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      </div>
    </div>
  )
}
