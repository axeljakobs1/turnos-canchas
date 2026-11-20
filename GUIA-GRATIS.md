# Publicar gratis (sin plan Blaze)

Lo que ya está hecho: proyecto Firebase, ingreso con mail, base de datos, reglas, app web y clave de notificaciones.

## A. Clave de servicio de Firebase (para mandar los avisos)
1. Firebase → engranaje → Configuración del proyecto → pestaña **Cuentas de servicio** → **Generar nueva clave privada** → Generar clave. Se descarga un archivo .json. No lo compartas con nadie ni lo subas a un repositorio.

## B. GitHub
2. Creá una cuenta en https://github.com (gratis) si no tenés.
3. Nuevo repositorio (botón + → New repository): nombre `turnos-canchas`, **Public**, sin README.
4. En el repositorio nuevo: "uploading an existing file" → arrastrá TODO el contenido de esta carpeta (incluida la carpeta oculta `.github`; si no se ve en tu computadora, activá "mostrar archivos ocultos") → Commit changes.
5. Settings → Secrets and variables → Actions → New repository secret. Nombre: `FIREBASE_SERVICE_ACCOUNT`. Valor: abrí el .json del paso 1 con el bloc de notas, copiá TODO el texto y pegalo. Add secret.
6. Settings → Pages → Source: **GitHub Actions**.
7. Pestaña Actions → "Publicar la app" → Run workflow. Cuando termine (1-2 min) te da la dirección: `https://TU-USUARIO.github.io/turnos-canchas/`.

## C. Autorizar la dirección en Firebase
8. Firebase → Authentication → Configuración → Dominios autorizados → Agregar dominio: `TU-USUARIO.github.io`.

## D. Probar
9. Abrí la dirección, creá tu cuenta `axel` (Administrador), verificá el mail, ingresá y tocá "Activar avisos".
10. Para probar el aviso sin esperar: anotate en un turno de mañana, y en GitHub → Actions → "Avisos de turnos" → Run workflow. Deberías recibir la notificación.

## Notas
- El aviso corre solo todos los días a las 21:00 (00:00 UTC). GitHub puede demorarlo unos minutos en horas de mucha carga.
- GitHub pausa las tareas programadas si el repositorio no tiene actividad por 60 días; si pasa, en Actions aparece un botón para reactivarla.
- Costo: USD 0 (GitHub Free + Firebase Spark).
