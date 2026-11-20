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

## Deploys

- **Railway** (servicio `the-coffee-shot`, root `coffee-shot/web`): la app completa con Node, incluido el backend de Wallet. Se despliega sola con cada push a la rama.
- **Cloudflare**: https://the-coffee-shot.fallow-web.workers.dev. Es la exportación estática del sitio en modo demo: `/`, `/staff` y `/owner` funcionan igual, pero no están las rutas `/api` (Wallet, sellos y feedback reales siguen en Railway). Se publica a mano:

  ```bash
  cd coffee-shot/web
  CLOUDFLARE_API_TOKEN=… npm run deploy:cloudflare
  ```

  El token necesita *Workers Scripts: Edit* y *Workers KV Storage: Edit*. En una sesión de Claude Code en la nube el token ya está guardado en el entorno: ahí basta `CLOUDFLARE_API_TOKEN=proxy-injected`. El script ([`web/scripts/cloudflare/deploy.mjs`](web/scripts/cloudflare/deploy.mjs)) sube `out/` a Workers KV y publica un Worker que lo sirve. No usa `wrangler deploy` porque, en las sesiones en la nube, el proxy reemplaza el token temporal con el que Wrangler sube los archivos.

_Concept demo by Workflowers. Photos are placeholders. El sello es una reconstrucción del archivo del logo, no el vector original._
