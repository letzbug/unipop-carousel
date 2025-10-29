(() => {
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  function clamp(n, min, max){ return Math.max(min, Math.min(n, max)); }

  function initCoverflow(root){
    if(root.__inited) return; root.__inited = true;

    const autoplay = parseInt(root.dataset.autoplay || '0', 10); // ms (0 = aus)
    const loop = root.dataset.loop === 'true';
    const ratio = root.dataset.ratio || ''; // "16/9" | "2/3"
    if(ratio) root.style.setProperty('--card-ratio', ratio);

    const items = $$('.item, .unipop-item', root);
    if(!items.length) return;

    // Wrap in Stage
    const stage = document.createElement('div'); stage.className = 'unipop-stage';
    while(root.firstChild) stage.appendChild(root.firstChild);
    root.appendChild(stage);

    // Controls
    const nav = document.createElement('div'); nav.className = 'unipop-nav';
    const prevBtn = Object.assign(document.createElement('button'), {className:'unipop-btn', innerHTML:'‹', ariaLabel:'Zurück'});
    const nextBtn = Object.assign(document.createElement('button'), {className:'unipop-btn', innerHTML:'›', ariaLabel:'Weiter'});
    nav.append(prevBtn, nextBtn); root.appendChild(nav);

    const dots = document.createElement('div'); dots.className = 'unipop-dots';
    items.forEach((_,i)=>{ const d = document.createElement('button'); d.className='unipop-dot'; d.type='button'; d.ariaLabel = `Slide ${i+1}`; dots.appendChild(d); });
    root.appendChild(dots);

    let index = 0, timer = null;

    function render(){
      const gap = parseFloat(getComputedStyle(root).getPropertyValue('--gap')) || 28;
      const angle = getComputedStyle(root).getPropertyValue('--angle') || '20deg';
      const scaleStep = parseFloat(getComputedStyle(root).getPropertyValue('--scale-step')) || .12;

      items.forEach((el,i)=>{
        const offset = i - index;
        const dir = Math.sign(offset);
        const abs = Math.abs(offset);

        // Position
        const x = offset * gap;                 // pro Schritt X-Verschiebung in %
        const zScale = 1 - (abs * scaleStep);   // pro Schritt kleiner
        const rot = dir * parseFloat(angle);    // ± Winkel

        el.style.zIndex = String(100 - abs);
        el.style.transform =
          `translate3d(calc(${x}% - 50% + 50%), -50%, 0) ` + // X relativ zum Zentrum
          `rotateY(${rot}deg) ` +
          `scale(${zScale})`;

        el.setAttribute('aria-current', abs === 0 ? 'true' : 'false');
      });

      // Dots
      $$('.unipop-dot', root).forEach((d,i)=> d.setAttribute('aria-current', String(i===index)));
    }

    function go(i){
      if(loop){
        index = (i + items.length) % items.length;
      }else{
        index = clamp(i, 0, items.length - 1);
      }
      render();
    }
    function next(){ go(index+1); }
    function prev(){ go(index-1); }

    // Events
    nextBtn.addEventListener('click', ()=>{ next(); restart(); });
    prevBtn.addEventListener('click', ()=>{ prev(); restart(); });
    $$('.unipop-dot', root).forEach((d,i)=> d.addEventListener('click', ()=>{ go(i); restart(); }));

    // Keyboard
    root.tabIndex = 0;
    root.addEventListener('keydown', e=>{
      if(e.key === 'ArrowRight') { next(); restart(); }
      if(e.key === 'ArrowLeft')  { prev(); restart(); }
    });

    // Swipe / Drag
    let startX=0, dragging=false;
    stage.addEventListener('pointerdown', e=>{ dragging=true; startX=e.clientX; stage.setPointerCapture(e.pointerId); stop(); });
    stage.addEventListener('pointerup', e=>{
      if(!dragging) return;
      const dx = e.clientX - startX;
      dragging=false;
      if(dx < -40) next(); else if(dx > 40) prev();
      restart();
    });
    stage.addEventListener('pointercancel', ()=> dragging=false);

    // Autoplay
    function start(){ if(autoplay>0){ stop(); timer=setInterval(next, autoplay); } }
    function stop(){ if(timer){ clearInterval(timer); timer=null; } }
    function restart(){ stop(); start(); }

    // Init
    go(0);
    start();
    window.addEventListener('resize', render);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.unipop-coverflow').forEach(initCoverflow);
  });
})();
