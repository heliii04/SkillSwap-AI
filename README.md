# SkillSwap AI

A skill-swap platform where members teach what they know and learn what they need — matched by an explainable match engine with optional LLM assistance.

Stack: **React 19 + Vite** (client) · **Express 5 + MongoDB (Mongoose) + Socket.IO** (server).

## Getting started

```bash
# server
cd server
cp .env.example .env      # fill MONGODB_URI, JWT secrets, SMTP, CLIENT_URL
npm install
npm run dev               # http://localhost:5000

# client
cd client
npm install
npm run dev               # http://localhost:5173
```

The client needs `VITE_API_BASE_URL` (e.g. `http://localhost:5000/api/v1`) in `client/.env`.

## AI features

Everything AI-powered degrades gracefully: without a key each feature falls back to a
deterministic rule-based result, so the app never breaks during a demo.

| Feature | Endpoint | Without an AI key |
|---|---|---|
| Match recommendations | `GET /api/v1/matches` | Full rule-based scoring (no AI needed) |
| Natural-language skill search | `GET /api/v1/ai/search?q=` | Synonym/keyword expansion |
| Skill suggestions from a bio | `POST /api/v1/ai/suggest-skills` | Keyword extraction |
| Learning roadmap for a swap | `POST /api/v1/ai/roadmap/:requestId` | 6-week template plan |
| First-message draft | `POST /api/v1/ai/icebreaker` | Template message |
| Provider status | `GET /api/v1/ai/status` | — |

### Match engine

`server/services/match.service.js` scores every candidate on:

| Signal | Weight |
|---|---|
| Skill overlap (title, tags, learning goal) | 40% |
| Level fit (mentor level vs learner target) | 20% |
| Availability overlap (days + time slot) | 15% |
| Session mode (online / offline / both) | 10% |
| Location (same city / state, only if offline matters) | 10% |
| Trust (profile completion, verified email, avatar) | 5% |

Both directions are scored. When each side can teach what the other wants, the match is
flagged `mutual` and boosted — those are the swaps that actually happen. Every match ships
with `reasons[]`, so the score is explainable instead of a magic number.

### Configuring a provider

Any OpenAI-compatible chat endpoint works:

```env
AI_ENABLED=true
AI_API_KEY=...
AI_BASE_URL=https://openrouter.ai/api/v1   # or https://api.openai.com/v1
AI_MODEL=openai/gpt-4o-mini                # or gpt-4o-mini on OpenAI
```

Calls are cached (identical prompts do not burn tokens twice), rate limited per user, and
guarded by a circuit breaker that disables the provider for a cooldown after repeated
failures instead of slowing every request.
