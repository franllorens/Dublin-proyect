# Fallow Speciality Coffee · web + Fallow Club

Demo concept para Fallow (Dublín): sitio público mobile-first, club de sellos en Apple/Google Wallet, PWA del barista y panel del dueño.

| Carpeta | Qué hay |
| --- | --- |
| [`web/`](web/) | **El sitio** (Next.js 14 + TypeScript, export estático para Cloudflare Pages): sitio público, `/staff` y `/owner`. Ver [`web/README.md`](web/README.md) |
| [`screenshots/`](screenshots/) | Capturas finales (sitio, `/staff`, `/owner` en mobile y desktop) y reportes de Lighthouse |
| `backend/fallow-wallet/` | **La API** de Apple/Google Wallet (Next.js route handlers), pensada para Railway |
| `data/`, `assets/`, `reference/` | Kit de marca: datos verificados, fotos placeholder, dossier y demo anterior |
| `PROMPT.md` | El brief |

## Arranque rápido (modo demo, sin cuentas)

```bash
cd web
npm install
npm run dev
```

Abrí http://localhost:3000 · `/staff` · `/owner`. Para ver el trailer abierto a cualquier hora: `/?at=wed-11:30`.

Publicación: el sitio va a Cloudflare Pages (proyecto `fallow-coffee`, deploy automático con `.github/workflows/deploy-pages.yml`) y la API a Railway. Modo real: ver `web/README.md`.

_Concept demo by Workflowers. Photos are placeholders. El logo es una reconstrucción, no el archivo oficial._
