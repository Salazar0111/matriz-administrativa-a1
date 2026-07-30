# Matriz de funciones y suplencias — despliegue en Vercel

Este proyecto tiene tres piezas:

- `public/index.html` — la matriz (lo que ya conoces, con el diseño de A1/Traduciendo)
- `api/matriz.js` — la función que guarda y lee los datos compartidos
- Una base de datos **Vercel KV** — donde viven los datos de verdad (reemplaza lo que antes hacía `window.storage` dentro de Claude)

## Paso 1 — Crear cuenta y subir el proyecto

1. Entra a https://vercel.com y crea una cuenta (puedes usar tu correo o GitHub).
2. La forma más simple: sube esta carpeta a un repositorio de GitHub (crea uno nuevo, arrastra estos archivos) y luego en Vercel eliges **"Add New Project"** → **"Import Git Repository"** → seleccionas ese repo.
   - Alternativa sin GitHub: instala la CLI de Vercel (`npm i -g vercel`), entra a esta carpeta en una terminal y ejecuta `vercel`. Te va a pedir iniciar sesión y algunas preguntas; acepta los valores por defecto.

## Paso 2 — Crear la base de datos compartida (Vercel KV)

1. Dentro del proyecto ya importado, ve a la pestaña **Storage**.
2. Clic en **Create Database** → elige **KV**.
3. Dale un nombre, por ejemplo `matriz-suplencias`.
4. Cuando termine, Vercel te va a preguntar a qué proyecto conectarla — conéctala a este mismo proyecto. Esto agrega automáticamente las variables de entorno que la función `api/matriz.js` necesita (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) — no tienes que copiarlas a mano.

## Paso 3 — (Opcional pero recomendado) Proteger el acceso con una clave

Cualquiera con el link va a poder abrir la página. Si quieres que solo tu equipo pueda **guardar cambios**, agrega una clave compartida:

1. En el proyecto, ve a **Settings → Environment Variables**.
2. Agrega una variable `MATRIZ_CLAVE_ACCESO` con el valor que quieras (ej. `a1traduciendo2026`).
3. Vuelve a desplegar (Vercel lo hace solo si conectaste GitHub; si no, corre `vercel --prod` de nuevo).
4. La primera vez que alguien del equipo entre e intente guardar algo, la página le va a pedir esa clave y la va a recordar en su navegador.

Si no configuras esta variable, la matriz queda abierta a cualquiera con el link, sin clave.

## Paso 4 — Desplegar a producción

Si conectaste GitHub, cada vez que subas un cambio al repositorio Vercel despliega solo. Si usas la CLI:

```bash
vercel --prod
```

Al terminar te da una URL fija, por ejemplo `https://matriz-suplencias-a1.vercel.app`. Esa es la que comparten los cuatro — ya no necesitan Claude para abrirla.

## Cómo se comporta una vez desplegada

- Todos ven los mismos datos: se guardan en Vercel KV, no en el navegador de cada quien.
- Cada 12 segundos la página revisa si hubo cambios de otra persona y se actualiza sola, sin pisar lo que tú estés escribiendo en ese momento.
- El nombre que cada quien elige en "Tú eres" se recuerda solo en su propio navegador (no es compartido, es para firmar comentarios y documentación).
- Los botones **Exportar CSV** y **Guardar copia** siguen funcionando igual, como respaldo manual.

## Si algo falla

- **"No se pudo guardar — revisa tu conexión"**: casi siempre significa que la base de datos KV no quedó conectada al proyecto (Paso 2), o que las variables de entorno no se aplicaron — vuelve a desplegar después de conectar el KV.
- **Pide una clave que no conoces**: alguien configuró `MATRIZ_CLAVE_ACCESO` — pregúntale al usuario administrador del proyecto en Vercel.
