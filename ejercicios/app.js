const PROBLEMS_DIR = "./problemas";
const MANIFEST_URL = `${PROBLEMS_DIR}/manifest.json`;
const SUBJECTS_URL = `${PROBLEMS_DIR}/asignaturas.json`;

const APP_CONFIG = {
  githubRepo: "fgp1209/fisica-uned-apuntes",
  githubBranch: "main",
  githubProblemsPath: "ejercicios/problemas"
};

const NORMALIZED_PROBLEM_RE = /^([a-z0-9-]+)-t(\d+)_([a-z0-9-]+)_(.+)\.json$/i;

const fallbackProblems = [
  {
    id: "mecanica-t1_cinematica_caida-libre-pelota-5s",
    archivo: "mecanica-t1_cinematica_caida-libre-pelota-5s.json",
    asignatura: "mecanica",
    categoria: "Mecánica",
    tema: "T1",
    subtema: "Cinemática",
    nivel: "basico",
    titulo: "Caída libre de una pelota durante 5 s",
    enunciado: "Una pelota se suelta desde el reposo y cae libremente durante 5 segundos. Tomando hacia arriba como sentido positivo y g = -9,8 m/s², calcula su posición y su velocidad en ese instante.",
    steps: [
      {
        tipo: "enunciado",
        titulo: "Problema",
        formula: "",
        textoPizarra: "",
        voz: "Una pelota se suelta desde el reposo y cae libremente durante cinco segundos. Tomando hacia arriba como sentido positivo y g igual a menos nueve coma ocho metros por segundo al cuadrado, calcula su posición y su velocidad en ese instante."
      }
    ]
  }
];

const state = {
  problems: [],
  filtered: [],
  subjects: {},
  currentProblemId: null,
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
  copyStep: $("#copyStep"),
  board: $("#board")
};

init();

async function init() {
  bindEvents();
  setupVoices();

  try {
    state.subjects = await loadSubjectCatalog();
    state.problems = await loadProblems();
  } catch (error) {
    console.warn("No se pudieron cargar los problemas. Usando fallback.", error);
    state.problems = fallbackProblems.map((problem) => enrichProblem(problem, problem.archivo));
  }

  applyFilters();
  selectProblemById(state.filtered[0]?.id || state.problems[0]?.id);
  els.loadingState.classList.add("hidden");
  els.problemView.classList.remove("hidden");
}

async function loadSubjectCatalog() {
  try {
    const response = await fetch(SUBJECTS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("asignaturas.json no encontrado");
    return response.json();
  } catch {
    return { orden: [], asignaturas: {} };
  }
}

async function loadProblems() {
  const files = await loadProblemFileNames();
  const problems = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(`${PROBLEMS_DIR}/${file}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Problema no encontrado: ${file}`);
      const problem = await response.json();
      return enrichProblem(problem, file);
    })
  );

  return problems.sort(compareProblems);
}

async function loadProblemFileNames() {
  const hotFiles = await loadProblemFileNamesFromGitHub();
  if (hotFiles.length) return hotFiles;

  const response = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("manifest.json no encontrado");
  const manifest = await response.json();
  const files = Array.isArray(manifest) ? manifest : manifest.problemas;
  return files.filter(isNormalizedProblemFile).sort(compareFileNames);
}

async function loadProblemFileNamesFromGitHub() {
  const info = getGitHubFolderInfo();
  if (!info) return [];

  try {
    const api = `https://api.github.com/repos/${info.repo}/contents/${info.path}?ref=${encodeURIComponent(info.branch)}`;
    const response = await fetch(api, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) return [];
    const entries = await response.json();
    if (!Array.isArray(entries)) return [];
    return entries
      .filter((entry) => entry.type === "file")
      .map((entry) => entry.name)
      .filter(isNormalizedProblemFile)
      .sort(compareFileNames);
  } catch {
    return [];
  }
}

function getGitHubFolderInfo() {
  const params = new URLSearchParams(window.location.search);
  const repo = params.get("repo") || inferGitHubRepoFromLocation() || APP_CONFIG.githubRepo;
  const branch = params.get("branch") || APP_CONFIG.githubBranch;
  const path = params.get("problemsPath") || inferProblemsPathFromLocation() || APP_CONFIG.githubProblemsPath;

  if (!repo || !path) return null;
  return { repo, branch, path };
}

function inferGitHubRepoFromLocation() {
  const host = window.location.hostname;
  if (!host.endsWith(".github.io")) return null;
  const owner = host.replace(".github.io", "");
  const repo = window.location.pathname.split("/").filter(Boolean)[0];
  return owner && repo ? `${owner}/${repo}` : null;
}

function inferProblemsPathFromLocation() {
  const host = window.location.hostname;
  if (!host.endsWith(".github.io")) return null;
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const pathParts = parts.slice(1);
  if (pathParts[pathParts.length - 1]?.endsWith(".html")) pathParts.pop();
  return `${pathParts.join("/")}/problemas`.replace(/^\//, "");
}

function isNormalizedProblemFile(file) {
  return NORMALIZED_PROBLEM_RE.test(file);
}

function enrichProblem(problem, file) {
  const parsed = parseProblemFileName(file);
  const asignatura = problem.asignatura || parsed.asignatura || slugify(problem.categoria || "sin-asignatura");
  const categoria = problem.categoria || getSubjectLabel(asignatura);
  const temaNumero = problem.temaNumero || parsed.temaNumero;
  const tema = normalizeTema(problem.tema, temaNumero);
  const subtemaSlug = problem.subtemaSlug || parsed.subtemaSlug || slugify(problem.subtema || "sin-subtema");
  const subtema = problem.subtema || titleFromSlug(subtemaSlug);
  const ejercicioSlug = parsed.ejercicioSlug || slugify(problem.titulo || file.replace(/\.json$/i, ""));
  const titulo = problem.titulo || titleFromSlug(ejercicioSlug);
  const id = problem.id || file.replace(/\.json$/i, "");

  return {
    ...problem,
    id,
    archivo: file,
    asignatura,
    categoria,
    temaNumero,
    tema,
    subtemaSlug,
    subtema,
    ejercicioSlug,
    titulo,
    steps: normalizeSteps(problem)
  };
}

function normalizeSteps(problem) {
  const rawSteps = Array.isArray(problem.steps) ? problem.steps : [];
  const hasStepZero = rawSteps[0]?.tipo === "enunciado" && !rawSteps[0]?.formula && !rawSteps[0]?.textoPizarra;
  if (hasStepZero) return rawSteps;

  return [
    {
      tipo: "enunciado",
      titulo: "Problema",
      formula: "",
      textoPizarra: "",
      voz: problem.ttsEnunciado || problem.enunciado || ""
    },
    ...rawSteps
  ];
}

function parseProblemFileName(file) {
  const match = file.match(NORMALIZED_PROBLEM_RE);
  if (!match) return {};
  return {
    asignatura: match[1].toLowerCase(),
    temaNumero: Number(match[2]),
    subtemaSlug: match[3].toLowerCase(),
    ejercicioSlug: match[4].replace(/\.json$/i, "").toLowerCase()
  };
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
      problem.archivo,
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

  if (!state.filtered.some((problem) => problem.id === state.currentProblemId)) {
    state.currentProblemId = state.filtered[0]?.id || null;
    state.currentStepIndex = 0;
  }

  renderProblemList();
  if (state.currentProblemId) renderCurrentProblem();

  if (!state.filtered.length) {
    els.problemList.innerHTML = `<div class="state-card compact">Sin resultados.</div>`;
  }
}

function renderProblemList() {
  const tree = buildTree(state.filtered);
  const current = getCurrentProblem();

  els.problemList.innerHTML = tree.map((subject) => {
    const subjectOpen = current?.asignatura === subject.slug;
    const topicsHtml = subject.topics.map((topic) => {
      const topicOpen = subjectOpen && current?.topicKey === topic.key;
      const leaves = topic.problems.map((problem) => `
        <button class="problem-leaf ${problem.id === state.currentProblemId ? "active" : ""}" type="button" data-id="${escapeHtml(problem.id)}">
          <strong>${escapeHtml(problem.titulo)}</strong>
          <span>${escapeHtml(problem.archivo)}</span>
        </button>
      `).join("");

      return `
        <details class="tree-node tree-topic" ${topicOpen ? "open" : ""}>
          <summary><span>${escapeHtml(topic.label)}</span><b>${topic.count}</b></summary>
          <div class="tree-children">${leaves}</div>
        </details>
      `;
    }).join("");

    return `
      <details class="tree-node tree-subject" ${subjectOpen ? "open" : ""}>
        <summary><span>${escapeHtml(subject.label)}</span><b>${subject.count}</b></summary>
        <div class="tree-children">${topicsHtml}</div>
      </details>
    `;
  }).join("");

  els.problemList.querySelectorAll(".problem-leaf").forEach((button) => {
    button.addEventListener("click", () => {
      selectProblemById(button.dataset.id);
      els.indexPanel.classList.remove("open");
    });
  });
}

function buildTree(problems) {
  const subjectMap = new Map();

  problems.forEach((problem) => {
    const subjectKey = problem.asignatura;
    const topicKey = `${problem.temaNumero || 0}-${problem.subtemaSlug}`;
    problem.topicKey = topicKey;

    if (!subjectMap.has(subjectKey)) {
      subjectMap.set(subjectKey, {
        slug: subjectKey,
        label: getSubjectLabel(subjectKey, problem.categoria),
        count: 0,
        topics: new Map()
      });
    }

    const subject = subjectMap.get(subjectKey);
    subject.count += 1;

    if (!subject.topics.has(topicKey)) {
      subject.topics.set(topicKey, {
        key: topicKey,
        order: problem.temaNumero || 999,
        label: `${problem.tema} · ${problem.subtema}`,
        count: 0,
        problems: []
      });
    }

    const topic = subject.topics.get(topicKey);
    topic.count += 1;
    topic.problems.push(problem);
  });

  return Array.from(subjectMap.values())
    .sort(compareSubjects)
    .map((subject) => ({
      ...subject,
      topics: Array.from(subject.topics.values())
        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "es"))
        .map((topic) => ({
          ...topic,
          problems: topic.problems.sort(compareProblems)
        }))
    }));
}

function selectProblemById(id) {
  if (!id) return;
  state.currentProblemId = id;
  state.currentStepIndex = 0;
  renderProblemList();
  renderCurrentProblem();
}

function getCurrentProblem() {
  return state.filtered.find((problem) => problem.id === state.currentProblemId) || state.filtered[0];
}

function getCurrentStep() {
  const problem = getCurrentProblem();
  return problem?.steps[state.currentStepIndex];
}

function renderCurrentProblem() {
  const problem = getCurrentProblem();
  if (!problem) return;
  const step = getCurrentStep();
  const lastStepIndex = Math.max(problem.steps.length - 1, 0);
  const current = state.currentStepIndex;

  els.subjectTag.textContent = problem.categoria;
  els.topicTag.textContent = `${problem.tema} · ${problem.subtema}`;
  els.levelTag.textContent = problem.nivel;
  els.problemTitle.textContent = problem.titulo;
  els.problemStatement.textContent = normalizeVisibleText(problem.enunciado);

  els.stepNumber.textContent = current;
  els.stepTotal.textContent = lastStepIndex;
  els.progressBar.style.width = `${lastStepIndex === 0 ? 100 : (current / lastStepIndex) * 100}%`;

  els.stepTitle.textContent = step?.titulo || "";
  els.stepKind.textContent = step?.tipo || "";
  els.boardFormula.innerHTML = renderFormula(step?.formula || "");
  els.boardText.textContent = normalizeVisibleText(step?.textoPizarra || "");
  els.stepExplanation.textContent = normalizeVisibleText(step?.voz || "");
  els.board.classList.toggle("empty", !(hasContent(step?.formula) || hasContent(step?.textoPizarra)));

  els.prevStep.disabled = state.currentStepIndex === 0;
  els.nextStep.disabled = state.currentStepIndex === lastStepIndex;
}

function goStep(delta) {
  stopSpeech();
  const problem = getCurrentProblem();
  if (!problem) return;
  const next = state.currentStepIndex + delta;
  if (next < 0 || next >= problem.steps.length) return;
  state.currentStepIndex = next;
  renderCurrentProblem();
}

function speakCurrentStep() {
  if (!("speechSynthesis" in window)) return;

  stopSpeech();
  const step = getCurrentStep();
  const text = step?.voz || step?.textoPizarra || step?.titulo || "";
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 1.5;
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
    const board = [formulaToMarkdown(item.formula), normalizeVisibleText(item.textoPizarra || "")]
      .filter(Boolean)
      .join("\n");
    return `## Paso ${index}: ${item.titulo}${marker}\n\nTipo: ${item.tipo}\n\nPizarra:\n${board}\n\nTexto/TTS:\n${normalizeVisibleText(item.voz || "")}`;
  }).join("\n\n---\n\n");

  return `# ${problem.titulo}\n\nArchivo: ${problem.archivo}\nCategoría: ${problem.categoria}\nTema: ${problem.tema}\nSubtema: ${problem.subtema}\nNivel: ${problem.nivel}\n\n## Enunciado\n\n${normalizeVisibleText(problem.enunciado)}\n\n## Punto de atasco\n\nPaso ${stepIndex}: ${step.titulo}\n\n---\n\n${steps}\n`;
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

function normalizeVisibleText(value) {
  if (Array.isArray(value)) return value.map((line) => String(line).trim()).filter(Boolean).join("\n");
  return String(value ?? "").replace(/\\n/g, "\n").trim();
}

function hasContent(value) {
  if (Array.isArray(value)) return value.some((item) => String(item ?? "").trim());
  return String(value ?? "").trim().length > 0;
}

function formulaToMarkdown(value) {
  return normalizeFormulaLines(value).join("\n");
}

function normalizeFormulaLines(input) {
  if (!input) return [];
  const raw = Array.isArray(input) ? input : String(input).replace(/\\n/g, "\n").split(/\n|;/g);
  return raw
    .map((line) => normalizeMathAliases(line))
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeMathAliases(input) {
  return String(input ?? "")
    .replace(/y_prime/g, "y'")
    .replace(/y_second/g, "y''")
    .replace(/Omega(?=_|\b)/g, "Ω")
    .replace(/omega(?=_|\b)/g, "ω")
    .replace(/theta(?=_|\b)/g, "θ")
    .replace(/phi(?=_|\b)/g, "φ")
    .replace(/alpha(?=_|\b)/g, "α")
    .replace(/beta(?=_|\b)/g, "β")
    .replace(/gamma(?=_|\b)/g, "γ")
    .replace(/lambda(?=_|\b)/g, "λ")
    .replace(/mu(?=_|\b)/g, "μ")
    .replace(/Delta(?=_|\b)/g, "Δ")
    .replace(/([A-Za-zθφωΩαβγλμ])_ddot\b/g, "$1̈")
    .replace(/([A-Za-zθφωΩαβγλμ])_dot\b/g, "$1̇")
    .replace(/sqrt\(([^()]+(?:\([^()]*\)[^()]*)?)\)/g, "√($1)")
    .replace(/\\sqrt\{([^{}]+)\}/g, "√($1)")
    .replace(/\\int/g, "∫")
    .replace(/\\partial/g, "∂")
    .replace(/\\sum/g, "Σ")
    .replace(/\\cdot/g, "·")
    .replace(/\\times/g, "×")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\Rightarrow/g, "⇒")
    .replace(/\\left/g, "")
    .replace(/\\right/g, "");
}

function renderFormula(input) {
  const lines = normalizeFormulaLines(input);
  if (!lines.length) return "";

  return lines.map((line) => {
    const html = renderMathLine(line);
    const len = line.length;
    const sizeClass = len > 52 ? "xlong" : len > 34 ? "long" : len < 12 ? "short" : "";
    return `<span class="formula-line ${sizeClass}">${html}</span>`;
  }).join("");
}

function renderMathLine(input) {
  let output = escapeHtml(input);

  output = output.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, `<span class="frac"><span>$1</span><span>$2</span></span>`);
  output = output.replace(/([A-Za-zθφωΩαβγλμ])_\{?([A-Za-z0-9]+)\}?/g, "$1<sub>$2</sub>");
  output = output.replace(/([A-Za-z0-9\)'θφωΩαβγλμ])\^\{?([A-Za-z0-9+\-]+)\}?/g, "$1<sup>$2</sup>");

  return output;
}

function getSubjectLabel(slug, fallback) {
  return state.subjects.asignaturas?.[slug] || fallback || titleFromSlug(slug);
}

function normalizeTema(tema, numero) {
  if (tema) return String(tema).toUpperCase().startsWith("T") ? tema : `T${tema}`;
  return numero ? `T${numero}` : "T?";
}

function compareSubjects(a, b) {
  const order = state.subjects.orden || [];
  const ia = order.indexOf(a.slug);
  const ib = order.indexOf(b.slug);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  return a.label.localeCompare(b.label, "es");
}

function compareProblems(a, b) {
  return (a.temaNumero || 999) - (b.temaNumero || 999)
    || a.subtema.localeCompare(b.subtema, "es")
    || a.titulo.localeCompare(b.titulo, "es");
}

function compareFileNames(a, b) {
  const pa = parseProblemFileName(a);
  const pb = parseProblemFileName(b);
  return (pa.asignatura || "").localeCompare(pb.asignatura || "", "es")
    || (pa.temaNumero || 999) - (pb.temaNumero || 999)
    || (pa.subtemaSlug || "").localeCompare(pb.subtemaSlug || "", "es")
    || a.localeCompare(b, "es");
}

function titleFromSlug(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sin-titulo";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
