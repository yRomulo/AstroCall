# AstroCall

Aplicação web para consultas astrológicas em tempo real com vídeo, autenticação, perfis e pós-atendimento com IA.

## Objetivo

- Conectar usuários e astrólogos em chamadas ao vivo.
- Persistir sessões, avaliações e perfis.
- Gerar conteúdo pós-sessão (resumo e reflexões) via IA.

## Tecnologias

- Frontend: Next.js 15 (App Router), React 19, TypeScript.
- UI: Tailwind CSS, Radix UI (shadcn/ui).
- Backend/BaaS: Firebase Auth + Firestore.
- RTC: LiveKit.
- IA: Genkit + Google AI (Gemini).

## Estrutura do projeto

```text
src/
	app/
		page.tsx                    # Home / lista de astrólogos
		auth/page.tsx               # Login e cadastro
		call/[sessionId]/page.tsx   # Sala da chamada + avaliação
		profile/page.tsx            # Edição de perfil
		admin/page.tsx              # Gestão administrativa
		dashboard/
			user/page.tsx
			astrologer/page.tsx
		api/livekit/token/route.ts  # Emissão de token LiveKit
	components/
		astrology/
		call/
		layout/
		ui/
	firebase/
		config.ts
		provider.tsx
		firestore/
		auth/
	ai/
		genkit.ts
		dev.ts
		flows/
```

## Pré-requisitos

- Node.js 20+
- npm 10+
- Projeto Firebase configurado
- Projeto/conta LiveKit
- Chave de API Google AI (para fluxos Genkit)

## Execução local

```bash
npm install
npm run dev
```

Acesse: `http://localhost:9002`

## Dados e regras

- Regras de segurança: `firestore.rules`
- Modelo de backend: `docs/backend.json`
- Coleções principais: `user_profiles`, `astrologer_profiles`, `sessions`, `reviews`, `roles_admin`
