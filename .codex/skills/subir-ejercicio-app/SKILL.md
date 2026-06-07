---
name: subir-ejercicio-app
description: Convierte un ejercicio escrito en un problema JSON paso a paso y lo añade a la aplicación `ejercicios/` de fisica-uned-apuntes. Usar cuando el usuario pida subir, incorporar, adaptar o corregir un ejercicio para la app, tanto si aporta solo el enunciado como si incluye una resolución completa.
---

# Subir ejercicio a la app

Crear o actualizar un único JSON compatible con la aplicación de ejercicios. La regla central es **conservar el contenido del problema y convertir la resolución en una pizarra progresiva**, sin inventar datos, hipótesis ni pasos matemáticos.

## Flujo obligatorio

1. Leer `guia_aplicacion_problemas.md`, `ejercicios/README.md`, `ejercicios/problemas/asignaturas.json` y uno o dos JSON similares de `ejercicios/problemas/`.
2. Revisar `ejercicios/app.js` solo para confirmar el contrato actual. No modificarlo salvo petición explícita.
3. Determinar asignatura, tema, subtema, nivel y título a partir del texto. Preguntar solo si falta un dato imprescindible que no pueda inferirse con seguridad.
4. Crear el nombre `asignatura-tN_subtema_nombre-del-ejercicio.json`, en minúsculas, sin tildes ni espacios. El campo `id` debe ser exactamente el nombre sin `.json`.
5. Escribir el archivo en `ejercicios/problemas/` con todos los campos obligatorios.
6. Ejecutar:

```bash
python3 .codex/skills/subir-ejercicio-app/scripts/validate_problem.py ejercicios/problemas/<archivo>.json
```

7. Revisar el diff y confirmar que no se ha alterado contenido ajeno.

## Contrato del problema

Campos raíz obligatorios:

```text
id, asignatura, categoria, tema, subtema, nivel, titulo, enunciado, steps
```

Valores de `nivel`:

```text
basico | medio | examen | avanzado
```

El paso cero siempre debe ser:

```json
{
  "tipo": "enunciado",
  "titulo": "Problema",
  "formula": "",
  "textoPizarra": "",
  "voz": "Lectura natural y completa del enunciado."
}
```

No adelantar el método, el modelo ni pistas de resolución en el paso cero.

## Construcción de los pasos

- Cada paso posterior realiza **una sola operación cognitiva**.
- Usar títulos cortos y tipos como `datos`, `sistema`, `modelo`, `fórmula`, `derivada`, `sustitución`, `cálculo`, `simplificación`, `interpretación`, `resultado`, `comprobación` o `error_típico`.
- `formula` es visual. Usar preferentemente una lista, con una línea de pizarra por elemento.
- `textoPizarra` es una frase breve que aclara lo visible.
- `voz` es una explicación oral natural en español de España; no debe limitarse a leer símbolos.
- Partir igualdades, derivaciones y sustituciones largas en varias líneas para móvil.
- Mantener saltos de línea útiles en el enunciado entre contexto, datos y petición.

Notación visual requerida:

```text
√(...) en vez de sqrt(...)
y' e y'' en vez de y_prime e y_second
θ̇ y θ̈ en vez de theta_dot y theta_ddot
q̇ y q̈ en vez de q_dot y q_ddot
∫, ∂, Σ, ·, ×, ≤, ≥, ≠, ≈, ⇒ cuando correspondan
```

No aplicar sustituciones de alias dentro de palabras: `mueve`, `demuestre` y `muelle` deben conservarse como texto español, no convertirse en formas con `μ`.

## Límites de edición

Por defecto, modificar únicamente el JSON creado o corregido.

No tocar:

```text
ejercicios/app.js
ejercicios/app.css
ejercicios/index.html
CHANGELOG.md
```

No modificar `ejercicios/problemas/manifest.json`: la publicación descubre los JSON mediante GitHub Contents API. Actualizarlo solo si el usuario pide explícitamente compatibilidad con el fallback local o sin API.

Si una petición exige cambiar la app, preservar las personalizaciones existentes, incluida la velocidad TTS `utterance.rate = 1.5`, salvo instrucción explícita contraria.

## Criterios de entrega

Antes de terminar, comprobar:

- JSON válido y UTF-8.
- Nombre del archivo e `id` coincidentes.
- Tema en formato `T0`, `T1`, etc.
- Paso cero limpio y pizarra vacía.
- Todos los pasos con `tipo`, `titulo`, `formula`, `textoPizarra` y `voz`.
- Fórmulas móviles sin aliases crudos.
- TTS natural y sin símbolos crudos.
- Ausencia de letras griegas incrustadas accidentalmente en palabras españolas.
- Ningún cambio en `CHANGELOG.md`.
