# Demos de cafés en Dublín · Workflowers

Dos demos independientes en el mismo repo, cada una con su propio deploy:

| Proyecto | Carpeta | Deploy (Railway, proyecto `perfect-mercy`) | Cloudflare |
| --- | --- | --- | --- |
| Fallow Speciality Coffee | [`web/`](web/) (más el kit en la raíz) | servicio `Dublin-proyect`, root `web` | — |
| The Coffee Shot | [`coffee-shot/`](coffee-shot/) | servicio `the-coffee-shot`, root `coffee-shot/web` | Worker `the-coffee-shot`: https://the-coffee-shot.fallow-web.workers.dev (sitio estático en modo demo) |

Skills de Claude Code del repo: [`.claude/skills/design-taste-frontend`](.claude/skills/design-taste-frontend) ([taste-skill](https://github.com/Leonxlnx/taste-skill) 2.5.1, MIT). Se probó un rediseño de The Coffee Shot con ella (commit 9360d9e) y se descartó: el sitio volvió a la versión anterior.

---

# Fallow Speciality Coffee · web + Fallow Club

Demo concept para Fallow (Dublín): sitio público mobile-first, club de sellos en Apple/Google Wallet, PWA del barista y panel del dueño.

| Carpeta | Qué hay |
| --- | --- |
| [`web/`](web/) | **La app** (Next.js 14 + TypeScript). Incluye el backend de Wallet. Ver [`web/README.md`](web/README.md) |
| [`screenshots/`](screenshots/) | Capturas finales (sitio, `/staff`, `/owner` en mobile y desktop) y reportes de Lighthouse |
| `backend/fallow-wallet/` | Backend original de Apple/Google Wallet + Supabase (ya copiado dentro de `web/`) |
| `data/`, `assets/`, `reference/` | Kit de marca: datos verificados, fotos placeholder, dossier y demo anterior |
| `PROMPT.md` | El brief |

## Arranque rápido (modo demo, sin cuentas)

```bash
cd web
npm install
npm run dev
```

Abrí http://localhost:3000 · `/staff` · `/owner`. Para ver el trailer abierto a cualquier hora: `/?at=wed-11:30`.

Modo real (Supabase + Apple + Google Wallet): ver `web/README.md`.

_Concept demo by Workflowers. Photos are placeholders. El logo es una reconstrucción, no el archivo oficial._
