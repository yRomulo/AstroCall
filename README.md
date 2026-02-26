# AstroCall

Plataforma de consultas astrológicas em tempo real com vídeo (LiveKit), autenticação e dados no Firebase, e recursos de IA com Genkit para pós-sessão (resumos e reflexões).

## ✨ Visão geral

O AstroCall conecta usuários a astrólogos para chamadas ao vivo, com fluxo completo de:

- cadastro/login,
- listagem de astrólogos,
- entrada em chamada por sessão,
- encerramento com avaliação,
- suporte de IA para conteúdo pós-atendimento.

## 🚀 Funcionalidades

- Autenticação por e-mail/senha (Firebase Auth).
- Perfis de usuário e astrólogo no Firestore.
- Chamada em tempo real com LiveKit.
- Geração de token segura via rota de API (`/api/livekit/token`).
- Fluxos de IA com Genkit para:
	- resumo de sessão,
	- prompts de reflexão pós-chamada.
- Dashboards dedicados para usuário e astrólogo.

## 🧱 Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **UI**: Tailwind CSS + componentes Radix UI (via shadcn/ui).
- **Backend/BaaS**: Firebase (Auth + Firestore).
- **RTC**: LiveKit.
- **IA**: Genkit + Google AI (Gemini).

## 📁 Estrutura principal

```text
src/
	app/
		page.tsx                     # Landing + lista de astrólogos
		auth/page.tsx                # Login/Cadastro
		call/[sessionId]/page.tsx    # Sala da chamada
		api/livekit/token/route.ts   # Emissão de token LiveKit
		dashboard/
			astrologer/page.tsx
			user/page.tsx
	ai/
		flows/
			session-summary-flow.ts
			post-call-reflections-flow.ts
	firebase/
		config.ts
```

## ✅ Pré-requisitos

- Node.js 20+
- npm 10+
- Projeto Firebase configurado
- Conta/projeto LiveKit Cloud (ou servidor LiveKit)
- Chave de API para Google AI (uso com Genkit)

## ⚙️ Configuração do ambiente

1. Instale as dependências:

```bash
npm install
```

2. Crie seu arquivo `.env.local` na raiz do projeto (você pode usar `.env.example` como base):

```dotenv
NEXT_PUBLIC_LIVEKIT_URL=wss://SEU-PROJETO.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Necessário para fluxos Genkit/Google AI
GOOGLE_API_KEY=sua_chave_google_ai
```

> Observação: o projeto atualmente possui configuração Firebase em `src/firebase/config.ts`.

## 🧪 Scripts disponíveis

- `npm run dev` — inicia o app em modo desenvolvimento na porta `9002`.
- `npm run build` — gera build de produção.
- `npm run start` — inicia o servidor com a build de produção.
- `npm run lint` — executa lint.
- `npm run typecheck` — valida tipos TypeScript.
- `npm run genkit:dev` — inicia ambiente Genkit para desenvolvimento.
- `npm run genkit:watch` — inicia Genkit em modo watch.

## ▶️ Executando localmente

```bash
npm run dev
```

Abra: `http://localhost:9002`

## 🔐 Modelo de dados e regras

O modelo de entidades e o racional de autorização estão documentados em:

- `docs/backend.json`
- `firestore.rules`

Coleções principais:

- `user_profiles`
- `astrologer_profiles`
- `sessions`
- `reviews`
- `roles_admin`

## ☁️ Deploy

O repositório já inclui arquivos de configuração para Firebase/App Hosting:

- `firebase.json`
- `apphosting.yaml`

Para publicar, ajuste o projeto Firebase e siga seu fluxo de deploy (CLI/console) conforme o ambiente da sua equipe.

## 🤝 Contribuição

1. Faça um fork do projeto.
2. Crie uma branch (`feature/minha-feature`).
3. Commit suas mudanças.
4. Abra um Pull Request.

## 📌 Status

Projeto em evolução contínua. Melhorias em UX, automações de backend e fluxos de IA ainda podem ser expandidas.
