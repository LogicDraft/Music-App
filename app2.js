// ── UI: Render Instrument View ─────────────────────────────────────────────
function renderView(inst) {
  const el = document.getElementById('inst-view');
  const cfg = INST[inst];
  document.getElementById('inst-badge').textContent = `${cfg.icon}  ${cfg.name}`;
  document.documentElement.style.setProperty('--accent', cfg.color);
  document.documentElement.style.setProperty('--accent-glow', cfg.shadow);

  if (cfg.layout === 'piano')   { el.innerHTML = buildPianoHTML(cfg); }
  else if (cfg.layout === 'guitar') { el.innerHTML = buildGuitarHTML(cfg); }
  else if (cfg.layout === 'drums')  { el.innerHTML = buildDrumsHTML(cfg); }
  else if (cfg.layout === 'pads')   { el.innerHTML = buildPadsHTML(cfg); }
  else if (cfg.layout === 'strings'){ el.innerHTML = buildStringsHTML(cfg); }

  // Bind mouse events
  el.querySelectorAll('[data-code]').forEach(k => {
    const code = k.dataset.code;
    k.addEventListener('mousedown', e => { e.preventDefault(); Tone.start(); playNote(code); });
    k.addEventListener('mouseup',   () => stopNote(code));
    k.addEventListener('mouseleave',() => stopNote(code));
  });
}

function buildPianoHTML(cfg) {
  const top = cfg.keys.filter(k=>k.type==='black');
  const mid = cfg.keys.filter(k=>k.type==='white').slice(0,9);
  const bot = cfg.keys.filter(k=>k.type==='white').slice(9);
  const pkey=(k)=>`<div class="pkey ${k.type}" id="vk-${k.code}" data-code="${k.code}">
    <span class="pk-label">${k.label}</span><span class="pk-note">${k.note}</span></div>`;
  return `<div class="piano-wrap">
    <div class="piano-row"><span class="piano-row-label">SHARPS</span><div class="piano-keys">${top.map(pkey).join('')}</div></div>
    <div class="piano-row"><span class="piano-row-label">HOME ROW</span><div class="piano-keys">${mid.map(pkey).join('')}</div></div>
    <div class="piano-row"><span class="piano-row-label">LOW ROW</span><div class="piano-keys">${bot.map(pkey).join('')}</div></div>
  </div>`;
}

function buildGuitarHTML(cfg) {
  const rows = cfg.strings.map(str => {
    const fkeys = str.keys.map(k =>
      `<div class="fkey" id="vk-${k.code}" data-code="${k.code}">
        <span class="fk-label">${k.label}</span><span class="fk-note">${k.note}</span>
      </div>`).join('');
    return `<div class="guitar-string-row">
      <div class="guitar-string-label">${str.label}</div>
      <div class="guitar-string-line"></div>
      <div class="fret-div-bg">${[0,1,2,3].map(()=>'<div class="fret-div"></div>').join('')}</div>
      <div class="guitar-fret-keys">${fkeys}</div>
    </div>`;
  }).join('');
  return `<div class="guitar-wrap"><div class="guitar-neck"><div class="guitar-frets">${rows}</div></div></div>`;
}

function buildDrumsHTML(cfg) {
  // Place pads in a 7-col × 4-row CSS grid
  const pads = cfg.pads.map(p => {
    const [col, row] = p.gc;
    return `<div class="drum-pad ${p.shape}" id="vk-${p.code}" data-code="${p.code}"
      style="grid-column:${col};grid-row:${row};background:${p.bg};border-color:${p.color};--pad-color:${p.color};color:${p.color}">
      <span class="dp-key">${p.label}</span>
      <span class="dp-label">${p.name}</span>
    </div>`;
  }).join('');
  return `<div class="drum-wrap"><div class="drum-kit">${pads}</div></div>`;
}

function buildPadsHTML(cfg) {
  const pads = cfg.pads.map(p =>
    `<div class="epad" id="vk-${p.code}" data-code="${p.code}"
      style="border-color:${p.border};background:${p.color}18;color:${p.color}">
      <span class="ep-key">${p.label}</span>
      <span class="ep-name">${p.name}</span>
    </div>`).join('');
  return `<div class="pads-wrap"><div class="pads-grid">${pads}</div></div>`;
}

function buildStringsHTML(cfg) {
  const sections = cfg.sections.map(sec => {
    const keys = sec.keys.map(k =>
      `<div class="skey" id="vk-${k.code}" data-code="${k.code}"
        style="background:var(--glass);border-color:var(--accent)22">
        <span class="sk-label" style="color:var(--accent)">${k.label}</span>
        <span class="sk-note">${k.note}</span>
      </div>`).join('');
    return `<div class="skey-section">
      <div class="skey-section-label">${sec.label}</div>
      <div class="skey-row">${keys}</div>
    </div>`;
  }).join('');
  return `<div class="strings-wrap"><div class="strings-grid">${sections}</div></div>`;
}

// ── Key activate/deactivate ─────────────────────────────────────────────────
function activateKey(code) {
  const el = document.getElementById(`vk-${code}`);
  if (el) el.classList.add('active');
}
function deactivateKey(code) {
  const el = document.getElementById(`vk-${code}`);
  if (el) el.classList.remove('active');
}

// ── Note display ───────────────────────────────────────────────────────────
function showNote(txt) {
  document.getElementById('note-name').textContent = txt || '—';
  document.getElementById('note-lbl').textContent = 'NOW PLAYING';
}
function resetNote() {
  document.getElementById('note-name').textContent = '—';
  document.getElementById('note-lbl').textContent = 'PRESS A KEY TO PLAY';
}

// ── Ripple ─────────────────────────────────────────────────────────────────
function spawnRipple(code) {
  const el = document.getElementById(`vk-${code}`);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const size = 70;
  const rip = document.createElement('div');
  rip.className = 'ripple';
  rip.style.cssText = `left:${r.left+r.width/2-size/2}px;top:${r.top+r.height/2-size/2}px;
    width:${size}px;height:${size}px;border:2px solid var(--accent);box-shadow:0 0 10px var(--accent)`;
  document.getElementById('ripple-layer').appendChild(rip);
  rip.addEventListener('animationend', () => rip.remove());
}

// ── EQ ─────────────────────────────────────────────────────────────────────
const eqBars = [];
function initEQ() { document.querySelectorAll('.eq-bar').forEach(b => eqBars.push({el:b,h:4})); }
function bumpEQ() { eqBars.forEach(b => { b.h = Math.random()*24+4; b.el.style.height=b.h+'px'; }); }
setInterval(() => {
  eqBars.forEach(b => {
    b.h = pressedKeys.size>0 ? b.h*0.7 + (Math.random()*24+4)*0.3 : Math.max(3, b.h*0.87);
    b.el.style.height = b.h+'px';
  });
}, 80);

// ── Canvas BG ───────────────────────────────────────────────────────────────
const cvs = document.getElementById('bg-canvas');
const ctx = cvs.getContext('2d');
let W, H, particles=[];
function resizeCvs(){ W=cvs.width=window.innerWidth; H=cvs.height=window.innerHeight; }
window.addEventListener('resize', resizeCvs); resizeCvs();
function spawnP(){
  const colors=['#00d4ff','#a855f7','#22d3ee','#e879f9'];
  particles.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:-(Math.random()*.5+.1),
    r:Math.random()*1.5+.4,alpha:Math.random()*.5+.2,color:colors[Math.floor(Math.random()*4)],life:0,max:100+Math.random()*100});
}
(function drawBG(){
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(0,212,255,0.025)'; ctx.lineWidth=1;
  for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  if(pressedKeys.size>0 && Math.random()<.35) spawnP();
  if(Math.random()<.04) spawnP();
  particles=particles.filter(p=>p.life<p.max);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.life++;
    const f=Math.sin(p.life/p.max*Math.PI);
    ctx.globalAlpha=p.alpha*f; ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha=1;
  requestAnimationFrame(drawBG);
})();

// ── Controls ───────────────────────────────────────────────────────────────
document.getElementById('vol').addEventListener('input', e => {
  setVol(parseFloat(e.target.value));
  document.getElementById('vol-val').textContent = Math.round(e.target.value*100)+'%';
});

document.getElementById('oct-up').addEventListener('click', () => {
  baseOctave = Math.min(7, baseOctave+1);
  document.getElementById('oct-val').textContent = baseOctave;
});
document.getElementById('oct-dn').addEventListener('click', () => {
  baseOctave = Math.max(1, baseOctave-1);
  document.getElementById('oct-val').textContent = baseOctave;
});

const btnSus = document.getElementById('btn-sustain');
btnSus.addEventListener('click', () => {
  sustainMode = !sustainMode;
  btnSus.dataset.on = sustainMode;
  btnSus.textContent = sustainMode ? 'ON' : 'OFF';
  setStatus(`Sustain ${sustainMode?'ON':'OFF'}`);
});

const btnRev = document.getElementById('btn-reverb');
btnRev.addEventListener('click', () => {
  useReverb = !useReverb; btnRev.dataset.on=useReverb; routeFX();
  setStatus(`Reverb ${useReverb?'ON':'OFF'}`);
});
const btnEch = document.getElementById('btn-echo');
btnEch.addEventListener('click', () => {
  useEcho = !useEcho; btnEch.dataset.on=useEcho; routeFX();
  setStatus(`Echo ${useEcho?'ON':'OFF'}`);
});

// ── Recording ───────────────────────────────────────────────────────────────
const btnRec=document.getElementById('btn-rec'), btnPlay=document.getElementById('btn-play'),
      btnLoop=document.getElementById('btn-loop'), btnClr=document.getElementById('btn-clr');
const recInd=document.getElementById('rec-ind');

btnRec.addEventListener('click',()=>{
  if(!isRecording){
    isRecording=true; recordedNotes=[]; recStart=performance.now();
    btnRec.classList.add('recording'); recInd.classList.remove('hidden');
    btnPlay.disabled=true; btnClr.disabled=true; setStatus('Recording...');
  } else {
    isRecording=false; btnRec.classList.remove('recording'); recInd.classList.add('hidden');
    if(recordedNotes.length){ btnPlay.disabled=false; btnClr.disabled=false; setStatus(`Recorded ${recordedNotes.filter(n=>n.type==='on').length} notes.`); }
    else setStatus('Nothing recorded.');
  }
});

function startPlayback(){
  stopPlayback(); if(!recordedNotes.length) return;
  setStatus('Playing back...');
  recordedNotes.forEach(ev=>{
    const tid=setTimeout(()=>{
      if(ev.type==='on'){
        synths[ev.inst||currentInst]?.triggerAttack(ev.note, Tone.now());
        showNote(ev.note); activateKey(ev.code); bumpEQ();
      } else {
        synths[ev.inst||currentInst]?.triggerRelease(
          recordedNotes.find(n=>n.type==='on'&&n.code===ev.code)?.note||'C4', Tone.now());
        deactivateKey(ev.code);
      }
    }, ev.t);
    playTimers.push(tid);
  });
  const last=recordedNotes[recordedNotes.length-1]?.t||0;
  playTimers.push(setTimeout(()=>{ resetNote(); if(isLooping) startPlayback(); else setStatus('Playback done.'); }, last+800));
}
function stopPlayback(){ playTimers.forEach(clearTimeout); playTimers=[]; }
btnPlay.addEventListener('click', startPlayback);
btnLoop.addEventListener('click',()=>{ isLooping=!isLooping; btnLoop.dataset.on=isLooping; setStatus(`Loop ${isLooping?'ON':'OFF'}`); });
btnClr.addEventListener('click',()=>{ stopPlayback(); recordedNotes=[]; btnPlay.disabled=true; btnClr.disabled=true; setStatus('Cleared.'); resetNote(); });

// ── Instrument Select ──────────────────────────────────────────────────────
document.querySelectorAll('.inst-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.inst-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentInst = btn.dataset.inst;
    Object.values(activeNotes).forEach(n=>{ try{synths[currentInst]?.triggerRelease(n,Tone.now());}catch(e){} });
    activeNotes={}; pressedKeys.clear();
    renderView(currentInst);
    setStatus(`Instrument: ${INST[currentInst].name}`);
  });
});

// ── Theme ──────────────────────────────────────────────────────────────────
document.getElementById('btn-theme').addEventListener('click',()=>{
  themeIdx=(themeIdx+1)%2;
  document.documentElement.dataset.theme = themeIdx===0?'':'white';
  setStatus(`Theme: ${themeIdx===0?'DARK':'LIGHT'}`);
});

// ── Fullscreen ─────────────────────────────────────────────────────────────
document.getElementById('btn-fullscreen').addEventListener('click',()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen().catch(()=>{});
});

// ── Keyboard ──────────────────────────────────────────────────────────────
document.addEventListener('keydown', e=>{
  if(e.repeat) return;
  if(e.code==='Escape') return;
  if(e.code==='Space'){
    e.preventDefault();
    Tone.start(); noiseSynth?.triggerAttackRelease('16n', Tone.now()); bumpEQ();
    return;
  }
  const validCodes = getAllValidCodes();
  if(validCodes.has(e.code)) e.preventDefault();
  Tone.start(); playNote(e.code);
});
document.addEventListener('keyup', e=>{ stopNote(e.code); });

function getAllValidCodes(){
  const inst=INST[currentInst], s=new Set();
  if(inst.keys) inst.keys.forEach(k=>s.add(k.code));
  if(inst.strings) inst.strings.forEach(str=>str.keys.forEach(k=>s.add(k.code)));
  if(inst.sections) inst.sections.forEach(sec=>sec.keys.forEach(k=>s.add(k.code)));
  if(inst.pads) inst.pads.forEach(p=>s.add(p.code));
  return s;
}

// ── Status ─────────────────────────────────────────────────────────────────
function setStatus(msg){ document.getElementById('status-txt').textContent=msg; }

// ── Loader ─────────────────────────────────────────────────────────────────
const STEPS=[
  {msg:'Initializing Audio Engine...',pct:15},
  {msg:'Building Synthesizer Bank...',pct:35},
  {msg:'Loading Instrument Profiles...',pct:55},
  {msg:'Calibrating FX Chain...',pct:72},
  {msg:'Rendering Instrument Views...',pct:88},
  {msg:'NEXUS STUDIO ONLINE ✓',pct:100},
];
async function boot(){
  const bar=document.getElementById('ld-bar'), stat=document.getElementById('ld-status');
  for(const s of STEPS){ bar.style.width=s.pct+'%'; stat.textContent=s.msg; await sleep(380); }
  await sleep(400);
  document.getElementById('loading-screen').classList.add('out');
  document.getElementById('app').classList.remove('hidden');
  buildAudio(); initEQ(); renderView(currentInst);
  setStatus('READY — Select an instrument and press keys to play');
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
window.addEventListener('DOMContentLoaded', boot);
