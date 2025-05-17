import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function BlogNotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold text-green-900 mb-4">Blog Not Found</h1>      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Sorry, the blog post you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button asChild>
        <Link href="/blogs" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blogs</span>
        </Link>
      </Button>
    </div>
  )
}
