export interface Comment {
  id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  email: string;
  body: string;
  approved: boolean;
  createdAt: Date | null;
}

export interface CommentInput {
  articleId: string;
  articleTitle: string;
  authorName: string;
  email: string;
  body: string;
}

export function formatCommentDate(date: Date | null): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
