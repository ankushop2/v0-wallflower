// Similarity detection utilities

import type { Grievance } from "./types"

// Simple text similarity using word overlap (in production, use embeddings)
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(
    text1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3),
  )
  const words2 = new Set(
    text2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3),
  )

  const intersection = new Set([...words1].filter((w) => words2.has(w)))
  const union = new Set([...words1, ...words2])

  return union.size > 0 ? intersection.size / union.size : 0
}

export function findSimilarPosts(
  title: string,
  body: string,
  existingPosts: Grievance[],
  threshold = 0.3,
): Array<{ post: Grievance; similarity: number }> {
  const searchText = `${title} ${body}`

  const results = existingPosts
    .map((post) => {
      const postText = `${post.title} ${post.body}`
      const similarity = calculateSimilarity(searchText, postText)
      return { post, similarity }
    })
    .filter(({ similarity }) => similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3) // Show top 3 matches

  return results
}
