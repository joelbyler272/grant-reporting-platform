"use client"

import { useState } from "react"
import { AlertTriangle, MessageSquare, RefreshCw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Comment } from "@/types"

interface SectionEditorProps {
  sectionId: string
  sectionName: string
  content: string
  wordLimit: number | null
  isComplete: boolean
  missingData?: string
  comments: Comment[]
  onContentChange: (sectionId: string, content: string) => void
  onAddComment: (sectionId: string, body: string) => void
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function getWordCountColor(count: number, limit: number | null): string {
  if (!limit) return "text-muted-foreground"
  const ratio = count / limit
  if (ratio > 1) return "text-red-600 dark:text-red-400"
  if (ratio >= 0.9) return "text-amber-600 dark:text-amber-400"
  return "text-green-600 dark:text-green-400"
}

function formatCommentDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function SectionEditor({
  sectionId,
  sectionName,
  content,
  wordLimit,
  isComplete,
  missingData,
  comments,
  onContentChange,
  onAddComment,
}: SectionEditorProps) {
  const [commentText, setCommentText] = useState("")
  const [showComments, setShowComments] = useState(false)
  const wordCount = countWords(content)

  function handleAddComment() {
    if (!commentText.trim()) return
    onAddComment(sectionId, commentText.trim())
    setCommentText("")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{sectionName}</h3>
        <Button variant="ghost" size="xs" disabled>
          <RefreshCw className="size-3" />
          Regenerate Section
        </Button>
      </div>

      {/* Gap flag */}
      {!isComplete && missingData && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{missingData}</span>
        </div>
      )}

      {/* Content textarea */}
      <Textarea
        value={content}
        onChange={(e) => onContentChange(sectionId, e.target.value)}
        className="min-h-32 resize-y"
      />

      {/* Word count */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-mono ${getWordCountColor(wordCount, wordLimit)}`}>
          {wordCount} {wordLimit ? `/ ${wordLimit}` : ""} words
        </span>
        <button
          type="button"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare className="size-3" />
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </button>
      </div>

      {/* Comment thread */}
      {showComments && (
        <div className="space-y-3 rounded-lg border p-3">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No comments on this section yet.
            </p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {comment.user?.full_name ?? "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatCommentDate(comment.created_at)}
                </span>
              </div>
              <p className="text-muted-foreground">{comment.body}</p>
            </div>
          ))}

          <div className="flex gap-2 border-t pt-3">
            <Textarea
              placeholder="Add a comment..."
              className="min-h-8"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
