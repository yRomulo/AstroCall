
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Globe, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Astrologer {
  id: string;
  name: string;
  photoUrl: string;
  bio: string;
  languages: string[];
  isOnline: boolean;
  rating?: number;
}

export function AstrologerCard({ astrologer }: { astrologer: Astrologer }) {
  return (
    <Card className="glass-card flex flex-col h-full hover:shadow-lg transition-all duration-300">
      <CardHeader className="p-0 relative h-48 w-full overflow-hidden rounded-t-lg">
        <Image
          src={astrologer.photoUrl}
          alt={astrologer.name}
          fill
          className="object-cover"
          data-ai-hint="astrologer portrait"
        />
        {astrologer.isOnline && (
          <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600">
            Online
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-6 space-y-3">
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-lg">{astrologer.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm font-medium text-amber-400">
            <Star className="h-4 w-4 fill-current" />
            {astrologer.rating || 4.9}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {astrologer.bio}
        </p>
        <div className="flex flex-wrap gap-2">
          {astrologer.languages.map((lang) => (
            <div key={lang} className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
              <Globe className="h-3 w-3" />
              {lang}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full group" variant={astrologer.isOnline ? "default" : "outline"} disabled={!astrologer.isOnline}>
          <Link href={`/call/${astrologer.id}`}>
            <Video className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            {astrologer.isOnline ? "Call Now" : "Currently Offline"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
