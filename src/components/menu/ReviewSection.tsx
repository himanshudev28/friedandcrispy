import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StarRating from "./StarRating";
import { toast } from "sonner";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

interface ReviewSectionProps {
  menuItemId: string;
  itemName: string;
}

const ReviewSection = ({ menuItemId, itemName }: ReviewSectionProps) => {
  const [open, setOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", menuItemId],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("menu_item_id", menuItemId)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        menu_item_id: menuItemId,
        name: name.trim() || "Anonymous",
        rating,
        comment: comment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", menuItemId] });
      toast.success("Review added!");
      setName("");
      setRating(0);
      setComment("");
      setOpen(false);
    },
    onError: () => toast.error("Failed to add review"),
  });

  const handleSubmit = () => {
    if (rating === 0) return toast.error("Please select a rating");
    if (!comment.trim()) return toast.error("Please add a comment");
    mutation.mutate();
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <StarRating rating={Math.round(avgRating)} />
        <span className="text-xs text-muted-foreground font-body">
          {avgRating.toFixed(1)} ({reviews.length})
        </span>
      </div>

      <div className="flex gap-2 mt-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs rounded-full font-body">
              ⭐ Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Review {itemName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-body text-muted-foreground">Name (optional)</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="font-body" />
              </div>
              <div>
                <label className="text-sm font-body text-muted-foreground">Rating *</label>
                <StarRating rating={rating} onRate={setRating} size="md" />
              </div>
              <div>
                <label className="text-sm font-body text-muted-foreground">Comment *</label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." className="font-body" />
              </div>
              <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full font-body">
                {mutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {reviews.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs rounded-full font-body" onClick={() => setShowReviews(!showReviews)}>
            <MessageSquare className="h-3 w-3 mr-1" />
            {showReviews ? "Hide" : "View"} Reviews
          </Button>
        )}
      </div>

      {showReviews && reviews.length > 0 && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className="bg-muted/50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold font-body">{review.name}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(review.created_at), "dd MMM yyyy")}</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="text-muted-foreground mt-1 font-body">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
