(() => {
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  function initCarousel(root){
    if(root.__inited) return; root.__inited = true;
    const autoplay = parseInt(root.dataset.autoplay || '0', 10);
    const loop = root.dataset.loop === 'true';
    const aspect = root.dataset.aspect || '';
    if(aspect) root.setAttribute('data-aspect', aspect);
    const slides = $$('.slide, .unipop-slide', root);
    if(!slides.length) return;
    slides.forEach(s => s.classList.add('unipop-slide'));
    const track = document.createElement('div');
    track.className = 'unipop-track';
    while(root.firstChild){ track.appendChild(root.firstChild); }
    root.appendChild(track);
    const nav = document.createElement('div'); nav.className = 'unipop-nav';
    const btnPrev = document.createElement('button'); btnPrev.className = 'unipop-btn'; btnPrev.innerHTML='‹';
    const btnNext = document.createElement('button'); btnNext.className = 'unipop-btn'; btnNext.innerHTML='›';
    nav.append(btnPrev, btnNext); root.appendChild(nav);
    const dots = document.createElement('div'); dots.className = 'unipop-dots';
    slides.forEach((_,i)=>{ const d=document.createElement('button'); d.className='unipop-dot'; dots.appendChild(d);});
    root.appendChild(dots);
    let index = 0, timer = null;
    function go(i){ index = (!loop? Math.max(0, Math.min(i, slides.length-1)) : (i+slides.length)%slides.length); track.style.transform = `translateX(${-100*index}%)`; updateDots(); }
    function next(){ go(index+1); }
    function prev(){ go(index-1); }
    function updateDots(){ $$('.unipop-dot',root).forEach((d,i)=> d.setAttribute('aria-current', i===index)); }
    function startAutoplay(){ if(autoplay>0){ stopAutoplay(); timer=setInterval(next,autoplay); } }
    function stopAutoplay(){ if(timer){ clearInterval(timer); timer=null; } }
    btnNext.onclick = ()=>{ next(); startAutoplay(); };
    btnPrev.onclick = ()=>{ prev(); startAutoplay(); };
    $$('.unipop-dot',root).forEach((d,i)=> d.onclick = ()=>{ go(i); startAutoplay(); });
    go(0); startAutoplay();
  }
  document.addEventListener('DOMContentLoaded', ()=> document.querySelectorAll('.unipop-carousel').forEach(initCarousel));
})();
