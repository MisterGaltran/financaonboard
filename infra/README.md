# Deploy do Finanças OnBoard no Yellow

Guia operacional para subir o app 24/7. Plano completo de arquitetura está em `~/.claude/plans/desejo-fazer-com-que-twinkling-panda.md` (na máquina de desenvolvimento).

## Arquitetura

```
[navegador] ──HTTPS──> [Cloudflare Pages: frontend estático]
                              │
                              │ fetch + wss
                              ▼
                       [Caddy :443] ──> [Node :4000]
                       api.davi-mendes.dedyn.io     Yellow / systemd
```

## Arquivos neste diretório

| Arquivo                        | Destino no Yellow                                     |
| ------------------------------ | ----------------------------------------------------- |
| `financaonboard-api.service`   | `/etc/systemd/system/financaonboard-api.service`      |
| `Caddyfile`                    | `/etc/caddy/Caddyfile`                                |
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
#   FRONTEND_URL=https://financaonboard.pages.dev   (ajustar para o domínio real do Pages)
```

### 3. Instalar systemd unit

```bash
sudo cp /mnt/projects/financaonboard/infra/financaonboard-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now financaonboard-api.service
sudo systemctl status financaonboard-api.service
journalctl -u financaonboard-api.service -f --since "2 min ago"
```

Validar local na LAN:

```bash
curl http://192.168.1.50:4000/health
```

### 4. Adicionar CNAME no deSEC

Painel: https://desec.io/domains → davi-mendes.dedyn.io → Add record

```
Type:    CNAME
Subname: api
Target:  davi-mendes.dedyn.io.
TTL:     3600
```

Validar (até 1h de propagação):

```bash
dig api.davi-mendes.dedyn.io +short
```

### 5. Instalar Caddy

```bash
sudo apt update
sudo apt install -y caddy
sudo cp /mnt/projects/financaonboard/infra/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy
journalctl -u caddy -n 50 --no-pager
```

### 6. Abrir portas no roteador Nokia

Painel: http://192.168.1.1 → Forward Rules / Port Forwarding

| Porta externa | Protocolo | IP interno     | Porta interna |
| ------------- | --------- | -------------- | ------------- |
| 80            | TCP       | 192.168.1.50   | 80            |
| 443           | TCP       | 192.168.1.50   | 443           |

Validar de fora da rede (4G no celular sem VPN):

```bash
curl -I https://api.davi-mendes.dedyn.io/health
```

Esperado: `HTTP/2 200` com certificado válido.

### 7. Deploy do frontend no Cloudflare Pages

1. https://pages.cloudflare.com → Create project → Connect to Git → escolher `financaonboard`.
2. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
   - Node version: `20`
3. Environment variables (Production) — copiar de `frontend/.env.production.example`:
   - `VITE_BACKEND_URL=https://api.davi-mendes.dedyn.io`
   - `VITE_WS_RECONNECT_DELAY=1000`
   - `VITE_WS_RECONNECT_DELAY_MAX=15000`
4. Save and Deploy. Aguardar build (~1-2 min) → site fica em `https://<projeto>.pages.dev`.

### 8. Atualizar `FRONTEND_URL` com o domínio real do Pages

```bash
ssh yellow-vpn
nano /mnt/projects/financaonboard/backend/.env
# FRONTEND_URL=https://<projeto>.pages.dev
sudo systemctl restart financaonboard-api.service
```

## Atualizações futuras (deploy de novas versões)

Frontend:  `git push origin main` → Cloudflare Pages rebuilda sozinho.

Backend:

```bash
ssh yellow-vpn
bash /mnt/projects/financaonboard/infra/deploy.sh
```

Equivalente a: `git pull` + `npm ci --omit=dev` + `systemctl restart`.

## Operação

Logs do backend:

```bash
journalctl -u financaonboard-api -f
```

Logs do Caddy:

```bash
journalctl -u caddy -f
```

Status geral:

```bash
systemctl is-active financaonboard-api caddy
```

Saúde de recursos (`§10` do INFRA-YELLOW):

```bash
free -h
htop
journalctl -p err -n 50
```

## Rollback

Se um deploy quebra:

```bash
cd /mnt/projects/financaonboard
git log --oneline -5                    # ver commits recentes
git checkout <commit-hash-anterior>     # voltar pra versão estável
cd backend && npm ci --omit=dev
sudo systemctl restart financaonboard-api
```

Quando estabilizar, voltar pro main:

```bash
cd /mnt/projects/financaonboard && git checkout main
```
