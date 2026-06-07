# ANEXO PERMANENTE — Generación de problemas para la aplicación UNED Física

Documento para adjuntar al prompt inicial del proyecto **Física**.

Función: fijar el sistema estable para crear, adaptar, validar y entregar problemas en formato JSON compatibles con la aplicación estática de ejercicios paso a paso.

La aplicación entrena resolución guiada de problemas. No genera apuntes. No genera tarjetas Anki. No sustituye clases. Su salida debe parecer una pizarra progresiva con audio, no un resumen largo.

---

# 0. Principio operativo

```text
Enunciado limpio → intento mental → paso guiado → pizarra legible → TTS natural → interpretación final
```

Regla central:

```text
Cada step hace una sola operación cognitiva.
La pizarra muestra estructura.
El TTS explica el razonamiento.
El enunciado no da pistas.
```

---

# 1. Uso previsto

Petición tipo:

```text
Crea 10 problemas nivel examen de Mecánica Teórica T1 sobre principio de Hamilton y ecuaciones de Lagrange para la aplicación.
Devuelve un zip con los JSON listos para subir a ejercicios/problemas.
```

Respuesta esperada:

```text
.zip
  ejercicios/
    problemas/
      asignatura-tN_subtema_nombre-del-ejercicio.json
      README_problemas_generados.md
```

Por defecto:

```text
no tocar index.html
no tocar app.css
no tocar app.js
no tocar manifest.json
no tocar asignaturas.json
```

Solo crear JSON en:

```text
ejercicios/problemas/
```

---

# 2. Convención de nombres

Formato obligatorio:

```text
asignatura-tN_subtema_nombre-del-ejercicio.json
```

Ejemplos correctos:

```text
mecanica-t1_cinematica_caida-libre-pelota-5s.json
mecanica-teorica-t1_principio-hamilton-lagrange_beltrami-camino-minimo.json
metodos-matematicos-i-t3_edo_factor-integrante.json
```

Reglas:

```text
minúsculas
sin tildes
sin espacios
sin símbolos raros
tema en formato t0, t1, t2...
subtema separado por guion bajo
palabras separadas por guion
id = nombre del archivo sin .json
```

La app agrupa automáticamente por:

```text
asignatura → tema/subtema → ejercicio
```

---

# 3. Slugs de asignatura

Usar estos slugs:

```text
mecanica
mecanica-teorica
metodos-matematicos-i
vibraciones-y-ondas
electromagnetismo
astronomia
astrofisica
biologia
tecnicas-experimentales
```

Nombres humanos recomendados:

```text
Mecánica
Mecánica Teórica
Métodos Matemáticos I
Vibraciones y Ondas
Electromagnetismo
Astronomía
Astrofísica
Biología
Técnicas Experimentales
```

---

# 4. Esquema JSON obligatorio

```json
{
  "id": "mecanica-teorica-t1_principio-hamilton-lagrange_beltrami-camino-minimo",
  "asignatura": "mecanica-teorica",
  "categoria": "Mecánica Teórica",
  "tema": "T1",
  "subtema": "Principio de Hamilton y ecuaciones de Lagrange",
  "nivel": "examen",
  "titulo": "Camino mínimo entre dos puntos por cálculo variacional",
  "enunciado": "Entre dos puntos fijos del plano, considere el funcional de longitud:\nS[y] = ∫ √(1 + y'^2) dx.\nUse la identidad de Beltrami para demostrar que el extremal es una recta.",
  "steps": []
}
```

Campos:

```text
id → nombre del archivo sin .json
asignatura → slug
categoria → nombre visible
tema → T0, T1, T2...
subtema → nombre visible
nivel → basico | medio | examen | avanzado
titulo → nombre corto visible en el índice
enunciado → problema limpio, sin pistas
steps → pasos guiados
```

---

# 5. Step 0 obligatorio

El primer paso siempre es el enunciado.

Debe cumplir:

```text
steps[0].tipo = "enunciado"
steps[0].titulo = "Problema"
steps[0].formula = ""
steps[0].textoPizarra = ""
steps[0].voz = lectura natural del enunciado
```

Ejemplo:

```json
{
  "tipo": "enunciado",
  "titulo": "Problema",
  "formula": "",
  "textoPizarra": "",
  "voz": "Entre dos puntos fijos del plano, considere el funcional de longitud S de ye igual a la integral de la raíz de uno más ye prima al cuadrado. Use la identidad de Beltrami para demostrar que el extremal es una recta."
}
```

Prohibido en step 0:

```text
“Como es caída libre...”
“Usaremos...”
“El modelo adecuado es...”
“Primero identificamos...”
“Este problema se resuelve con...”
```

---

# 6. Pasos posteriores

Desde el paso 1, cada step debe resolver una sola operación.

Secuencia general:

```text
1. datos
2. sistema de referencia / convenio de signos
3. modelo físico o matemático
4. principio o fórmula
5. derivada / sustitución
6. cálculo
7. simplificación
8. interpretación
9. resultado
10. comprobación o trampa típica
```

No todos los problemas necesitan todos los pasos.

---

# 7. Estructura de cada step

Formato:

```json
{
  "tipo": "modelo",
  "titulo": "Beltrami",
  "formula": [
    "F - y' · ∂F/∂y' = C"
  ],
  "textoPizarra": "Se puede usar porque F no depende explícitamente de x.",
  "voz": "Como el integrando no depende explícitamente de equis, usamos la identidad de Beltrami."
}
```

Campos:

```text
tipo → clase de paso
titulo → corto, visible
formula → pizarra, preferentemente lista de líneas
textoPizarra → una frase visible bajo la fórmula
voz → explicación natural para TTS
```

---

# 8. Regla de pizarra móvil

La pizarra se verá en móvil. Por tanto:

```text
NO escribir fórmulas largas en una sola línea.
NO escribir sqrt(1+y_prime^2).
NO escribir derivaciones completas en una sola pizarra.
NO usar notación cruda de programación.
```

Preferir:

```json
"formula": [
  "S[y] = ∫ F dx",
  "F(y') = √(1 + y'^2)"
]
```

En vez de:

```json
"formula": "S[y]=integral de sqrt(1+y_prime^2) dx"
```

Preferir:

```json
"formula": [
  "∂F/∂y' =",
  "y' / √(1 + y'^2)"
]
```

En vez de:

```json
"formula": "∂F/∂y_prime = y_prime/sqrt(1+y_prime^2)"
```

Preferir:

```json
"formula": [
  "√(1 + y'^2) -",
  "(y')^2 / √(1 + y'^2) = C"
]
```

En vez de:

```json
"formula": "sqrt(1+y_prime^2) - y_prime^2/sqrt(1+y_prime^2)=C"
```

---

# 9. Notación visual permitida

Usar notación legible directamente en pantalla:

```text
√(...)
∫
∂
δ
Σ
Δ
≈
≠
≤
≥
⇒
·
½
θ
φ
α
β
γ
λ
μ
ω
Ω
q̇
q̈
θ̇
θ̈
ẋ
ẍ
y'
y''
```

Ejemplos:

```text
q̇, no q_dot
q̈, no q_ddot
θ, no theta
φ, no phi
√(...), no sqrt(...)
y', no y_prime
y'', no y_second
```

Subíndices sencillos pueden escribirse como:

```text
v_0
x_1
p_θ
N_gl
ω_0
```

La app los muestra como subíndices cuando sea posible.

---

# 10. Fórmulas: string o array

La forma preferida es array:

```json
"formula": [
  "T = ½m l^2 θ̇^2",
  "V = -mgl cos θ"
]
```

Se acepta string solo para fórmulas muy cortas:

```json
"formula": "N_gl = 4 - 1 = 3"
```

Regla:

```text
Si la fórmula supera una línea de móvil, usar array.
Si hay dos expresiones distintas, usar array.
Si hay una igualdad larga con sustitución, partirla en varias líneas.
```

---

# 11. Enunciado

El `enunciado` debe ser limpio, completo y sin pistas.

Correcto:

```text
Entre dos puntos fijos del plano, considere el funcional de longitud:
S[y] = ∫ √(1 + y'^2) dx.
Use la identidad de Beltrami para demostrar que el extremal es una recta.
```

Incorrecto:

```text
Entre dos puntos fijos del plano, considere el funcional de longitud S[y]=integral de sqrt(1+y_prime^2) dx. Use la identidad de Beltrami...
```

Incorrecto:

```text
Como F no depende de x, use Beltrami...
```

Motivo:

```text
El enunciado puede pedir usar una identidad si eso forma parte del problema.
No debe explicar por qué esa identidad aplica.
```

---

# 12. TTS nativo móvil

La app usa:

```text
window.speechSynthesis
SpeechSynthesisUtterance
lang = "es-ES"
```

El campo `voz` debe estar escrito para ser oído.

Correcto:

```text
Como el integrando no depende explícitamente de equis, usamos la identidad de Beltrami.
```

Incorrecto:

```text
F-y'∂F/∂y'=C
```

Correcto:

```text
La derivada de la raíz de uno más ye prima al cuadrado respecto a ye prima es ye prima dividido por esa misma raíz.
```

Incorrecto:

```text
dF/dy_prime=y_prime/sqrt(1+y_prime^2)
```

Regla:

```text
formula = visual
voz = oral
```

---

# 13. Tipos de paso permitidos

Usar preferentemente:

```text
enunciado
datos
sistema
modelo
fórmula
derivada
sustitución
cálculo
simplificación
interpretación
resultado
comprobación
error_típico
```

Criterio:

```text
datos → magnitudes del enunciado
sistema → ejes, signos, origen, coordenadas
modelo → MRUA, Lagrange, Hamilton, Beltrami...
fórmula → ecuación madre
derivada → cálculo diferencial local
sustitución → cambiar símbolos por datos
cálculo → operar
simplificación → álgebra posterior
interpretación → significado físico o matemático
resultado → respuesta final
comprobación → dimensión, límite o caso conocido
error_típico → trampa real de examen
```

---

# 14. Ejemplo correcto completo

```json
{
  "id": "mecanica-teorica-t1_principio-hamilton-lagrange_beltrami-camino-minimo",
  "asignatura": "mecanica-teorica",
  "categoria": "Mecánica Teórica",
  "tema": "T1",
  "subtema": "Principio de Hamilton y ecuaciones de Lagrange",
  "nivel": "examen",
  "titulo": "Camino mínimo entre dos puntos por cálculo variacional",
  "enunciado": "Entre dos puntos fijos del plano, considere el funcional de longitud:\nS[y] = ∫ √(1 + y'^2) dx.\nUse la identidad de Beltrami para demostrar que el extremal es una recta.",
  "steps": [
    {
      "tipo": "enunciado",
      "titulo": "Problema",
      "formula": "",
      "textoPizarra": "",
      "voz": "Entre dos puntos fijos del plano, considere el funcional de longitud S de ye igual a la integral de la raíz de uno más ye prima al cuadrado. Use la identidad de Beltrami para demostrar que el extremal es una recta."
    },
    {
      "tipo": "datos",
      "titulo": "Funcional",
      "formula": [
        "S[y] = ∫ F dx",
        "F(y') = √(1 + y'^2)"
      ],
      "textoPizarra": "El integrando solo depende de y'.",
      "voz": "El funcional es la longitud de una curva. Su integrando depende de ye prima, pero no depende explícitamente de equis."
    },
    {
      "tipo": "modelo",
      "titulo": "Beltrami",
      "formula": [
        "F - y' · ∂F/∂y' = C"
      ],
      "textoPizarra": "Se puede usar porque F no depende explícitamente de x.",
      "voz": "Como el integrando no depende explícitamente de equis, usamos la identidad de Beltrami."
    },
    {
      "tipo": "derivada",
      "titulo": "Derivada parcial",
      "formula": [
        "∂F/∂y' =",
        "y' / √(1 + y'^2)"
      ],
      "textoPizarra": "Se deriva la raíz respecto a y'.",
      "voz": "La derivada de la raíz de uno más ye prima al cuadrado respecto a ye prima es ye prima dividido por esa misma raíz."
    },
    {
      "tipo": "sustitución",
      "titulo": "Sustituir en Beltrami",
      "formula": [
        "√(1 + y'^2) -",
        "(y')^2 / √(1 + y'^2) = C"
      ],
      "textoPizarra": "Ahora todo queda escrito en función de y'.",
      "voz": "Sustituimos la derivada en la identidad de Beltrami."
    },
    {
      "tipo": "simplificación",
      "titulo": "Reducir fracción",
      "formula": [
        "1 / √(1 + y'^2) = C"
      ],
      "textoPizarra": "La expresión depende solo de y'.",
      "voz": "Al combinar términos queda uno dividido por la raíz de uno más ye prima al cuadrado igual a una constante."
    },
    {
      "tipo": "interpretación",
      "titulo": "Pendiente constante",
      "formula": [
        "y' = constante"
      ],
      "textoPizarra": "Si una función de y' es constante, y' también lo es.",
      "voz": "Si esa expresión es constante, la pendiente de la curva también es constante."
    },
    {
      "tipo": "resultado",
      "titulo": "Extremal",
      "formula": [
        "y(x) = A x + B"
      ],
      "textoPizarra": "Una curva con pendiente constante es una recta.",
      "voz": "Por tanto, el extremal del funcional de longitud es una recta."
    }
  ]
}
```

---

# 15. Qué debe evitarse

Prohibido:

```text
fórmulas de programación
sqrt(...)
y_prime
theta_dot
q_ddot
enunciados en una sola línea ilegible
pizarras con tres ideas mezcladas
steps que sustituyen, calculan e interpretan a la vez
TTS leyendo símbolos crudos
entradillas tipo vídeo
relleno motivacional
```

Ejemplo malo:

```json
"formula": "sqrt(1+y_prime^2) - y_prime^2/sqrt(1+y_prime^2)=C"
```

Ejemplo bueno:

```json
"formula": [
  "√(1 + y'^2) -",
  "(y')^2 / √(1 + y'^2) = C"
]
```

---

# 16. Niveles

## 16.1 Básico

```text
una fórmula principal
datos directos
pocos pasos
objetivo: automatizar modelo
```

## 16.2 Medio

```text
dos fórmulas encadenadas
algún signo o despeje
interpretación final
```

## 16.3 Examen

```text
requiere elegir método
incluye distractor o trampa típica
tiene interpretación final
puede exigir derivación breve
no es clon numérico
```

## 16.4 Avanzado

```text
derivación simbólica
varios apartados
criterio de aproximación
relación entre conceptos
```

---

# 17. Generación de lotes

Para 10 problemas nivel examen:

```text
- 10 archivos JSON
- 6–10 steps por problema
- step 0 limpio
- pizarra con arrays de líneas cuando haya fórmulas largas
- TTS natural
- README del lote
- zip con ruta ejercicios/problemas/
```

El README debe indicar:

```text
asignatura
tema
subtema
nivel
número de problemas
lista de archivos
validación JSON
si se ha tocado manifest.json
observaciones relevantes
```

---

# 18. Compatibilidad con índice caliente

En GitHub Pages:

```text
No hace falta manifest.json.
La app lista los JSON de ejercicios/problemas automáticamente.
```

En local con `file://`:

```text
No se puede listar la carpeta.
Hace falta manifest.json actualizado.
```

Por defecto, no incluir manifest.

---

# 19. Validación obligatoria

Antes de entregar:

```text
1. todos los archivos terminan en .json
2. nombres cumplen asignatura-tN_subtema_nombre.json
3. cada JSON parsea
4. id coincide con nombre de archivo sin .json
5. existe steps[0]
6. steps[0].tipo = "enunciado"
7. steps[0].formula = ""
8. steps[0].textoPizarra = ""
9. todos los steps tienen tipo, titulo, formula, textoPizarra, voz
10. ninguna fórmula contiene sqrt(
11. ninguna fórmula contiene y_prime, theta_dot, q_ddot, etc.
12. fórmulas largas usan array
13. TTS no lee símbolos crudos
14. resultado final tiene unidades o interpretación
15. zip conserva ruta ejercicios/problemas/
```

Checklist de salida:

```text
JSON válido: OK
nombres válidos: OK
step 0 limpio: OK
pizarra móvil: OK
TTS natural: OK
ZIP generado: OK
```

---

# 20. Prompts reutilizables

## 20.1 Crear problemas nuevos

```text
Crea 10 problemas nivel examen de [asignatura] [tema] [subtema] para la aplicación de problemas guiados.

Requisitos:
- un JSON por problema
- ruta: ejercicios/problemas/
- nombre: asignatura-tN_subtema_nombre-del-ejercicio.json
- step 0: solo enunciado, pizarra vacía, TTS del enunciado
- pizarra móvil: formula como array si hay más de una línea
- no usar sqrt(...), y_prime, theta_dot, q_ddot ni notación de programación
- usar √, ∫, ∂, θ, q̇, q̈, y', y''
- TTS natural en español de España
- 6–10 steps por problema
- sin tocar app.js, app.css, index.html ni manifest.json
- devolver ZIP
```

## 20.2 Adaptar problema existente

```text
Adapta este problema a la aplicación de problemas guiados.

Requisitos:
- extrae un enunciado limpio
- step 0 sin pistas
- separa datos, modelo, fórmula, sustitución, cálculo e interpretación
- cada step debe hacer una sola operación cognitiva
- formula debe ser legible en móvil; usa array de líneas
- voz debe estar escrita para TTS, no para leer símbolos
- devuelve ZIP con el JSON en ejercicios/problemas/
```

## 20.3 Corregir lote existente

```text
Corrige este ZIP de problemas para la aplicación.

Objetivo:
- hacer la pizarra legible en móvil
- convertir fórmulas largas en arrays de líneas
- sustituir notación cruda: sqrt, y_prime, theta_dot, q_ddot
- conservar ids, nombres de archivo, asignatura, tema y subtema
- mantener step 0 limpio
- devolver ZIP corregido
```

---

# 21. Regla final

```text
Si una fórmula no cabe bien en móvil, no se reduce la letra sin más.
Se divide el razonamiento en más pasos o se parte la pizarra en varias líneas.
```
