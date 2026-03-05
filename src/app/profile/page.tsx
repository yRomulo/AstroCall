"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirebaseApp, useFirestore, useMemoFirebase, useUser } from "@/firebase";

interface UserProfile {
  id: string;
  role?: "user" | "astrologer" | "admin";
  name?: string;
  email?: string | null;
  photoUrl?: string;
}

interface AstrologerProfile {
  id: string;
  photoUrl?: string;
  bio?: string;
  languages?: string[];
}

const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function getUploadErrorDescription(error: unknown): string {
  const fallback = "Não foi possível atualizar seu perfil.";

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("cors") || message.includes("preflight")) {
      return "Upload bloqueado por CORS no Firebase Storage. Configure o CORS do bucket para permitir http://localhost:9002 e tente novamente.";
    }

    if (message.includes("storage/unauthorized") || message.includes("unauthorized")) {
      return "Você não tem permissão para enviar imagens. Verifique as regras do Firebase Storage.";
    }

    if (message.includes("storage/object-not-found") || message.includes("object-not-found")) {
      return "Bucket de armazenamento não encontrado. Revise NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.";
    }

    if (message.includes("cloudinary")) {
      return "Falha no upload via Cloudinary. Verifique NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.";
    }

    if (message.includes("next_public_firebase_storage_bucket")) {
      return error.message;
    }
  }

  return fallback;
}

export default function ProfilePage() {
  const router = useRouter();
  const firebaseApp = useFirebaseApp();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "user_profiles", user.uid);
  }, [db, user]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  const astrologerProfileRef = useMemoFirebase(() => {
    if (!db || !user || profileData?.role !== "astrologer") return null;
    return doc(db, "astrologer_profiles", user.uid);
  }, [db, user, profileData?.role]);

  const { data: astrologerProfileData, isLoading: isAstrologerProfileLoading } = useDoc<AstrologerProfile>(astrologerProfileRef);

  const [name, setName] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [callBannerFile, setCallBannerFile] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth");
    }
  }, [isUserLoading, router, user]);

  useEffect(() => {
    setName(profileData?.name ?? user?.displayName ?? "");
  }, [profileData?.name, user?.displayName]);

  useEffect(() => {
    if (profileData?.role === "astrologer") {
      setBio(astrologerProfileData?.bio ?? "");
      setLanguagesInput((astrologerProfileData?.languages ?? []).join(", "));
    }
  }, [astrologerProfileData?.bio, astrologerProfileData?.languages, profileData?.role]);

  const uploadImageWithCloudinary = async (file: File) => {
    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      throw new Error("Cloudinary não configurado.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorPayload}`);
    }

    const payload = (await response.json()) as { secure_url?: string };
    if (!payload.secure_url) {
      throw new Error("Cloudinary upload failed: secure_url ausente.");
    }

    return payload.secure_url;
  };

  const uploadImage = async (file: File, path: string) => {
    if (cloudinaryCloudName && cloudinaryUploadPreset) {
      return uploadImageWithCloudinary(file);
    }

    if (!firebaseApp.options.storageBucket) {
      throw new Error("Configure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET para habilitar uploads de imagem.");
    }

    const storage = getStorage(firebaseApp);
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your name before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      let profilePhotoUrl = profileData?.photoUrl ?? "";
      if (profilePhotoFile) {
        profilePhotoUrl = await uploadImage(
          profilePhotoFile,
          `user_profiles/${user.uid}/avatar-${Date.now()}-${profilePhotoFile.name}`
        );
      }

      const payload = {
        id: user.uid,
        email: user.email ?? null,
        name: trimmedName,
        photoUrl: profilePhotoUrl || null,
        updatedAt: serverTimestamp(),
        ...(profileData?.role ? { role: profileData.role } : {}),
      };

      await setDoc(doc(db, "user_profiles", user.uid), payload, { merge: true });

      if (profileData?.role === "astrologer") {
        let callBannerUrl = astrologerProfileData?.photoUrl ?? "";
        if (callBannerFile) {
          callBannerUrl = await uploadImage(
            callBannerFile,
            `astrologer_profiles/${user.uid}/banner-${Date.now()}-${callBannerFile.name}`
          );
        }

        const parsedLanguages = languagesInput
          .split(",")
          .map((lang) => lang.trim())
          .filter(Boolean);

        const astroPayload = {
          id: user.uid,
          photoUrl: callBannerUrl || null,
          bio: bio.trim(),
          languages: parsedLanguages,
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "astrologer_profiles", user.uid), astroPayload, { merge: true });
      }

      setProfilePhotoFile(null);
      setCallBannerFile(null);

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: getUploadErrorDescription(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || (user && (isProfileLoading || isAstrologerProfileLoading))) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-10">
          <p className="text-muted-foreground">Loading profile...</p>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-headline text-3xl font-bold text-primary mb-6">Edit Profile</h1>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Your information</CardTitle>
              <CardDescription>Update your profile details below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" value={user.email ?? ""} readOnly disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-photo">Profile image upload</Label>
                  <Input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePhotoFile(e.target.files?.[0] ?? null)}
                  />
                  {profileData?.photoUrl && (
                    <p className="text-xs text-muted-foreground">Current profile image is active.</p>
                  )}
                </div>

                {profileData?.role === "astrologer" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="call-banner">Banner image upload (Astrologer)</Label>
                      <Input
                        id="call-banner"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCallBannerFile(e.target.files?.[0] ?? null)}
                      />
                      {astrologerProfileData?.photoUrl && (
                        <p className="text-xs text-muted-foreground">Current call banner image is active.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="astrologer-bio">Banner description (Astrologer)</Label>
                      <Textarea
                        id="astrologer-bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe your consultation style..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="astrologer-languages">Spoken languages (comma separated)</Label>
                      <Input
                        id="astrologer-languages"
                        value={languagesInput}
                        onChange={(e) => setLanguagesInput(e.target.value)}
                        placeholder="Português, English, Español"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
