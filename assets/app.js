const THEME_STORAGE_KEY = "uned-theme";
let sessionThemeOverride = null;

function getStoredTheme(){
  try{
    return sessionStorage.getItem(THEME_STORAGE_KEY) || sessionThemeOverride;
  } catch(_err){
    return sessionThemeOverride;
  }
}

function getSystemTheme(){
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getActiveTheme(){
  return getStoredTheme() || getSystemTheme();
}

function applyTheme(theme){
  const activeTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.style.colorScheme = activeTheme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if(themeColor){
    if(!themeColor.dataset.light){
      themeColor.dataset.light = themeColor.getAttribute("content") || "#3f4f75";
    }
    themeColor.setAttribute("content", activeTheme === "dark" ? "#0f172a" : themeColor.dataset.light);
  }
  document.querySelectorAll(".theme-toggle").forEach((button) => updateThemeToggle(button, activeTheme));
}

function updateThemeToggle(button, theme){
  const nextTheme = theme === "dark" ? "claro" : "nocturno";
  button.textContent = theme === "dark" ? "☀" : "☾";
  button.setAttribute("aria-label", `Cambiar a modo ${nextTheme}`);
  button.setAttribute("title", `Cambiar a modo ${nextTheme}`);
  button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
}

function toggleTheme(){
  const nextTheme = getActiveTheme() === "dark" ? "light" : "dark";
  sessionThemeOverride = nextTheme;
  try{
    sessionStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch(_err){
    // Si sessionStorage no está disponible, el cambio funciona hasta recargar.
  }
  applyTheme(nextTheme);
}

function addThemeToggle(){
  if(document.querySelector(".theme-toggle")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle no-print";
  button.addEventListener("click", toggleTheme);

  const actions = document.querySelector(".toolbar-actions");
  const lessonToolbar = document.querySelector(".lesson-toolbar");
  const toolbar = document.querySelector(".toolbar");

  if(actions){
    button.classList.add("theme-toggle-inline");
    actions.appendChild(button);
  } else if(lessonToolbar){
    button.classList.add("theme-toggle-inline", "theme-toggle-lesson");
    lessonToolbar.appendChild(button);
  } else if(toolbar){
    button.classList.add("theme-toggle-inline");
    toolbar.appendChild(button);
  } else {
    button.classList.add("theme-toggle-floating");
    document.body.appendChild(button);
  }

  updateThemeToggle(button, getActiveTheme());
}

function openAllDetails(){
  document.querySelectorAll("details").forEach((el)=>el.open=true);
}
function closeAllDetails(){
  document.querySelectorAll("details").forEach((el)=>el.open=false);
}
function setDetails(open){
  document.querySelectorAll("details").forEach((el)=>el.open=Boolean(open));
}
function printReady(){
  openAllDetails();
  if(window.MathJax && MathJax.typesetPromise){
    MathJax.typesetPromise().then(()=>window.print());
  } else {
    window.print();
  }
}

applyTheme(getActiveTheme());

if(window.matchMedia){
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = () => {
    if(!getStoredTheme()) applyTheme(getSystemTheme());
  };
  if(colorSchemeQuery.addEventListener){
    colorSchemeQuery.addEventListener("change", syncSystemTheme);
  } else if(colorSchemeQuery.addListener){
    colorSchemeQuery.addListener(syncSystemTheme);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  addThemeToggle();
  applyTheme(getActiveTheme());

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      const target = document.querySelector(a.getAttribute("href"));
      if(target){
        setTimeout(() => target.scrollIntoView({block:"start", behavior:"smooth"}), 0);
      }
    });
  });
});
