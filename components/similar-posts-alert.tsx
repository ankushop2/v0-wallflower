"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircleIcon, MergeIcon, ExternalLinkIcon } from "lucide-react"
import type { Grievance } from "@/lib/types"
import Link from "next/link"

interface SimilarPostsAlertProps {
  similarPosts: Array<{ post: Grievance; similarity: number }>
  onMerge: (postId: string) => void
  onDismiss: () => void
}

export function SimilarPostsAlert({ similarPosts, onMerge, onDismiss }: SimilarPostsAlertProps) {
  if (similarPosts.length === 0) return null

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <AlertCircleIcon className="h-4 w-4 text-amber-500" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">
              We found {similarPosts.length} similar {similarPosts.length === 1 ? "issue" : "issues"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Consider merging your concern with an existing post to strengthen its visibility
            </p>
          </div>

          <div className="space-y-2">
            {similarPosts.map(({ post, similarity }) => (
              <Card key={post.id} className="p-3 bg-background">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/thread/${post.id}`}
                        className="text-sm font-medium hover:underline line-clamp-1"
                        target="_blank"
                      >
                        {post.title}
                      </Link>
                      <ExternalLinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <span>•</span>
                      <span>{post.up} upvotes</span>
                      <span>•</span>
                      <span>{Math.round(similarity * 100)}% match</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onMerge(post.id)} className="shrink-0">
                    <MergeIcon className="mr-1.5 h-3.5 w-3.5" />
                    Merge
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Continue with new post
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
