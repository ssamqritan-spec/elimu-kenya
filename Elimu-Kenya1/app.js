'use strict';
const $=s=>document.querySelector(s);

/* Mobile menu */
const menu=$('#menu'),nav=$('#nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}
if(menu&&nav){
  menu.onclick=()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(o))};
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
}

/* Hero slideshow */
const slides=[
  ['assets/graduates-outdoors.jpg','University graduates together'],
  ['assets/graduation-procession.jpg','Graduation procession'],
  ['assets/graduates-ceremony.jpg','Graduates celebrating achievement']
];
const img=$('#heroImage'),count=$('#slideCount'),pauseBtn=$('#pause');
let i=0,timer=null,playing=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(img&&count){
  slides.forEach(s=>{const p=new Image();p.src=s[0]});
  const show=n=>{
    i=(n+slides.length)%slides.length;
    const s=slides[i];
    img.style.opacity='0';
    setTimeout(()=>{img.onload=()=>{img.style.opacity='1'};img.src=s[0];img.alt=s[1];if(img.complete)img.style.opacity='1'},250);
    count.textContent='0'+(i+1)+' / 0'+slides.length;
  };
  const stop=()=>{clearInterval(timer);timer=null};
  const start=()=>{stop();if(playing)timer=setInterval(()=>show(i+1),6000)};
  const label=()=>{
    if(!pauseBtn)return;
    pauseBtn.textContent=playing?'\u2161':'\u25B6';
    pauseBtn.setAttribute('aria-label',playing?'Pause slideshow':'Play slideshow');
  };
  if($('#prev'))$('#prev').onclick=()=>{show(i-1);start()};
  if($('#next'))$('#next').onclick=()=>{show(i+1);start()};
  if(pauseBtn)pauseBtn.onclick=()=>{playing=!playing;label();start()};
  label();start();
}
