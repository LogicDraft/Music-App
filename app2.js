'use strict';

const INST_ICON = {
  piano: 'piano',
  epiano: 'queue_music',
  synth: 'graphic_eq',
  guitar: 'music_note',
  bass: 'music_note',
  violin: 'album',
  flute: 'air',
  drums: 'radio_button_checked',
  pads: 'grid_view'
};

const STORAGE_KEY = 'nexus-studio-settings-v2';
const SOUND_PRESETS = {
  studio: { name: 'Studio', reverb: true, echo: false, reverbWet: 0.28, echoWet: 0.18 },
  warm: { name: 'Warm', reverb: true, echo: false, reverbWet: 0.16, echoWet: 0.12 },
  dream: { name: 'Dream', reverb: true, echo: true, reverbWet: 0.48, echoWet: 0.36 },
  punch: { name: 'Punch', reverb: false, echo: false, reverbWet: 0.08, echoWet: 0.08 }
};
let soundPreset = 'studio';

function renderView(inst) {
  const el = document.getElementById('inst-view');
  const cfg = INST[inst];
  document.getElementById('inst-badge').innerHTML =
    `<span class="material-symbols-rounded">${INST_ICON[inst] || 'music_note'}</span><span>${cfg.name}</span>`;
  document.documentElement.style.setProperty('--accent', cfg.color);
  document.documentElement.style.setProperty('--accent-glow', cfg.shadow);

  if (cfg.layout === 'piano') el.innerHTML = buildPianoHTML(cfg);
  else if (cfg.layout === 'guitar') el.innerHTML = buildGuitarHTML(cfg);
  else if (cfg.layout === 'drums') el.innerHTML = buildDrumsHTML(cfg);
  else if (cfg.layout === 'pads') el.innerHTML = buildPadsHTML(cfg);
  else if (cfg.layout === 'strings') el.innerHTML = buildStringsHTML(cfg);

  el.querySelectorAll('[data-code]').forEach(k => {
    const code = k.dataset.code;
    k.addEventListener('mousedown', e => { e.preventDefault(); Tone.start(); playNote(code); });
    k.addEventListener('mouseup', () => stopNote(code));
    k.addEventListener('mouseleave', () => stopNote(code));
  });

  renderKeymap();
}

function buildPianoHTML(cfg) {
  const top = cfg.keys.filter(k => k.type === 'black');
  const mid = cfg.keys.filter(k => k.type === 'white').slice(0, 9);
  const bot = cfg.keys.filter(k => k.type === 'white').slice(9);
  const pkey = k => `<div class="pkey ${k.type}" id="vk-${k.code}" data-code="${k.code}">
    <span class="pk-label">${k.label}</span><span class="pk-note">${k.note}</span></div>`;

  return `<div class="piano-wrap">
    <div class="piano-row"><span class="piano-row-label">Sharps</span><div class="piano-keys">${top.map(pkey).join('')}</div></div>
    <div class="piano-row"><span class="piano-row-label">Home row</span><div class="piano-keys">${mid.map(pkey).join('')}</div></div>
    <div class="piano-row"><span class="piano-row-label">Low row</span><div class="piano-keys">${bot.map(pkey).join('')}</div></div>
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
      <div class="fret-div-bg">${[0, 1, 2, 3].map(() => '<div class="fret-div"></div>').join('')}</div>
      <div class="guitar-fret-keys">${fkeys}</div>
    </div>`;
  }).join('');

  return `<div class="guitar-wrap"><div class="guitar-neck"><div class="guitar-frets">${rows}</div></div></div>`;
}

function buildDrumsHTML(cfg) {
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
        style="background:var(--surface);border-color:color-mix(in srgb, var(--accent) 32%, var(--border))">
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

function getInstrumentKeys(inst = currentInst) {
  const cfg = INST[inst];
  if (cfg.layout === 'piano') {
    return cfg.keys.map(k => ({ key: k.label, note: k.note, role: k.type === 'black' ? 'Sharp key' : 'Natural key' }));
  }
  if (cfg.layout === 'guitar') {
    return cfg.strings.flatMap(str => str.keys.map(k => ({ key: k.label, note: k.note, role: str.label })));
  }
  if (cfg.layout === 'strings') {
    return cfg.sections.flatMap(sec => sec.keys.map(k => ({ key: k.label, note: k.note, role: sec.label })));
  }
  if (cfg.layout === 'drums') {
    return cfg.pads.map(p => ({ key: p.label, note: p.name, role: 'Drum pad' }));
  }
  if (cfg.layout === 'pads') {
    return cfg.pads.map(p => ({ key: p.label, note: p.name, role: p.note }));
  }
  return [];
}

function renderKeymap() {
  const grid = document.getElementById('keymap-grid');
  if (!grid) return;

  const cfg = INST[currentInst];
  document.getElementById('keymap-subtitle').textContent = `${cfg.name} shortcuts`;
  grid.innerHTML = getInstrumentKeys().map(item => `<div class="keymap-item">
    <span class="keycap">${item.key}</span>
    <span>
      <span class="keymap-note">${item.note}</span>
      <span class="keymap-role">${item.role}</span>
    </span>
  </div>`).join('');
}

function activateKey(code) {
  const el = document.getElementById(`vk-${code}`);
  if (el) el.classList.add('active');
}

function deactivateKey(code) {
  const el = document.getElementById(`vk-${code}`);
  if (el) el.classList.remove('active');
}

function showNote(txt) {
  document.getElementById('note-name').textContent = txt || '-';
  document.getElementById('note-lbl').textContent = 'Now playing';
}

function resetNote() {
  document.getElementById('note-name').textContent = '-';
  document.getElementById('note-lbl').textContent = 'Press a key to play';
}

function spawnRipple(code) {
  const el = document.getElementById(`vk-${code}`);
  if (!el) return;

  const r = el.getBoundingClientRect();
  const size = 70;
  const rip = document.createElement('div');
  rip.className = 'ripple';
  rip.style.cssText = `left:${r.left + r.width / 2 - size / 2}px;top:${r.top + r.height / 2 - size / 2}px;
    width:${size}px;height:${size}px;border:2px solid var(--accent);box-shadow:0 0 10px var(--accent)`;
  document.getElementById('ripple-layer').appendChild(rip);
  rip.addEventListener('animationend', () => rip.remove());
}

const eqBars = [];

function initEQ() {
  document.querySelectorAll('.eq-bar').forEach(b => eqBars.push({ el: b, h: 4 }));
}

function bumpEQ() {
  eqBars.forEach(b => {
    b.h = Math.random() * 24 + 4;
    b.el.style.height = `${b.h}px`;
  });
}

setInterval(() => {
  eqBars.forEach(b => {
    b.h = pressedKeys.size > 0 ? b.h * 0.7 + (Math.random() * 24 + 4) * 0.3 : Math.max(3, b.h * 0.87);
    b.el.style.height = `${b.h}px`;
  });
}, 80);

const cvs = document.getElementById('bg-canvas');
const ctx = cvs.getContext('2d');
let W, H, particles = [];

function resizeCvs() {
  W = cvs.width = window.innerWidth;
  H = cvs.height = window.innerHeight;
}

window.addEventListener('resize', resizeCvs);
resizeCvs();

function spawnP() {
  const colors = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335'];
  particles.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -(Math.random() * 0.45 + 0.08),
    r: Math.random() * 1.3 + 0.35,
    alpha: Math.random() * 0.32 + 0.12,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 0,
    max: 100 + Math.random() * 100
  });
}

(function drawBG() {
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(26,115,232,0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 72) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 72) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  if (pressedKeys.size > 0 && Math.random() < 0.35) spawnP();
  if (Math.random() < 0.03) spawnP();
  particles = particles.filter(p => p.life < p.max);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    const f = Math.sin(p.life / p.max * Math.PI);
    ctx.globalAlpha = p.alpha * f;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawBG);
})();

function readSavedSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveSettings() {
  const data = {
    currentInst,
    volume,
    baseOctave,
    sustainMode,
    useReverb,
    useEcho,
    isLooping,
    theme: themeIdx === 1 ? 'dark' : 'light',
    soundPreset
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function applySavedSettings() {
  const saved = readSavedSettings();
  if (saved.currentInst && INST[saved.currentInst]) currentInst = saved.currentInst;
  if (Number.isFinite(saved.volume)) volume = Math.min(1, Math.max(0, saved.volume));
  if (Number.isFinite(saved.baseOctave)) baseOctave = Math.min(7, Math.max(1, saved.baseOctave));
  if (typeof saved.sustainMode === 'boolean') sustainMode = saved.sustainMode;
  if (typeof saved.useReverb === 'boolean') useReverb = saved.useReverb;
  if (typeof saved.useEcho === 'boolean') useEcho = saved.useEcho;
  if (typeof saved.isLooping === 'boolean') isLooping = saved.isLooping;
  if (saved.soundPreset && SOUND_PRESETS[saved.soundPreset]) soundPreset = saved.soundPreset;
  themeIdx = saved.theme === 'dark' ? 1 : 0;
  document.documentElement.dataset.theme = themeIdx === 1 ? 'dark' : '';
  syncControlsFromState();
}

function syncControlsFromState() {
  const vol = document.getElementById('vol');
  vol.value = volume;
  vol.style.background = `linear-gradient(to right, var(--accent) ${volume * 100}%, var(--surface-soft) ${volume * 100}%)`;
  document.getElementById('vol-val').textContent = `${Math.round(volume * 100)}%`;
  document.getElementById('oct-val').textContent = baseOctave;

  const sustain = document.getElementById('btn-sustain');
  sustain.dataset.on = sustainMode;
  sustain.textContent = sustainMode ? 'On' : 'Off';

  document.getElementById('btn-reverb').dataset.on = useReverb;
  document.getElementById('btn-echo').dataset.on = useEcho;
  document.getElementById('btn-loop').dataset.on = isLooping;
  document.querySelectorAll('.inst-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.inst === currentInst));
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.preset === soundPreset));
}

function applySoundPreset(name, persist = false, updateFx = true) {
  const preset = SOUND_PRESETS[name] || SOUND_PRESETS.studio;
  soundPreset = name in SOUND_PRESETS ? name : 'studio';
  if (updateFx) {
    useReverb = preset.reverb;
    useEcho = preset.echo;
  }

  if (reverb?.wet) reverb.wet.value = preset.reverbWet;
  if (echo?.wet) echo.wet.value = preset.echoWet;
  if (Object.keys(synths).length) routeFX();

  syncControlsFromState();
  setStatus(`Sound preset: ${preset.name}`);
  if (persist) saveSettings();
}

function getRecordingStats() {
  const noteOns = recordedNotes.filter(n => n.type === 'on');
  const duration = recordedNotes.length ? Math.max(...recordedNotes.map(n => n.t || 0), 250) : 0;
  return { noteOns, duration };
}

function renderTimeline() {
  const notesEl = document.getElementById('timeline-notes');
  const emptyEl = document.getElementById('timeline-empty');
  const metaEl = document.getElementById('timeline-meta');
  const durationEl = document.getElementById('timeline-duration');
  const { noteOns, duration } = getRecordingStats();

  if (!noteOns.length) {
    notesEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    metaEl.textContent = 'No notes recorded';
    durationEl.textContent = '0.0s';
    return;
  }

  emptyEl.classList.add('hidden');
  metaEl.textContent = `${noteOns.length} note${noteOns.length === 1 ? '' : 's'} captured`;
  durationEl.textContent = `${(duration / 1000).toFixed(1)}s`;
  notesEl.innerHTML = noteOns.map((ev, idx) => {
    const off = recordedNotes.find(n => n.type === 'off' && n.code === ev.code && n.t > ev.t);
    const left = Math.min(96, (ev.t / duration) * 100);
    const width = Math.max(3.2, (((off?.t || ev.t + 220) - ev.t) / duration) * 100);
    const lane = idx % 2;
    return `<span class="timeline-note" style="left:${left}%;width:${Math.min(width, 100 - left)}%;top:${lane * 1.28}rem">${ev.note || ev.code}</span>`;
  }).join('');
}

function startTimelinePlayback() {
  const track = document.getElementById('timeline-track');
  const { duration } = getRecordingStats();
  if (!duration) return;

  track.classList.remove('playing');
  track.style.setProperty('--timeline-duration', `${Math.max(duration + 800, 900)}ms`);
  track.style.setProperty('--timeline-width', `${track.clientWidth}px`);
  void track.offsetWidth;
  track.classList.add('playing');
}

function stopTimelinePlayback() {
  document.getElementById('timeline-track').classList.remove('playing');
}

document.getElementById('vol').addEventListener('input', e => {
  setVol(parseFloat(e.target.value));
  document.getElementById('vol-val').textContent = `${Math.round(e.target.value * 100)}%`;
  e.target.style.background = `linear-gradient(to right, var(--accent) ${e.target.value * 100}%, var(--surface-soft) ${e.target.value * 100}%)`;
  saveSettings();
});

document.getElementById('oct-up').addEventListener('click', () => {
  baseOctave = Math.min(7, baseOctave + 1);
  document.getElementById('oct-val').textContent = baseOctave;
  saveSettings();
});

document.getElementById('oct-dn').addEventListener('click', () => {
  baseOctave = Math.max(1, baseOctave - 1);
  document.getElementById('oct-val').textContent = baseOctave;
  saveSettings();
});

const btnSus = document.getElementById('btn-sustain');
btnSus.addEventListener('click', () => {
  sustainMode = !sustainMode;
  btnSus.dataset.on = sustainMode;
  btnSus.textContent = sustainMode ? 'On' : 'Off';
  setStatus(`Sustain ${sustainMode ? 'on' : 'off'}`);
  saveSettings();
});

const btnRev = document.getElementById('btn-reverb');
btnRev.addEventListener('click', () => {
  useReverb = !useReverb;
  btnRev.dataset.on = useReverb;
  routeFX();
  setStatus(`Reverb ${useReverb ? 'on' : 'off'}`);
  saveSettings();
});

const btnEch = document.getElementById('btn-echo');
btnEch.addEventListener('click', () => {
  useEcho = !useEcho;
  btnEch.dataset.on = useEcho;
  routeFX();
  setStatus(`Echo ${useEcho ? 'on' : 'off'}`);
  saveSettings();
});

const btnRec = document.getElementById('btn-rec');
const btnPlay = document.getElementById('btn-play');
const btnLoop = document.getElementById('btn-loop');
const btnClr = document.getElementById('btn-clr');
const recInd = document.getElementById('rec-ind');
const keymapDialog = document.getElementById('keymap-dialog');

document.getElementById('btn-keymap').addEventListener('click', () => {
  renderKeymap();
  keymapDialog.classList.remove('hidden');
});

document.getElementById('btn-close-keymap').addEventListener('click', () => {
  keymapDialog.classList.add('hidden');
});

document.querySelector('[data-close-keymap]').addEventListener('click', () => {
  keymapDialog.classList.add('hidden');
});

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => applySoundPreset(btn.dataset.preset, true, true));
});

btnRec.addEventListener('click', () => {
  if (!isRecording) {
    isRecording = true;
    recordedNotes = [];
    recStart = performance.now();
    renderTimeline();
    stopTimelinePlayback();
    btnRec.classList.add('recording');
    recInd.classList.remove('hidden');
    btnPlay.disabled = true;
    btnClr.disabled = true;
    setStatus('Recording...');
  } else {
    isRecording = false;
    btnRec.classList.remove('recording');
    recInd.classList.add('hidden');
    renderTimeline();
    if (recordedNotes.length) {
      btnPlay.disabled = false;
      btnClr.disabled = false;
      setStatus(`Recorded ${recordedNotes.filter(n => n.type === 'on').length} notes.`);
    } else {
      setStatus('Nothing recorded.');
    }
  }
});

function startPlayback() {
  stopPlayback();
  if (!recordedNotes.length) return;
  setStatus('Playing back...');
  startTimelinePlayback();
  recordedNotes.forEach(ev => {
    const tid = setTimeout(() => {
      if (ev.type === 'on') {
        synths[ev.inst || currentInst]?.triggerAttack(ev.note, Tone.now());
        showNote(ev.note);
        activateKey(ev.code);
        bumpEQ();
      } else {
        synths[ev.inst || currentInst]?.triggerRelease(
          recordedNotes.find(n => n.type === 'on' && n.code === ev.code)?.note || 'C4',
          Tone.now()
        );
        deactivateKey(ev.code);
      }
    }, ev.t);
    playTimers.push(tid);
  });

  const last = recordedNotes[recordedNotes.length - 1]?.t || 0;
  playTimers.push(setTimeout(() => {
    resetNote();
    if (isLooping) startPlayback();
    else {
      stopTimelinePlayback();
      setStatus('Playback done.');
    }
  }, last + 800));
}

function stopPlayback() {
  playTimers.forEach(clearTimeout);
  playTimers = [];
  stopTimelinePlayback();
}

btnPlay.addEventListener('click', startPlayback);
btnLoop.addEventListener('click', () => {
  isLooping = !isLooping;
  btnLoop.dataset.on = isLooping;
  setStatus(`Loop ${isLooping ? 'on' : 'off'}`);
  saveSettings();
});
btnClr.addEventListener('click', () => {
  stopPlayback();
  recordedNotes = [];
  btnPlay.disabled = true;
  btnClr.disabled = true;
  setStatus('Cleared.');
  resetNote();
  renderTimeline();
});

document.querySelectorAll('.inst-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.inst-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentInst = btn.dataset.inst;
    Object.values(activeNotes).forEach(n => {
      try { synths[currentInst]?.triggerRelease(n, Tone.now()); } catch (e) {}
    });
    activeNotes = {};
    pressedKeys.clear();
    renderView(currentInst);
    setStatus(`Instrument: ${INST[currentInst].name}`);
    saveSettings();
  });
});

document.getElementById('btn-theme').addEventListener('click', () => {
  themeIdx = (themeIdx + 1) % 2;
  document.documentElement.dataset.theme = themeIdx === 0 ? '' : 'dark';
  setStatus(`Theme: ${themeIdx === 0 ? 'light' : 'dark'}`);
  saveSettings();
});

document.getElementById('btn-fullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen().catch(() => {});
});

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.code === 'Escape') {
    keymapDialog.classList.add('hidden');
    return;
  }
  if (!keymapDialog.classList.contains('hidden')) return;
  if (e.code === 'Space') {
    e.preventDefault();
    Tone.start();
    noiseSynth?.triggerAttackRelease('16n', Tone.now());
    bumpEQ();
    return;
  }
  const validCodes = getAllValidCodes();
  if (validCodes.has(e.code)) e.preventDefault();
  Tone.start();
  playNote(e.code);
});

document.addEventListener('keyup', e => { stopNote(e.code); });

function getAllValidCodes() {
  const inst = INST[currentInst];
  const s = new Set();
  if (inst.keys) inst.keys.forEach(k => s.add(k.code));
  if (inst.strings) inst.strings.forEach(str => str.keys.forEach(k => s.add(k.code)));
  if (inst.sections) inst.sections.forEach(sec => sec.keys.forEach(k => s.add(k.code)));
  if (inst.pads) inst.pads.forEach(p => s.add(p.code));
  return s;
}

function setStatus(msg) {
  document.getElementById('status-txt').textContent = msg;
}

const STEPS = [
  { msg: 'Initializing audio engine...', pct: 15 },
  { msg: 'Building synthesizer bank...', pct: 35 },
  { msg: 'Loading instrument profiles...', pct: 55 },
  { msg: 'Calibrating FX chain...', pct: 72 },
  { msg: 'Rendering instrument views...', pct: 88 },
  { msg: 'Nexus Studio is ready.', pct: 100 },
];

async function boot() {
  const bar = document.getElementById('ld-bar');
  const stat = document.getElementById('ld-status');
  for (const s of STEPS) {
    bar.style.width = `${s.pct}%`;
    stat.textContent = s.msg;
    await sleep(380);
  }
  await sleep(400);
  document.getElementById('loading-screen').classList.add('out');
  document.getElementById('app').classList.remove('hidden');
  applySavedSettings();
  buildAudio();
  applySoundPreset(soundPreset, false, false);
  initEQ();
  renderView(currentInst);
  renderTimeline();
  setStatus('Ready. Select an instrument and press keys to play.');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

window.addEventListener('DOMContentLoaded', boot);
