(() => {
  const paper = document.getElementById('paper');
  const tpl = document.getElementById('lineTemplate');
  const sourcePanel = document.getElementById('sourcePanel');
  const symbolPanel = document.getElementById('symbolPanel');
  const latexOutput = document.getElementById('latexOutput');
  const commandInput = document.getElementById('commandInput');
  const toggleMathKeyboardBtn = document.getElementById('toggleMathKeyboard');
  const togglePaletteBtn = document.getElementById('togglePalette');

  const STORAGE_KEY = 'mathnote-live-v1';
  let activeField = null;

  const SNIPPETS = {
    'frac': '\\frac{#0}{#?}',
    'sqrt': '\\sqrt{#0}',
    'int': '\\int_{#?}^{#?} #?\\,d#?',
    'sum': '\\sum_{#?}^{#?} #?',
    'prod': '\\prod_{#?}^{#?} #?',
    'lim': '\\lim_{#?\\to#?} #?',
    'par': '\\left(#0\\right)',
    'abs': '\\left|#0\\right|',
    'norm': '\\left\\lVert#0\\right\\rVert',
    'bar': '\\bar{#0}',
    'vec': '\\vec{#0}',
    'cases': '\\begin{cases}#?,& #?\\\\#?,& #?\\end{cases}',
    '*cases': '\\begin{cases}#?,& #?\\\\#?,& #?\\end{cases}',
    'align': '\\begin{aligned}#?&=#?\\\\#?&=#?\\end{aligned}',
    '*align': '\\begin{aligned}#?&=#?\\\\#?&=#?\\end{aligned}',
    'm2': '\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}',
    'm22': '\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}',
    '*m2x2': '\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}',
    '*m22': '\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}',
    'm3': '\\begin{bmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{bmatrix}',
    'm33': '\\begin{bmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{bmatrix}',
    '*m3x3': '\\begin{bmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{bmatrix}',
    '*m33': '\\begin{bmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{bmatrix}',
    'det2': '\\begin{vmatrix}#?&#?\\\\#?&#?\\end{vmatrix}',
    '*det2': '\\begin{vmatrix}#?&#?\\\\#?&#?\\end{vmatrix}',
    'det3': '\\begin{vmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{vmatrix}',
    '*det3': '\\begin{vmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{vmatrix}',
    'cr': 'u_x=v_y,\\quad u_y=-v_x',
    '*cr': 'u_x=v_y,\\quad u_y=-v_x',
    'cauchy': '\\int_\\gamma \\frac{f(z)}{z-z_0}\\,dz=2\\pi i f(z_0)',
    '*cauchy': '\\int_\\gamma \\frac{f(z)}{z-z_0}\\,dz=2\\pi i f(z_0)',
    'laplace': '\\mathcal{L}\\{f(t)\\}=\\int_0^\\infty e^{-st}f(t)\\,dt',
    '*laplace': '\\mathcal{L}\\{f(t)\\}=\\int_0^\\infty e^{-st}f(t)\\,dt',
    'pd': '\\frac{\\partial #?}{\\partial #?}',
    'pd2': '\\frac{\\partial^2 #?}{\\partial #?\\partial #?}',
  };

  const INLINE_TOKENS = Object.keys(SNIPPETS).sort((a, b) => b.length - a.length);

  function createLine(value = '', afterRow = null) {
    const row = tpl.content.firstElementChild.cloneNode(true);
    const mf = row.querySelector('math-field');
    mf.value = value || '';

    mf.addEventListener('focusin', () => { activeField = mf; });
    mf.addEventListener('input', save);
    mf.addEventListener('keydown', (ev) => handleMathKeydown(ev, mf, row));

    if (afterRow && afterRow.nextSibling) paper.insertBefore(row, afterRow.nextSibling);
    else paper.appendChild(row);

    setTimeout(() => {
      if (typeof mf.setOptions === 'function') {
        mf.setOptions({
          defaultMode: 'math',
          smartMode: false,
          virtualKeyboardMode: 'manual',
          mathVirtualKeyboardPolicy: 'manual',
          keypressSound: 'none',
          plonkSound: 'none',
          inlineShortcuts: {
            ...SNIPPETS,
            sin: '\\sin', cos: '\\cos', tan: '\\tan', log: '\\log', ln: '\\ln',
            alpha: '\\alpha', beta: '\\beta', gamma: '\\gamma', delta: '\\delta',
            theta: '\\theta', lambda: '\\lambda', mu: '\\mu', pi: '\\pi', omega: '\\omega'
          }
        });
      }
    }, 0);

    return mf;
  }

  function focusField(mf) {
    activeField = mf;
    mf.focus();
  }

  function insertLatex(latex) {
    if (!activeField) {
      activeField = paper.querySelector('math-field') || createLine();
    }
    focusField(activeField);
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
        insertInto(mf, SNIPPETS[token]);
        save();
        return true;
      }
    }
    return false;
  }

  function insertInto(mf, latex) {
    focusField(mf);
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
    try { lines = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { lines = []; }
    if (!Array.isArray(lines) || lines.length === 0) lines = [''];
    lines.forEach(line => createLine(line));
    setTimeout(() => focusField(paper.querySelector('math-field')), 200);
  }

  document.querySelectorAll('[data-latex]').forEach(btn => {
    btn.addEventListener('click', () => insertLatex(btn.dataset.latex));
  });

  toggleMathKeyboardBtn.addEventListener('click', () => {
    if (!activeField) activeField = paper.querySelector('math-field') || createLine();
    focusField(activeField);
    if (typeof activeField.executeCommand === 'function') {
      activeField.executeCommand('toggleVirtualKeyboard');
    } else if (window.mathVirtualKeyboard?.visible) {
      window.mathVirtualKeyboard.hide();
    } else if (window.mathVirtualKeyboard?.show) {
      window.mathVirtualKeyboard.show();
    }
  });

  togglePaletteBtn.addEventListener('click', () => {
    symbolPanel.hidden = !symbolPanel.hidden;
    togglePaletteBtn.classList.toggle('active', !symbolPanel.hidden);
    if (!symbolPanel.hidden && activeField) activeField.focus();
  });

  document.getElementById('closePalette').addEventListener('click', () => {
    symbolPanel.hidden = true;
    togglePaletteBtn.classList.remove('active');
    activeField?.focus();
  });

  document.getElementById('addLine').addEventListener('click', () => {
    const row = activeField?.closest('.line') || paper.lastElementChild;
    const next = createLine('', row);
    focusField(next);
    save();
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
    activeField?.focus();
  });

  window.addEventListener('virtual-keyboard-toggle', ev => {
    const visible = Boolean(ev?.detail?.visible);
    toggleMathKeyboardBtn.classList.toggle('active', visible);
  });

  document.getElementById('clearAll').addEventListener('click', () => {
    if (!confirm('Borrar toda la hoja local?')) return;
    localStorage.removeItem(STORAGE_KEY);
    paper.innerHTML = '';
    focusField(createLine(''));
  });

  document.getElementById('runCommand').addEventListener('click', runCommandInput);
  commandInput.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      runCommandInput();
    }
  });

  function runCommandInput() {
    const raw = commandInput.value.trim();
    if (!raw) return;
    insertLatex(SNIPPETS[raw] || raw);
    commandInput.value = '';
  }

  window.addEventListener('beforeunload', save);
  window.addEventListener('DOMContentLoaded', load);
})();
