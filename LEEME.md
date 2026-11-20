# Turnos Canchas – app para Android e iPhone

# Opción sin tiendas: instalar desde el navegador (PWA)

La carpeta `www/` ya es una app instalable (manifest, ícono y service worker). Se publica gratis en Firebase Hosting y la gente la instala desde un link, sin Play Store ni App Store.

1. En una computadora con Node: `npx firebase-tools login` (con axeljakobs1@gmail.com).
2. En esta carpeta: `npx firebase-tools deploy --only hosting,firestore:rules --project turnos-canchas-60dfc`
3. Te da una dirección tipo `https://turnos-canchas-60dfc.web.app`. Mandala por WhatsApp.
4. Android (Chrome): menú ⋮ → "Instalar app". iPhone (Safari): botón Compartir → "Agregar a pantalla de inicio".

## Avisos de las 21:00 (servidor de notificaciones)
Ya está todo armado: la clave de notificaciones está generada y cargada, la app muestra el botón "Activar avisos" y la función `functions/index.js` manda cada día a las 21:00 (hora de Mendoza) los turnos del día siguiente de cada persona.
Falta un solo paso que requiere tarjeta: activar el plan **Blaze** del proyecto (Firebase → Actualizar). Es "paga por uso" y con tan pocos usuarios el consumo queda dentro de la capa gratuita (costo esperado USD 0). Después:
```
cd functions && npm install && cd ..
npx firebase-tools deploy --only functions,hosting,firestore:rules --project turnos-canchas-60dfc
```
Cada persona toca "Activar avisos" una vez al entrar. En iPhone solo funciona con la app agregada a la pantalla de inicio e iOS 16.4 o más nuevo.
Si no activás Blaze, la app funciona igual pero sin avisos (salvo en la versión de tienda con Capacitor, que programa los avisos en el teléfono).

---


Todo el código está listo. Lo que falta son pasos que solo puede hacer el dueño de las cuentas (Firebase, Google Play, Apple).

## 1. Firebase (ya hecho)
Proyecto `turnos-canchas-60dfc` creado en tu cuenta axeljakobs1@gmail.com, con ingreso por mail/contraseña, Firestore (São Paulo, modo producción), las reglas de `firestore.rules` publicadas y la app web registrada. Los datos de conexión ya están en `www/firebase-config.js`.

## 2. Tu cuenta de administrador principal
Abrí la app (o `www/index.html` servido con cualquier servidor local), elegí **Administrador → Crear cuenta** con usuario `axel` y mail axeljakobs1@gmail.com. Te llega un mail de verificación: abrí el link y después ingresá. Ahí quedás aprobado como administrador principal y la app crea las 4 sedes y los valores por hora iniciales.
Las demás cuentas (colaboradores y administradores) quedan pendientes hasta que las apruebes.

## 3. Generar las apps
Requisitos: Node 18+, Android Studio (Android), Mac con Xcode (iPhone).
```
npm install
npx cap add android
npx cap add ios        # solo en Mac
npx cap sync
npm run android        # abre Android Studio → Build > Generate Signed Bundle (AAB)
npm run ios            # abre Xcode → Product > Archive
```
Ícono y pantalla de inicio: poné `assets/icon.png` (1024×1024) y ejecutá `npx @capacitor/assets generate`.

## 4. Publicar
- Google Play: cuenta de desarrollador (pago único USD 25) → crear app → subir el AAB.
- App Store: Apple Developer Program (USD 99/año) → App Store Connect → subir desde Xcode. Apple pide política de privacidad (la app guarda mail y nombre de usuario).

## Notificaciones
La app programa en el teléfono un aviso a las 21:00 del día anterior a cada turno, con los turnos del día siguiente de esa persona. Se reprograma cada vez que se abre la app o cambian sus anotaciones. Si alguien lo anota estando la app cerrada, el aviso se crea la próxima vez que la abra; para avisar sin abrirla haría falta un servidor de notificaciones push (Firebase Cloud Messaging con una función programada, requiere plan Blaze).

## Notas
- Los datos de prueba de la versión de claude.ai no se migran; las sedes y valores iniciales se crean solos.
- Al "Quitar acceso" a una cuenta se borran sus datos de la app; el mail queda registrado en Firebase Authentication (se puede borrar desde la consola).
