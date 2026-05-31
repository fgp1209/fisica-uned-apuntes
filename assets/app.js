function openAllDetails(){
  document.querySelectorAll("details").forEach((el)=>el.open=true);
}
function closeAllDetails(){
  document.querySelectorAll("details").forEach((el)=>el.open=false);
}
function printReady(){
  openAllDetails();
  if(window.MathJax && MathJax.typesetPromise){
    MathJax.typesetPromise().then(()=>window.print());
  } else {
    window.print();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      const target = document.querySelector(a.getAttribute("href"));
      if(target){
        setTimeout(() => target.scrollIntoView({block:"start", behavior:"smooth"}), 0);
      }
    });
  });
});
