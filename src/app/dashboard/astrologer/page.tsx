
"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, collection, query, where } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AstrologerDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const [isOnline, setIsOnline] = useState(false);

  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "sessions"), where("astrologerId", "==", user.uid));
  }, [db, user]);

  const { data: calls, isLoading: loading } = useCollection(sessionsQuery);

  const toggleOnline = async (checked: boolean) => {
    if (!user || !db) return;
    setIsOnline(checked);
    const astroRef = doc(db, "astrologer_profiles", user.uid);
    updateDoc(astroRef, { isOnline: checked }).catch(async () => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: astroRef.path,
        operation: "update",
        requestResourceData: { isOnline: checked }
      }));
    });
  };

  const totalEarnings = (calls?.length || 0) * 15.5;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary">Control Panel</h1>
            <p className="text-muted-foreground">Manage your availability and track your sessions.</p>
          </div>
          <Card className="glass-card px-6 py-4 flex items-center gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="online-status">Availability</Label>
              <div className="text-sm text-muted-foreground">
                {isOnline ? "You are visible to users" : "You are currently hidden"}
              </div>
            </div>
            <Switch
              id="online-status"
              checked={isOnline}
              onCheckedChange={toggleOnline}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Video className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calls?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9</div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-32 flex items-center justify-center">Loading sessions...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls?.map((call: any) => (
                    <TableRow key={call.id}>
                      <TableCell>{call.startedAt ? format(call.startedAt.toDate(), "MMM dd, HH:mm") : "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{call.userId?.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Badge variant={call.status === "ended" ? "secondary" : "default"}>
                          {call.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {call.endedAt ? "15 mins" : "-"}
                      </TableCell>
                      <TableCell className="text-right">{call.rating || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {(!calls || calls.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No sessions recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
