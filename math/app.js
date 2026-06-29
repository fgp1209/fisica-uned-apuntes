(() => {
  const paper = document.getElementById('paper');
  const tpl = document.getElementById('lineTemplate');
  const toolbar = document.getElementById('toolbar');
  const vk = document.getElementById('virtualKeyboard');
  const vkGrid = document.getElementById('vkGrid');
  const functionSelect = document.getElementById('functionSelect');
  const sourcePanel = document.getElementById('sourcePanel');
  const latexOutput = document.getElementById('latexOutput');

  const STORAGE_KEY = 'mathnote-live-v4';
  let activeField = null;
  let keyboardMode = 'abc';
  let shifted = false;

  const CATALOG = [
    { key: 'absoluto', label: 'Absoluto |x|', latex: '\\left|#0\\right|' },
    { key: 'alineado', label: 'Alineado', latex: '\\begin{aligned}#?&=#?\\\\#?&=#?\\end{aligned}' },
    { key: 'argumento', label: 'Argumento complejo', latex: '\\arg z' },
    { key: 'autovalor', label: 'Autovalor', latex: 'A#?=\\lambda #?' },
    { key: 'base', label: 'Base / span', latex: '\\operatorname{span}\\{#?\\}' },
    { key: 'casos', label: 'Casos', latex: '\\begin{cases}#?,& #?\\\\#?,& #?\\end{cases}' },
    { key: 'cauchy', label: 'Cauchy integral', latex: '\\int_\\gamma \\frac{f(z)}{z-z_0}\\,dz=2\\pi i f(z_0)' },
    { key: 'conjugado', label: 'Conjugado', latex: '\\bar{#0}' },
    { key: 'cr', label: 'Cauchy-Riemann', latex: 'u_x=v_y,\\quad u_y=-v_x' },
    { key: 'determinante2', label: 'Determinante 2x2', latex: '\\begin{vmatrix}#?&#?\\\\#?&#?\\end{vmatrix}' },
    { key: 'determinante3', label: 'Determinante 3x3', latex: '\\begin{vmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{vmatrix}' },
    { key: 'derivada', label: 'Derivada', latex: '\\frac{d#?}{d#?}' },
    { key: 'edo1', label: 'EDO lineal 1º', latex: 'y^\\prime+p(x)y=q(x)' },
    { key: 'euler', label: 'Euler complejo', latex: 'e^{i\\theta}=\\cos\\theta+i\\sin\\theta' },
    { key: 'exponencial', label: 'Exponencial', latex: 'e^{#?}' },
    { key: 'fraccion', label: 'Fracción', latex: '\\frac{#0}{#?}' },
    { key: 'funcion_compleja', label: 'Función compleja', latex: 'f(z)=u(x,y)+iv(x,y)' },
    { key: 'integral', label: 'Integral definida', latex: '\\int_{#?}^{#?} #?\\,d#?' },
    { key: 'integral_gamma', label: 'Integral sobre γ', latex: '\\int_\\gamma #?\\,dz' },
    { key: 'jacobiano', label: 'Jacobiano', latex: 'J=\\frac{\\partial(x,y)}{\\partial(u,v)}' },
    { key: 'laplace', label: 'Laplace', latex: '\\mathcal{L}\\{f(t)\\}=\\int_0^\\infty e^{-st}f(t)\\,dt' },
    { key: 'laurent', label: 'Laurent', latex: '\\sum_{n=-\\infty}^{\\infty} a_n(z-z_0)^n' },
    { key: 'limite', label: 'Límite', latex: '\\lim_{#?\\to#?} #?' },
    { key: 'logaritmo', label: 'Log complejo', latex: '\\log z=\\ln|z|+i\\arg z' },
    { key: 'matriz2', label: 'Matriz 2x2', latex: '\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}' },
    { key: 'matriz3', label: 'Matriz 3x3', latex: '\\begin{bmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{bmatrix}' },
    { key: 'modulo', label: 'Módulo complejo', latex: '|z|^2=z\\bar z' },
    { key: 'norma', label: 'Norma', latex: '\\left\\lVert#0\\right\\rVert' },
    { key: 'parcial', label: 'Parcial', latex: '\\frac{\\partial #?}{\\partial #?}' },
    { key: 'parcial2', label: 'Parcial segunda', latex: '\\frac{\\partial^2 #?}{\\partial #?\\partial #?}' },
    { key: 'producto', label: 'Producto Π', latex: '\\prod_{#?}^{#?} #?' },
    { key: 'producto_interno', label: 'Producto interno', latex: '\\left\\langle #0,#? \\right\\rangle' },
    { key: 'raiz', label: 'Raíz', latex: '\\sqrt{#0}' },
    { key: 'residuo', label: 'Residuo', latex: '\\operatorname{Res}(f,z_0)' },
    { key: 'residuos', label: 'Teorema residuos', latex: '\\int_\\gamma f(z)\\,dz=2\\pi i\\sum_k \\operatorname{Res}(f,z_k)' },
    { key: 'serie', label: 'Serie de potencias', latex: '\\sum_{n=0}^{\\infty} a_n(z-z_0)^n' },
    { key: 'sistema', label: 'Sistema x′=Ax', latex: '\\mathbf{x}^\\prime=A\\mathbf{x}' },
    { key: 'sumatorio', label: 'Sumatorio', latex: '\\sum_{#?}^{#?} #?' },
    { key: 'taylor', label: 'Taylor', latex: 'f(z)=\\sum_{n=0}^{\\infty} \\frac{f^{(n)}(z_0)}{n!}(z-z_0)^n' },
    { key: 'trig_cos', label: 'cos( )', latex: '\\cos\\left(#?\\right)' },
    { key: 'trig_sin', label: 'sin( )', latex: '\\sin\\left(#?\\right)' },
    { key: 'trig_tan', label: 'tan( )', latex: '\\tan\\left(#?\\right)' },
    { key: 'wronskiano', label: 'Wronskiano', latex: 'W(y_1,y_2)=\\begin{vmatrix}y_1&y_2\\\\y_1^\\prime&y_2^\\prime\\end{vmatrix}' },
  ];

  const ALIASES = new Map(CATALOG.map(x => [x.key, x.latex]));
  for (const [alias, key] of [
    ['frac','fraccion'], ['fraccion','fraccion'], ['integral','integral'], ['int','integral'],
    ['sum','sumatorio'], ['sumatorio','sumatorio'], ['lim','limite'], ['limite','limite'],
    ['matriz2','matriz2'], ['matriz3','matriz3'], ['determinante2','determinante2'], ['determinante3','determinante3'],
    ['det2','determinante2'], ['det3','determinante3'], ['parcial','parcial'], ['parcial2','parcial2'],
    ['casos','casos'], ['cauchy','cauchy'], ['cr','cr'], ['laplace','laplace'], ['laurent','laurent'],
    ['residuo','residuo'], ['residuos','residuos'], ['taylor','taylor'], ['sin','trig_sin'], ['cos','trig_cos'], ['tan','trig_tan']
  ]) ALIASES.set(alias, ALIASES.get(key));

  const TOP_KEYS = ['fraccion','raiz','integral','sumatorio','limite','parcial','parcial2','trig_sin','trig_cos','matriz2','matriz3','determinante3','cr','cauchy'];

  const LETTERS = [
    ['α','\\alpha'], ['β','\\beta'], ['γ','\\gamma'], ['Γ','\\Gamma'], ['δ','\\delta'], ['Δ','\\Delta'],
    ['ε','\\epsilon'], ['η','\\eta'], ['θ','\\theta'], ['Θ','\\Theta'], ['λ','\\lambda'], ['Λ','\\Lambda'],
    ['μ','\\mu'], ['ν','\\nu'], ['ξ','\\xi'], ['π','\\pi'], ['Π','\\Pi'], ['ρ','\\rho'],
    ['σ','\\sigma'], ['Σ','\\Sigma'], ['τ','\\tau'], ['φ','\\phi'], ['ψ','\\psi'], ['ω','\\omega'], ['Ω','\\Omega'],
    ['ℝ','\\mathbb{R}'], ['ℂ','\\mathbb{C}'], ['ℕ','\\mathbb{N}'], ['ℤ','\\mathbb{Z}'], ['ℚ','\\mathbb{Q}'],
    ['∂','\\partial'], ['∇','\\nabla'], ['∞','\\infty'], ['∈','\\in'], ['∉','\\notin'], ['⊂','\\subset'], ['⊆','\\subseteq'],
    ['≤','\\le'], ['≥','\\ge'], ['≠','\\ne'], ['≈','\\approx'], ['⇒','\\Rightarrow'], ['⇔','\\Leftrightarrow'], ['→','\\to'], ['↦','\\mapsto'],
    ['∀','\\forall'], ['∃','\\exists'], ['∧','\\land'], ['∨','\\lor'], ['¬','\\neg']
  ];

  const SYMBOL_ROWS = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['@','#','€','_','&','-','+','(',')','/'],
    ['\\','*','"','\'',':',';','!','?','=','⌫'],
    ['ABC',',','<','>','[',']','{','}','.','↵']
  ];
  const ABC_ROWS = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l','ñ'],
    ['⇧','z','x','c','v','b','n','m','⌫'],
    ['123','_','^','=','+','-','(',')','/','↵']
  ];

  const sortEs = (a, b) => a.label.localeCompare(b.label, 'es');
  const byKey = new Map(CATALOG.map(x => [x.key, x]));

  function repairLatex(value = '') {
    return String(value).replace(/\\\\([A-Za-z{}])/g, '\\$1');
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
          inlineShortcuts: Object.fromEntries(ALIASES),
          keypressSound: 'none',
          plonkSound: 'none',
        });
      }
      window.mathVirtualKeyboard?.hide?.();
    }, 0);
  }

  function createLine(value = '', afterRow = null) {
    const row = tpl.content.firstElementChild.cloneNode(true);
    const mf = row.querySelector('math-field');
    mf.value = repairLatex(value || '');
    configureField(mf);
    mf.addEventListener('focusin', () => {
      activeField = mf;
      window.mathVirtualKeyboard?.hide?.();
    });
    mf.addEventListener('pointerdown', () => {
      activeField = mf;
      window.mathVirtualKeyboard?.hide?.();
    });
    mf.addEventListener('input', save);
    mf.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        newLine();
      }
    });
    if (afterRow && afterRow.nextSibling) paper.insertBefore(row, afterRow.nextSibling);
    else paper.appendChild(row);
    return mf;
  }

  function activeRow() {
    return activeField?.closest('.line') || paper.lastElementChild;
  }

  function ensureField() {
    if (!activeField) activeField = paper.querySelector('math-field') || createLine();
    return activeField;
  }

  function focusField() {
    const mf = ensureField();
    try { mf.focus({ preventScroll: true }); } catch { mf.focus(); }
    window.mathVirtualKeyboard?.hide?.();
  }

  function insertLatex(latex) {
    const mf = ensureField();
    focusField();
    try {
      mf.insert(repairLatex(latex), {
        insertionMode: 'replaceSelection',
        selectionMode: 'placeholder',
        focus: true,
        feedback: false,
      });
    } catch {
      mf.value = (mf.value || '') + repairLatex(latex);
    }
    window.mathVirtualKeyboard?.hide?.();
    save();
  }

  function command(cmd) {
    const mf = ensureField();
    focusField();
    try {
      mf.executeCommand(cmd);
      save();
      return true;
    } catch { return false; }
  }

  function backspace() {
    const mf = ensureField();
    if (!command('deleteBackward')) {
      mf.value = (mf.value || '').slice(0, -1);
      save();
    }
  }

  function moveLeft() { command('moveToPreviousChar'); }
  function moveRight() { command('moveToNextChar'); }

  function newLine() {
    const next = createLine('', activeRow());
    activeField = next;
    focusField();
    save();
  }

  function expandSpaceShortcut() {
    const mf = ensureField();
    const v = mf.value || '';
    const fracMatch = v.match(/(^|[^A-Za-z0-9_{}\\])([A-Za-z0-9_{}\\]+)\/$/);
    if (fracMatch) {
      const token = fracMatch[2];
      mf.value = v.slice(0, v.length - token.length - 1);
      insertLatex(`\\frac{${token}}{#?}`);
      return true;
    }
    const keys = [...ALIASES.keys()].sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (v.endsWith(key)) {
        mf.value = v.slice(0, -key.length);
        insertLatex(ALIASES.get(key));
        return true;
      }
    }
    return false;
  }

  function pressToken(token) {
    if (token === '⌫') return backspace();
    if (token === '↵') return newLine();
    if (token === '⇦') return moveLeft();
    if (token === '⇨') return moveRight();
    if (token === '⇧') { shifted = !shifted; renderKeyboard(); return; }
    if (token === '123') { setMode('sym'); return; }
    if (token === 'ABC') { setMode('abc'); return; }
    if (token === 'space') {
      if (!expandSpaceShortcut()) insertLatex('\\;');
      return;
    }
    insertLatex(shifted && /^[a-zñ]$/.test(token) ? token.toUpperCase() : token);
    if (shifted) { shifted = false; renderKeyboard(); }
  }

  function makeKey(label, handler, extra = '') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = 'vkKey ' + extra;
    btn.addEventListener('pointerdown', ev => ev.preventDefault());
    btn.addEventListener('click', handler);
    return btn;
  }

  function renderRows(rows, className) {
    vkGrid.className = 'vkGrid ' + className;
    vkGrid.innerHTML = '';
    for (const row of rows) {
      const div = document.createElement('div');
      div.className = 'vkRow';
      for (const token of row) {
        let extra = '';
        if (['⌫','↵','⇧','123','ABC'].includes(token)) extra = 'ctrl';
        const label = shifted && /^[a-zñ]$/.test(token) ? token.toUpperCase() : token;
        div.appendChild(makeKey(label, () => pressToken(token), extra));
      }
      vkGrid.appendChild(div);
    }
    const bottom = document.createElement('div');
    bottom.className = 'vkRow bottom';
    bottom.appendChild(makeKey('⇦', moveLeft, 'ctrl small'));
    bottom.appendChild(makeKey('fx', () => setMode('fx'), 'ctrl small'));
    bottom.appendChild(makeKey('αβγ', () => setMode('letters'), 'ctrl small'));
    bottom.appendChild(makeKey('space', () => pressToken('space'), 'space'));
    bottom.appendChild(makeKey('⇨', moveRight, 'ctrl small'));
    vkGrid.appendChild(bottom);
  }

  function renderFunctions() {
    vkGrid.className = 'vkGrid functions';
    vkGrid.innerHTML = '';
    const items = [...CATALOG].sort(sortEs);
    for (const item of items) {
      vkGrid.appendChild(makeKey(item.label, () => insertLatex(item.latex), 'func'));
    }
  }

  function renderLetters() {
    vkGrid.className = 'vkGrid letters';
    vkGrid.innerHTML = '';
    for (const [label, latex] of LETTERS) {
      vkGrid.appendChild(makeKey(label, () => insertLatex(latex), 'letter'));
    }
  }

  function setMode(mode) {
    keyboardMode = mode;
    document.querySelectorAll('.vkTabs button').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    renderKeyboard();
  }

  function renderKeyboard() {
    if (keyboardMode === 'abc') renderRows(ABC_ROWS, 'abc');
    else if (keyboardMode === 'sym') renderRows(SYMBOL_ROWS, 'sym');
    else if (keyboardMode === 'fx') renderFunctions();
    else renderLetters();
  }

  function initToolbar() {
    toolbar.innerHTML = '';
    for (const key of TOP_KEYS) {
      const item = byKey.get(key);
      if (!item) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = item.label
        .replace('Fracción','a/b')
        .replace('Raíz','√')
        .replace('Integral definida','∫')
        .replace('Sumatorio','Σ')
        .replace('Límite','lim')
        .replace('Parcial segunda','∂²')
        .replace('Parcial','∂')
        .replace('Matriz 2x2','M2')
        .replace('Matriz 3x3','M3')
        .replace('Determinante 3x3','det3')
        .replace('Cauchy-Riemann','CR')
        .replace('Cauchy integral','Cauchy');
      btn.title = item.label;
      btn.addEventListener('pointerdown', ev => ev.preventDefault());
      btn.addEventListener('click', () => insertLatex(item.latex));
      toolbar.appendChild(btn);
    }

    functionSelect.innerHTML = '';
    for (const item of [...CATALOG].sort(sortEs)) {
      const opt = document.createElement('option');
      opt.value = item.key;
      opt.textContent = item.label;
      functionSelect.appendChild(opt);
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
      lines = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('mathnote-live-v3') ||
        localStorage.getItem('mathnote-live-v2') ||
        localStorage.getItem('mathnote-live-v1') ||
        '[]'
      );
    } catch { lines = []; }
    if (!Array.isArray(lines) || lines.length === 0) lines = [''];
    lines.forEach(line => createLine(line));
    activeField = paper.querySelector('math-field');
  }

  document.querySelectorAll('.vkTabs button').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
  document.getElementById('runCommand').addEventListener('click', () => {
    const item = CATALOG.find(x => x.key === functionSelect.value);
    if (item) insertLatex(item.latex);
  });
  document.getElementById('addLine').addEventListener('click', newLine);
  document.getElementById('copyLatex').addEventListener('click', async () => navigator.clipboard.writeText(getAllLatex()));
  document.getElementById('toggleSource').addEventListener('click', () => {
    latexOutput.value = getAllLatex();
    sourcePanel.hidden = false;
  });
  document.getElementById('closeSource').addEventListener('click', () => sourcePanel.hidden = true);
  document.getElementById('clearAll').addEventListener('click', () => {
    if (!confirm('Borrar toda la hoja local?')) return;
    ['mathnote-live-v4','mathnote-live-v3','mathnote-live-v2','mathnote-live-v1'].forEach(k => localStorage.removeItem(k));
    paper.innerHTML = '';
    activeField = createLine('');
    focusField();
  });

  window.addEventListener('beforeunload', save);
  window.addEventListener('DOMContentLoaded', () => {
    initToolbar();
    load();
    renderKeyboard();
    setTimeout(() => focusField(), 150);
  });
})();
