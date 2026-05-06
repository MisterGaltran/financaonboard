# Deploy do Finanças OnBoard no Yellow

Guia operacional para subir o app 24/7. Arquitetura final usando **Tailscale Funnel** (depois que descobrimos que o ISP residencial filtra inbound TCP 443).

## Arquitetura

```
[navegador] ──HTTPS──> [Cloudflare Pages: frontend estático]
                              │
                              │ fetch + wss
                              ▼
                       [Tailscale Funnel] ── outbound tunnel ──> [Node :4000]
                       https://yellow-vpn.tailf47dec.ts.net      Yellow / systemd
```

Por que Tailscale Funnel em vez de Caddy + porta forwarding:
- Conexão é **outbound** do Yellow → Tailscale, não depende de portas abertas no Nokia.
- Contorna filtros do ISP Oi que dropam inbound TCP 443 pra IPs residenciais brasileiros.
- TLS terminado no edge do Tailscale, certificados Let's Encrypt automáticos.
- Custo: R$ 0/mês.

## Arquivos neste diretório

| Arquivo                        | Destino no Yellow                                     |
| ------------------------------ | ----------------------------------------------------- |
| `financaonboard-api.service`   | `/etc/systemd/system/financaonboard-api.service`      |
| `deploy.sh`                    | executar in-place: `bash infra/deploy.sh`             |

## Setup inicial (executar uma vez)

### 1. Clonar repo no Yellow

```bash
ssh yellow-vpn
mkdir -p /mnt/projects/financaonboard
cd /mnt/projects/financaonboard
git clone git@github.com:MisterGaltran/financaonboard.git .
cd backend
npm ci --omit=dev
```

### 2. Copiar `.env` do dev (do notebook)

```powershell
# No PowerShell do Windows:
scp C:\financaonboard\backend\.env yellow-vpn:/mnt/projects/financaonboard/backend/.env
```

No Yellow:

```bash
chmod 600 /mnt/projects/financaonboard/backend/.env
nano /mnt/projects/financaonboard/backend/.env
# trocar:
#   NODE_ENV=production
#   FRONTEND_URL=https://financaonboard.pages.dev
```

### 3. Instalar systemd unit do backend

```bash
sudo cp /mnt/projects/financaonboard/infra/financaonboard-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now financaonboard-api.service
sudo systemctl status financaonboard-api.service
```

Validar localmente:

```bash
curl http://localhost:4000/health
```

### 4. Instalar e configurar Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

O comando imprime uma URL de auth — abra no navegador, faça login (Google/GitHub).

### 5. Habilitar Funnel no admin do Tailscale

1. https://login.tailscale.com/admin → **DNS** → habilita HTTPS Certificates (botão "Enable HTTPS").
2. **Access controls** (ACLs) → adiciona no JSON:
   ```json
   "nodeAttrs": [
     { "target": ["MisterGaltran@"], "attr": ["funnel"] }
   ]
   ```
3. Se aparecer aviso "list of allowed nodes does not include...", abre o link de opt-in que o `tailscale funnel` imprimiu e aprova esse nó específico.

### 6. Configurar Funnel apontando pro backend

```bash
sudo tailscale funnel --bg 4000
sudo tailscale cert yellow-vpn.<seu-tailnet>.ts.net   # força emissão do TLS na primeira vez
tailscale funnel status
```

Vai sair a URL pública: `https://yellow-vpn.<seu-tailnet>.ts.net`. **Anota essa URL** — vai ser o backend público.

> **Importante:** se o Funnel reclamar de "address already in use" na 443, é porque o Caddy está bindando ainda. Pare e desabilite com `sudo systemctl stop caddy && sudo systemctl disable caddy`.

### 7. Deploy do frontend no Cloudflare Pages

1. https://pages.cloudflare.com → Create project → Connect to Git → `financaonboard`.
2. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
   - Node version: `20`
3. Environment variables (Production) — copiar de `frontend/.env.production.example`:
   - `VITE_BACKEND_URL=https://yellow-vpn.<seu-tailnet>.ts.net`
   - `VITE_WS_RECONNECT_DELAY=1000`
   - `VITE_WS_RECONNECT_DELAY_MAX=15000`
4. Save and Deploy.

### 8. Validar end-to-end

```bash
# de qualquer rede (4G ou outro Wi-Fi):
curl -I https://yellow-vpn.<seu-tailnet>.ts.net/health
# HTTP/2 200 esperado
```

Abre `https://financaonboard.pages.dev` no navegador.

## Atualizações futuras

**Frontend:** `git push origin main` → Cloudflare Pages rebuilda sozinho.

**Backend:**

```bash
ssh yellow-vpn
bash /mnt/projects/financaonboard/infra/deploy.sh
```

Equivalente a: `git pull` + `npm ci --omit=dev` + `systemctl restart financaonboard-api`.

## Operação

```bash
# Logs ao vivo
journalctl -u financaonboard-api -f
journalctl -u tailscaled -f

# Status
systemctl is-active financaonboard-api tailscaled
tailscale funnel status

# Saúde de recursos
free -h && df -h /mnt/projects
journalctl -p err -n 50
```

## Rollback

```bash
cd /mnt/projects/financaonboard
git log --oneline -5
git checkout <commit-hash-anterior>
cd backend && npm ci --omit=dev
sudo systemctl restart financaonboard-api
# voltar pra main quando estabilizar:
cd /mnt/projects/financaonboard && git checkout main
```

## Histórico

A versão inicial deste setup usava Caddy + DNS-01 challenge no domínio `davi-mendes.dedyn.io`. Funcionou da LAN do Davi (via hairpin NAT do Nokia), mas falhou de verdade publicamente porque o ISP Oi filtra inbound TCP 443 pra IPs residenciais brasileiros (testado via check-host.net: 99% dos nós davam timeout, só Ucrânia conectou).

A migração para Tailscale Funnel resolveu o problema usando conexão outbound do Yellow → Tailscale → público. Caddy e o token deSEC ficaram instalados mas inativos:
- Caddy: `sudo systemctl status caddy` deve estar `inactive (dead)`. Pra remover de vez: `sudo systemctl disable caddy && sudo apt remove caddy`.
- Token deSEC em `/etc/caddy/desec.env`: pode ser revogado em https://desec.io/tokens (não tem mais uso). O DDNS do WireGuard usa um token diferente em `/home/davi/desec/update.sh`, deixa esse intacto.
