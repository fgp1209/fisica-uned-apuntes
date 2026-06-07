# Ejercicios paso a paso — UNED Física

MVP estático para estudiar problemas por pasos con pizarra visual y TTS nativo del móvil.

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
    mecanica-t1_cinematica_caida-libre-pelota-5s.json
    mecanica-t1_cinematica_movimiento-rectilineo-uniforme.json
    mecanica-t1_cinematica_posicion-aceleracion-constante.json
```

## Nombre de archivos

Formato obligatorio:

```txt
asignatura-tN_subtema_nombre-del-ejercicio.json
```

Ejemplo:

```txt
mecanica-t1_cinematica_caida-libre-pelota-5s.json
```

El índice se agrupa automáticamente así:

```txt
Mecánica (3)
  T1 · Cinemática (3)
    Caída libre de una pelota durante 5 s
    Movimiento rectilíneo uniforme
    Posición con aceleración constante
```

## Carga de problemas

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

Usa `window.speechSynthesis` y `SpeechSynthesisUtterance` con:

```js
utterance.lang = "es-ES";
```

No depende de servicios externos.
