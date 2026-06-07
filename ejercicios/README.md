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
    manifest.json
    mec-cin-mua-001.json
    mec-cin-mru-001.json
```

## Uso

Abrir `index.html` desde un servidor estático o GitHub Pages.

En local:

```bash
cd ejercicios
python3 -m http.server 8080
```

Después abrir:

```txt
http://localhost:8080
```

## TTS

Usa `window.speechSynthesis` y `SpeechSynthesisUtterance` con `lang = "es-ES"`.

El texto hablado está separado de la fórmula:

```json
{
  "formula": "x = x_0 + v_0 t + \\frac{1}{2} a t^2",
  "voz": "Como la aceleración es constante, usamos la ecuación de posición..."
}
```

## Añadir problemas

1. Crear un archivo JSON dentro de `problemas/`.
2. Añadirlo a `problemas/manifest.json`.
3. Mantener `formula`, `textoPizarra` y `voz` separados.

## Exportar atasco a ChatGPT

El botón `Descargar para ChatGPT` genera un `.md` con:

- enunciado;
- categoría, tema y subtema;
- step actual marcado como punto de atasco;
- pasos previos y posteriores.
