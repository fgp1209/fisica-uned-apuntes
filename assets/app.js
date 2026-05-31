window.MathJax = {
  tex: {inlineMath: [['\\(','\\)'], ['$', '$']], displayMath: [['\\[','\\]']]},
  svg: {fontCache: 'global'}
};
function printReady(){
  if(window.MathJax && MathJax.typesetPromise){MathJax.typesetPromise().then(()=>window.print());}
  else{window.print();}
}
