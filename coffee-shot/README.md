# The Coffee Shot · web + The Coffee Shot Club

Demo concept para The Coffee Shot (The Plaza, Beacon South Quarter, Sandyford): sitio público mobile-first, club de sellos en Apple/Google Wallet con «tu pedido de siempre», PWA del barista y panel del dueño. Mismo alcance que Fallow, en su propia carpeta y con su propio deploy.

| Carpeta | Qué hay |
| --- | --- |
| [`web/`](web/) | **La app** (Next.js 14 + TypeScript), con el backend de Wallet incluido. Ver [`web/README.md`](web/README.md) |
| [`kit/`](kit/) | Dossier de marca, logo oficial (400 px), fotos originales de Google/TripAdvisor |
| [`screenshots/`](screenshots/) | Capturas finales (sitio, `/staff`, `/owner` en mobile y desktop) y reportes de Lighthouse |

## Arranque rápido (modo demo, sin cuentas)

```bash
cd coffee-shot/web
npm install
npm run dev
```

Abrí http://localhost:3000 · `/staff` · `/owner`.

_Concept demo by Workflowers. Photos are placeholders. El sello es una reconstrucción del archivo del logo, no el vector original._
