
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Star, Video, History } from "lucide-react";

export default function UserDashboard() {
  const db = useFirestore();
  const { user } = useUser();

  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "sessions"), where("userId", "==", user.uid));
  }, [db, user]);

  const { data: sessions, isLoading } = useCollection(sessionsQuery);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-headline text-3xl font-bold mb-8">My Journey</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Mapping your constellation...</div>
              ) : (
                <div className="space-y-4">
                  {sessions?.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-2 rounded-full">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Call with Astrologer</p>
                          <p className="text-xs text-muted-foreground">
                            {s.startedAt ? format(s.startedAt.toDate(), "MMMM dd, yyyy 'at' hh:mm a") : "Unknown Date"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {s.rating && (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-bold">{s.rating}</span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">{s.status}</span>
                      </div>
                    </div>
                  ))}
                  {(!sessions || sessions.length === 0) && (
                    <div className="py-12 text-center text-muted-foreground">
                      No past sessions found. Start your first consultation today!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Sessions</span>
                  <span className="font-bold">{sessions?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Minutes Consulted</span>
                  <span className="font-bold">{(sessions?.length || 0) * 15} mins</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
