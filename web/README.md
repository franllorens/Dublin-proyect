# Fallow Speciality Coffee: sitio + Fallow Club

Demo para presentarle a Fallow (Dublín). Es un proyecto Next.js 14 (App Router, TypeScript) que **ya incluye el backend** de `backend/fallow-wallet`: las rutas `/api/club/*` y `/api/apple/v1/*` están copiadas tal cual en `app/api`, y `src/lib`, `models/` y `supabase/` también. Un solo `npm run dev` levanta el sitio, la app del barista, el panel del dueño y la API.

| Ruta | Qué es |
| --- | --- |
| `/` | Sitio público (inglés, mobile-first) |
| `/staff` | PWA del barista: escáner, sello, canje, feed del día |
| `/owner` | Panel del dueño: KPIs, gráficos, listas, aviso al pase. **Datos de ejemplo.** |

## Correrlo en modo demo (sin cuentas)

```bash
cd web
npm install
npm run dev
```

Abrí http://localhost:3000. Sin variables de entorno todo el club corre **simulado en el navegador** (`localStorage` + `BroadcastChannel`, `lib/demo-store.ts`), con las mismas reglas que el backend: 9 sellos, sello de bienvenida, 10 minutos entre escaneos y un sello por story por semana. Lo que hagas en una vista aparece en las otras:

1. En `/`, sección *Fallow Club*: poné un nombre y tocá **Add to Apple Wallet**. La tarjeta entra al Wallet con resorte y aparece la pantalla de bloqueo. Después **Be the barista** estampa los sellos.
2. En `/staff` aparecen esa tarjeta y tres tarjetas de ejemplo. Tocá una para «escanearla»; si la volvés a tocar, se bloquea en naranja por el doble escaneo.
3. En `/owner` los KPIs suman lo que hiciste (`+n live`).

**Probar el hero a cualquier hora.** La compuerta del trailer se abre solo si hay algún local abierto según la hora de Dublín. Para mostrarlo fuera de horario:

- `/?at=wed-11:30`: abierto, con la compuerta subiendo.
- `/?at=sun-11:00`: solo Kilternan (fin de semana).
- `/?at=wed-19:30`: cerrado, con el cartel «BACK TMRW 07:00».

## Modo real (Apple Wallet + Google Wallet + Supabase)

1. Seguí `../backend/fallow-wallet/README.md`: proyecto de Supabase, Pass Type ID de Apple, issuer de Google y el script de la clase.
2. En Supabase corré `supabase/schema.sql` y además **`supabase/feedback.sql`**, la tabla nueva para «Tell the team privately».
3. Copiá `.env.example` a `.env.local` y completalo. El sitio pasa a modo real cuando existen `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `APP_BASE_URL` (`lib/mode.ts`). `NEXT_PUBLIC_FORCE_DEMO=1` vuelve a demo aunque estén cargadas.
4. `npm run build && npm start`, o deploy en Vercel. Apple exige HTTPS en `APP_BASE_URL`.

Qué cambia en modo real:

- **Add to Apple / Google Wallet** llama a `POST /api/club/join`. En iPhone abre el `.pkpass`, en Android el link de Google, y en desktop muestra los dos links. Si el servidor falla, cae a demo y lo avisa.
- **`/staff`** lista a los baristas de cada local (tabla `staff`, leída en el servidor) y pide el PIN, que vive en `sessionStorage`. Escaneo y canje pegan contra `POST /api/club/stamp` y `/api/club/redeem`.
- **Reseñas privadas** van a `POST /api/feedback`, una ruta nueva que guarda en `feedback`.
- **Be the barista** sigue siendo una simulación en el mockup: los sellos reales solo salen del escáner.
- **`/owner`** sigue con datos de ejemplo. Conectarlo a `stamp_events` / `redemptions` es el paso siguiente.

## Decisiones de diseño

- **Dirección: «la ventanilla».** Crema de carrocería como papel, verde bosque como estructura y rosa solo donde es rosa en la calle (sello, tablero, azulejos de Kilternan, La Marzocco). Tokens en `app/globals.css`, sin Tailwind.
- **Hero:** el trailer teardrop dibujado en SVG (`components/site/Trailer.tsx`). La compuerta tiene bisagra arriba, se ve su cara interna de madera, se prende la luz y aterriza el vaso. Sigue el horario real. El LCP es el texto del hero; la animación arranca después de hidratar.
- **Tipografías:**
  - Fraunces para el wordmark y los títulos, por sus terminales blandas y el contraste del rótulo. Recoleta no está en Google Fonts. Se instanció con fontTools (SOFT 70, opsz 72, wght 500–700): 33 KB en vez de 118 KB.
  - Antonio para las letras del tablero.
  - Instrument Sans para el texto.
- **Logo:** reconstrucción propia, no el archivo oficial. El wordmark son los contornos de Fraunces (opsz 72 / SOFT 50) en paths SVG; las astas están dibujadas a mano a partir de fotos del sello (`components/brand/Logo.tsx`).
- **Movimiento:** GSAP + ScrollTrigger, cargados recién cuando hacen falta (`lib/motion.ts`), y Lenis solo con puntero fino. Con `prefers-reduced-motion` todo aparece en su estado final.

## Reglas respetadas

- **Reseñas:** el link de Google y «Tell the team privately» se muestran siempre, juntos y para todos. Nunca se da un sello por una reseña.
- **Stories:** el sticker lleva `#Ad` visible, con la explicación de la guía de la CCPC y la ASAI.
- **Precios:** salen exactos de `data/menu.json`. Donde no hay versión fría va «–». La vitrina va sin precios.
- **Placeholders visibles:** fotos («Placeholder photo · replace»), notas de cata y precio de la bolsa («to confirm»). Los datos del panel están marcados como «Example data».
- **Footer:** «Concept demo by Workflowers. Photos are placeholders.» y `noindex`, porque no es el sitio oficial.

## Medido (build de producción, Lighthouse 13 mobile)

| Ruta | Performance | Accessibility | Best practices |
| --- | --- | --- | --- |
| `/` | 96–98 | 100 | 100 |
| `/staff` | 99 | 100 | 100 |
| `/owner` | 99 | 100 | 100 |

SEO da 60–63 solo por el `noindex` intencional de la demo. Para producción hay que sacar `robots` de `app/layout.tsx`.

## Pendiente / a confirmar con Fallow

- Archivo vectorial original del logo y la tipografía real.
- Fotos propias para reemplazar los placeholders (`assets/`).
- Place IDs de Google de cada local, para el link directo a «write a review» (`lib/hours.ts → reviewUrl`).
- Pin exacto de Nova Atria y si el menú es igual en los 3 locales.
- Notas de cata y precio de la bolsa del Fallow Blend.
- Del backend:
  - Imagen de tira con los sellos dibujados: el mockup ya muestra el diseño.
  - Webhook de Instagram para el sello por story.
  - Endpoint de avisos masivos para el composer de `/owner`.

## Estructura

```
web/
  app/            page.tsx (sitio), staff/, owner/, api/ (backend + feedback), fonts/
  components/     brand/ (logo), site/ (secciones), club/ (Wallet + pase), staff/, owner/
  lib/            hours.ts (hora de Dublín), demo-store.ts, motion.ts, mode.ts, qr.ts, sample.ts
  data/           copia de ../data (precios, locales, marca)
  assets/         fotos placeholder
  src/lib, models/, supabase/, scripts/   backend fallow-wallet
```
