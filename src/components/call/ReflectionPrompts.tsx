
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BrainCircuit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReflectionProps {
  summary: string;
}

export function ReflectionPrompts({ summary }: ReflectionProps) {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const condensedSummary = summary.trim().slice(0, 140);
    const localPrompts = [
      "Qual foi o insight mais importante desta sessão para o seu momento atual?",
      "Que ação prática você pode tomar nas próximas 24 horas com base na orientação recebida?",
      condensedSummary
        ? `Como o tema "${condensedSummary}" se conecta com seus objetivos para este mês?`
        : "Que padrão emocional você percebeu durante a conversa e como pode cuidar disso com mais intenção?",
    ];

    setPrompts(localPrompts);
    setLoading(false);
  }, [summary]);

  return (
    <Card className="glass-card mt-8 border-primary/20">
      <CardHeader className="flex flex-row items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">Integrate Your Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Based on your session, here are some journal prompts to help you process the guidance received:
        </p>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : (
          <ul className="space-y-3">
            {prompts.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
