# Fallow Speciality Coffee: sitio + Fallow Club

Demo para presentarle a Fallow (Dublín). Next.js 14 (App Router, TypeScript) exportado como **sitio estático para Cloudflare Pages**. La API de Wallet (Apple/Google) vive aparte, en `../backend/fallow-wallet`, pensada para Railway.

| Ruta | Qué es |
| --- | --- |
| `/` | Sitio público (inglés, mobile-first), con **Order ahead** para pedir desde la oficina |
| `/staff` | PWA del barista: pedidos entrantes, escáner, sello, canje, feed del día |
| `/owner` | Panel del dueño: KPIs, gráficos, listas, aviso al pase. **Datos de ejemplo.** |

## Correrlo en modo demo (sin cuentas)

```bash
cd web
npm install
npm run dev
```

Abrí http://localhost:3000. Sin `NEXT_PUBLIC_API_URL` todo el club corre **simulado en el navegador** (`localStorage` + `BroadcastChannel`, `lib/demo-store.ts`), con las mismas reglas que el backend: 9 sellos, sello de bienvenida, 10 minutos entre escaneos y un sello por story por semana. Lo que hagas en una vista aparece en las otras:

1. En `/`, sección *Fallow Club*: poné un nombre y tocá **Add to Apple Wallet**. La tarjeta entra al Wallet con resorte y aparece la pantalla de bloqueo. Después **Be the barista** estampa los sellos.
2. En `/staff` aparecen esa tarjeta y tres tarjetas de ejemplo. Tocá una para «escanearla»; si la volvés a tocar, se bloquea en naranja por el doble escaneo.
3. En `/owner` los KPIs suman lo que hiciste (`+n live`).

**Con dos teléfonos (lo mejor para presentar).** En el teléfono del cliente abrí el sitio y creá la tarjeta en *Fallow Club*. En otro teléfono abrí `/staff`, tocá *Scan a card* y apuntá al QR de la tarjeta. El sello llega al primer teléfono con la misma animación y notificación que «Be the barista», y el barista ve el resultado grande sobre la cámara. La misma tarjeta vuelve a contar recién cuando sale del cuadro y se la muestra otra vez. Las tarjetas creadas en el sitio no tienen el bloqueo de 10 minutos, así se puede llegar al café gratis en la demo. Las tarjetas de ejemplo (Aoife, Conor, Niamh) sí lo tienen, para mostrar la protección contra el doble escaneo. Esto funciona porque `server.mjs`, en Railway, pasa los sellos de un teléfono al otro (ver abajo).

**Order ahead** (sección justo después del hero): el oficinista elige el local, el café (precios exactos del tablero, frío o caliente, leche, shot, syrup) y algo de la vitrina, que va «priced at the hatch» porque no hay precios publicados. Después elige la hora y su nombre y envía el pedido. Paga en la ventanilla. En demo, abrí `/staff` en otra pestaña, elegí el mismo local y vas a ver entrar el ticket (por ejemplo «N-01»). Cada botón del barista («Start making» → «On the counter» → «Collected») actualiza en vivo el ticket del cliente. Si nadie lo toca, el demo avanza solo en unos segundos.

**Probar el hero a cualquier hora.** La compuerta del trailer se abre solo si hay algún local abierto según la hora de Dublín. Para mostrarlo fuera de horario:

- `/?at=wed-11:30`: abierto, con la compuerta subiendo.
- `/?at=sun-11:00`: solo Kilternan (fin de semana).
- `/?at=wed-19:30`: cerrado, con el cartel «BACK TMRW 07:00».

## Publicar en Railway (rama `main`)

El servicio **Dublin-proyect** del proyecto `perfect-mercy` en Railway despliega `web/` desde la rama `main` en cada push: https://dublin-proyect-production.up.railway.app. Railpack corre `npm run build`, que genera `out/`, y después `npm start` (`node server.mjs`). Ese servidor sirve la carpeta en `$PORT` (8080 por defecto) y además hace de puente del demo entre teléfonos (`/api/demo/listen`, `/api/demo/request` y `/api/demo/respond`): guarda todo en memoria, no persiste nada y se reinicia con cada deploy. En Cloudflare Pages no hay puente, así que ahí el escaneo entre teléfonos no funciona; en el mismo navegador, sí. Para el modo real, cargá `NEXT_PUBLIC_API_URL` en las variables del servicio y volvé a desplegar.

## Publicar en Cloudflare Pages

`npm run build` genera `out/`, que es lo que se sube al proyecto de Pages **`fallow-coffee`** (https://fallow-coffee.pages.dev). Hay tres formas:

1. **Automática con GitHub Actions** (`.github/workflows/deploy-pages.yml`): cada push a `main` que toque `web/` compila y despliega. Mientras no estén cargados los secretos, el workflow se saltea sin fallar. En GitHub, *Settings → Secrets and variables → Actions*, cargá los secretos `CLOUDFLARE_API_TOKEN` (con permiso *Cloudflare Pages: Edit*) y `CLOUDFLARE_ACCOUNT_ID`. Opcional: la variable `NEXT_PUBLIC_API_URL`.
2. **Desde tu máquina:** `npm run deploy:pages`, con `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en el entorno.
3. **A mano:** en el panel de Cloudflare, *Workers & Pages → fallow-coffee → Create deployment*, y arrastrás la carpeta `out/` o su zip.

`public/_headers` define la caché de `/_next/static` y `noindex`. Las fotos de `assets/` están pre-redimensionadas a WebP (960 y 640 px), porque Pages no optimiza imágenes. Los originales están en `../assets/`.

## Modo real (Apple Wallet + Google Wallet)

1. Desplegá `../backend/fallow-wallet` (en Railway) siguiendo su README, incluida `supabase/feedback.sql`. En el backend, `CORS_ORIGINS` tiene que incluir la URL del sitio, por ejemplo `https://fallow-coffee.pages.dev`.
2. Compilá el sitio con `NEXT_PUBLIC_API_URL=https://<tu-api>.up.railway.app` (`lib/mode.ts`). `NEXT_PUBLIC_FORCE_DEMO=1` vuelve a demo aunque esté cargada.

Qué cambia en modo real:

- **Add to Apple / Google Wallet** llama a `POST {API}/api/club/join`. En iPhone abre el `.pkpass`, en Android el link de Google, y en desktop muestra los dos links. Si la API falla, cae a demo y lo avisa.
- **`/staff`** pide la lista de baristas a `GET {API}/api/club/staff` y el PIN, que vive en `sessionStorage`. Escaneo y canje pegan contra `POST {API}/api/club/stamp` y `/api/club/redeem`.
- **Reseñas privadas** van a `POST {API}/api/feedback`.
- **Order ahead** crea el pedido con `POST {API}/api/orders` y el ticket del cliente consulta `GET {API}/api/orders/:id` cada 8 s. El barista ve su cola con `POST {API}/api/orders/queue` (cada 10 s, con PIN) y la avanza con `POST {API}/api/orders/:id/status`. Necesita `supabase/orders.sql`.
- **Be the barista** sigue siendo una simulación en el mockup: los sellos reales solo salen del escáner.
- **`/owner`** sigue con datos de ejemplo. Conectarlo a la base es el paso siguiente.

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

SEO da 60–63 solo por el `noindex` intencional de la demo. Para producción hay que sacar `robots` de `app/layout.tsx` y el `X-Robots-Tag` de `public/_headers`.

Medido sobre el build con servidor de Next; el export estático sirve los mismos archivos.

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
  app/            page.tsx (sitio), staff/, owner/, fonts/
  components/     brand/ (logo), site/ (secciones), club/ (Wallet + pase), staff/, owner/
  lib/            hours.ts (hora de Dublín), demo-store.ts, motion.ts, mode.ts, qr.ts, sample.ts
  data/           copia de ../data (precios, locales, marca)
  assets/         fotos placeholder en WebP
  public/         íconos, manifest y service worker del barista, _headers de Pages
```
