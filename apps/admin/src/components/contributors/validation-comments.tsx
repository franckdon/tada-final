import { Badge } from "@tada/ui/components/badge";
import { Card, CardContent } from "@tada/ui/components/card";
import { Check, X, MessageSquare, Calendar } from "lucide-react";

interface ValidationComment {
  id: string;
  comment: string;
  action: "approved" | "rejected" | "pending";
  createdAt: Date;
  validator: {
    id: string;
    name: string;
  };
}

interface ValidationCommentsProps {
  comments: ValidationComment[];
}

export function ValidationComments({ comments }: ValidationCommentsProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <Check className="h-3 w-3 text-green-600" />;
      case "rejected":
        return <X className="h-3 w-3 text-red-600" />;
      default:
        return <MessageSquare className="h-3 w-3 text-blue-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "approved":
        return (
          <Badge
            variant="success"
            className="bg-green-100 text-green-80 font-light"
          >
            Approuvé
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  return (
    <div>
      <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Historique de validation ({comments.length})
      </h5>
      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id} className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getActionIcon(comment.action)}
                  <span className="font-medium text-sm">
                    {comment.validator.name}
                  </span>
                  {getActionBadge(comment.action)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(comment.createdAt).toLocaleString("fr-FR")}
                </div>
              </div>
              {comment.comment && (
                <div className="text-sm text-muted-foreground bg-background rounded p-2 border">
                  {comment.comment}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
