
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function RatingModal({ sessionId }: { sessionId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!db || !user || isSubmitting) return;

    setIsSubmitting(true);

    const reviewRef = doc(collection(db, "reviews"));

    const reviewData = {
      id: reviewRef.id,
      sessionId,
      astrologerId: sessionId,
      userId: user.uid,
      rating,
      comment,
      createdAt: serverTimestamp(),
    };

    const sessionRef = doc(db, "sessions", sessionId);

    try {
      await setDoc(reviewRef, reviewData);

      await updateDoc(sessionRef, {
        rating,
        comment,
      }).catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: sessionRef.path,
          operation: "update",
          requestResourceData: { rating, comment }
        }));
      });

      setSubmitted(true);
      toast({ title: "Review Submitted", description: "Your feedback helps the community!" });
    } catch {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: reviewRef.path,
        operation: "create",
        requestResourceData: reviewData
      }));
      toast({
        title: "Não foi possível enviar a avaliação",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
        Thank you for your rating!
      </div>
    );
  }

  return (
    <Card className="glass-card w-full">
      <CardHeader>
        <CardTitle className="text-xl">How was your session?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`p-1 transition-colors ${rating >= star ? 'text-amber-400' : 'text-muted'}`}
            >
              <Star className={`h-8 w-8 ${rating >= star ? 'fill-current' : ''}`} />
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="comment">Leave a comment</Label>
          <Textarea
            id="comment"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  );
}
