
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc, updateDoc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, UserPlus } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminPage() {
  const db = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "user_profiles"));
  }, [db]);

  const { data: users, isLoading: loading } = useCollection(usersQuery);

  const promoteToAstrologer = async (user: any) => {
    const userRef = doc(db, "user_profiles", user.id);
    const astroRef = doc(db, "astrologer_profiles", user.id);

    updateDoc(userRef, { role: "astrologer" }).catch(async () => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: userRef.path,
        operation: "update",
        requestResourceData: { role: "astrologer" }
      }));
    });

    const astroData = {
      id: user.id,
      name: user.email.split('@')[0],
      bio: "Promoted expert",
      languages: ["English"],
      isOnline: false,
      photoUrl: "https://picsum.photos/seed/astro/400/400",
    };

    setDoc(astroRef, astroData).catch(async () => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: astroRef.path,
        operation: "create",
        requestResourceData: astroData
      }));
    });

    toast({ title: "User Promoted", description: `${user.email} is now an astrologer.` });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-3xl font-bold">Admin Management</h1>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Platform Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">Loading user data...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="text-right">
                        {user.role === "user" && (
                          <Button size="sm" onClick={() => promoteToAstrologer(user)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Promote
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
