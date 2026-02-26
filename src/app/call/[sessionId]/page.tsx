
"use client";

import { useEffect, useState, use } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RatingModal } from "@/components/call/RatingModal";
import { ReflectionPrompts } from "@/components/call/ReflectionPrompts";
import { AlertCircle, Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function CallPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const livekitServerUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const [token, setToken] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, isUserLoading: userLoading } = useUser();
  const db = useFirestore();
  const [callEnded, setCallEnded] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const startSession = async () => {
      try {
        setConnectionError(null);

        if (!livekitServerUrl) {
          setConnectionError("Configuração ausente: defina NEXT_PUBLIC_LIVEKIT_URL no .env.local");
          return;
        }

        const username = user.email ?? user.uid;
        const query = new URLSearchParams({
          room: sessionId,
          username,
        });

        const resp = await fetch(`/api/livekit/token?${query.toString()}`);
        const data = await resp.json();

        if (!resp.ok || !data?.token) {
          const errorMessage = data?.error || "Não foi possível gerar o token da chamada.";
          setConnectionError(errorMessage);
          return;
        }

        setToken(data.token);

        const sessionRef = doc(db, "sessions", sessionId);
        const sessionData = {
          id: sessionId,
          userId: user.uid,
          astrologerId: sessionId,
          status: "active",
          startedAt: serverTimestamp(),
        };

        setDoc(sessionRef, sessionData).catch(async () => {
          errorEmitter.emit("permission-error", new FirestorePermissionError({
            path: sessionRef.path,
            operation: "create",
            requestResourceData: sessionData
          }));
        });
      } catch (e) {
        console.error(e);
        setConnectionError("Erro de conexão ao entrar na chamada. Tente novamente.");
      }
    };

    startSession();
  }, [sessionId, user, userLoading, db, router, livekitServerUrl]);

  const handleDisconnected = async () => {
    setCallEnded(true);
    const sessionRef = doc(db, "sessions", sessionId);
    
    updateDoc(sessionRef, {
      status: "ended",
      endedAt: serverTimestamp(),
    }).catch(async () => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: sessionRef.path,
        operation: "update",
        requestResourceData: { status: "ended" }
      }));
    });

    setSessionSummary("Resumo disponível após o encerramento da sessão. Reflita sobre os principais temas discutidos e próximos passos.");
  };

  if (connectionError && !token && !callEnded) {
    return (
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Falha ao entrar na chamada</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => router.push("/")}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (userLoading || (!token && !callEnded)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="font-headline text-xl">Connecting to the cosmos...</p>
      </div>
    );
  }

  if (callEnded) {
    return (
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full text-center space-y-6">
          <h1 className="font-headline text-3xl font-bold">Session Complete</h1>
          <p className="text-muted-foreground">Thank you for connecting with your guide today.</p>
          
          <RatingModal sessionId={sessionId} />
          
          {sessionSummary && <ReflectionPrompts summary={sessionSummary} />}
          
          <Button onClick={() => router.push("/")} variant="outline" className="mt-8">
            Return to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token!}
        serverUrl={livekitServerUrl}
        onDisconnected={handleDisconnected}
        data-lk-theme="default"
        className="h-full"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
