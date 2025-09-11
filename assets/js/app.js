let MODE = 'home';
let LAST_SECTION = null;
const tabsBox = document.getElementById('tabs');
const tabs = document.querySelectorAll('.vtab');
const gallery = document.getElementById('gallery');
const homeBtn = document.getElementById('homeBtn');
const contactTab = document.getElementById('contactTab');

const overlay = document.getElementById('overlay');
const overlayScroll = document.getElementById('overlayScroll');
const closeOverlayBtn = document.getElementById('closeOverlay');
const projectSheet = document.getElementById('projectSheet');
const contactSheet = document.getElementById('contactSheet');
const sheetMedia = document.getElementById('sheetMedia');
const sheetTitle = document.getElementById('sheetTitle');
const sheetDesc  = document.getElementById('sheetDesc');
const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
const preloader = document.getElementById('preloader');

function endPreloader(){
  if(!preloader) return;
  preloader.classList.add('hide');
  setTimeout(()=> preloader.style.display='none', 450);
}

// Rivela le card visibili con uno "stagger"
function revealGridStagger(){
const cards = Array.from(gallery.querySelectorAll('.card'))
  .filter(c => getComputedStyle(c).display !== 'none');
  cards.forEach((c,i) => {
    c.classList.remove('is-in');
    setTimeout(()=> { c.classList.add('is-in'); }, 40 + i*70);
  });
}

/* === A D D E D : overlay titolo/meta sulle card in hover ===
   - usa PROJECTS_KEYED per il titolo
   - legge luogo/data da data-meta sulla card (facoltativo) */

function injectCardOverlays(){
  if (!gallery) return;
  const cards = gallery.querySelectorAll('.card');

  cards.forEach(card => {
    const img = card.querySelector('img');
    if (!img) return;

    const key = (img.getAttribute('alt') || '').toLowerCase();
    const proj = window.PROJECTS_KEYED ? window.PROJECTS_KEYED[key] : null;
    if (!proj) return;

    let mask = card.querySelector('.mask');
    if (!mask){
      mask = document.createElement('div');
      mask.className = 'mask';
      card.appendChild(mask);
    }

    const meta = proj.meta || card.getAttribute('data-meta') || '';
    mask.innerHTML = `
      <div class="txt">
        <div class="title">${proj.title || ''}</div>
        ${meta ? `<div class="meta">${meta}</div>` : ``}
      </div>
    `;
  });
}

const bzTop = document.getElementById('bzTop');
const bzLeft = document.getElementById('bzLeft');
const bzRight = document.getElementById('bzRight');

// dot scrollbar (bound to overlayScroll)
const scrollDots = document.getElementById('scrollDots');
const DOTS = 24;
let currentDot = Math.floor(DOTS/2);
function buildDots(){
  if (!scrollDots) return;                // <— protezione
  scrollDots.innerHTML = '';
  for (let i=0;i<DOTS;i++){
    const li = document.createElement('li');
    if (i === currentDot) li.classList.add('active');
    scrollDots.appendChild(li);
  }
}

function setDotByProgress(progress){
  if (!scrollDots || !scrollDots.children.length) return; // <— protezione
  const idx = Math.max(0, Math.min(DOTS-1, Math.round(progress*(DOTS-1))));
  if (idx === currentDot) return;
  scrollDots.children[currentDot].classList.remove('active');
  scrollDots.children[idx].classList.add('active');
  currentDot = idx;
}
buildDots();

function setMode(newMode){
  MODE = newMode;
  document.body.classList.remove('mode-home','mode-section','mode-project','mode-contact');
  if (MODE === 'home'){
    document.body.classList.add('mode-home');
    tabsBox.classList.remove('compact');
    tabs.forEach(t => t.classList.remove('active'));
    filterCards(null);
    hideOverlay();
    // refresh overlay testi/meta in home
    injectCardOverlays();
    // rientro a cascata
    setTimeout(revealGridStagger, 40);
  } else if (MODE === 'section'){
    document.body.classList.add('mode-section');
    tabsBox.classList.add('compact');
    projectSheet.classList.add('hidden');
    contactSheet.classList.add('hidden');
    hideOverlay();
  } else if (MODE === 'project'){
    document.body.classList.add('mode-project');
    // force all tabs compact (no active)
    tabs.forEach(x => x.classList.remove('active'));
    tabsBox.classList.add('compact');
    overlay.classList.remove('hidden'); overlay.setAttribute('aria-hidden','false');
    projectSheet.classList.remove('hidden'); contactSheet.classList.add('hidden');
    currentDot = Math.floor(DOTS/2); buildDots();
    overlayScroll.scrollTop = 0;
  } else if (MODE === 'contact'){
    document.body.classList.add('mode-contact');
    tabsBox.classList.add('compact');
    overlay.classList.remove('hidden'); overlay.setAttribute('aria-hidden','false');
    contactSheet.classList.remove('hidden'); projectSheet.classList.add('hidden');
    currentDot = Math.floor(DOTS/2); buildDots();
    overlayScroll.scrollTop = 0;
  }
}
function hideOverlay(){ overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden','true'); }

function filterCards(cat){
  const wanted = (cat || '').toLowerCase();
  const cards = gallery.querySelectorAll('.card');

  cards.forEach(card => {
    // key dalla <img alt="a|b|c...">
    const img = card.querySelector('img');
    const key = (img?.getAttribute('alt') || '').toLowerCase();

    // progetto dalla mappa keyed
    const proj = window.PROJECTS_KEYED ? window.PROJECTS_KEYED[key] : null;

    // 1) categorie dal data.js
    let cats = Array.isArray(proj?.cats)
      ? proj.cats.map(c => String(c).toLowerCase())
      : null;

    // 2) fallback: data-cats sull’HTML (spazio-separato)
    if (!cats || cats.length === 0) {
      const raw = card.getAttribute('data-cats') || '';
      cats = raw.split(/\s+/).filter(Boolean).map(c => c.toLowerCase());
    }

    const visible = !wanted || cats.includes(wanted);

    if (visible){
      card.classList.remove('hide');
      card.style.display = '';
      card.classList.add('show');
      setTimeout(() => card.classList.remove('show'), 260);
    } else {
      card.classList.add('hide');
      setTimeout(() => { card.style.display = 'none'; }, 200);
    }
  });

  // dopo ogni filtraggio
  injectCardOverlays();
  revealGridStagger();
}

function stepBack(){
  if (MODE === 'project'){ setMode('section'); return; }
  if (MODE === 'contact'){ 
    if (LAST_SECTION){ setMode('section'); } 
    else { setMode('home'); } 
    return; 
  }
  if (MODE === 'section'){ setMode('home'); return; }
}

// Tabs
tabs.forEach(t => t.addEventListener('click', () => {
  const cat = t.dataset.filter;
  if (MODE === 'project' || MODE === 'contact') hideOverlay();
  if (cat === 'about'){ openProject(PROJECTS['About me']); return; }
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  LAST_SECTION = cat;
  setMode('section');
  filterCards(cat);
}));

// Contatti
contactTab.addEventListener('click', (e)=>{ e.preventDefault(); setMode('contact'); });

// Home/logo
homeBtn.addEventListener('click', e => {
  e.preventDefault();
  LAST_SECTION=null;
  setMode('home');
});

// Open project
function openProject(project){
  if (!project) return;

  const isInline = !!project.inlineText;      // layout "testo tra le immagini"
  const isAbout = Array.isArray(project.cats) && project.cats.some(c => c.toLowerCase()==='about');
  document.body.classList.toggle('project-about', isAbout);
  projectSheet.classList.toggle('inline', isInline); // cambia layout via CSS

  // titoli/descrizione: se inline non usiamo la colonna laterale
  sheetTitle.textContent = project.title || 'Progetto';
  sheetDesc.innerHTML    = isInline ? '' : (project.desc || '');
  sheetMedia.innerHTML   = '';

  const imgs  = Array.isArray(project.images) ? project.images : [];
  const texts = Array.isArray(project.texts)  ? project.texts  : [];

  imgs.forEach((src, i) => {
    const im = new Image();
    im.loading  = 'eager';
    im.decoding = 'async';
    im.src = src;
    im.addEventListener('load', () => im.classList.add('is-ready'));
    sheetMedia.appendChild(im);

    if (isInline){
      const t = texts[i];
      if (t && String(t).trim()){
        const block = document.createElement('div');
        block.className = 'img-text';
        block.innerHTML = t; // consenti <strong>, link, ecc.
        sheetMedia.appendChild(block);
      }
    }
  });

  setMode('project');
}

// close
function closeProject(){ hideOverlay(); }
closeOverlayBtn.addEventListener('click', closeProject);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') stepBack(); });

// backzones click
[bzTop, bzLeft, bzRight].forEach(el => {
  if (el) el.addEventListener('click', stepBack);
});

// cards -> project (robusto + delega eventi)
gallery.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card || !gallery.contains(card)) return;

  const img = card.querySelector('img');
  // usa alt (es. "a","b",...) o, se presente, data-key sulla card
  const key = ((img && img.getAttribute('alt')) || card.dataset.key || '').toLowerCase();
  const data = (window.PROJECTS_KEYED && window.PROJECTS_KEYED[key]) || null;

  if (!data) {
    console.warn('Project non trovato per key:', key);
    return;
  }
  openProject(data);
});

// dot scrollbar on inner scroller
overlayScroll.addEventListener('scroll', () => {
  const max = overlayScroll.scrollHeight - overlayScroll.clientHeight;
  if (max <= 0) return;
  const progress = overlayScroll.scrollTop / max;
  setDotByProgress(progress);
});

setMode('home');

// preloader + rivelazione iniziale griglia
document.addEventListener('DOMContentLoaded', () => {
  // crea overlay titoli/meta sulle card dopo che il DOM è pronto
  injectCardOverlays();
  setTimeout(() => {
    endPreloader();
    revealGridStagger();
  }, 3000);
});


// Touch: mostra overlay per ~1s al tap senza aprire il progetto
(function(){
  if (!('ontouchstart' in window)) return;
  const cards = gallery ? gallery.querySelectorAll('.card') : [];
  cards.forEach(card => {
    let hoverTimer = null;
    card.addEventListener('touchstart', () => {
      if (MODE !== 'home' && MODE !== 'section') return;
      card.classList.add('touchshow');
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(()=> card.classList.remove('touchshow'), 1000);
    }, {passive:true});
  });
})();


// === Mobile-only (<=900px): compact tabs & swipe-to-close ===
(function () {
  var mq = window.matchMedia('(max-width: 900px)');
  var tabsEl = document.getElementById('tabs');
  var home = document.getElementById('homeBtn');
  var overlay = document.getElementById('overlay');
  var closeBtn = document.getElementById('closeOverlay');

  // Tabs: attivo fermo, gli altri si restringono (solo mobile)
  function onTabsClick(e){
    if (!mq.matches || !tabsEl) return;
    var btn = e.target.closest('.vtab');
    if (!btn || !tabsEl.contains(btn)) return;
    tabsEl.querySelectorAll('.vtab').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    tabsEl.classList.add('compact'); // gli altri diventano icona (CSS)
  }

  // Reset quando tocchi il logo Home (solo mobile)
  function onHomeClick(){
    if (!mq.matches || !tabsEl) return;
    tabsEl.classList.remove('compact');
    tabsEl.querySelectorAll('.vtab').forEach(function(b){ b.classList.remove('active'); });
  }

  // Swipe-right per chiudere il progetto (solo mobile)
  var sx = 0, sy = 0, tracking = false;
  function onTouchStart(e){
    if (!mq.matches || !overlay) return;
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; tracking = true;
  }
  function onTouchEnd(e){
    if (!mq.matches || !overlay || !tracking) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - sx;
    var dy = Math.abs(t.clientY - sy);
    if (dx > 60 && dy < 40 && closeBtn) closeBtn.click(); // swipe a destra
  }

  // Attach listeners
  if (tabsEl) tabsEl.addEventListener('click', onTabsClick, { passive: true });
  if (home) home.addEventListener('click', onHomeClick, { passive: true });
  if (overlay) {
    overlay.addEventListener('touchstart', onTouchStart, { passive: true });
    overlay.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  // Se torni sopra i 900px, ripulisci lo stato compatto
  function onBreakpointChange(ev){
    if (!ev.matches && tabsEl){
      tabsEl.classList.remove('compact');
      tabsEl.querySelectorAll('.vtab').forEach(function(b){ b.classList.remove('active'); });
    }
  }
  if (mq.addEventListener) mq.addEventListener('change', onBreakpointChange);
  else if (mq.addListener) mq.addListener(onBreakpointChange); // Safari vecchi
})();

