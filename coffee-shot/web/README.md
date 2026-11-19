# The Coffee Shot: sitio + The Coffee Shot Club

Demo para presentarle a The Coffee Shot (Beacon South Quarter, Sandyford, Dublin 18). Mismo alcance que Fallow: sitio público mobile-first, club de sellos en Apple/Google Wallet, PWA del barista y panel del dueño. Es un proyecto Next.js 14 (App Router, TypeScript) que arrancó como copia de `../../web` (Fallow) y **ya incluye el backend de Wallet**: rutas `/api/club/*`, `/api/apple/v1/*` y `/api/feedback`, más `src/lib`, `models/` y `supabase/`. Un solo `npm run dev` levanta todo.

| Ruta | Qué es |
| --- | --- |
| `/` | Sitio público (inglés, mobile-first) |
| `/staff` | PWA del barista: escáner, sello, canje, feed del día y **el pedido de siempre del cliente** |
| `/owner` | Panel del dueño: KPIs, gráficos, listas, aviso al pase. **Datos de ejemplo.** |

## Correrlo en modo demo (sin cuentas)

```bash
cd coffee-shot/web
npm install
npm run dev
```

Abrí http://localhost:3000. Sin variables de entorno el club corre **simulado en el navegador** (`lib/demo-store.ts`, `localStorage` + `BroadcastChannel`), con las mismas reglas que el backend: 9 sellos, sello de bienvenida, 10 minutos entre escaneos y un sello por story por semana. Lo que hagas en una vista aparece en las otras:

1. En `/`, sección *Club*: poné un nombre y **tu pedido de siempre** y tocá **Add to Apple Wallet**. La tarjeta negra entra al Wallet y la pantalla de bloqueo saluda con tu pedido. **Be the barista: pour a shot** llena los vasitos de la tarjeta.
2. En `/staff`, tocá una tarjeta de ejemplo para «escanearla»: aparece en grande su pedido de siempre. Si la volvés a tocar, se bloquea en naranja por el doble escaneo.
3. En `/owner` los KPIs suman lo que hiciste (`+n live`), y los pedidos guardados entran en «Saved usuals».

**Probar el estado en vivo a cualquier hora:** `/?at=wed-11:30` (abierto), `/?at=sun-16:45` (cierra pronto), `/?at=sun-19:00` (cerrado).

## Modo real (Apple Wallet + Google Wallet + Supabase)

Es el mismo backend que Fallow, multi-tenant, con el tenant `coffeeshot` y un campo nuevo: **`customers.usual`**.

1. Seguí `../../backend/fallow-wallet/README.md` para crear el proyecto de Supabase, el Pass Type ID de Apple y el issuer de Google. Para este cliente usá `pass.com.workflowers.coffeeshot` (o el que corresponda).
2. En Supabase corré `supabase/schema.sql`, que ya trae la columna `usual` y el seed de The Coffee Shot con su ubicación, y después `supabase/feedback.sql`.
   - Si reusás la base de Fallow, en lugar del schema completo corré esto, más el seed del final de `schema.sql`:
     ```sql
     alter table customers add column usual text;
     ```
3. Copiá `.env.example` a `.env.local` y completalo. El sitio pasa a modo real cuando existen `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `APP_BASE_URL` (`lib/mode.ts`). `NEXT_PUBLIC_FORCE_DEMO=1` fuerza el modo demo.
4. Diseño de la tarjeta en Google: `npm run google:class https://<host>/coffeeshot-logo.png`. El logo ya está en `public/`.

Qué cambia en modo real:

- `POST /api/club/join` acepta `usual`, lo guarda en `customers` y lo muestra en el pase:
  - Apple: campo *YOUR USUAL*.
  - Google: *text module*.
- `POST /api/club/stamp` devuelve `name` y `usual`, y la PWA del barista lo muestra en grande en cada escaneo.
- El resto es igual que en Fallow: reseñas privadas a `/api/feedback`, y «Be the barista» sigue siendo solo una simulación en el mockup.
- `/owner` sigue con datos de ejemplo.

## Decisiones de diseño

- **Dirección: «el mostrador».**
  - Azulejo subway blanco como papel.
  - Negro sello para las piezas de marca: el vaso, la tarjeta y el footer.
  - Pizarra con tiza para el menú.
  - Dorado solo como línea, igual que en el vaso y el cartel.
  - Cobre de las lámparas para el calor.
  - Tokens en `app/globals.css`, sin Tailwind.
- **Hero:** su vaso takeaway negro con el sello dorado, bajo una lámpara de cobre que se balancea y se prende. El sello «sirve su propio shot»: el anillo se enrosca, el vasito se llena, aparece el grano y sube el vapor. Todo es CSS, sin JS. El LCP es texto y no espera a la animación.
- **El cartel de la fachada** (panel crema con doble filete dorado) abre la página y cierra el footer.
- **Las pizarras:** dos tableros como los de atrás del mostrador, uno grande (Coffee & Tea | Sandwiches) y uno angosto (Iced + Lately). Cada línea se escribe con tiza al entrar en pantalla (`ChalkReveal`).
- **El club:** cada sello es un vasito de shot que se llena de espresso con crema. Se suma **«your usual»**, porque lo que más repiten las reseñas es que el staff sabe el nombre y el pedido de cada uno (cita de TripAdvisor en la sección).
- **Tipografías:**
  - Cinzel para el cartel, el sello y las etiquetas (capitales tipo Trajan, cerca de la serif dorada real).
  - Cormorant Garamond para los títulos.
  - Amatic SC 700 para la tiza: es la mayúscula angosta y alta con la que escriben las pizarras.
  - Jost para el texto.
  - Solo Jost se precarga; el resto entra con `swap`.
- **Logo:** el sello está redibujado en SVG (`components/brand/Seal.tsx`) a partir del archivo oficial de 400 px del kit, en dos versiones:
  - «print»: anillo negro y campo blanco.
  - «line»: dorado sobre negro, como en el vaso.
  - No es el vector original.

## Reglas respetadas

- **Reseñas:** el link de Google y «Tell the team privately» van siempre juntos y para todos. Nunca se da un sello por una reseña.
- **Stories:** el sticker lleva `#Ad` visible, con la explicación de la CCPC y la ASAI.
- **Precios:** salen de `data/menu.json`, leídos de una foto vieja de las pizarras, y se marcan como **a confirmar** en la misma pizarra. Donde la foto no deja leer el precio va «€ –». La vitrina y lo nuevo de Instagram van sin precios.
- **Citas:** solo reales y atribuidas: Georgina Campbell’s Ireland Guide, una reseña de TripAdvisor y el propio texto del café en Facebook.
- **Placeholders visibles:**
  - Fotos («Placeholder photo · replace», sacadas de Google y TripAdvisor).
  - Número de local, cierre del domingo, blend Red Rock e Instagram oficial («to confirm»).
  - Datos del panel («Example data»).
- **Footer:** «Concept demo by Workflowers. Photos are placeholders.» y `noindex`.

## Medido (build de producción, Lighthouse 12 mobile)

| Ruta | Performance | Accessibility | Best practices |
| --- | --- | --- | --- |
| `/` | 94–95 | 100 | 100 |
| `/staff` | 98 | 100 | 100 |
| `/owner` | 98 | 100 | 100 |

SEO da 60–63 solo por el `noindex` intencional de la demo. Reportes en `../screenshots/lighthouse-*.html`.

## Pendiente / a confirmar con The Coffee Shot

- **Menú actual con precios:** una foto nítida de las pizarras de hoy. Es lo más importante; se cambia en `data/menu.json`.
- Dirección exacta (¿Unit 2 The Plaza o Unit 13 The Courtyard?) y cierre del domingo (¿17:00 o 18:00?).
- ¿Cuál es el Instagram oficial, `@thecoffeeshot_bsq` o `@thecoffeeshotsandyford`? Se cambia en `lib/brand.ts`.
- ¿Sigue el Red Rock de Badger & Dodo? ¿Venden grano?
- Vector original del logo y fotos propias.
- Place ID de Google para el link directo a «write a review» (`lib/hours.ts → reviewUrl`). Hoy apunta a su ficha.
- Del backend, igual que en Fallow:
  - Tira de la tarjeta con los vasitos dibujados.
  - Webhook de Instagram.
  - Endpoint de avisos masivos.

## Estructura

```
coffee-shot/
  kit/          dossier de marca, logo oficial, fotos originales, texto extraído
  screenshots/  capturas finales + reportes de Lighthouse
  web/
    app/          page.tsx (sitio), staff/, owner/, api/ (backend + feedback)
    components/   brand/ (sello, cartel), site/ (secciones), club/ (Wallet + pase), staff/, owner/
    lib/          hours.ts (hora de Dublín), demo-store.ts, brand.ts, motion.ts, mode.ts, qr.ts, sample.ts
    data/         brand.json, location.json, menu.json
    assets/       fotos placeholder optimizadas
    src/lib, models/coffeeshot.pass, supabase/, scripts/   backend de Wallet
```
