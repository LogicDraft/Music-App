/* ═══════════════════════════════════════════════════════════════
   NEXUS PIANO — app.js
   Full keyboard-driven piano with Tone.js, recording, FX, canvas
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── Constants ─────────────────────────────────────────────────────────────

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// Keyboard layout → [semitone offset from base, isBlack]
const KEY_MAP = {
  // Top row → sharps (black keys)
  KeyQ: { semi:  1, black: true,  label:'Q',  rowNote:'C#' },
  KeyW: { semi:  3, black: true,  label:'W',  rowNote:'D#' },
  KeyE: { semi:  6, black: true,  label:'E',  rowNote:'F#' },
  KeyR: { semi:  8, black: true,  label:'R',  rowNote:'G#' },
  KeyT: { semi: 10, black: true,  label:'T',  rowNote:'A#' },
  KeyY: { semi: 13, black: true,  label:'Y',  rowNote:'C#²' },
  KeyU: { semi: 15, black: true,  label:'U',  rowNote:'D#²' },
  KeyI: { semi: 18, black: true,  label:'I',  rowNote:'F#²' },
  KeyO: { semi: 20, black: true,  label:'O',  rowNote:'G#²' },
  KeyP: { semi: 22, black: true,  label:'P',  rowNote:'A#²' },

  // Middle row → white keys
  KeyA: { semi:  0, black: false, label:'A',  rowNote:'C'  },
  KeyS: { semi:  2, black: false, label:'S',  rowNote:'D'  },
  KeyD: { semi:  4, black: false, label:'D',  rowNote:'E'  },
  KeyF: { semi:  5, black: false, label:'F',  rowNote:'F'  },
  KeyG: { semi:  7, black: false, label:'G',  rowNote:'G'  },
  KeyH: { semi:  9, black: false, label:'H',  rowNote:'A'  },
  KeyJ: { semi: 11, black: false, label:'J',  rowNote:'B'  },
  KeyK: { semi: 12, black: false, label:'K',  rowNote:'C²' },
  KeyL: { semi: 14, black: false, label:'L',  rowNote:'D²' },

  // Bottom row → low octave
  KeyZ: { semi: -12, black: false, label:'Z',  rowNote:'C-1' },
  KeyX: { semi: -10, black: false, label:'X',  rowNote:'D-1' },
  KeyC: { semi:  -8, black: false, label:'C',  rowNote:'E-1' },
  KeyV: { semi:  -7, black: false, label:'V',  rowNote:'F-1' },
  KeyB: { semi:  -5, black: false, label:'B',  rowNote:'G-1' },
  KeyN: { semi:  -3, black: false, label:'N',  rowNote:'A-1' },
  KeyM: { semi:  -1, black: false, label:'M',  rowNote:'B-1' },
};

const ROW_TOP = ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP'];
const ROW_MID = ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL'];
const ROW_BOT = ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM'];

const THEMES = ['default', 'white'];

const INSTRUMENTS = {
  piano:   { color: '#00d4ff', shadow: 'rgba(0,212,255,0.4)',  name: 'PIANO' },
  epiano:  { color: '#22d3ee', shadow: 'rgba(34,211,238,0.4)', name: 'E-PIANO' },
  guitar:  { color: '#f59e0b', shadow: 'rgba(245,158,11,0.4)', name: 'GUITAR' },
  bass:    { color: '#ef4444', shadow: 'rgba(239,68,68,0.4)',  name: 'BASS' },
  violin:  { color: '#d946ef', shadow: 'rgba(217,70,239,0.4)', name: 'VIOLIN' },
  flute:   { color: '#14b8a6', shadow: 'rgba(20,184,166,0.4)', name: 'FLUTE' },
  drums:   { color: '#f97316', shadow: 'rgba(249,115,22,0.4)', name: 'DRUMS' },
  synth:   { color: '#8b5cf6', shadow: 'rgba(139,92,246,0.4)', name: 'SYNTH' },
  pads:    { color: '#ec4899', shadow: 'rgba(236,72,153,0.4)', name: 'EDM PADS' }
};

// ─── State ─────────────────────────────────────────────────────────────────

let baseOctave  = 4;
let volume      = 0.75;
let sustainMode = false;
let isRecording = false;
let recordedNotes = [];
let recordStartTime = 0;
let playbackTimeout = [];
let pressedKeys = new Set();
let activeNotes = {};    // code → Tone.PolySynth note id
let themeIdx = 0;
let currentInst = 'piano';
let synths = {};
let useReverb = true;
let useEcho = false;
let isLooping = false;

// ─── Audio Engine (Tone.js) ─────────────────────────────────────────────────

let noiseSynth, reverbNode, echoNode, limiterNode;

function buildAudio() {
  limiterNode = new Tone.Limiter(-3).toDestination();
  reverbNode  = new Tone.Reverb({ decay: 2.5, wet: 0.25 }).connect(limiterNode);
  echoNode    = new Tone.FeedbackDelay("8n", 0.4).connect(limiterNode);

  // Dash sound synth
  noiseSynth = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
  }).connect(reverbNode);

  synths.piano = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.008, decay: 0.3, sustain: 0.6, release: 1.5 }});
  synths.epiano = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 3, modulationIndex: 10, oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 1.5 }});
  synths.guitar = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'pwm', modulationFrequency: 0.2 }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 1.2 }});
  synths.bass = new Tone.PolySynth(Tone.AMSynth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.5, sustain: 0.4, release: 0.8 }});
  synths.violin = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 1.5 }});
  synths.flute = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 2, modulationIndex: 2, oscillator: { type: 'sine' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.8 }});
  synths.synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 1 }});
  synths.pads = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 3 }});
  synths.drums = new Tone.PolySynth(Tone.MembraneSynth, { pitchDecay: 0.05, octaves: 2, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }});

  updateFXRouting();
  setVolume(volume);
}

function updateFXRouting() {
  Object.values(synths).forEach(s => {
    s.disconnect();
    if (useEcho && useReverb) { s.connect(echoNode); echoNode.disconnect(); echoNode.connect(reverbNode); }
    else if (useEcho) { s.connect(echoNode); echoNode.disconnect(); echoNode.connect(limiterNode); }
    else if (useReverb) { s.connect(reverbNode); }
    else { s.connect(limiterNode); }
  });
}

function noteForCode(code) {
  const map = KEY_MAP[code];
  if (!map) return null;
  const midiBase = (baseOctave + 1) * 12; // C4 = MIDI 60
  const midi = midiBase + map.semi;
  if (midi < 0 || midi > 127) return null;
  const oct  = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[midi % 12];
  return { freq: Tone.Frequency(midi, 'midi').toFrequency(), name, oct, midi, isLow: map.semi < 0 };
}

function playNote(code) {
  if (pressedKeys.has(code)) return;
  pressedKeys.add(code);
  const note = noteForCode(code);
  if (!note) return;

  const s = synths[currentInst];
  s.triggerAttack(note.freq, Tone.now());
  activeNotes[code] = note.freq;

  updateNoteDisplay(note.name + note.oct);
  activateKey(code);
  spawnRipple(code);
  bumpEQ();

  if (isRecording) {
    recordedNotes.push({ code, freq: note.freq, name: note.name + note.oct, isLow: note.isLow, t: performance.now() - recordStartTime, type: 'on' });
  }
}

function stopNote(code) {
  if (!pressedKeys.has(code)) return;
  pressedKeys.delete(code);
  const freq = activeNotes[code];
  if (!freq) return;

  if (!sustainMode) {
    const note = noteForCode(code);
    const s = synths[currentInst];
    s.triggerRelease(freq, Tone.now());
  }
  delete activeNotes[code];

  deactivateKey(code);

  if (pressedKeys.size === 0) resetNoteDisplay();
  if (isRecording) {
    recordedNotes.push({ code, t: performance.now() - recordStartTime, type: 'off' });
  }
}

function setVolume(v) {
  volume = v;
  const db = v === 0 ? -Infinity : 20 * Math.log10(v) - 6;
  if (synth)      synth.volume.value      = db;
  if (synthLow)   synthLow.volume.value   = db;
  if (noiseSynth) noiseSynth.volume.value = db;
}

// ─── UI: Key DOM ────────────────────────────────────────────────────────────

function buildKeyboard() {
  renderRow('keys-top', ROW_TOP);
  renderRow('keys-mid', ROW_MID);
  renderRow('keys-bot', ROW_BOT);
}

function renderRow(containerId, codes) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  codes.forEach(code => {
    const cfg = KEY_MAP[code];
    const div = document.createElement('div');
    div.className = `piano-key ${cfg.black ? 'black-key' : 'white-key'}`;
    div.id = `key-${code}`;
    div.innerHTML = `
      <span class="key-label">${cfg.label}</span>
      <span class="key-note">${cfg.rowNote}</span>`;
    // Mouse support
    div.addEventListener('mousedown', () => { Tone.start(); playNote(code); });
    div.addEventListener('mouseup',   () => stopNote(code));
    div.addEventListener('mouseleave',() => stopNote(code));
    el.appendChild(div);
  });
}

function activateKey(code) {
  const el = document.getElementById(`key-${code}`);
  if (el) el.classList.add('active');
}
function deactivateKey(code) {
  const el = document.getElementById(`key-${code}`);
  if (el) el.classList.remove('active');
}

// ─── UI: Note Display ───────────────────────────────────────────────────────

function updateNoteDisplay(name) {
  const el = document.getElementById('note-name');
  el.textContent = name;
  el.style.color = 'var(--blue)';
  el.style.textShadow = '0 0 30px var(--blue), 0 0 60px rgba(0,212,255,0.4)';
  document.getElementById('note-label').textContent = 'NOW PLAYING';
}
function resetNoteDisplay() {
  document.getElementById('note-name').textContent = '—';
  document.getElementById('note-label').textContent = 'PRESS A KEY TO PLAY';
}

// ─── Ripple Effect ──────────────────────────────────────────────────────────

function spawnRipple(code) {
  const keyEl = document.getElementById(`key-${code}`);
  if (!keyEl) return;
  const rect = keyEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const size = KEY_MAP[code].black ? 60 : 80;
  const colors = ['rgba(0,212,255,0.6)', 'rgba(168,85,247,0.6)', 'rgba(232,121,249,0.6)', 'rgba(34,211,238,0.6)'];
  const color  = colors[Math.floor(Math.random() * colors.length)];

  const layer = document.getElementById('ripple-layer');
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.cssText = `
    left:${cx - size/2}px; top:${cy - size/2}px;
    width:${size}px; height:${size}px;
    border:2px solid ${color};
    box-shadow: 0 0 12px ${color};
  `;
  layer.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}

// ─── EQ Bars ────────────────────────────────────────────────────────────────

let eqBars = [];
let eqDecay = [];
function initEQ() {
  eqBars = Array.from(document.querySelectorAll('.eq-bar'));
  eqDecay = eqBars.map(() => 0);
}
function bumpEQ() {
  eqBars.forEach((bar, i) => {
    eqDecay[i] = Math.random() * 28 + 6;
    bar.style.height = eqDecay[i] + 'px';
  });
}
function tickEQ() {
  eqBars.forEach((bar, i) => {
    if (pressedKeys.size > 0) {
      const target = Math.random() * 28 + 6;
      eqDecay[i] = eqDecay[i] * 0.7 + target * 0.3;
    } else {
      eqDecay[i] = Math.max(3, eqDecay[i] * 0.88);
    }
    bar.style.height = eqDecay[i] + 'px';
  });
}
setInterval(tickEQ, 80);

// ─── Background Canvas ──────────────────────────────────────────────────────

const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnParticle() {
  const x = Math.random() * W;
  const y = Math.random() * H;
  const color = ['#00d4ff','#a855f7','#22d3ee','#e879f9'][Math.floor(Math.random()*4)];
  particles.push({ x, y, vx: (Math.random()-0.5)*0.4, vy: -(Math.random()*0.6+0.1), alpha: Math.random()*0.6+0.2, r: Math.random()*1.5+0.5, color, life: 0, maxLife: 120+Math.random()*120 });
}

function drawBG() {
  ctx.clearRect(0, 0, W, H);

  // Ambient grid
  ctx.strokeStyle = 'rgba(0,212,255,0.03)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < W; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
  }
  for (let y = 0; y < H; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  }

  // Particles
  if (pressedKeys.size > 0 && Math.random() < 0.4) spawnParticle();
  if (Math.random() < 0.05) spawnParticle(); // idle ambient

  particles = particles.filter(p => p.life < p.maxLife);
  particles.forEach(p => {
    p.x  += p.vx; p.y += p.vy;
    p.life++;
    const fade = Math.sin((p.life / p.maxLife) * Math.PI);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = p.color.replace(')', `,${p.alpha * fade})`).replace('rgb','rgba').replace('##','#');
    // simple approach:
    ctx.globalAlpha = p.alpha * fade;
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // Active pulse glow from center bottom
  if (pressedKeys.size > 0) {
    const grad = ctx.createRadialGradient(W/2, H, 0, W/2, H, H*0.7);
    grad.addColorStop(0, `rgba(0,212,255,0.04)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  requestAnimationFrame(drawBG);
}
drawBG();

// ─── Volume Control ─────────────────────────────────────────────────────────

const volSlider  = document.getElementById('volume-slider');
const volDisplay = document.getElementById('volume-display');
volSlider.addEventListener('input', () => {
  const v = parseFloat(volSlider.value);
  setVolume(v);
  volDisplay.textContent = Math.round(v * 100) + '%';
  volSlider.style.setProperty('--pct', Math.round(v*100) + '%');
});

// ─── Octave Controls ────────────────────────────────────────────────────────

function setOctave(o) {
  baseOctave = Math.max(1, Math.min(7, o));
  document.getElementById('octave-display').textContent = baseOctave;
  setStatus(`Octave set to ${baseOctave}`);
}
document.getElementById('oct-up').addEventListener('click', () => setOctave(baseOctave + 1));
document.getElementById('oct-down').addEventListener('click', () => setOctave(baseOctave - 1));

// ─── Sustain Toggle ─────────────────────────────────────────────────────────

const btnSustain = document.getElementById('btn-sustain');
btnSustain.addEventListener('click', () => {
  sustainMode = !sustainMode;
  btnSustain.dataset.active = sustainMode;
  btnSustain.textContent = sustainMode ? 'ON' : 'OFF';
  if (!sustainMode) {
    // Release all held notes
    Object.entries(activeNotes).forEach(([code, freq]) => {
      const s = synths[currentInst];
      s.triggerRelease(freq, Tone.now());
    });
  }
  setStatus(`Sustain mode ${sustainMode ? 'ON' : 'OFF'}`);
});

// ─── Recording ──────────────────────────────────────────────────────────────

const btnRecord = document.getElementById('btn-record');
const btnPlay   = document.getElementById('btn-play');
const btnClear  = document.getElementById('btn-clear');
const recIndicator = document.getElementById('recording-indicator');

btnRecord.addEventListener('click', () => {
  if (!isRecording) {
    isRecording = true;
    recordedNotes = [];
    recordStartTime = performance.now();
    btnRecord.classList.add('active');
    recIndicator.classList.remove('hidden');
    btnPlay.disabled  = true;
    btnClear.disabled = true;
    setStatus('Recording... play something!');
  } else {
    isRecording = false;
    btnRecord.classList.remove('active');
    recIndicator.classList.add('hidden');
    if (recordedNotes.length > 0) {
      btnPlay.disabled  = false;
      btnClear.disabled = false;
      setStatus(`Recorded ${recordedNotes.filter(n=>n.type==='on').length} notes. Press PLAY to listen back.`);
    } else {
      setStatus('Recording stopped — nothing captured.');
    }
  }
});

function startPlayback() {
  stopPlayback();
  if (!recordedNotes.length) return;
  setStatus('Playing back recording...');
  recordedNotes.forEach(evt => {
    const tid = setTimeout(() => {
      if (evt.type === 'on') {
        const s = synths[currentInst];
        s.triggerAttack(evt.freq, Tone.now());
        updateNoteDisplay(evt.name);
        const codeEntry = Object.keys(KEY_MAP).find(k => KEY_MAP[k].rowNote === evt.name || noteForCode(k)?.name === evt.name?.replace(/\d/g,''));
        if (codeEntry) activateKey(codeEntry);
      } else {
        const s = synths[currentInst];
        const freqEvt = recordedNotes.find(n => n.type==='on' && n.code === evt.code)?.freq;
        if (freqEvt) s.triggerRelease(freqEvt, Tone.now());
        if (evt.code) deactivateKey(evt.code);
      }
    }, evt.t);
    playbackTimeout.push(tid);
  });
  const lastT = recordedNotes[recordedNotes.length - 1]?.t || 0;
  const endTid = setTimeout(() => {
    resetNoteDisplay();
    if (isLooping) {
      startPlayback();
    } else {
      setStatus('Playback complete.');
    }
  }, lastT + 800);
  playbackTimeout.push(endTid);
}

btnPlay.addEventListener('click', () => {
  startPlayback();
});

function stopPlayback() {
  playbackTimeout.forEach(clearTimeout);
  playbackTimeout = [];
}

btnClear.addEventListener('click', () => {
  stopPlayback();
  recordedNotes = [];
  btnPlay.disabled  = true;
  btnClear.disabled = true;
  setStatus('Recording cleared.');
  resetNoteDisplay();
});

const btnLoop = document.getElementById('btn-loop');
btnLoop.addEventListener('click', () => {
  isLooping = !isLooping;
  btnLoop.dataset.active = isLooping;
  setStatus(`Loop mode ${isLooping ? 'ON' : 'OFF'}`);
});

// ─── Instrument & FX Listeners ───────────────────────────────────────────────

document.querySelectorAll('.inst-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.inst-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentInst = btn.dataset.inst;
    const c = INSTRUMENTS[currentInst];
    document.documentElement.style.setProperty('--blue', c.color);
    document.documentElement.style.setProperty('--shadow-blue', `0 0 20px ${c.shadow}`);
    setStatus(`Instrument: ${c.name}`);
  });
});

const btnReverb = document.getElementById('btn-reverb');
btnReverb.addEventListener('click', () => {
  useReverb = !useReverb;
  btnReverb.dataset.active = useReverb;
  updateFXRouting();
  setStatus(`Reverb ${useReverb ? 'ON' : 'OFF'}`);
});

const btnEcho = document.getElementById('btn-echo');
btnEcho.addEventListener('click', () => {
  useEcho = !useEcho;
  btnEcho.dataset.active = useEcho;
  updateFXRouting();
  setStatus(`Echo ${useEcho ? 'ON' : 'OFF'}`);
});

// ─── Theme Switcher ─────────────────────────────────────────────────────────

document.getElementById('btn-theme').addEventListener('click', () => {
  themeIdx = (themeIdx + 1) % THEMES.length;
  document.documentElement.dataset.theme = THEMES[themeIdx] === 'default' ? '' : THEMES[themeIdx];
  setStatus(`Theme: ${THEMES[themeIdx].toUpperCase()}`);
});

// ─── Fullscreen ─────────────────────────────────────────────────────────────

document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen().catch(()=>{});
}

// ─── Help Modal ─────────────────────────────────────────────────────────────

document.getElementById('btn-help').addEventListener('click', () => {
  document.getElementById('help-modal').classList.remove('hidden');
});
document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('help-modal').classList.add('hidden');
});
document.getElementById('help-modal').addEventListener('click', e => {
  if (e.target.classList.contains('modal-backdrop')) {
    document.getElementById('help-modal').classList.add('hidden');
  }
});

// ─── Keyboard Event Handling ─────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  // Block browser shortcuts only for piano keys
  if (KEY_MAP[e.code]) e.preventDefault();
  if (e.repeat) return;

  // Special keys
  if (e.code === 'KeyF' && !KEY_MAP['KeyF']) { toggleFullscreen(); return; }
  if (e.code === 'Escape') { document.getElementById('help-modal').classList.add('hidden'); return; }

  if (!KEY_MAP[e.code]) return;
  Tone.start();
  playNote(e.code);
});

document.addEventListener('keyup', e => {
  if (!KEY_MAP[e.code]) return;
  stopNote(e.code);
});

// Spacebar = Dash Sound
window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (e.repeat) return;
    Tone.start();
    if (noiseSynth) noiseSynth.triggerAttackRelease("16n", Tone.now(), 0.8);
    bumpEQ();
  }
});

// ─── Status Bar ─────────────────────────────────────────────────────────────

function setStatus(msg) {
  document.getElementById('status-text').textContent = msg;
}

// ─── Loading Sequence ────────────────────────────────────────────────────────

const LOAD_STEPS = [
  { msg: 'Initializing Audio Engine...',  pct: 10 },
  { msg: 'Loading Tone.js Synthesizer...', pct: 30 },
  { msg: 'Building Oscillator Bank...',   pct: 50 },
  { msg: 'Calibrating Reverb Nodes...',   pct: 65 },
  { msg: 'Rendering Keyboard Matrix...',  pct: 80 },
  { msg: 'Igniting Neon Circuits...',     pct: 92 },
  { msg: 'NEXUS ONLINE ✓',               pct: 100 },
];

async function runLoader() {
  const bar    = document.getElementById('loader-bar');
  const status = document.getElementById('loader-status');

  for (const step of LOAD_STEPS) {
    status.textContent = step.msg;
    bar.style.width    = step.pct + '%';
    await sleep(340);
  }

  await sleep(500);
  document.getElementById('loading-screen').classList.add('fade-out');
  document.getElementById('app').classList.remove('hidden');

  // Build after reveal
  buildKeyboard();
  buildAudio();
  initEQ();
  setStatus('READY — Press any mapped key to play');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Boot ────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  runLoader();
});
