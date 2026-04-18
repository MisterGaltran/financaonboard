# Finança Onboard — Trading Dashboard

Web App em tempo real para suporte à tomada de decisão em operações de mercado.

## Estrutura

- `backend/` — Node.js + Express + Socket.io (ponte Polygon WS → clientes)
- `frontend/` — React + Vite + Tailwind + Zustand

## Setup rápido

```bash
# Backend
cd backend
cp .env.example .env     # preencha as chaves
npm install
npm run dev              # sobe em http://localhost:4000

# Frontend (outro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev              # sobe em http://localhost:5173
```

Status: PASSO 1 concluído (scaffold). Backend e Frontend ainda sem lógica — próximos passos preenchem.
