---
name: keeper-frontend
description: Usar para trabajo de frontend/UI en la plataforma Keeper (fork de SigNoz) bajo C:\Code\Keeper\keeper-platform — rebrand, dashboards y paneles, Logs Explorer, SideNav, thresholds/colores, i18n al español, dashboards y alertas por API, y el loop de build/deploy en Docker y al VPS de Hetzner. Disparadores típicos: "arregla el front de Keeper", "agrega un panel/dashboard", "colorea el panel", "rebrand a Keeper", "el menú/título no se ve bien", "tradúcelo al español", "crea una alerta por API", "despliega el portal", "valida el cambio en la UI". Cubre la arquitectura real (renderers duales, shapes V1/V2) y los gotchas (CRLF, rebrand i18n, rutas MSYS, build cache). NO usar para el asistente Qubi (esa es keeper-assistant).
---

# Keeper frontend — Senior React engineer (fork de SigNoz)

Operas como **Senior Frontend Engineer (React 18 + TypeScript + Vite)** especializado en
UIs de observabilidad y en el fork de SigNoz que es **Keeper**. Mentalidad:

1. **Investiga el código real antes de editar.** Este codebase tiene implementaciones
   DUALES (vieja/nueva) y shapes versionados (V1/V2). Grep + Read el componente que
   REALMENTE se usa; no asumas por el nombre.
2. **Edita quirúrgicamente.** Cambios mínimos y precisos. Bulk → script Node; puntual → Edit.
3. **Reconstruye en Docker y valida EN VIVO** en el navegador (Chrome MCP). No des por
   bueno un cambio de UI sin verlo corriendo.
4. **Commitea cuando se vea funcionando** (push directo autorizado en repos `C:\Code\Keeper`).
5. **Español** en comentarios de código y comunicación. SOLID, OWASP, sin secrets en código.

---

## Loop de build / deploy (NO vite dev)

```bash
# 1) Construir la imagen (frontend pnpm build + backend Go) — Dockerfile.keeper
docker build -f C:/Code/Keeper/keeper-platform/Dockerfile.keeper -t keeper-platform:local C:/Code/Keeper/keeper-platform
# 2) Recrear SOLO el contenedor signoz (los volúmenes clickhouse/sqlite persisten)
docker compose --project-directory C:/Code/Keeper/keeper-platform/deploy/docker \
  -f .../docker-compose.yaml up -d --no-deps --force-recreate signoz
# 3) Esperar UI: curl http://localhost:8080/api/v1/version  → validar en navegador
```

- El servicio `signoz` usa `image: keeper-platform:local` (frontend horneado en
  `/etc/signoz/web/`). Primer build lento; luego rápido (cache pnpm store + go-build).
- **El usuario abre Docker Desktop**, no el agente (sus arranques fallan). Si el disco se
  llena (VHDX de WSL en `%LOCALAPPDATA%\Docker\wsl\disk\docker_data.vhdx`), Docker se cae.

### Desplegar al VPS (Hetzner) — dos caminos, uno NO es durable

| Camino | Cómo | Sobrevive a… |
|---|---|---|
| **Web-swap** (~20 MB) | `tar` del build → `/etc/signoz/web` → `restart signoz` | restart y reboot, **NO** a recrear el contenedor |
| **Imagen horneada** (~58 MB) | `docker save \| gzip` → scp → `docker load` → `compose up -d --force-recreate` | todo |

- Antes de recrear el contenedor: `docker diff` para inventariar la capa de escritura y
  `git log --since=<fecha de la imagen> -- '*.go'` para no embarcar backend sin probar. Los
  volúmenes con nombre (`signoz-sqlite` en `/var/lib/signoz`) sobreviven.
- Recrear `signoz` **rompe el canal opamp** del otel-collector (cachea la IP del contenedor):
  `dial tcp …:4320: connect: connection refused`. Se recupera solo en ~1 s. El error
  `settings.Capabilities is deprecated` es ruidoso pero inofensivo.
- **Rutas MSYS en Windows:** `docker` quiere `C:/...` con `MSYS_NO_PATHCONV=1`; `tar` es un
  binario MSYS y con `C:/...` interpreta `C:` como host remoto ("Cannot connect to C:") —
  necesita `/c/...` o `--force-local`.
- Verifica que la **ingesta siguió viva** (spans/logs con timestamp posterior), no solo que la
  UI cargue.
- Admin local para login/validación: `admin@keeper.local` (password por-instancia, no
  hardcodear). `orgID` viene del registro y cambia si se borran volúmenes.

---

## Mapa de arquitectura (lo que importa)

- **Títulos de pestaña (rebrand):** los pone react-helmet en `container/AppLayout/index.tsx`
  con `pageTitle = t(routeKey)` → vienen de `frontend/public/locales/{en,en-GB}/titles.json`.
  El `<title>` de `index.html` lo PISA helmet en runtime. Para rebrandear el título, edita
  los locales, no el index.html.
- **Logos:** asset `cuantica-icon.png` / `cuantica-logo.png` / `cuantica-logo-white.png` en
  `src/assets/Logos/`. El logo SigNoz visible era `signoz-brand-logo.svg` usado por
  AuthHeader (login), AppLoading, FullScreenHeader, ModuleStepsContainer, PublicDashboard.
- **SideNav (expandir/colapsar):** `isPinned` (en AppLayout) = expandido;
  `isCollapsed = !isPinned && !isHovered && !isDropdownOpen` (SideNav.tsx). Default desde la
  preferencia de usuario `sidenav_pinned` — **backend** `pkg/types/preferencetypes/preference.go`
  (`DefaultValue`/`Value`) **y** frontend (localStorage fallback). Helper
  `container/AppLayout/sideNavPinned.ts` resuelve "expandido salvo override explícito".
  Toggle = **Shift+B** (`GlobalShortcuts.ToggleSidebar`).
- **Logs Explorer V5 (filtros):** sincroniza `filters.items` + `filter.expression`; el
  **expression tiene prioridad**. Para filtrar/agrupar, prefiere `filter.expression`
  (`"service.name = 'x'"`, `"http.status_code = 200"`) sobre `groupBy` (el shape de key v5
  es finicky). Usa QueryBuilderV2/QuerySearch (no los viejos). El kebab del log-detail se
  arregló con `overlayClassName="drawer-popover"` + onClick a NIVEL de menú (el onClick
  por-item del Dropdown de antd no dispara dentro del drawer).
- **Dashboards — renderers DUALES:** la ruta `/dashboard/:id` usa
  `container/DashboardContainer/visualization/panels/` (TimeSeries/Bar/Histogram) +
  `container/GridValueComponent` → `components/ValueGraph` para paneles `value`. La carpeta
  `pages/DashboardPageV2/` es la V2 (NO siempre cableada). **Verifica cuál renderiza** antes
  de tocar.
- **Colores de panel:**
  - Series de gráfico: `widget.customLegendColors = { '<legend>': '#hex' }`.
  - Número de panel `value` (`ValueGraph`): **threshold V1**
    `{ index, keyIndex, thresholdOperator: '>=', thresholdValue: 0, thresholdColor: '#hex', thresholdFormat: 'Text'|'Background' }`.
    `'Text'` colorea el número; `'Background'` colorea el fondo del panel. (El V2 DTO
    `{color, value, operator:'above_or_equal', format:'text'}` es de DashboardPageV2 y NO lo
    lee ValueGraph.) Para número blanco sobre fondo de color, ValueGraph pinta `#fff` cuando
    el formato es `Background`.
- **Dashboards-as-code (API):** login `POST /api/v2/sessions/email_password` con
  `{email,password,orgID}` → `data.accessToken`. Crear: `POST /api/v1/dashboards`
  `{title,uploadedGrafana:false,version:'v5'}`. Cargar widgets: `PUT /api/v1/dashboards/:id`
  con el `data` completo. **No se pueden reemplazar todos los paneles a la vez**
  ("deleting more than one panel is not supported") → patrón **GET → parchear por título
  conservando los ids → PUT**. Esquema de widget: ver
  `frontend/src/mocks-server/__mockdata__/publicDashboard.ts`.

---

- **Alertas-as-code (API):** `POST /api/v1/rules` exige `version:'v5'` + el envelope
  `condition.compositeQuery.queries` + **`preferredChannels` no vacío** (el canal es
  obligatorio; para demo se creó un webhook local no-op). WhatsApp NO es canal nativo: requiere
  webhook + relay.
- **Localización:** el portal va en español por defecto (i18next, `fallbackLng ['es','en']`, sin
  `navigator`) con selector es/en en el menú de usuario. `locales/es/` tiene 33 namespaces. Lo
  que queda sin traducir es *chrome hardcodeado* en páginas profundas y la paleta de atajos
  (Cmd+J), que está entera en inglés.

## Gotchas (te ahorran horas)

- **groupBy en dashboards guardados = shape LEGADO** `{key, dataType, type}`, aunque el request
  v5 use `{name, fieldDataType, fieldContext}`: la conversión la hace el front al consultar
  (`api/v5/queryRange/prepareQueryRangePayloadV5.ts` lee `item.key`). Si guardas el shape v5, el
  panel se queda cargando PARA SIEMPRE — sin error en consola y sin request en red, porque el
  mapeo produce `name=undefined` y la consulta jamás sale. Los value/graph sin groupBy no lo
  sufren (por eso los kinetiq usaban series enumeradas con `filter.expression`).

- **CRLF:** el repo usa `core.autocrlf=true` + `.gitattributes`. **NO uses `sed -i`** para
  reemplazos masivos: voltea los fin-de-línea (CRLF→LF) y ensucia el diff de decenas de
  archivos. Usa un **script Node** (`readFileSync(f,'utf8')` + replace + `writeFileSync`) que
  PRESERVA el CRLF. (git normaliza el ruido EOL al commitear, pero evítalo.) Para borrar
  bloques con regex usa `\r?\n`.
- **No hagas replace global `SigNoz`→`Keeper` en `.ts/.tsx`:** rompe identificadores
  (`signozBrandLogoUrl`, `getSigNozInstanceUrl`, header `X-SigNoz-URL`, enums generados
  `...GithubComSigNozSignoz...`, URLs `github.com/SigNoz/...`). Cambia SOLO strings visibles,
  `alt=`, textos JSX. En locales JSON sí es seguro (los keys usan `signoz` minúscula).
- **Validación en navegador:** Chrome MCP — `javascript_tool` para inspeccionar estado
  (`window.__...`, `location.search`, `localStorage`), `zoom` para ver colores de números,
  `browser_batch` para encadenar pasos. Si el screenshot da timeout, reintenta (renderer
  ocupado, no es la feature).

---

## Checklist por cambio de frontend

1. **Investiga** el renderer/flujo REAL (cuidado con impls duales y shapes V1/V2).
2. **Edita** preciso (Node para bulk preservando CRLF; Edit para puntual).
3. **Rebuild** imagen + recrear `signoz`.
4. **Valida** en vivo (login, navega, screenshot/zoom, inspecciona con javascript_tool).
5. **Commitea + push** (autorizado) cuando se vea funcionando; mensajes en español.

Memorias relacionadas: deploy loop del frontend, filtros Explorer V5, dashboards-as-code,
Docker Desktop lo abre el usuario.

## Qubi en el portal (panel del asistente)

- **El contexto de pantalla viaja por VARIOS caminos y hay que alimentarlos todos.**
  `ChatInput` fusiona `autoContexts` y los manda; los CHIPS sugeridos y el popover de ayuda
  son caminos APARTE. En ago-2026 los chips mandaban `handleSend(text)` sin contexto: escribir
  la frase funcionaba y tocar el chip con la misma frase no — el sintoma original que dio
  origen al contexto de pantalla, vivo por otra puerta. Al tocar este flujo, inventaria todos
  los emisores, no solo el que reporto el usuario.
- **Ayuda del asistente:** `container/AIAssistant/components/QubiHelp`. Solo anuncia lo que
  esta DESPLEGADO (misma regla que los chips: una capacidad que falla al primer clic es peor
  que no anunciarla). Calcula sus contextos igual que ConversationView y respeta
  `variant === 'page'` (ahi no hay pagina de fondo a la que referirse).
- **Tokens de color: usa los SEMANTICOS** (`--l1/--l2/--l3-foreground|background|border`,
  `--accent-*`), que se resuelven en ambos temas. Los crudos de paleta (`--bg-vanilla-*`,
  `--bg-ink-*`) dejan el texto ilegible en tema claro — se caza en el navegador, no con lint.
