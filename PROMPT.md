# Prompt para Claude Code: web + club de Fallow Speciality Coffee

> Copiá todo lo que está debajo de la línea y pegalo en Claude Code, abierto en la carpeta de este kit.

---

Vas a construir el sitio web de **Fallow Speciality Coffee** (Dublín) y su club de fidelización **Fallow Club**. Es una demo para ir a vendérsela al dueño, así que tiene que ser lo mejor que hayas diseñado: que la abra en el celular y diga «esto es Fallow». La versión actual (`reference/current-demo-v2.html`) es correcta pero segura. Tu trabajo es superarla con claridad, no maquillarla.

## Leé esto primero, en este orden
1. `reference/fallow-brand-dossier.html`: identidad completa (logo, paleta, tipografía, elementos firma, locales, historia, tono). Es la fuente de verdad.
2. `data/brand.json`, `data/menu.json`, `data/locations.json`: datos verificados. **Precios exactos: no inventes ni redondees.**
3. `assets/`: fotos reales, foto del tablero de precios y logo reconstruido.
4. `reference/current-demo-v2.html`: la demo a superar. Mirala, entendé los flujos y después olvidate de su layout.
5. `backend/fallow-wallet/`: backend real de Apple/Google Wallet (Next.js route handlers + Supabase). El frontend se conecta a estos endpoints.

Si tenés disponible la skill `frontend-design`, cargala antes de diseñar.

## Quién es Fallow (resumen)
- Café de especialidad **para llevar**, sin salón: dos trailers teardrop vintage color crema en Sandyford Business Park (Bizquip y Nova Atria) y un drive-thru en Kilternan (contenedor verde con fachada de azulejos rosa).
- Clientes: oficinistas del parque empresarial (Meta, Salesforce, Google al lado), filas al mediodía. En Kilternan, además, familias y el club de rugby los fines de semana.
- Marca: verde bosque `#173F35`, rosa pastel `#DFB0BB`, crema `#F3ECDD`, teal `#0B3D5C` (aproximados). Wordmark serif en minúscula «fallow» con astas de ciervo arriba. Sello circular rosa en vasos blancos. La La Marzocco rosa. El tablero de letras rosa con letras verdes.
- Blend propio: 50% Colombia y 50% Guatemala, tostado en exclusiva por Full Circle Roasters. Lema de la bolsa: «FOLLOW THE FALLOW».
- Tono: inglés, cálido, frases cortas, comunidad.

## Qué construir

### Stack
- Next.js 14 (App Router) + TypeScript, en una carpeta nueva `web/`. Tiene que poder convivir con el backend o fusionarse con él (mismo proyecto Next.js, rutas `/api/club/*` ya escritas).
- Motion: GSAP + ScrollTrigger, o Framer Motion, más Lenis para el smooth scroll. Elegí uno y usalo con criterio.
- Tipografía por Google Fonts. El wordmark real no está confirmado: buscá una serif con terminales redondeadas que se acerque, como Fraunces con SOFT 100 o Recoleta, y justificá la elección.
- Sin Tailwind por defecto genérico: definí tokens de diseño propios (CSS variables) a partir de la paleta de la marca.

### El sitio público (en inglés, mobile-first: el 80% lo va a ver desde el celular escaneando un QR)
1. **Hero.** Lo primero que se ve tiene que ser inconfundiblemente Fallow. Las ideas que espero que explores (elegí una y ejecutala impecable):
   - El vaso con el sello rosa en primer plano y el trailer detrás, con parallax en capas: recortá el vaso de la foto, o reconstruí el trailer con ilustración o CSS.
   - El trailer crema que se abre: la ventanilla sube y aparece el menú.
   - Las astas de ciervo que se dibujan (SVG stroke animation) y se convierten en el logo.

   Debajo va el estado en vivo: «Open now at Nova Atria · till 15:00», calculado con la hora de Dublín y los horarios de `locations.json`.
2. **Los 3 locales.** Mostrá el formato de cada uno (trailer, trailer, drive-thru), el estado abierto/cerrado en vivo, el horario y un link a Google Maps. Que se note que Kilternan es otra cosa (drive-thru, abre los fines de semana).
3. **El menú como tablero de letras.** Es el momento firma: pegboard rosa con letras verdes condensadas que se colocan una por una al entrar en pantalla, y un toggle Hot/Iced que da vuelta los precios como fichas. Precios exactos de `menu.json`; donde no hay versión fría va un «–». Abajo, la vitrina (`cabinet_no_prices`) sin precios.
4. **Fallow Blend.** Mostrá el origen de forma visual (50/50 Colombia y Guatemala), el tostador local y la exclusividad.
5. **Fallow Club.** Nueve cafés y el décimo gratis, en Apple o Google Wallet, sin app.
   - Mockup de iPhone con el Wallet. Al tocar «Add to Apple Wallet», la tarjeta entra al stack con una animación tipo resorte y aparece la notificación en la pantalla de bloqueo.
   - Botón para que el visitante haga de barista y vea los sellos «estamparse» con el sello rosa: rotación, escala y un poco de tinta.
   - En producción el botón llama a `POST /api/club/join`. Si no hay variables de entorno, cae a modo demo simulado. Implementá los dos caminos.
6. **Stories.** «Share your cup, get a stamp»: sticker con @fallowspecialitycoffee y **#Ad** visible, y el flujo en 4 pasos (story → Meta avisa → DM con link → +1 sello). Una vez por semana.
7. **Reseñas.** «How was your coffee?»: un link a Google Maps y una opción «Tell the team privately». **Los dos se muestran siempre a todos.**
8. **Footer** con los locales, el Instagram y un disclaimer chico: «Concept demo by Workflowers. Photos are placeholders.»

### Vistas internas (rutas aparte)
- `/staff`: PWA del barista. Selector de local, escáner con la cámara (`BarcodeDetector`, con zxing como fallback), feedback grande verde o naranja, botón Redeem, feed del día. Pega contra `POST /api/club/stamp` y `/api/club/redeem`; en modo demo, simulado.
- `/owner`: panel del dueño. KPIs (miembros, sellos, canjes, stories, toques en reseñas), sellos por local y por origen, clientes «a 1 del premio» y «no vienen hace 3 semanas», y un composer de aviso al pase con preview en el mockup del teléfono. Datos de ejemplo marcados como tales.

## Reglas que no se negocian
- **Google prohíbe incentivar reseñas y filtrar por satisfacción (review gating).** Nunca des sellos ni premios por una reseña. No muestres el link de Google solo a quien puntuó alto: el link público y el feedback privado van siempre juntos y para todos.
- **Stories:** el sticker sugerido lleva #Ad (guía de la CCPC y la ASAI en Irlanda).
- **No inventes datos:** ni precios, ni reseñas, ni testimonios, ni nombres de dueños. Lo que falte va como placeholder visible.
- **Las fotos de `assets/` son provisorias**, de fichas públicas de Google. Usalas para la demo y marcalas para reemplazar.
- **El logo es una reconstrucción.** Usalo, o mejoralo como SVG propio fiel al original (astas sobre una serif en minúscula), sin presentarlo como el archivo oficial.
- Accesibilidad: contraste AA, foco visible, `prefers-reduced-motion` respetado (todas las animaciones tienen que tener una versión sin movimiento), botones de verdad y alt en las imágenes.
- Performance: Lighthouse mobile ≥ 90 en Performance y Accessibility. Imágenes optimizadas con `next/image`. Que la animación del hero no bloquee el LCP.

## Cómo trabajar
1. Antes de escribir código, proponé en 10–15 líneas: la dirección visual, la idea elegida para el hero y por qué, las tipografías, cómo se mueve la página y qué es lo único memorable. Evitá lo que se ve generado por IA: tarjetas idénticas con sombra suave, eyebrows en mayúsculas sobre cada título, gradientes decorativos, emojis como íconos, fade-up en cada sección.
2. Construí sección por sección. Después de cada una, sacá screenshots con Playwright a 390 px y a 1440 px, miralas con ojo crítico y corregí antes de seguir.
3. Al final, corré Lighthouse mobile y arreglá lo que baje de 90.
4. Entregá: `npm run dev` funcionando, un README con cómo correrlo en modo demo y en modo real (variables del backend), y screenshots finales de las 3 vistas en mobile y desktop.

## Criterio de éxito
Si le mostrás el sitio a alguien que conoce Fallow, lo reconoce sin ver el nombre. El tablero de letras y la tarjeta que entra al Wallet son los dos momentos que el dueño le va a querer mostrar a otros.
