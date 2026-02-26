
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AstrologerCard } from "@/components/astrology/AstrologerCard";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const firestore = useFirestore();
  
  const astrologersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "astrologer_profiles"));
  }, [firestore]);

  const { data: astrologersData, isLoading: loading } = useCollection(astrologersQuery);

  const presetAstrologers = [
    {
      id: "astro-1",
      name: "Dr. Aditya Sharma",
      photoUrl: PlaceHolderImages[0].imageUrl,
      bio: "Expert in Vedic Astrology with 15 years of experience in natal chart readings and remedial measures.",
      languages: ["English", "Hindi"],
      isOnline: true,
      rating: 4.8
    },
    {
      id: "astro-2",
      name: "Luna Starseed",
      photoUrl: PlaceHolderImages[1].imageUrl,
      bio: "Specialist in Western Evolutionary Astrology and Tarot guidance for career and relationship insights.",
      languages: ["English", "Spanish"],
      isOnline: true,
      rating: 4.9
    },
    {
      id: "astro-3",
      name: "Master Chen",
      photoUrl: PlaceHolderImages[2].imageUrl,
      bio: "Bazi and Feng Shui master providing holistic wisdom for business success and personal harmony.",
      languages: ["Mandarin", "English"],
      isOnline: false,
      rating: 4.7
    }
  ];

  const astrologers = [...(astrologersData ?? []), ...presetAstrologers];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Consult the Stars in Real-Time
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect instantly with verified expert astrologers from around the world. Secure, private video calls to guide your journey.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {astrologers.map((astro: any) => (
              <AstrologerCard key={astro.id} astrologer={astro} />
            ))}
          </div>
        )}
      </main>
      
      <footer className="border-t bg-card/30 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AstroCall. Your destiny, revealed.
        </div>
      </footer>
    </div>
  );
}
