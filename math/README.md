# MathNote Live

Hoja matemática negra con MathLive, pensada para Android/tablet.

## Uso rápido

1. Sube esta carpeta a GitHub.
2. Activa GitHub Pages sobre la rama principal.
3. Abre la URL desde Chrome Android.
4. Menú de Chrome → Añadir a pantalla de inicio.

## Teclado

- El teclado matemático de MathLive no se abre solo.
- Escribe normalmente con el teclado nativo de Android.
- Botón `math kbd`: muestra/oculta el teclado virtual matemático de MathLive.
- Botón `Σ`: abre un panel propio de símbolos rápidos: griegas, conjuntos, flechas, lógica, complejos, matrices y determinantes.

## Atajos

Dentro de una línea matemática, escribe el atajo y pulsa espacio:

- `a/ ` → fracción simple `a` como numerador.
- `frac ` → fracción con huecos.
- `int ` → integral con límites.
- `sum ` → sumatorio.
- `lim ` → límite.
- `*m2x2 ` → matriz 2x2.
- `*m3x3 ` → matriz 3x3.
- `*det2 ` → determinante 2x2.
- `*det3 ` → determinante 3x3.
- `*cases ` → sistema por casos.
- `*align ` → bloque alineado.
- `*cr ` → Cauchy-Riemann.
- `*cauchy ` → fórmula integral de Cauchy.

También hay una caja de comandos debajo de la barra. Escribe `*m3x3` y pulsa `insert`.

## Teclas

- Enter: nueva línea matemática.
- Backspace en línea vacía: borra línea.
- Botón `src`: muestra LaTeX acumulado.
- Botón `copy`: copia LaTeX acumulado.

## Limitaciones

- No calcula nada.
- No es LaTeX completo ni Word desktop.
- Usa MathLive desde CDN: requiere internet para cargar la librería salvo que se vendoree `mathlive.min.js`.
