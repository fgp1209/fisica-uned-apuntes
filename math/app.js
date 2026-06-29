(() => {
  const paper = document.getElementById('paper');
  const tpl = document.getElementById('lineTemplate');
  const sourcePanel = document.getElementById('sourcePanel');
  const symbolPanel = document.getElementById('symbolPanel');
  const latexOutput = document.getElementById('latexOutput');
  const toolbar = document.getElementById('toolbar');
  const symbolGrid = document.getElementById('symbolGrid');
  const functionSelect = document.getElementById('functionSelect');
  const toggleMathKeyboardBtn = document.getElementById('toggleMathKeyboard');
  const focusNativeKeyboardBtn = document.getElementById('focusNativeKeyboard');

  const STORAGE_KEY = 'mathnote-live-v2';
  let activeField = null;
  let mathKeyboardVisible = false;

  const CATALOG = [
    { key: 'abs', label: 'Absoluto |x|', latex: '\\left|#0\\right|' },
    { key: 'alineado', label: 'Alineado 2 líneas', latex: '\\begin{aligned}#?&=#?\\\\#?&=#?\\end{aligned}' },
    { key: 'autovalor', label: 'Autovalor T(v)=λv', latex: 'T(#?)=\\lambda #?' },
    { key: 'base', label: 'Base / span', latex: '\\operatorname{span}\\{#?\\}' },
    { key: 'bar', label: 'Barra conjugado', latex: '\\bar{#0}' },
    { key: 'cambio', label: 'Cambio y=vx', latex: 'y=vx,\\quad y^\\prime=v+xv^\\prime' },
    { key: 'casos', label: 'Casos', latex: '\\begin{cases}#?,& #?\\\\#?,& #?\\end{cases}' },
    { key: 'cauchy', label: 'Cauchy integral', latex: '\\int_\\gamma \\frac{f(z)}{z-z_0}\\,dz=2\\pi i f(z_0)' },
    { key: 'convolucion', label: 'Convolución Laplace', latex: '(f*g)(t)=\\int_0^t f(\\tau)g(t-\\tau)\\,d\\tau' },
    { key: 'cr', label: 'Cauchy-Riemann', latex: 'u_x=v_y,\\quad u_y=-v_x' },
    { key: 'derivada', label: 'Derivada d/dx', latex: '\\frac{d#?}{d#?}' },
    { key: 'parcial', label: 'Derivada parcial', latex: '\\frac{\\partial #?}{\\partial #?}' },
    { key: 'parcial2', label: 'Derivada parcial segunda', latex: '\\frac{\\partial^2 #?}{\\partial #?\\partial #?}' },
    { key: 'determinante2', label: 'Determinante 2x2', latex: '\\begin{vmatrix}#?&#?\\\\#?&#?\\end{vmatrix}' },
    { key: 'determinante3', label: 'Determinante 3x3', latex: '\\begin{vmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{vmatrix}' },
    { key: 'edo1', label: 'EDO lineal 1º orden', latex: 'y^\\prime+p(x)y=q(x)' },
    { key: 'euler', label: 'Euler complejo', latex: 'e^{i\\theta}=\\cos\\theta+i\\sin\\theta' },
    { key: 'exponencial', label: 'Exponencial e^x', latex: 'e^{#?}' },
    { key: 'fraccion', label: 'Fracción', latex: '\\frac{#0}{#?}' },
    { key: 'funcion_compleja', label: 'Función compleja u+iv', latex: 'f(z)=u(x,y)+iv(x,y)' },
    { key: 'integral', label: 'Integral definida', latex: '\\int_{#?}^{#?} #?\\,d#?' },
    { key: 'integral_gamma', label: 'Integral sobre γ', latex: '\\int_\\gamma #?\\,dz' },
    { key: 'laplace', label: 'Laplace definición', latex: '\\mathcal{L}\\{f(t)\\}=\\int_0^\\infty e^{-st}f(t)\\,dt' },
    { key: 'laurent', label: 'Serie de Laurent', latex: '\\sum_{n=-\\infty}^{\\infty} a_n(z-z_0)^n' },
    { key: 'limite', label: 'Límite', latex: '\\lim_{#?\\to#?} #?' },
    { key: 'log', label: 'Logaritmo complejo', latex: '\\log z=\\ln|z|+i\\arg z' },
    { key: 'matriz2', label: 'Matriz 2x2', latex: '\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}' },
    { key: 'matriz3', label: 'Matriz 3x3', latex: '\\begin{bmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{bmatrix}' },
    { key: 'modulo_complejo', label: 'Módulo complejo', latex: '|z|^2=z\\bar z' },
    { key: 'norma', label: 'Norma', latex: '\\left\\lVert#0\\right\\rVert' },
    { key: 'producto', label: 'Producto Π', latex: '\\prod_{#?}^{#?} #?' },
    { key: 'producto_interno', label: 'Producto interno', latex: '\\left\\langle #0,#? \\right\\rangle' },
    { key: 'raiz', label: 'Raíz cuadrada', latex: '\\sqrt{#0}' },
    { key: 'residuo', label: 'Residuo', latex: '\\operatorname{Res}(f,z_0)=\\frac{1}{2\\pi i}\\int_\\gamma f(z)\\,dz' },
    { key: 'residuos', label: 'Teorema de residuos', latex: '\\int_\\gamma f(z)\\,dz=2\\pi i\\sum_k \\operatorname{Res}(f,z_k)' },
    { key: 'serie_potencias', label: 'Serie de potencias', latex: '\\sum_{n=0}^{\\infty} a_n(z-z_0)^n' },
    { key: 'sistema', label: 'Sistema x\'=Ax', latex: '\\mathbf{x}^\\prime=A\\mathbf{x}' },
    { key: 'sumatorio', label: 'Sumatorio Σ', latex: '\\sum_{#?}^{#?} #?' },
    { key: 'taylor', label: 'Taylor complejo', latex: 'f(z)=\\sum_{n=0}^{\\infty} \\frac{f^{(n)}(z_0)}{n!}(z-z_0)^n' },
    { key: 'trig_cos', label: 'cos( )', latex: '\\cos\\left(#?\\right)' },
    { key: 'trig_sin', label: 'sin( )', latex: '\\sin\\left(#?\\right)' },
    { key: 'trig_tan', label: 'tan( )', latex: '\\tan\\left(#?\\right)' },
    { key: 'valor_propio', label: 'Valor propio Ax=λx', latex: 'A#?=\\lambda #?' },
    { key: 'wronskiano', label: 'Wronskiano', latex: 'W(y_1,y_2)=\\begin{vmatrix}y_1&y_2\\\\y_1^\\prime&y_2^\\prime\\end{vmatrix}' },
  ];

  const SYMBOLS = [
    ['alpha', 'α', '\\alpha'], ['beta', 'β', '\\beta'], ['gamma', 'γ', '\\gamma'], ['Gamma', 'Γ', '\\Gamma'],
    ['delta', 'δ', '\\delta'], ['Delta', 'Δ', '\\Delta'], ['epsilon', 'ε', '\\epsilon'], ['varepsilon', 'ϵ', '\\varepsilon'],
    ['theta', 'θ', '\\theta'], ['lambda', 'λ', '\\lambda'], ['mu', 'μ', '\\mu'], ['pi', 'π', '\\pi'], ['omega', 'ω', '\\omega'],
    ['infinito', '∞', '\\infty'], ['parcial', '∂', '\\partial'], ['nabla', '∇', '\\nabla'],
    ['R', 'ℝ', '\\mathbb{R}'], ['C', 'ℂ', '\\mathbb{C}'], ['N', 'ℕ', '\\mathbb{N}'], ['Z', 'ℤ', '\\mathbb{Z}'], ['Q', 'ℚ', '\\mathbb{Q}'],
    ['pertenece', '∈', '\\in'], ['no pertenece', '∉', '\\notin'], ['subconjunto', '⊂', '\\subset'], ['subconjunto igual', '⊆', '\\subseteq'],
    ['union', '∪', '\\cup'], ['interseccion', '∩', '\\cap'], ['vacio', '∅', '\\emptyset'],
    ['menor igual', '≤', '\\le'], ['mayor igual', '≥', '\\ge'], ['distinto', '≠', '\\ne'], ['aprox', '≈', '\\approx'], ['equiv', '≡', '\\equiv'],
    ['implica', '⇒', '\\Rightarrow'], ['si y solo si', '⇔', '\\Leftrightarrow'], ['tiende', '→', '\\to'], ['mapsto', '↦', '\\mapsto'],
    ['para todo', '∀', '\\forall'], ['existe', '∃', '\\exists'], ['negacion', '¬', '\\neg'], ['and', '∧', '\\land'], ['or', '∨', '\\lor'],
  ];

  const ALIASES = new Map();
  for (const item of CATALOG) ALIASES.set(item.key, item.latex);
  const EXTRA_ALIASES = [
    ['frac', 'fraccion'], ['int', 'integral'], ['sum', 'sumatorio'], ['lim', 'limite'],
    ['m2', 'matriz2'], ['m3', 'matriz3'], ['det2', 'determinante2'], ['det3', 'determinante3'],
    ['pd', 'parcial'], ['pd2', 'parcial2'], ['cases', 'casos'], ['align', 'alineado'],
    ['*m2x2', 'matriz2'], ['*m3x3', 'matriz3'], ['*det2', 'determinante2'], ['*det3', 'determinante3'],
  ];
  for (const [alias, key] of EXTRA_ALIASES) ALIASES.set(alias, ALIASES.get(key));

  const TOP_KEYS = ['fraccion', 'raiz', 'integral', 'sumatorio', 'limite', 'parcial', 'parcial2', 'trig_sin', 'matriz2', 'matriz3', 'determinante3', 'cr', 'cauchy', 'laplace'];
  const INLINE_TOKENS = [...ALIASES.keys()].sort((a, b) => b.length - a.length);

  function repairLatex(value = '') {
    return String(value).replace(/\\\\([A-Za-z{}])/g, '\\$1');
  }

  function initMenus() {
    const byKey = new Map(CATALOG.map(x => [x.key, x]));
    toolbar.innerHTML = '';
    for (const key of TOP_KEYS) {
      const item = byKey.get(key);
      if (!item) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = shortLabel(item.label);
      btn.title = item.label;
      btn.addEventListener('pointerdown', ev => ev.preventDefault());
      btn.addEventListener('click', () => insertLatex(item.latex));
      toolbar.appendChild(btn);
    }

    functionSelect.innerHTML = '';
    for (const item of [...CATALOG].sort((a, b) => a.label.localeCompare(b.label, 'es'))) {
      const opt = document.createElement('option');
      opt.value = item.key;
      opt.textContent = item.label;
      functionSelect.appendChild(opt);
    }

    symbolGrid.innerHTML = '';
    for (const item of [...CATALOG].sort((a, b) => a.label.localeCompare(b.label, 'es'))) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = item.label;
      btn.addEventListener('pointerdown', ev => ev.preventDefault());
      btn.addEventListener('click', () => insertLatex(item.latex));
      symbolGrid.appendChild(btn);
    }
    for (const [, label, latex] of SYMBOLS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.className = 'symbolOnly';
      btn.addEventListener('pointerdown', ev => ev.preventDefault());
      btn.addEventListener('click', () => insertLatex(latex));
      symbolGrid.appendChild(btn);
    }
  }

  function shortLabel(label) {
    return label
      .replace('Fracción', 'a/b')
      .replace('Raíz cuadrada', '√')
      .replace('Integral definida', '∫')
      .replace('Sumatorio Σ', 'Σ')
      .replace('Límite', 'lim')
      .replace('Derivada parcial segunda', '∂²')
      .replace('Derivada parcial', '∂/∂x')
      .replace('Determinante 3x3', 'det3')
      .replace('Matriz 2x2', 'm2')
      .replace('Matriz 3x3', 'm3')
      .replace('Cauchy-Riemann', 'CR')
      .replace('Cauchy integral', 'Cauchy')
      .replace('Laplace definición', 'Laplace')
      .replace('sin( )', 'sin');
  }

  function createLine(value = '', afterRow = null) {
    const row = tpl.content.firstElementChild.cloneNode(true);
    const mf = row.querySelector('math-field');
    mf.value = repairLatex(value || '');
    configureField(mf);

    mf.addEventListener('focusin', () => { activeField = mf; });
    mf.addEventListener('pointerdown', () => { activeField = mf; setNativeKeyboardMode(mf); });
    mf.addEventListener('input', save);
    mf.addEventListener('keydown', (ev) => handleMathKeydown(ev, mf, row));

    if (afterRow && afterRow.nextSibling) paper.insertBefore(row, afterRow.nextSibling);
    else paper.appendChild(row);

    return mf;
  }

  function configureField(mf) {
    mf.setAttribute('virtual-keyboard-mode', 'off');
    mf.setAttribute('math-virtual-keyboard-policy', 'manual');
    mf.setAttribute('smart-fence', 'true');
    mf.setAttribute('smart-mode', 'false');
    setTimeout(() => {
      if (typeof mf.setOptions === 'function') {
        mf.setOptions({
          defaultMode: 'math',
          smartMode: false,
          smartFence: true,
          virtualKeyboardMode: 'off',
          mathVirtualKeyboardPolicy: 'manual',
          keypressSound: 'none',
          plonkSound: 'none',
          inlineShortcuts: Object.fromEntries(ALIASES)
        });
      }
    }, 0);
  }

  function setNativeKeyboardMode(mf = activeField) {
    if (!mf) return;
    mathKeyboardVisible = false;
    toggleMathKeyboardBtn.classList.remove('active');
    mf.setAttribute('virtual-keyboard-mode', 'off');
    if (typeof mf.setOptions === 'function') mf.setOptions({ virtualKeyboardMode: 'off', mathVirtualKeyboardPolicy: 'manual' });
    window.mathVirtualKeyboard?.hide?.();
  }

  function focusField(mf, { native = true } = {}) {
    activeField = mf;
    if (native) setNativeKeyboardMode(mf);
    mf.focus({ preventScroll: true });
  }

  function insertLatex(latex) {
    latex = repairLatex(latex);
    if (!activeField) activeField = paper.querySelector('math-field') || createLine();
    activeField.focus({ preventScroll: true });
    if (typeof activeField.insert === 'function') {
      activeField.insert(latex, {
        insertionMode: 'replaceSelection',
        selectionMode: 'placeholder',
        focus: true,
        feedback: true
      });
    } else {
      activeField.value = (activeField.value || '') + latex;
    }
    save();
  }

  function handleMathKeydown(ev, mf, row) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      const next = createLine('', row);
      focusField(next);
      save();
      return;
    }

    if (ev.key === 'Backspace' && !mf.value && paper.querySelectorAll('math-field').length > 1) {
      ev.preventDefault();
      const prev = row.previousElementSibling?.querySelector('math-field');
      const next = row.nextElementSibling?.querySelector('math-field');
      row.remove();
      focusField(prev || next);
      save();
      return;
    }

    if (ev.key === ' ' || ev.code === 'Space') {
      if (expandSpaceShortcut(mf)) ev.preventDefault();
    }
  }

  function expandSpaceShortcut(mf) {
    const v = mf.value || '';

    const fracMatch = v.match(/(^|[^A-Za-z0-9_{}\\])([A-Za-z0-9_{}\\]+)\/$/);
    if (fracMatch) {
      const prefix = v.slice(0, v.length - fracMatch[2].length - 1);
      const token = fracMatch[2];
      mf.value = prefix;
      insertInto(mf, `\\frac{${token}}{#?}`);
      save();
      return true;
    }

    for (const token of INLINE_TOKENS) {
      if (v.endsWith(token)) {
        mf.value = v.slice(0, -token.length);
        insertInto(mf, ALIASES.get(token));
        save();
        return true;
      }
    }
    return false;
  }

  function insertInto(mf, latex) {
    latex = repairLatex(latex);
    activeField = mf;
    mf.focus({ preventScroll: true });
    if (typeof mf.insert === 'function') {
      mf.insert(latex, {
        insertionMode: 'insertAfter',
        selectionMode: 'placeholder',
        focus: true,
        feedback: true
      });
    } else {
      mf.value = (mf.value || '') + latex;
    }
  }

  function getAllLatex() {
    return [...paper.querySelectorAll('math-field')]
      .map(mf => (mf.value || '').trim())
      .filter(Boolean)
      .join('\n\\\\\n');
  }

  function save() {
    const lines = [...paper.querySelectorAll('math-field')].map(mf => mf.value || '');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }

  function load() {
    let lines = [];
    try {
      lines = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('mathnote-live-v1') || '[]');
    } catch {
      lines = [];
    }
    if (!Array.isArray(lines) || lines.length === 0) lines = [''];
    lines.forEach(line => createLine(line));
    setTimeout(() => {
      activeField = paper.querySelector('math-field');
      if (activeField) setNativeKeyboardMode(activeField);
    }, 200);
  }

  function toggleMathKeyboard() {
    if (!activeField) activeField = paper.querySelector('math-field') || createLine();
    activeField.focus({ preventScroll: true });

    if (mathKeyboardVisible) {
      mathKeyboardVisible = false;
      window.mathVirtualKeyboard?.hide?.();
      setNativeKeyboardMode(activeField);
      symbolPanel.hidden = true;
      toggleMathKeyboardBtn.classList.remove('active');
      return;
    }

    mathKeyboardVisible = true;
    toggleMathKeyboardBtn.classList.add('active');
    activeField.setAttribute('virtual-keyboard-mode', 'manual');
    if (typeof activeField.setOptions === 'function') activeField.setOptions({ virtualKeyboardMode: 'manual', mathVirtualKeyboardPolicy: 'manual' });
    try {
      if (typeof activeField.executeCommand === 'function') activeField.executeCommand('showVirtualKeyboard');
      window.mathVirtualKeyboard?.show?.();
    } catch {}

    // Fallback siempre visible: si MathLive no abre su teclado en Android, queda este panel.
    symbolPanel.hidden = false;
  }

  document.getElementById('runCommand').addEventListener('click', () => {
    const item = CATALOG.find(x => x.key === functionSelect.value);
    if (item) insertLatex(item.latex);
  });

  document.getElementById('addLine').addEventListener('click', () => {
    const row = activeField?.closest('.line') || paper.lastElementChild;
    const next = createLine('', row);
    focusField(next);
    save();
  });

  focusNativeKeyboardBtn.addEventListener('click', () => {
    if (!activeField) activeField = paper.querySelector('math-field') || createLine();
    symbolPanel.hidden = true;
    focusField(activeField);
  });

  toggleMathKeyboardBtn.addEventListener('click', toggleMathKeyboard);

  document.getElementById('closePalette').addEventListener('click', () => {
    symbolPanel.hidden = true;
    toggleMathKeyboardBtn.classList.remove('active');
    mathKeyboardVisible = false;
    setNativeKeyboardMode(activeField);
    activeField?.focus({ preventScroll: true });
  });

  document.getElementById('copyLatex').addEventListener('click', async () => {
    const text = getAllLatex();
    await navigator.clipboard.writeText(text);
  });

  document.getElementById('toggleSource').addEventListener('click', () => {
    latexOutput.value = getAllLatex();
    sourcePanel.hidden = false;
    latexOutput.focus();
    latexOutput.select();
  });

  document.getElementById('closeSource').addEventListener('click', () => {
    sourcePanel.hidden = true;
    activeField?.focus({ preventScroll: true });
  });

  window.addEventListener('virtual-keyboard-toggle', ev => {
    const visible = Boolean(ev?.detail?.visible);
    mathKeyboardVisible = visible;
    toggleMathKeyboardBtn.classList.toggle('active', visible || !symbolPanel.hidden);
  });

  document.getElementById('clearAll').addEventListener('click', () => {
    if (!confirm('Borrar toda la hoja local?')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('mathnote-live-v1');
    paper.innerHTML = '';
    focusField(createLine(''));
  });

  window.addEventListener('beforeunload', save);
  window.addEventListener('DOMContentLoaded', () => {
    initMenus();
    load();
  });
})();
