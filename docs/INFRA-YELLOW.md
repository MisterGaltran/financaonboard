# Yellow VPN — Infraestrutura para Deploy de Backend 24/7

> Documento técnico descrevendo um servidor pessoal já configurado e em operação. Atualizado em maio de 2026 após o deploy do app **financaonboard** (Express + Socket.io + frontend Cloudflare Pages).

---

## TL;DR para IAs

- **Hardware:** Home Assistant Yellow rev 1.3 (Raspberry Pi CM4 ARM64, 4 cores, 4GB RAM, eMMC 32GB para sistema, SSD NVMe 1TB para dados/projetos).
- **OS:** Debian 13 (Trixie) via Raspberry Pi OS Lite 64-bit.
- **Conectividade:** IP fixo na LAN (`192.168.1.50`), internet residencial Oi Fibra 280/190 Mbps **sem CGNAT**, IP público dinâmico exposto via DDNS deSEC (`davi-mendes.dedyn.io`).
- **VPN:** WireGuard rodando 24/7 (porta UDP 51820). Acesso remoto seguro pelo dono via tunnels nomeados.
- **Reverse proxy público:** **Caddy 2.11** (build custom com plugin `caddy-dns/desec`), TLS automático via Let's Encrypt usando desafio DNS-01 (não usa portas 80/443 para validação). Acessível via `https://davi-mendes.dedyn.io`.
- **Acesso:** SSH na porta 22 (chave pública configurada para GitHub `MisterGaltran`). VS Code Remote-SSH funcional.
- **Pasta de trabalho:** `/mnt/projects` (montado do SSD via fstab, permissão `davi:davi`).
- **Stacks instaladas:** Python 3.13 + uv, Node 20 LTS + npm + pnpm, Git, tmux, VS Code Server, **Caddy 2.11** (com plugin desec).
- **Apps em produção:** **financaonboard-api** (Express + Socket.io na porta 4000, systemd service).
- **Restrições principais:** ARM64 (não x86), 4GB de RAM total, banda de upload limitada a ~190 Mbps, recurso de CPU modesto, **Oi bloqueia inbound TCP 80** (mas TCP 443 funciona).
- **Múltiplos projetos:** o servidor é compartilhado entre vários projetos. Cada novo backend deve ser isolado em sua própria pasta, porta e unit do systemd, sem assumir uso exclusivo de recursos.
- **Operador:** Davi Mendes, fala português brasileiro, tem domínio do Linux operacional mas está em transição para programação. Prefere instruções diretas com explicações concisas do "porquê".

---

## 1. Identidade da máquina

| Campo | Valor |
|---|---|
| Hostname | `yellow-vpn` |
| Usuário principal | `davi` (sudo) |
| Distribuição | Debian 13 Trixie (Raspberry Pi OS Lite 64-bit) |
| Arquitetura | `aarch64` (ARM64) |
| Kernel | Linux 6.x (RPi build) |
| Domínio público | `davi-mendes.dedyn.io` (DDNS deSEC, atualizado a cada 5 min via cron) |
| IP público IPv4 atual | `186.241.4.181` (sem CGNAT, dinâmico) |
| IP LAN fixo | `192.168.1.50` (DHCP estático no roteador Nokia G-1425G-A) |
| Hostname mDNS | `yellow-vpn.local` |
| MAC | `d8:3a:dd:e6:21:93` |

---

## 2. Hardware

### 2.1 Yellow rev 1.3
- **CPU:** Broadcom BCM2711 / Cortex-A72 quad-core 1.5 GHz (ARM64).
- **RAM:** 4 GB LPDDR4.
- **eMMC:** 32 GB internos, dedicados ao sistema operacional. Montado em `/`.
- **Slot M.2 NVMe:** ocupado por SSD GUDGA 1 TB (modelo GVR1TB), conectado via PCIe Gen3.
- **Rede:** Ethernet Gigabit on-board (`eth0`), Wi-Fi e Bluetooth não usados.
- **Alimentação:** fonte 12V 2.5A. Sem nobreak — quedas de luz derrubam tudo até retorno manual da energia.

### 2.2 SSD — onde os projetos vivem
- **Device:** `/dev/nvme0n1`, partição `/dev/nvme0n1p1`, filesystem ext4 com label `projects`.
- **UUID:** `f6d32a71-6234-4b9e-bc6e-9565edf3d543`.
- **Mount point:** `/mnt/projects` (montagem automática via `/etc/fstab` com flags `defaults,noatime,nofail`).
- **Capacidade utilizável:** ~916 GB.
- **Diretórios padrão:**
  ```
  /mnt/projects/
  ├── financaonboard/        # app em produção (backend Express + frontend Vite)
  ├── learning/              # estudos / sandbox de aprendizado
  ├── sandbox/               # experimentos descartáveis
  ├── backups/               # tarballs gerados pelo cron diário
  └── lost+found/            # padrão ext4
  ```

### 2.3 Implicações operacionais para deploy
- **Sempre usar `/mnt/projects` para qualquer dado que precisa persistir.** Nunca `/home/davi`.
- **Cuidado com I/O paralelo agressivo:** 4 cores ARM saturam rápido.
- **RAM é o gargalo mais provável.** ~1 GB sistema + ~700 MB VS Code Server + ~150 MB financaonboard-api + ~50 MB Caddy. Sobra ~2 GB para outros serviços.

---

## 3. Rede e conectividade

### 3.1 Topologia
```
[Internet]
    │
    ▼
[Modem Nokia G-1425G-A — IP público dinâmico, sem CGNAT]
    │  (LAN 192.168.1.0/24)
    ├── 192.168.1.50  →  Yellow (este servidor)
    └── 192.168.1.x   →  outros dispositivos
    │
    └── Port forwarding ativo:
        UDP 51820  →  192.168.1.50:51820   (WireGuard)
        TCP   443  →  192.168.1.50:443     (Caddy HTTPS)
```

### 3.2 Portas atualmente expostas à internet
| Porta | Protocolo | Serviço | Observação |
|---|---|---|---|
| 51820 | UDP | WireGuard VPN | Acesso pessoal remoto à LAN |
| 443 | TCP | Caddy HTTPS | Reverse proxy → backends locais |

> **Por que NÃO temos a 80 aberta:** a Oi bloqueia inbound TCP 80 em conexões residenciais (testado e confirmado). Como mudamos a emissão TLS para o desafio DNS-01 (que conversa só com a API do deSEC), a porta 80 ficou inútil — fica fechada.

### 3.3 DDNS
Script em `/home/davi/desec/update.sh` roda a cada 5 minutos via cron e atualiza o registro A do domínio `davi-mendes.dedyn.io` no deSEC com o IPv4 público atual.

> **Importante:** o script usa `curl --silent -4` para **forçar IPv4** (corrigido em 2026-05). Sem o `-4`, o curl resolveu IPv6 da rede Oi e atualizou apenas o AAAA, deixando o A vazio — o que quebra o DNS para clientes IPv4-only.

Logs em `/home/davi/desec/update.log`.

### 3.4 Restrições de rede importantes
- **Oi bloqueia inbound TCP 80.** Confirmado por timeout em testes externos via 4G. Por isso usamos DNS-01 challenge para TLS.
- **Operadora móvel Claro bloqueia DNS para `.dedyn.io`.** Resolução pelo nome falha em 4G/5G da Claro mesmo com DNS Google. Para o celular Android do dono, o WireGuard usa Endpoint por IP literal.
- **Sem IPv6 público estável para serviços.** O modem fornece IPv6 mas a configuração atual de DDNS é IPv4 only.
- **Banda assimétrica:** 280 Mbps download / 190 Mbps upload.

---

## 4. WireGuard VPN (já configurado)

- **Servidor:** PiVPN/WireGuard escutando em `0.0.0.0:51820/udp`.
- **Subnet VPN:** `10.6.0.0/24`.
- **Clientes ativos:** notebook Windows do dono (`notebook-davi`) e celular Android (`celular-davi`/`VPNCasa`).
- **Comandos úteis:**
  - `sudo wg show` — status, peers, último handshake, bytes trafegados.
  - `pivpn -c` — listar clientes.
  - `pivpn add` — criar novo cliente.
  - `pivpn -qr <nome>` — gerar QR code para configurar celular.
  - `pivpn -r <nome>` — remover cliente.

### Implicação para deploy
**Backends que só precisam estar acessíveis ao dono podem ficar restritos à LAN/VPN.** Se quiser expor publicamente via HTTPS, usar Caddy (próxima seção) com bind em `localhost:<porta>` e adicionar bloco no Caddyfile.

---

## 5. Caddy (reverse proxy público com TLS automático)

### 5.1 Por que Caddy custom
O pacote oficial do Debian (`apt install caddy`) traz a versão 2.6.2 sem nenhum plugin DNS — ele só consegue emitir certificados Let's Encrypt via desafios HTTP-01 (porta 80) ou TLS-ALPN-01 (porta 443). Como **a Oi bloqueia inbound 80**, ambos falham.

A solução foi baixar um binário customizado do Caddy 2.11.2 já com o plugin `caddy-dns/desec` compilado. Esse plugin permite o desafio **DNS-01**, que valida o domínio criando um registro TXT temporário via API do deSEC — sem precisar de portas abertas.

### 5.2 Onde está o quê
| Caminho | O que é |
|---|---|
| `/usr/bin/caddy` | Binário Caddy 2.11.2 com plugin desec (~45 MB) |
| `/etc/caddy/Caddyfile` | Configuração do reverse proxy |
| `/etc/caddy/desec.env` | Token API do deSEC (chmod 640, owner `root:caddy`) |
| `/etc/systemd/system/caddy.service.d/override.conf` | Override do systemd: carrega o env file e remove `--environ` (que vazava o token nos logs) |

### 5.3 Conteúdo do Caddyfile atual
```caddy
davi-mendes.dedyn.io {
    encode zstd gzip
    tls {
        dns desec {
            token {$DESEC_TOKEN}
        }
    }
    reverse_proxy localhost:4000
    log {
        output stderr
        format console
    }
}
```

### 5.4 Override do systemd
```ini
[Service]
EnvironmentFile=/etc/caddy/desec.env
ExecStart=
ExecStart=/usr/bin/caddy run --config /etc/caddy/Caddyfile
```

### 5.5 Como adicionar um segundo backend público
Editar `/etc/caddy/Caddyfile`, adicionar bloco extra:
```caddy
api2.davi-mendes.dedyn.io {
    encode zstd gzip
    tls {
        dns desec { token {$DESEC_TOKEN} }
    }
    reverse_proxy localhost:5000
}
```
Depois:
1. Adicionar registro CNAME `api2` → `davi-mendes.dedyn.io.` no painel do deSEC (ou A record direto se preferir).
2. `sudo systemctl reload caddy`.

Caddy emite o certificado automaticamente no primeiro acesso.

### 5.6 Como atualizar o binário do Caddy
```bash
sudo systemctl stop caddy
sudo curl -L -o /usr/bin/caddy "https://caddyserver.com/api/download?os=linux&arch=arm64&p=github.com/caddy-dns/desec"
sudo chmod +x /usr/bin/caddy
sudo systemctl start caddy
```

---

## 6. SSH e acesso

- **SSH server:** OpenSSH na porta 22, autenticação por senha **e** por chave pública.
- **Chave pública do Yellow registrada no GitHub:** ed25519, comentário `yellow-vpn-davi`, vinculada à conta `MisterGaltran`. `ssh -T git@github.com` autentica com sucesso.
- **Acesso do notebook do dono:** configurado em `~/.ssh/config` do Windows com host alias `yellow-vpn` apontando para `192.168.1.50:22`.

---

## 7. Stacks instaladas e disponíveis

### 7.1 Linguagens e runtimes
| Stack | Versão | Local | Observação |
|---|---|---|---|
| Python | 3.13.5 | `/usr/bin/python3` | Padrão do Debian Trixie |
| uv (gerenciador Python) | 0.11.8 | `~/.local/bin/uv` | Substitui pip/venv/poetry |
| Node.js | 20.20.2 LTS | `/usr/bin/node` | Via repositório NodeSource |
| npm | 10.8.2 | `/usr/bin/npm` | Prefix configurado em `~/.npm-global` (sem sudo) |
| pnpm | 10.33.2 | `~/.npm-global/bin/pnpm` | Recomendado por economizar disco |
| **Caddy** | **2.11.2** | `/usr/bin/caddy` | **Custom build com plugin desec** |

### 7.2 Ferramentas de sistema
- `git`, `curl`, `wget`, `htop`, `tmux`, `vim`, `nano`, `build-essential`, `rsync`, `unzip`, `zip`, `jq`, `nvme-cli`, `parted`, `smartmontools`.
- **tmux** com config personalizada em `~/.tmux.conf`.

### 7.3 Ferramentas de IA
- **opencode** v1.14.33 instalado via `npm i -g opencode-ai`. Configurado para usar DeepSeek V4 Flash/Pro.

### 7.4 NÃO instalado (instalar sob demanda)
- **Docker e Docker Compose** — decisão consciente do dono para preservar RAM.
- **Bancos de dados** — nenhum (PostgreSQL, MySQL, SQLite-server, Redis, MongoDB).

---

## 8. Persistência e automação

### 8.1 Cron jobs ativos (`crontab -l` do usuário `davi`)
```cron
*/5 * * * * /home/davi/desec/update.sh >/dev/null 2>&1
0 3 * * *   /home/davi/scripts/backup-projects.sh >/dev/null 2>&1
```

### 8.2 fstab
```
UUID=f6d32a71-6234-4b9e-bc6e-9565edf3d543 /mnt/projects ext4 defaults,noatime,nofail 0 2
```

### 8.3 systemd services em produção
| Unit | O que faz | Pasta de trabalho |
|---|---|---|
| `financaonboard-api.service` | Backend Node + Socket.io na porta 4000 | `/mnt/projects/financaonboard/backend` |
| `caddy.service` | Reverse proxy HTTPS público | `/etc/caddy/` |
| `wg-quick@wg0.service` | WireGuard VPN | `/etc/wireguard/` |

---

## 9. Padrões de deploy recomendados

### 9.1 Para um backend Node.js / Python típico

**Estrutura sugerida:**
```
/mnt/projects/<nome-projeto>/
├── (código da aplicação, vinda do git)
├── .env                          (chmod 600, fora do git)
├── data/                         (uploads, sqlite, etc.)
└── logs/                         (se a aplicação escreve logs em arquivo)
```

**systemd unit recomendado** (`/etc/systemd/system/<nome>.service`):
```ini
[Unit]
Description=<descrição>
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=davi
Group=davi
WorkingDirectory=/mnt/projects/<nome-projeto>
EnvironmentFile=/mnt/projects/<nome-projeto>/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
MemoryMax=512M
CPUQuota=200%

[Install]
WantedBy=multi-user.target
```

**Comandos:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now <nome>.service
sudo systemctl status <nome>.service
journalctl -u <nome>.service -f --since "10 min ago"
```

### 9.2 Bind em interface
- **Serviço só para uso pessoal via VPN/LAN:** bind em `0.0.0.0` ou `192.168.1.50`. Não abrir porta no Nokia. Acessível só dentro de casa ou via WireGuard.
- **Serviço público na internet:** bind em `localhost`/`127.0.0.1` apenas. Adicionar bloco no `/etc/caddy/Caddyfile` para fazer reverse proxy com TLS.

### 9.3 Bancos de dados
**Para projetos pessoais e MVPs, SQLite local é geralmente suficiente** — zero infraestrutura, arquivo único em `/mnt/projects/<projeto>/data/db.sqlite`.

Se precisar de Postgres:
- Instalar via apt: `sudo apt install postgresql`.
- Storage em `/mnt/projects/<projeto>/pgdata`.
- Limitar memória: `shared_buffers = 256MB`, `effective_cache_size = 1GB` no max.
- Bind em `localhost` apenas.

### 9.4 Variáveis de ambiente e secrets
- **Não commitar `.env`** — gitignore do projeto deve cobrir.
- Permissão dos arquivos sensíveis: `chmod 600`.
- Para systemd, usar `EnvironmentFile=` apontando para o `.env` do projeto.

---

## 10. Restrições e considerações importantes

### 10.1 Limites de recursos (4GB RAM, 4 cores ARM64)
- Não rodar mais de 2-3 serviços pesados simultaneamente.
- Considerar `MemoryMax` em todas as units do systemd para evitar runaway.
- `zram0` ativo com 2GB de swap comprimida.

### 10.2 Imagens Docker e binários
- **Sempre usar imagens `arm64` ou multi-arch.**
- Pacotes Node-native que precisam compilar (`bcrypt`, `sharp`) podem demorar 5-15 min em ARM.

### 10.3 Energia e disponibilidade
- **Sem nobreak.** Após queda de luz, tudo volta automaticamente: systemd inicia serviços, cron volta, WireGuard sobe, Caddy sobe.
- Backend stateless é mais seguro; bancos de dados precisam de transações ACID e shutdown limpo.

### 10.4 Banda
- 190 Mbps de upload total compartilhada com tudo.
- Para servir conteúdo estático pesado, considerar CDN gratuita (Cloudflare Pages / Cloudflare R2) na frente.

### 10.5 Backup do código
O backup local em `/mnt/projects/backups/` cobre erros humanos. **Não cobre falha física do SSD nem incêndio.** Manter espelho em GitHub e cópia segura do `.env` fora do Yellow (gerenciador de senhas) é necessário.

### 10.6 Secrets e arquivos insubstituíveis
Backends podem armazenar arquivos críticos (chaves de assinatura, certificados privados, tokens permanentes). Esses arquivos exigem backup externo adicional além do cron local — idealmente em pelo menos dois lugares fora do Yellow.

---

## 11. Como diagnosticar a saúde da máquina

```bash
# Uptime e load
uptime

# Memória
free -h

# Disco
df -h /mnt/projects /

# Saúde do SSD
sudo nvme smart-log /dev/nvme0n1 | head -20

# VPN
sudo wg show

# DDNS
tail /home/davi/desec/update.log

# Top consumidores de RAM/CPU
htop
ps aux --sort=-%mem | head -10

# Temperatura
vcgencmd measure_temp 2>/dev/null || cat /sys/class/thermal/thermal_zone0/temp

# Serviços systemd com problema
systemctl --failed

# Status dos services em produção
systemctl is-active financaonboard-api caddy wg-quick@wg0

# Logs recentes do sistema
journalctl -p err -n 50 --no-pager

# Cron agendado
crontab -l
```

---

## 12. Convenções operacionais

- **Idioma:** português brasileiro.
- **Tom:** instruções diretas, com explicação concisa do "porquê".
- **Responsabilidade:** o operador (Davi) é responsável por aprovar mudanças destrutivas. A IA não deve presumir autorização para `rm -rf`, `git push --force`, alterações em `/etc/fstab`, mudanças em portas do roteador, ou qualquer ação irreversível sem confirmação explícita.
- **Reboots:** evitar. Um reboot interrompe a VPN e qualquer sessão tmux. Se necessário, avisar antes.
- **Senhas e API keys:** nunca pedir para o usuário colar em chat. Sempre instruir a usar variáveis de ambiente, arquivos com `chmod 600`, ou gerenciadores de senha.

---

## 13. Estado atual de uso (snapshot maio 2026)

```
Sistema:        Debian 13 Trixie, Linux ARM64
Máquina:        Yellow rev 1.3 (CM4, 4 cores, 4GB RAM)
SSD:            1TB NVMe, montado em /mnt/projects, ~870GB livres
VPN:            WireGuard ativo, 2 clientes (notebook + celular)
DDNS:           davi-mendes.dedyn.io (atualizado a cada 5 min, IPv4 forçado)
TLS público:    Caddy 2.11 + plugin desec, DNS-01 challenge
Stack web:      Node 20 LTS + Python 3.13 + Caddy 2.11
IA local:       opencode + DeepSeek V4 Flash via terminal
Backup:         tarball diário em /mnt/projects/backups/ (retenção 7 dias)
Portas abertas: 51820/UDP (WireGuard), 443/TCP (Caddy)
Apps:           financaonboard-api (backend Node, porta 4000, systemd)
                financaonboard frontend hospedado em Cloudflare Pages
```

---

## 14. Coexistência de múltiplos backends

### 14.1 Nomenclatura e isolamento
- **Pasta dedicada:** `/mnt/projects/<nome-do-projeto>/` (kebab-case).
- **systemd unit:** nome combina com o projeto, ex.: `meuapp-api.service`.
- **Variáveis de ambiente:** prefixadas com nome do projeto quando houver risco de colisão.
- **Logs:** journalctl do systemd; filtrar por unit.

### 14.2 Alocação de portas
| Faixa | Uso sugerido | Em uso |
|---|---|---|
| 3000–3099 | Backends Node.js | — |
| **4000** | **financaonboard-api** | **ocupada** |
| 5000–5099 | Backends Python (Flask, FastAPI) | — |
| 8000–8099 | Aplicações genéricas / Django | — |
| 5432, 6379, 27017 | Bancos padrão (Postgres, Redis, Mongo) — se instalados | — |

Antes de propor uma porta nova: `sudo ss -tulpn | grep LISTEN`.

### 14.3 Recursos finitos — orçamento de RAM
Sistema + VS Code Server + financaonboard ≈ 1.8 GB. Sobram ~2.2 GB para novos serviços.

- **Backend leve** (API stateless): 256–512 MB.
- **Backend médio** (cache em memória, workers): 512 MB – 1 GB.
- **Backend pesado**: considerar mover para outra máquina.

Sempre incluir `MemoryMax=` no systemd unit.

### 14.4 Roteamento público quando há mais de um backend exposto
Caddy multi-site no mesmo Caddyfile (cada bloco é um subdomínio). Adicionar CNAME no deSEC apontando o subdomínio para `davi-mendes.dedyn.io.`:

```caddy
davi-mendes.dedyn.io {
    tls { dns desec { token {$DESEC_TOKEN} } }
    reverse_proxy localhost:4000   # financaonboard
}

api2.davi-mendes.dedyn.io {
    tls { dns desec { token {$DESEC_TOKEN} } }
    reverse_proxy localhost:5000
}
```

Apenas a porta 443 fica aberta no roteador. Cada novo backend público requer só um bloco a mais no `Caddyfile` e um `systemctl reload caddy`.

### 14.5 Variáveis e secrets entre projetos
- Cada projeto tem seu próprio `.env` em `/mnt/projects/<projeto>/.env` com `chmod 600`.
- systemd `EnvironmentFile=` aponta para o `.env` específico.

### 14.6 Banco de dados compartilhado vs dedicado
- **Default:** SQLite por projeto.
- **Postgres:** uma instância única servindo múltiplos projetos via *databases* separadas.
- Em qualquer caso, bind em `localhost`.

### 14.7 Backup
Cron diário cobre `/mnt/projects/` inteiro. Bancos de dados precisam de tratamento especial — fazer dump (`pg_dump`, `sqlite .backup`) para arquivo dentro da pasta do projeto antes do horário do cron.

---

## 15. Apêndice — App `financaonboard` em produção

App de finanças (cotações, notícias, calendário econômico) deployado em maio 2026.

### 15.1 Arquitetura
```
[navegador] ─HTTPS─> [Cloudflare Pages: financaonboard.pages.dev]
                              │
                              │ wss + REST
                              ▼
                       [Caddy :443] (TLS Let's Encrypt automático)
                              │
                              ▼
                       [Node 20 + Express + Socket.io :4000]
                          systemd: financaonboard-api
                          /mnt/projects/financaonboard/backend
```

### 15.2 Atualização de código
Frontend (auto-deploy a cada `git push`):
```bash
git push origin main   # do notebook → Cloudflare Pages rebuilda em ~1-2 min
```

Backend (manual, no SSH do Yellow):
```bash
bash /mnt/projects/financaonboard/infra/deploy.sh
# faz git pull + npm ci --omit=dev + systemctl restart financaonboard-api
```

### 15.3 Operação no dia-a-dia
```bash
# Logs ao vivo
journalctl -u financaonboard-api -f
journalctl -u caddy -f

# Status
systemctl is-active financaonboard-api caddy

# Health check público
curl https://davi-mendes.dedyn.io/health
```

### 15.4 Secrets
- API keys (Finnhub, EODHD, Polygon, BRAPI) em `/mnt/projects/financaonboard/backend/.env` (chmod 600).
- Token deSEC em `/etc/caddy/desec.env` (chmod 640, owner `root:caddy`).

---

*Documento mantido por Davi Mendes. Última atualização: maio 2026 — após deploy do app financaonboard.*
