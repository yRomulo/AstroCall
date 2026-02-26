
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, User, LogOut } from "lucide-react";
import { useAuth, useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "user_profiles", user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc(userDocRef);
  const role = userData?.role;

  const handleSignOut = () => auth && signOut(auth);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <span className="font-headline text-xl font-bold tracking-tight text-primary">
            AstroCall
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Directory
          </Link>
          {role === 'astrologer' && (
            <Link href="/dashboard/astrologer" className="text-sm font-medium hover:text-primary">
              Control Panel
            </Link>
          )}
          {role === 'user' && (
            <Link href="/dashboard/user" className="text-sm font-medium hover:text-primary">
              My Dashboard
            </Link>
          )}
          {(role === 'admin' || role === 'astrologer') && (
            <Link href="/admin" className="text-sm font-medium hover:text-primary">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-primary/20">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">{user.email}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="rounded-full px-6">
                Join Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
