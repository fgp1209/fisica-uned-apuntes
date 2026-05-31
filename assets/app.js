
function setDetails(open){
  document.querySelectorAll('details.study-toggle').forEach(d => { d.open = open; });
}
function printReady(){
  setDetails(true);
  if(window.MathJax && MathJax.typesetPromise){ MathJax.typesetPromise().then(()=>window.print()); }
  else{ window.print(); }
}
function toggleReadingMode(){
  document.body.classList.toggle('reading-mode');
}