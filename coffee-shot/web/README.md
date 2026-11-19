# The Coffee Shot: sitio + The Coffee Shot Club

Demo para The Coffee Shot (The Plaza, Beacon South Quarter, Sandyford, Dublin 18): sitio público, club de sellos en Apple/Google Wallet con «tu pedido de siempre», PWA del barista y panel del dueño.

**Rediseño con la skill [taste-skill](https://github.com/Leonxlnx/taste-skill)** (`design-taste-frontend` 2.5.1, instalada en `.claude/skills/` del repo). La home se reconstruyó siguiendo su método para un «place»: fotos reales, una sección por pantalla, paleta y tipografía sorteadas, sin ilustraciones ni efectos, y verificada por su checker en un Chrome real. Resultado: **GATE: PASS** (detalle abajo).

| Ruta | Qué es | Cómo está hecha |
| --- | --- | --- |
| `/` | Sitio público (inglés, mobile-first) | **HTML estático** con el kit de la skill: `public/index.html` + `public/assets` (copias exactas del kit) |
| `/club/card` | La tarjeta del club: elegís Apple o Google Wallet y ves la tarjeta entrar al Wallet; «Be the barista» llena los vasitos | Next.js (React), llega desde el formulario de la home con nombre y pedido precargados |
| `/menu` | Las pizarras completas, escritas con tiza | Next.js (React) |
| `/staff` | PWA del barista: escáner, sello, canje y el pedido de siempre en grande | Next.js (React) |
| `/owner` | Panel del dueño: KPIs, horarios, pedidos guardados, aviso al pase. **Datos de ejemplo.** | Next.js (React) |
| `/api/*` | Backend de Wallet (Apple + Google) y Supabase | Route handlers |

¿Por qué la home es estática? El `system.js` del kit manipula el DOM (la hoja del menú en el celular, el horario de hoy, la barra de acciones, el momento animado). Si la hidrata React, los dos se pisan. `next.config.mjs` reescribe `/` a `/index.html`. Todo lo demás sigue en Next.js.

## Correrlo

```bash
cd coffee-shot/web
npm install
npm run build && npm start      # o npm run dev
```

Abrí http://localhost:3000. Ojo: `next start` solo sirve los archivos de `public/` que existían al compilar; si agregás uno, volvé a compilar.

Modo demo y modo real del club: igual que antes. Sin variables de entorno, la tarjeta y los sellos se simulan en el navegador (`lib/demo-store.ts`). Con `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `APP_BASE_URL` pasa a modo real: `supabase/schema.sql` trae `customers.usual`, y `POST /api/club/join` acepta `usual`. Ver la sección «Modo real» del README de Fallow (`../../web/README.md`).

## El reporte de la skill

**GATE: PASS** (corrido de nuevo sobre la versión final: consistency a 1440 y 390, el paseo a 320, layout a 1440 y 390, y copy-lint).

**Waivers** (5, el máximo; en `.taste-skill/waivers.json`):

| Check | Por qué |
| --- | --- |
| `copy-slop-word` «beacon» | «Beacon South Quarter» es el nombre real del lugar. Aparece una sola vez, en la dirección. |
| `phone-number` | Es el teléfono público real del café, y el brief lo da. |
| `menu-toggle` | Falso positivo. Después del clic, el checker relee el primer botón llamado «menu», que es el expansor que agrega `system.js`. El botón real sí pasa a `aria-expanded="true"` (verificado con `element.click()`). |
| `hero-lines` | El check estira el h1 a 47 caracteres. El real tiene 28 y ocupa 1 línea a 1440 y 2 a 390. |
| `section-gaps` (390, visita/menú) | En celular, la visita necesita dos pantallas (dirección grande, panel y fachada) y el kit limita la foto a 4:5, así que el pie de la segunda pantalla queda abierto. |

**Lo sorteado:**

- **Tipo de página:** place (café).
- **Paleta:** `brand`, con los colores del café:
  - el crema del cartel (`#f5efe3`);
  - el negro del sello y los vasos (`#141414`);
  - el dorado del sello, oscurecido a `#857033` para que el texto de los botones pase contraste.
- **Tipografía:** `besley` (Besley + Albert Sans). La primera del sorteo, `bricolage`, es una grotesca juguetona que choca con el sello de serif clásica dorada.
- **Piezas:**
  - hero: el de place, que la skill no sortea;
  - nav: `nav-split`;
  - footer: `footer-columns`;
  - ritmo: `surface-pairs`;
  - botones: `block`;
  - marca: el sello real del café en vez de la marca sorteada (`arc`).
- **Composiciones:**
  - oferta: `pair`;
  - el local: `bleed`, sin usar (la página compacta no tiene esa sección);
  - momento tipográfico: `name`, re-sorteado a `address` porque el formulario del club ocupa el lugar del cierre.
- **Momento animado:** salió `photo-chapters` (3 pantallas), que dejaba la página en 10 pantallas en celular cuando el máximo para un place es 7. Lo re-sorteé con `--exclude photo-chapters` y salió `picture-develops`: la foto de la fachada se «revela» al entrar en pantalla.
- **Sin** efectos, scroll-jacking, carruseles ni fade-ins.

**Voz:** «sensory facts, second person, present tense» (`copy-registers.md` 7), en la voz del dueño detrás del mostrador. Sin adjetivos de virtud ni juegos de palabras con «shot».

**Resultados de los otros checks:**

- **Checker completo** (1440, 1024, 820, 768, 390): a 1440 y 390 solo quedan los waivers y un falso positivo de hover.
  - `hover-move` (fotos del menú): verifiqué con el mismo Chromium que la foto hace `scale(1.03)` en hover.
  - Tablet y 1024 no entran en el gate. A 768 y 820 queda `menu-toggle` (el mismo falso positivo). A 1024 queda `no-visual` en el menú: las dos fotos cubren 13% de la pantalla, por debajo del 15%.
- **Layout check:** sin hallazgos en los cinco tamaños.
- **perf.mjs:** 0 FAIL.
  - 468 KiB en total y LCP de 96 ms relativo.
  - Dos tipografías servidas desde el sitio (67 KiB). Uso archivos propios en lugar de Google Fonts porque esa hoja bloqueaba los scripts en el Chrome del checker, y además así no hay problema de GDPR.
- **Lighthouse mobile:** Performance 94, Accessibility 100, Best practices 100. SEO 63, solo por el `noindex` de la demo.

**Datos asumidos** (marcados `data-assumed`; el checker los lista):

- Todos los precios. Salen de una foto vieja de las pizarras, así que hay que confirmarlos.
- En `/menu` (fuera del gate), el café caliente sin precio legible muestra «€ –».

**Lo que tiene que dar el cliente:**

1. **Foto actual de las pizarras con precios.**
2. Fotos propias. Hoy son fotos de clientes de Google Maps y Tripadvisor (`data-source="phone"`, crédito en el footer y en `credits.html`). Lista de tomas de la skill:
   - la fachada de frente;
   - el local desde la puerta;
   - el mostrador con la máquina;
   - tres productos sobre una misma superficie;
   - manos trabajando;
   - un detalle.

   Con luz de ventana, sin flash.
3. Cuál es el Instagram oficial.
4. El vector del logo.
5. Dominio (`coffeeshot.ie` no resuelve): el `canonical` queda comentado hasta tenerlo.

## Estructura

```
coffee-shot/web/
  public/index.html          la home (taste-skill), con el plan y el deal en un comentario al principio del <body>
  public/assets/             copias exactas del kit (system, motion, layout, ui, moments/picture-develops)
  public/fonts/              Besley y Albert Sans (OFL), latin y latin-ext
  public/img/                fotos en WebP (varios anchos, recorte de celular del hero), logo
  public/credits.html, share.jpg
  app/club/card, app/menu, app/staff, app/owner, app/api
  components/club (Wallet + pase), components/site (MenuBoard, SiteBar), components/brand (sello SVG)
  .taste-skill/waivers.json, history.json   (el resto de .taste-skill es temporal y está en .gitignore)
```

Para volver a correr el gate (necesita Node 22 y Chromium; como root hace falta un wrapper con `--no-sandbox` en `CHROME_PATH`):

```bash
node ../../.claude/skills/design-taste-frontend/scripts/gate.mjs --start http://localhost:3000/ --kind place --category "café" --primary "Join the club" --new
```

```bash
node ../../.claude/skills/design-taste-frontend/scripts/gate.mjs http://localhost:3000/
```
