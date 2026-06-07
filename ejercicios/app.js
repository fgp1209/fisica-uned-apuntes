const PROBLEM_MANIFEST = "./problemas/manifest.json";

const fallbackProblems = [
  {
    id: "mec-cin-001",
    categoria: "Mecánica",
    tema: "Tema 1",
    subtema: "Cinemática — MUA",
    nivel: "basico",
    titulo: "Posición de una partícula con aceleración constante",
    enunciado: "Una partícula parte de x₀ = 2 m con velocidad inicial v₀ = 3 m/s y aceleración constante a = 4 m/s². Calcula su posición a los 5 s.",
    steps: [
      {
        tipo: "enunciado",
        titulo: "Leer datos del problema",
        formula: "x_0 = 2 m; v_0 = 3 m/s; a = 4 m/s^2; t = 5 s",
        textoPizarra: "El dato clave es que la aceleración permanece constante.",
        voz: "Tenemos posición inicial dos metros, velocidad inicial tres metros por segundo, aceleración cuatro metros por segundo al cuadrado y tiempo cinco segundos. El movimiento es uniformemente acelerado."
      },
      {
        tipo: "fórmula",
        titulo: "Elegir la ecuación horaria",
        formula: "x = x_0 + v_0 t + \\frac{1}{2} a t^2",
        textoPizarra: "Se usa la posición del movimiento uniformemente acelerado.",
        voz: "Como la aceleración es constante, usamos la ecuación de posición del movimiento uniformemente acelerado: equis igual a equis inicial más velocidad inicial por tiempo más un medio de la aceleración por tiempo al cuadrado."
      },
      {
        tipo: "sustitución",
        titulo: "Sustituir los valores",
        formula: "x = 2 + 3·5 + \\frac{1}{2}·4·5^2",
        textoPizarra: "Primero se sustituyen magnitudes; después se calcula.",
        voz: "Sustituimos los valores del enunciado. La posición es dos más tres por cinco más un medio por cuatro por cinco al cuadrado."
      },
      {
        tipo: "cálculo",
        titulo: "Calcular término a término",
        formula: "x = 2 + 15 + 50 = 67 m",
        textoPizarra: "El término de aceleración aporta cincuenta metros.",
        voz: "Tres por cinco son quince. Cinco al cuadrado es veinticinco, y un medio por cuatro por veinticinco son cincuenta. El resultado total es sesenta y siete metros."
      }
    ]
  }
];

const state = {
  problems: [],
  filtered: [],
  currentProblemIndex: 0,
  currentStepIndex: 0,
  filter: "all",
  query: "",
  voicesReady: false
};

const $ = (selector) => document.querySelector(selector);

const els = {
  indexPanel: $("#indexPanel"),
  toggleIndex: $("#toggleIndex"),
  closeIndex: $("#closeIndex"),
  loadingState: $("#loadingState"),
  problemView: $("#problemView"),
  problemList: $("#problemList"),
  searchInput: $("#searchInput"),
  subjectTag: $("#subjectTag"),
  topicTag: $("#topicTag"),
  levelTag: $("#levelTag"),
  problemTitle: $("#problemTitle"),
  problemStatement: $("#problemStatement"),
  stepNumber: $("#stepNumber"),
  stepTotal: $("#stepTotal"),
  progressBar: $("#progressBar"),
  stepTitle: $("#stepTitle"),
  stepKind: $("#stepKind"),
  boardFormula: $("#boardFormula"),
  boardText: $("#boardText"),
  stepExplanation: $("#stepExplanation"),
  prevStep: $("#prevStep"),
  nextStep: $("#nextStep"),
  speakStep: $("#speakStep"),
  stopSpeech: $("#stopSpeech"),
  restartProblem: $("#restartProblem"),
  downloadProblem: $("#downloadProblem"),
  toggleFullScreen: $("#toggleFullScreen"),
  copyStep: $("#copyStep")
};

init();

async function init() {
  bindEvents();
  setupVoices();

  try {
    state.problems = await loadProblems();
  } catch (error) {
    console.warn("No se pudo cargar manifest.json. Usando problema de fallback.", error);
    state.problems = fallbackProblems;
  }

  applyFilters();
  selectProblem(0);
  els.loadingState.classList.add("hidden");
  els.problemView.classList.remove("hidden");
}

async function loadProblems() {
  const manifestResponse = await fetch(PROBLEM_MANIFEST, { cache: "no-store" });
  if (!manifestResponse.ok) throw new Error("Manifest no encontrado");
  const manifest = await manifestResponse.json();

  const problems = await Promise.all(
    manifest.problemas.map(async (file) => {
      const response = await fetch(`./problemas/${file}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Problema no encontrado: ${file}`);
      return response.json();
    })
  );

  return problems;
}

function bindEvents() {
  els.toggleIndex.addEventListener("click", () => els.indexPanel.classList.add("open"));
  els.closeIndex.addEventListener("click", () => els.indexPanel.classList.remove("open"));

  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    applyFilters();
  });

  document.querySelectorAll(".chip").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
      state.filter = button.dataset.filter;
      applyFilters();
    });
  });

  els.prevStep.addEventListener("click", () => goStep(-1));
  els.nextStep.addEventListener("click", () => goStep(1));
  els.speakStep.addEventListener("click", speakCurrentStep);
  els.stopSpeech.addEventListener("click", stopSpeech);
  els.restartProblem.addEventListener("click", () => {
    state.currentStepIndex = 0;
    renderCurrentProblem();
  });
  els.downloadProblem.addEventListener("click", downloadProblemContext);
  els.copyStep.addEventListener("click", copyCurrentStep);
  els.toggleFullScreen.addEventListener("click", toggleFullScreen);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") goStep(1);
    if (event.key === "ArrowLeft") goStep(-1);
    if (event.key.toLowerCase() === "s") speakCurrentStep();
    if (event.key === "Escape") stopSpeech();
  });
}

function setupVoices() {
  if (!("speechSynthesis" in window)) {
    els.speakStep.disabled = true;
    els.speakStep.textContent = "Sin TTS";
    return;
  }

  const markReady = () => { state.voicesReady = true; };
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener?.("voiceschanged", markReady);
  setTimeout(markReady, 300);
}

function applyFilters() {
  state.filtered = state.problems.filter((problem) => {
    const haystack = [
      problem.categoria,
      problem.tema,
      problem.subtema,
      problem.nivel,
      problem.titulo,
      problem.enunciado
    ].join(" ").toLowerCase();

    const matchesQuery = !state.query || haystack.includes(state.query);
    const matchesLevel = state.filter === "all" || problem.nivel === state.filter;
    return matchesQuery && matchesLevel;
  });

  renderProblemList();

  if (!state.filtered.length) {
    els.problemList.innerHTML = `<div class="state-card">Sin resultados.</div>`;
  }
}

function renderProblemList() {
  els.problemList.innerHTML = state.filtered.map((problem, index) => `
    <button class="problem-item ${index === state.currentProblemIndex ? "active" : ""}" type="button" data-index="${index}">
      <strong>${escapeHtml(problem.titulo)}</strong>
      <span>${escapeHtml(problem.categoria)} · ${escapeHtml(problem.subtema)} · ${escapeHtml(problem.nivel)}</span>
    </button>
  `).join("");

  els.problemList.querySelectorAll(".problem-item").forEach((button) => {
    button.addEventListener("click", () => {
      selectProblem(Number(button.dataset.index));
      els.indexPanel.classList.remove("open");
    });
  });
}

function selectProblem(index) {
  if (!state.filtered.length) return;
  state.currentProblemIndex = index;
  state.currentStepIndex = 0;
  renderProblemList();
  renderCurrentProblem();
}

function getCurrentProblem() {
  return state.filtered[state.currentProblemIndex];
}

function getCurrentStep() {
  return getCurrentProblem().steps[state.currentStepIndex];
}

function renderCurrentProblem() {
  const problem = getCurrentProblem();
  const step = getCurrentStep();
  const total = problem.steps.length;
  const current = state.currentStepIndex + 1;

  els.subjectTag.textContent = problem.categoria;
  els.topicTag.textContent = `${problem.tema} · ${problem.subtema}`;
  els.levelTag.textContent = problem.nivel;
  els.problemTitle.textContent = problem.titulo;
  els.problemStatement.textContent = problem.enunciado;

  els.stepNumber.textContent = current;
  els.stepTotal.textContent = total;
  els.progressBar.style.width = `${(current / total) * 100}%`;

  els.stepTitle.textContent = step.titulo;
  els.stepKind.textContent = step.tipo;
  els.boardFormula.innerHTML = renderFormula(step.formula || "");
  els.boardText.textContent = step.textoPizarra || "";
  els.stepExplanation.textContent = step.voz || "";

  els.prevStep.disabled = state.currentStepIndex === 0;
  els.nextStep.disabled = state.currentStepIndex === total - 1;
}

function goStep(delta) {
  stopSpeech();
  const problem = getCurrentProblem();
  const next = state.currentStepIndex + delta;
  if (next < 0 || next >= problem.steps.length) return;
  state.currentStepIndex = next;
  renderCurrentProblem();
}

function speakCurrentStep() {
  if (!("speechSynthesis" in window)) return;

  stopSpeech();
  const step = getCurrentStep();
  const text = step.voz || step.textoPizarra || step.titulo;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.92;
  utterance.pitch = 1;

  const voices = speechSynthesis.getVoices();
  const spanishVoice = voices.find((voice) => voice.lang === "es-ES") || voices.find((voice) => voice.lang.startsWith("es"));
  if (spanishVoice) utterance.voice = spanishVoice;

  speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

function downloadProblemContext() {
  const problem = getCurrentProblem();
  const step = getCurrentStep();
  const markdown = buildProblemMarkdown(problem, step, state.currentStepIndex);
  downloadText(`${problem.id}-chatgpt.md`, markdown);
}

function copyCurrentStep() {
  const problem = getCurrentProblem();
  const step = getCurrentStep();
  const text = buildProblemMarkdown(problem, step, state.currentStepIndex);
  navigator.clipboard?.writeText(text);
}

function buildProblemMarkdown(problem, step, stepIndex) {
  const steps = problem.steps.map((item, index) => {
    const marker = index === stepIndex ? " ← ATASCO AQUÍ" : "";
    return `## Step ${index + 1}: ${item.titulo}${marker}\n\nTipo: ${item.tipo}\n\nPizarra:\n${item.formula || ""}\n\nExplicación:\n${item.voz || ""}`;
  }).join("\n\n---\n\n");

  return `# ${problem.titulo}\n\nCategoría: ${problem.categoria}\nTema: ${problem.tema}\nSubtema: ${problem.subtema}\nNivel: ${problem.nivel}\n\n## Enunciado\n\n${problem.enunciado}\n\n## Punto de atasco\n\nStep ${stepIndex + 1}: ${step.titulo}\n\n---\n\n${steps}\n`;
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function renderFormula(input) {
  if (!input) return "";
  let output = escapeHtml(input);

  output = output.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, `<span class="frac"><span>$1</span><span>$2</span></span>`);
  output = output.replace(/([A-Za-z])_\{?([A-Za-z0-9]+)\}?/g, "$1<sub>$2</sub>");
  output = output.replace(/([A-Za-z0-9\)])\^\{?([A-Za-z0-9+\-]+)\}?/g, "$1<sup>$2</sup>");
  output = output.replace(/\\Delta/g, "Δ");
  output = output.replace(/\\cdot/g, "·");
  output = output.replace(/;/g, "<br>");

  return output;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
