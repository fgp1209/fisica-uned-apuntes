---
name: generar-apuntes-html
description: Convert raw Spanish study notes or Markdown for the fisica-uned-apuntes project into responsive HTML lesson pages. Use when the user provides apuntes en bruto and expects a finished tema HTML, optional index update, MathJax-safe formulas, no invented content, and no summarization.
---

# Generar Apuntes HTML

Convertir apuntes brutos en una pagina HTML de estudio del proyecto `fisica-uned-apuntes`.

La regla central es: **maquetar, no reescribir el fondo**. Conservar tesis, ejemplos, definiciones, preguntas, respuestas y orden conceptual. No inventar contenido y no resumir salvo orden explicita.

Si tienes dudas de la asignatura o del tema, pregunta al usuario. Si el texto del apunte lo indica claramente, no preguntar.

## Flujo

1. Leer el apunte bruto y detectar asignatura, tema, titulo y secciones. Si el texto lo indica, no preguntar.
2. Revisar ejemplos existentes (`biologia-t1.html`, `vo-t1.html`), `assets/styles.css`, `assets/app.js`, `templates/tema-template.html` e `index.html`.
3. Crear o actualizar el HTML del tema usando el patron local:
   - `body` con clase `subject-*`.
   - favicon y touch icon en el `<head>` usando los PNG de `assets/icons`.
   - cabecera con volver al indice, asignatura, tema, chips y estado.
   - toolbar con Mapa, Prerrequisitos, Desarrollo, Conceptos, Errores, Preguntas, Respuestas, Resumen y Checklist.
   - mapa conceptual clicable al inicio.
   - secciones `page`, tarjetas, bloques de lectura y acordeones.
4. Convertir formulas a MathJax:
   - inline: `\(...\)`.
   - bloque: `\[...\]`, preferiblemente dentro de `.formula-block`.
   - corregir formulas rotas por texto plano cuando la intencion sea inequívoca; no cambiar significado.
5. Actualizar `index.html` solo si hace falta para enlazar el tema nuevo o corregir estado/titulo.
6. Tocar `assets/styles.css` o `assets/app.js` solo si el HTML necesita una clase/funcion que no exista o si falla la responsividad/impresion.
7. Validar rutas, enlaces internos, carga de CSS/JS/MathJax, mobile, impresion y que no haya rutas absolutas locales.

## Estructura Obligatoria

Cada tema debe conservar estas secciones cuando existan en el apunte:

1. Prerrequisitos minimos
2. Idea central del capitulo
3. Desarrollo completo del capitulo
4. Conceptos clave
5. Relaciones entre ideas
6. Errores habituales
7. Preguntas orientadas a examen
8. Respuestas modelo
9. Resumen final de repaso
10. Checklist de dominio

## Decisiones De Maquetacion

- Usar `definition-card` para conceptos breves y prerrequisitos.
- Usar `reading-block` para narrativa que debe quedar visible.
- Usar `details.accordion` para respuestas, errores, bloques largos o lectura ampliada.
- Mantener el nucleo abierto: definiciones, formulas madre, relaciones clave y avisos de examen no deben quedar escondidos si son esenciales.
- Partir parrafos largos en bloques respirables sin alterar el contenido.
- Anadir negritas semanticas solo para conceptos, oposiciones, relaciones y trampas examinables.
- Crear un mapa clicable derivado del texto, con enlaces reales a secciones existentes.
- Evitar tarjetas y colores decorativos; el color de asignatura es acento.

## Rutas Del Proyecto Actual

El proyecto puede estar en fase plana o por carpetas. Antes de crear rutas, mirar los ejemplos reales.

En la version plana actual:

```text
index.html
biologia-t1.html
vo-t1.html
astronomia-t1.html
assets/styles.css
assets/app.js
```

Los HTML en raiz cargan:

```html
<link rel="icon" type="image/png" sizes="32x32" href="assets/icons/icon-32.png" />
<link rel="icon" type="image/png" sizes="50x50" href="assets/icons/icon-50.png" />
<link rel="apple-touch-icon" sizes="100x100" href="assets/icons/icon-100.png" />
<link rel="stylesheet" href="assets/styles.css" />
<script defer src="assets/app.js"></script>
```

Si mas adelante se usan carpetas por asignatura, ajustar rutas a `../assets/...` y botones de vuelta. En esos HTML, los iconos deben quedar como:

```html
<link rel="icon" type="image/png" sizes="32x32" href="../assets/icons/icon-32.png" />
<link rel="icon" type="image/png" sizes="50x50" href="../assets/icons/icon-50.png" />
<link rel="apple-touch-icon" sizes="100x100" href="../assets/icons/icon-100.png" />
```

## Paletas

Usar las clases ya definidas en `assets/styles.css`:

```text
subject-biologia
subject-vo
subject-mecanica
subject-mecanica-teorica
subject-mm1
subject-astronomia
subject-tecnicas
```

Para Astronomia usar `subject-astronomia`.

## No Hacer

- No resumir ni eliminar contenido.
- No cambiar respuestas, ejemplos ni definiciones.
- No inventar formulas, datos, fuentes o explicaciones.
- No copiar CSS dentro del HTML.
- No tocar CSS/JS global por gusto.
- No dejar paginas huerfanas.
- No dejar formulas en formatos ambiguos como `(h = 90^\circ - z)` si deben renderizar: convertir a `\(h = 90^\circ - z\)`.
- No entregar sin comprobar enlaces internos y responsividad basica.
