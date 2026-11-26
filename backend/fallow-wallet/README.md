# Fallow Club: pases reales de Apple Wallet y Google Wallet

Backend del club de sellos para Fallow, multi-tenant. Son route handlers de Next.js con Supabase. Ya compila (`tsc` limpio), y probé la generación del `.pkpass` con un certificado de prueba: sale bien firmado, con los campos, la ubicación y el `webServiceURL`. Falta conectarlo con tus cuentas reales.

## Qué hace

| Endpoint | Para qué |
| --- | --- |
| `POST /api/club/join` | Alta: crea el cliente y el pase, suma el sello de bienvenida y devuelve los links de Apple y Google |
| `GET /api/club/pass/:serial?k=` | Primera descarga del `.pkpass` (el botón «Add to Apple Wallet») |
| `POST /api/club/stamp` | Barista: suma un sello (PIN del staff, 10 minutos de espera entre sellos) y actualiza los dos Wallets |
| `POST /api/club/redeem` | Barista: canjea el café gratis y la tarjeta vuelve a 0 |
| `GET /api/club/staff?tenant=` | Lista de baristas por local (id, nombre, local) para la PWA del barista. Sin PINs |
| `POST /api/feedback` | «Tell the team privately» del sitio. Necesita `supabase/feedback.sql` |
| `POST /api/orders` | Order ahead: crea el pedido (local, nombre, líneas, hora de retiro) y devuelve número y estado. Se paga en la ventanilla. Necesita `supabase/orders.sql` |
| `GET /api/orders/:id` | Estado del pedido para el ticket del cliente |
| `POST /api/orders/queue` | Barista (PIN): pedidos abiertos de hoy en su local, primero los que se retiran antes |
| `POST /api/orders/:id/status` | Barista (PIN): avanza el pedido (making → ready → collected), solo hacia adelante y solo en su local |
| `/api/apple/v1/...` | PassKit Web Service: registro de iPhones, lista de cambios, descarga del pase actualizado y log |

Los sellos se guardan como eventos (`stamp_events`). La tabla `passes` solo guarda el número para cachear.

## Puesta en marcha (sandbox)

### 1. Supabase
1. Creá un proyecto y corré `supabase/schema.sql` en el SQL editor. Ya trae Fallow y sus 3 locales.
2. Cargá un barista por local en `staff`. El `pin_hash` se calcula con `hashPin()` de `src/lib/staff.ts`.

### 2. Apple Wallet (necesita el Apple Developer Program, US$99 por año)
1. En Certificates, IDs & Profiles → Identifiers, creá un **Pass Type ID**, por ejemplo `pass.com.workflowers.fallow`.
2. Generá un CSR desde Keychain o con openssl, creá el certificado de ese Pass Type ID y bajá el `.cer`.
3. Convertilo a PEM:
   ```
   openssl x509 -inform der -in pass.cer -out signerCert.pem
   ```
   Si lo exportaste como `.p12`, usá `openssl pkcs12 -in pass.p12 -clcerts -nokeys -out signerCert.pem` y `openssl pkcs12 -in pass.p12 -nocerts -out signerKey.pem`.
4. Bajá el **Apple WWDR G4** desde apple.com/certificateauthority y convertilo a PEM igual que en el paso 3.
5. Cargá `APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID` y los 3 PEM en las variables de entorno. Apple no tiene sandbox para Wallet: el pase es real desde el primer día.

### 3. Google Wallet (gratis)
1. En pay.google.com/business/console abrí la cuenta de emisor y anotá el **Issuer ID**.
2. En Google Cloud, activá la «Google Wallet API», creá una service account y bajá su clave JSON.
3. En la consola de Wallet, en Users, invitá el email de la service account como Developer.
4. Mientras la cuenta esté en **modo demo**, solo ven el pase las cuentas de Google que agregues como testers. Agregá la tuya y la del dueño de Fallow.
5. Corré `npx tsx scripts/create-google-class.ts https://.../logo.png` una sola vez para crear el diseño de la tarjeta.

### 4. Deploy
1. `npm install`. Copiá `.env.example` a `.env.local` y completalo.
2. Deploy a Vercel. Apple exige HTTPS en `APP_BASE_URL` para mandar las actualizaciones.
3. Probá el flujo con curl:
   ```
   curl -X POST $APP_BASE_URL/api/club/join -H 'content-type: application/json' -d '{"tenant":"fallow","firstName":"Francisco"}'
   ```
   Abrí el link `apple` en Safari del iPhone o el link `google` en Android.
   ```
   curl -X POST $APP_BASE_URL/api/club/stamp -H 'content-type: application/json' -d '{"serial":"FLW-...","staffId":"...","pin":"1234"}'
   ```
   El pase se tiene que actualizar solo en el teléfono, en pocos segundos.

## CORS

El sitio es estático (Cloudflare Pages) y llama a esta API desde el navegador. `middleware.ts` permite los orígenes de `CORS_ORIGINS` (separados por comas), por ejemplo `https://fallow-coffee.pages.dev`.

## Pendiente para la siguiente iteración
- **Imagen de tira con los sellos dibujados.** Hoy el contador es texto («4/9»); la tira necesita generar la imagen en el servidor.
- **Webhook de Instagram** (`story_mention`) para el sello por story. Va en la Fase 3, cuando Meta apruebe la app.
- **Sesiones reales para el staff.** Hoy se valida el PIN en cada request; alcanza para un MVP.
- **Rate limit en `/api/club/join` y `/api/orders`.**
- **Pago online del pedido anticipado** (Stripe / Apple Pay): hoy se paga en la ventanilla. Para cobrar online hacen falta los precios de la vitrina.
