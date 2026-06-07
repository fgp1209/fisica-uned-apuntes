# Ejercicios paso a paso — UNED Física

Aplicación estática para estudiar problemas por pasos con pizarra visual y TTS nativo del móvil.

## Estructura

```txt
ejercicios/
  index.html
  app.css
  app.js
  README.md
  problemas/
    asignaturas.json
    manifest.json
    asignatura-tN_subtema_nombre-del-ejercicio.json
```

## Uso

Al entrar en `ejercicios/` se muestra primero el índice desplazable. El visor paso a paso solo se abre cuando se selecciona un problema.

También se puede elegir **Cargar JSON propio** para abrir un ejercicio local al instante. Esa carga es temporal: el archivo se procesa únicamente en el navegador, no se envía, no se almacena y desaparece al recargar la página.

## Nombre de archivos

Formato recomendado:

```txt
asignatura-tN_subtema_nombre-del-ejercicio.json
```

El índice se agrupa automáticamente por asignatura, tema/subtema y ejercicio.

## Carga de problemas publicados

En GitHub Pages, la app intenta leer en caliente la carpeta `ejercicios/problemas` usando GitHub Contents API. Así aparecen los nuevos `.json` sin rehacer `manifest.json`.

En local o si la API falla, usa `problemas/manifest.json` como fallback.

## Paso 0

Todo problema debe empezar con paso 0:

```json
{
  "tipo": "enunciado",
  "titulo": "Problema",
  "formula": "",
  "textoPizarra": "",
  "voz": "Texto del enunciado leído por el TTS"
}
```

En el paso 0 la pizarra queda vacía y el botón `Escuchar` lee solo el enunciado.

## TTS

Usa `window.speechSynthesis` y `SpeechSynthesisUtterance` con español de España. No depende de servicios externos.
