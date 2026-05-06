# Premium Redesign - Financa Onboard

**Data:** 2026-05-05
**Status:** Aprovado
**Publico-alvo:** Investidores PF avancados
**Estilo:** Dark moderno minimalista (ref: TradingView, Nu Invest)
**Abordagem:** Redesign incremental - CSS/Tailwind + ajustes de JSX, sem mudar arquitetura de dados

---

## 1. Nova Paleta de Cores

Substituir integralmente a paleta Bloomberg amber por tons neutros com acento indigo.

### Tokens semanticos (substituem `bbg-*` e removem `trade-*`)

| Token | Hex | Uso |
|-------|-----|-----|
| `surface` | `#0a0a0f` | Background principal (body) |
| `surface-alt` | `#12121a` | Background de paineis/cards |
| `surface-hover` | `#1a1a25` | Hover em rows, alt rows |
| `border` | `#1e1e2e` | Bordas sutis entre elementos |
| `border-hi` | `#2a2a3a` | Bordas de destaque (headers, separadores) |
| `text-primary` | `#e1e1e6` | Texto principal (off-white) |
| `text-secondary` | `#6b6b80` | Labels, metadata, texto muted |
| `accent` | `#6366f1` | Acento principal (indigo) |
| `accent-light` | `#818cf8` | Hover de acentos, links |
| `positive` | `#22c55e` | Variacao positiva |
| `positive-dim` | `#15803d` | Flash up background |
| `negative` | `#ef4444` | Variacao negativa |
| `negative-dim` | `#991b1b` | Flash down background |
| `warning` | `#f59e0b` | Alertas, impacto medio |
| `info` | `#38bdf8` | Timestamps, links, dados neutros |

### Tokens removidos
- Todos os `bbg-*` (amber, cyan, panel, etc.)
- Todos os `trade-*` (legacy nao utilizado)

---

## 2. Tipografia

### Fonte principal: Inter (Google Fonts)

Carregar no `index.html`:
```
Inter 400, 500, 600, 700 com display=swap
```

### Aplicacao

- **Corpo/UI:** Inter, sistema sans-serif como fallback
- **Dados numericos:** Inter com `font-variant-numeric: tabular-nums` e `font-feature-settings: 'tnum'`
- **Monospace removido** como fonte base. Usar apenas em contextos especificos se necessario.

### Tamanhos (substituem `bbg-xs/sm/md`)

| Token | Tamanho | Line-height | Uso |
|-------|---------|-------------|-----|
| `ui-xs` | `11px` | `14px` | Badges, labels minimos |
| `ui-sm` | `12px` | `16px` | Metadata, secondary text |
| `ui-base` | `13px` | `18px` | Texto principal de UI |

---

## 3. Header Premium

### Estrutura

```
+-----------------------------------------------------------------+
|  * FINANCA ONBOARD     B3 * ABERTO  NYSE * FECHADO  [providers] |
|                            14:32:08 BRT                 [search]|
+-----------------------------------------------------------------+
```

### Logo
- Circulo indigo (`accent`) como icone
- "FINANCA ONBOARD" em Inter semibold (600), tracking wide
- Subtitulo "// TRADING TERMINAL" removido

### Relogio de mercados
- Atualiza a cada segundo via `setInterval`
- Timezone BRT via `Intl.DateTimeFormat`
- Status com dot colorido:
  - **B3:** aberto 10:00-17:00 BRT, dot `positive`/`negative`
  - **NYSE:** aberto 10:30-17:00 EST, dot `positive`/`negative`. Quando fechado, mostra horario de abertura
  - **Crypto:** sempre aberto, dot `positive` fixo, label "24H"
- Horarios calculados client-side, sem API extra

### StatusBar integrada ao header
- Providers ficam no header como segundo nivel visual (nao barra separada)
- Dots de provider discretos, sem labels expandidos por padrao
- **Botoes TEST-ALERT e TEST-HIGH-NEWS removidos** do layout (sao debug)

### Busca
- Icone de search minimalista no canto direito
- Badge `Ctrl+K` sutil ao lado
- Remover botao grande "SEARCH" atual

---

## 4. Layout do Cockpit

### Grid

```
+------------------------------------------------------------+
|  HEADER                                                     |
+------------------------------------------------------------+
|  WATCHLIST (cards horizontais)                              |
+-------------------------------+----------------------------+
|                               |                            |
|  CALENDARIO ECONOMICO (~55%)  |   NEWS FEED (~45%)         |
|                               |                            |
+-------------------------------+----------------------------+
|  NEWS TICKER (marquee)                                     |
+------------------------------------------------------------+
```

Proporcoes mantidas: `grid-cols-[1.2fr_1fr]` (ajustado de 1.6fr para distribuicao mais equilibrada).

---

## 5. Componentes

### 5.1 Watchlist Cards

- Background `surface-alt`, borda `border`, border-radius `4px`
- Hover: borda muda para `accent` com `transition-all 150ms`
- Preco: 16px Inter bold, tabular-nums
- Variacao: seta + cor (`positive`/`negative`)
- High/Low e Volume: `text-secondary`, `ui-xs`
- Sem dados: skeleton pulse ao inves de texto "OUT OF TOP-100"
- Botao remover: aparece no hover, icone X limpo

### 5.2 Calendario Economico

- Header do painel: titulo + filtros na mesma linha
- Day headers sticky: background `surface-hover`
- Impact badges: border-radius `rounded` (arredondados)
  - High: background `negative`, texto escuro
  - Medium: background `warning`, texto escuro
  - Low: background `text-secondary/40`, texto `text-primary`
- Eventos passados: `opacity-40`
- Row hover: background `surface-hover`
- Flash animation no Actual cell mantida com novas cores

### 5.3 News Feed

- Fresh news (< 5min): borda esquerda `accent` (indigo)
- Badge "NEW": texto `accent`, bold
- Headlines: hover muda para `text-primary` (branco)
- Tickers: pills com border-radius, background `accent/10`, borda `accent/30`
- Source: uppercase `ui-xs`, timestamp em `info`
- Stale news (> 1h): `opacity-40` (ajustado de 55)

### 5.4 News Ticker (footer)

- Badge "NEWS": background `accent` (indigo) ao inves de amber
- Gradientes fade laterais mantidos (atualizados para `surface`)
- Hover pausa mantido
- Impact icon `warning` no high impact

### 5.5 Brazil Quotes (marquee IBOV)

- Visual atualizado com novas cores
- Label "IBOV" com acento `accent`
- Gradientes laterais atualizados

### 5.6 Empty States

- Skeleton loading com pulse animation
- 3-4 retangulos `surface-hover` pulsando
- Substitui textos como "LOADING IBOV COMPOSITION..."

### 5.7 Dropdowns (filtros de pais e source)

- Border-radius `4px`
- Shadow: `0 4px 12px rgba(0,0,0,0.5)`
- Background `surface-alt`
- Checkboxes: quadrado com border-radius `2px`, fill `accent` quando ativo
- Items hover: background `surface-hover`

### 5.8 Chips de Filtro (24H, FUT, H-M, idiomas)

- Ativo: background `accent/20`, borda `accent`, texto `accent-light`
- Inativo: background `surface`, borda `border`, texto `text-secondary`
- Hover: borda `accent`

---

## 6. Modais

### 6.1 Alert Popup

- Overlay fullscreen com blur mantido
- Background do modal: `surface-alt`
- Borda `negative` (vermelho mantido - e alerta real)
- Border-pulse animation atualizada com novas cores de `negative`
- Botoes com border-radius `4px`
- Tipografia Inter
- Botao ACK: background `negative`, texto branco

### 6.2 Command Palette

- Borda `accent` (indigo)
- Shadow glow: `0 0 40px rgba(99,102,241,0.2)`
- Background `surface-alt`
- Input placeholder: `text-secondary`
- Item hover: `accent/15` translucido
- Footer atalhos mantido com nova tipografia
- Border-radius `4px`

### 6.3 Watchlist Editor

- Mesmo tratamento da Command Palette
- Pills de simbolo: background `accent/10`, borda `accent/40`, hover borda `negative`
- Input focus ring: borda `accent`

---

## 7. CSS Global e Animacoes

### index.css

- Reset: `background: #0a0a0f`, `color: #e1e1e6`
- Fonte: Inter com feature settings `'tnum' 1`
- Scrollbar: thumb `#2a2a3a` com border-radius `3px`, track `#0a0a0f`
- Regra global: todos os `button, a, [role="button"]` com `transition: colors 150ms`

### Keyframes

- `flash-up`: `rgba(34,197,94,0.35)` -> transparente (300ms)
- `flash-down`: `rgba(239,68,68,0.35)` -> transparente (300ms)
- `border-pulse`: alterna entre `negative` e `warning` com glow
- `ticker-scroll`: mantido
- `fadeIn` (novo): opacity 0->1, 300ms ease-out
- `skeleton-pulse` (novo): opacity alternando 0.4->1, 1.5s ease-in-out infinite

### Tailwind config

- Remover todos os tokens `bbg-*` e `trade-*`
- Definir novos tokens semanticos conforme Secao 1
- Font family: `sans: ['Inter', 'system-ui', 'sans-serif']`
- Font sizes: `ui-xs`, `ui-sm`, `ui-base`
- Border radius default: nenhum override (usar classes `rounded` do Tailwind)

---

## 8. Favicon + Meta Tags

### Favicon
- SVG inline no `<head>`: circulo indigo preenchido
- `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">`

### Meta tags
- `<meta name="theme-color" content="#0a0a0f">`
- `<meta name="description" content="...">`
- `<meta property="og:title" content="Financa Onboard">`
- `<meta property="og:description" content="...">`

---

## 9. Fora de Escopo (futuro)

- Sparklines/mini-graficos nos tiles da watchlist
- Paineis redimensionaveis (react-grid-layout)
- Component library (Radix/shadcn)
- Dark/light mode toggle
- Internacionalizacao
- PWA / service worker

---

## 10. Arquivos Impactados

| Arquivo | Tipo de Mudanca |
|---------|----------------|
| `frontend/index.html` | Google Fonts, favicon SVG, meta tags |
| `frontend/tailwind.config.js` | Nova paleta, tipografia, animacoes |
| `frontend/src/index.css` | Reset global, scrollbar, transicoes, keyframes |
| `frontend/src/App.jsx` | Sem mudanca estrutural |
| `frontend/src/components/Dashboard/Dashboard.jsx` | Header redesign, grid ajustado |
| `frontend/src/components/Dashboard/StatusBar.jsx` | Integrar ao header, remover debug buttons |
| `frontend/src/components/Watchlist/Watchlist.jsx` | Novo visual de cards |
| `frontend/src/components/Watchlist/WatchlistTile.jsx` | Novo visual, skeleton empty state |
| `frontend/src/components/Watchlist/WatchlistEditor.jsx` | Novo visual modal |
| `frontend/src/components/BrazilQuotes/BrazilQuotes.jsx` | Novo visual, skeleton |
| `frontend/src/components/EconomicCalendar/EconomicCalendar.jsx` | Novo visual, badges |
| `frontend/src/components/EconomicCalendar/CountryFilter.jsx` | Novo visual dropdown |
| `frontend/src/components/NewsFeed/NewsFeed.jsx` | Novo visual, badges, pills |
| `frontend/src/components/NewsFeed/NewsFilter.jsx` | Novo visual dropdown |
| `frontend/src/components/NewsTicker/NewsTicker.jsx` | Novo visual |
| `frontend/src/components/AlertSystem/AlertPopup.jsx` | Novo visual modal |
| `frontend/src/components/CommandPalette/CommandPalette.jsx` | Novo visual modal |
| `frontend/src/utils/formatters.js` | Atualizar IMPACT_BADGE_CLASS |
| **Novo:** `frontend/src/components/Dashboard/MarketClock.jsx` | Relogio de mercados + status |
