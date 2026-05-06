'use strict';

// ── Instrument Definitions ─────────────────────────────────────────────────
const INST = {
  piano: {
    name:'PIANO', icon:'🎹', color:'#00d4ff', shadow:'rgba(0,212,255,0.4)',
    layout:'piano',
    osc:'triangle', env:{attack:0.008,decay:0.3,sustain:0.6,release:1.5},
    keys:[
      {code:'KeyQ',label:'Q',note:'C#4',type:'black'},{code:'KeyW',label:'W',note:'D#4',type:'black'},
      {code:'KeyE',label:'E',note:'F#4',type:'black'},{code:'KeyR',label:'R',note:'G#4',type:'black'},
      {code:'KeyT',label:'T',note:'A#4',type:'black'},{code:'KeyY',label:'Y',note:'C#5',type:'black'},
      {code:'KeyU',label:'U',note:'D#5',type:'black'},{code:'KeyI',label:'I',note:'F#5',type:'black'},
      {code:'KeyO',label:'O',note:'G#5',type:'black'},{code:'KeyP',label:'P',note:'A#5',type:'black'},
      {code:'KeyA',label:'A',note:'C4',type:'white'},{code:'KeyS',label:'S',note:'D4',type:'white'},
      {code:'KeyD',label:'D',note:'E4',type:'white'},{code:'KeyF',label:'F',note:'F4',type:'white'},
      {code:'KeyG',label:'G',note:'G4',type:'white'},{code:'KeyH',label:'H',note:'A4',type:'white'},
      {code:'KeyJ',label:'J',note:'B4',type:'white'},{code:'KeyK',label:'K',note:'C5',type:'white'},
      {code:'KeyL',label:'L',note:'D5',type:'white'},
      {code:'KeyZ',label:'Z',note:'C3',type:'white'},{code:'KeyX',label:'X',note:'D3',type:'white'},
      {code:'KeyC',label:'C',note:'E3',type:'white'},{code:'KeyV',label:'V',note:'F3',type:'white'},
      {code:'KeyB',label:'B',note:'G3',type:'white'},{code:'KeyN',label:'N',note:'A3',type:'white'},
      {code:'KeyM',label:'M',note:'B3',type:'white'},
    ]
  },
  epiano: {
    name:'E-PIANO', icon:'🎹', color:'#22d3ee', shadow:'rgba(34,211,238,0.4)',
    layout:'piano',
    osc:'fmsinc', env:{attack:0.01,decay:0.2,sustain:0.4,release:1.5},
    keys:null // same as piano
  },
  synth: {
    name:'SYNTH', icon:'🎛️', color:'#8b5cf6', shadow:'rgba(139,92,246,0.4)',
    layout:'piano',
    osc:'square', env:{attack:0.01,decay:0.25,sustain:0.5,release:1},
    keys:null
  },
  guitar: {
    name:'GUITAR', icon:'🎸', color:'#f59e0b', shadow:'rgba(245,158,11,0.4)',
    layout:'guitar',
    osc:'pwm', env:{attack:0.02,decay:0.4,sustain:0.2,release:1},
    // 6 strings × 4 frets
    strings:[
      {name:'e',label:'High e', keys:[
        {code:'KeyP',label:'P',note:'E5'},{code:'KeyO',label:'O',note:'F5'},
        {code:'KeyI',label:'I',note:'F#5'},{code:'KeyU',label:'U',note:'G5'}]},
      {name:'B',label:'B', keys:[
        {code:'KeyL',label:'L',note:'B4'},{code:'KeyK',label:'K',note:'C5'},
        {code:'KeyJ',label:'J',note:'C#5'},{code:'KeyH',label:'H',note:'D5'}]},
      {name:'G',label:'G', keys:[
        {code:'KeyM',label:'M',note:'G4'},{code:'KeyN',label:'N',note:'G#4'},
        {code:'KeyB',label:'B',note:'A4'},{code:'KeyV',label:'V',note:'A#4'}]},
      {name:'D',label:'D', keys:[
        {code:'KeyA',label:'A',note:'D4'},{code:'KeyS',label:'S',note:'D#4'},
        {code:'KeyD',label:'D',note:'E4'},{code:'KeyF',label:'F',note:'F4'}]},
      {name:'A',label:'A', keys:[
        {code:'KeyQ',label:'Q',note:'A3'},{code:'KeyW',label:'W',note:'A#3'},
        {code:'KeyE',label:'E',note:'B3'},{code:'KeyR',label:'R',note:'C4'}]},
      {name:'E',label:'Low E', keys:[
        {code:'KeyZ',label:'Z',note:'E3'},{code:'KeyX',label:'X',note:'F3'},
        {code:'KeyC',label:'C',note:'F#3'},{code:'KeyT',label:'T',note:'G3'}]},
    ]
  },
  bass: {
    name:'BASS', icon:'🎸', color:'#ef4444', shadow:'rgba(239,68,68,0.4)',
    layout:'guitar',
    osc:'triangle', env:{attack:0.02,decay:0.5,sustain:0.4,release:0.8},
    strings:[
      {name:'G',label:'G', keys:[
        {code:'KeyL',label:'L',note:'G3'},{code:'KeyK',label:'K',note:'G#3'},
        {code:'KeyJ',label:'J',note:'A3'},{code:'KeyH',label:'H',note:'A#3'}]},
      {name:'D',label:'D', keys:[
        {code:'KeyA',label:'A',note:'D3'},{code:'KeyS',label:'S',note:'D#3'},
        {code:'KeyD',label:'D',note:'E3'},{code:'KeyF',label:'F',note:'F3'}]},
      {name:'A',label:'A', keys:[
        {code:'KeyQ',label:'Q',note:'A2'},{code:'KeyW',label:'W',note:'A#2'},
        {code:'KeyE',label:'E',note:'B2'},{code:'KeyR',label:'R',note:'C3'}]},
      {name:'E',label:'Low E', keys:[
        {code:'KeyZ',label:'Z',note:'E2'},{code:'KeyX',label:'X',note:'F2'},
        {code:'KeyC',label:'C',note:'F#2'},{code:'KeyV',label:'V',note:'G2'}]},
    ]
  },
  violin: {
    name:'VIOLIN', icon:'🎻', color:'#d946ef', shadow:'rgba(217,70,239,0.4)',
    layout:'strings',
    osc:'sawtooth', env:{attack:0.3,decay:0.1,sustain:0.9,release:1.5},
    sections:[
      {label:'E STRING', keys:[
        {code:'KeyQ',label:'Q',note:'E5'},{code:'KeyW',label:'W',note:'F5'},
        {code:'KeyE',label:'E',note:'F#5'},{code:'KeyR',label:'R',note:'G5'}]},
      {label:'A STRING', keys:[
        {code:'KeyA',label:'A',note:'A4'},{code:'KeyS',label:'S',note:'B4'},
        {code:'KeyD',label:'D',note:'C5'},{code:'KeyF',label:'F',note:'D5'}]},
      {label:'D STRING', keys:[
        {code:'KeyZ',label:'Z',note:'D4'},{code:'KeyX',label:'X',note:'E4'},
        {code:'KeyC',label:'C',note:'F4'},{code:'KeyV',label:'V',note:'G4'}]},
    ]
  },
  flute: {
    name:'FLUTE', icon:'🪈', color:'#14b8a6', shadow:'rgba(20,184,166,0.4)',
    layout:'strings',
    osc:'fmsinc', env:{attack:0.1,decay:0.1,sustain:0.8,release:0.8},
    sections:[
      {label:'HIGH', keys:[
        {code:'KeyQ',label:'Q',note:'D6'},{code:'KeyW',label:'W',note:'E6'},
        {code:'KeyE',label:'E',note:'F6'},{code:'KeyR',label:'R',note:'G6'}]},
      {label:'MID', keys:[
        {code:'KeyA',label:'A',note:'G5'},{code:'KeyS',label:'S',note:'A5'},
        {code:'KeyD',label:'D',note:'B5'},{code:'KeyF',label:'F',note:'C6'}]},
      {label:'LOW', keys:[
        {code:'KeyZ',label:'Z',note:'D5'},{code:'KeyX',label:'X',note:'E5'},
        {code:'KeyC',label:'C',note:'F5'},{code:'KeyV',label:'V',note:'G5'}]},
    ]
  },
  drums: {
    name:'DRUMS', icon:'🥁', color:'#f97316', shadow:'rgba(249,115,22,0.4)',
    layout:'drums',
    pads:[
      {code:'KeyQ', label:'Q', name:'CLAP',   color:'#86efac', bg:'rgba(134,239,172,0.12)', gc:[2,1], shape:'cymbal'},
      {code:'KeyW', label:'W', name:'COWBELL', color:'#fde68a', bg:'rgba(253,230,138,0.12)', gc:[4,1], shape:'cymbal'},
      {code:'KeyE', label:'E', name:'RIM',    color:'#c4b5fd', bg:'rgba(196,181,253,0.12)', gc:[6,1], shape:'cymbal'},
      {code:'KeyG', label:'G', name:'CRASH',  color:'#a855f7', bg:'rgba(168,85,247,0.12)', gc:[1,2], shape:'cymbal'},
      {code:'KeyD', label:'D', name:'HI-HAT', color:'#00d4ff', bg:'rgba(0,212,255,0.12)',  gc:[3,2], shape:'hihat'},
      {code:'KeyF', label:'F', name:'OPEN HH',color:'#22d3ee', bg:'rgba(34,211,238,0.12)', gc:[5,2], shape:'hihat'},
      {code:'KeyH', label:'H', name:'RIDE',   color:'#818cf8', bg:'rgba(129,140,248,0.12)', gc:[7,2], shape:'cymbal'},
      {code:'KeyJ', label:'J', name:'TOM 1',  color:'#f9a8d4', bg:'rgba(249,168,212,0.12)', gc:[2,3], shape:'tom'},
      {code:'KeyS', label:'S', name:'SNARE',  color:'#fbbf24', bg:'rgba(251,191,36,0.12)', gc:[4,3], shape:'snare'},
      {code:'KeyK', label:'K', name:'TOM 2',  color:'#fb7185', bg:'rgba(251,113,133,0.12)', gc:[6,3], shape:'tom'},
      {code:'KeyA', label:'A', name:'KICK',   color:'#f97316', bg:'rgba(249,115,22,0.15)', gc:[3,4], shape:'kick'},
      {code:'KeyL', label:'L', name:'FLOOR',  color:'#ef4444', bg:'rgba(239,68,68,0.12)', gc:[5,4], shape:'tom'},
    ]
  },
  pads: {
    name:'EDM PADS', icon:'✨', color:'#ec4899', shadow:'rgba(236,72,153,0.4)',
    layout:'pads',
    osc:'sine', env:{attack:0.4,decay:0.5,sustain:1,release:3},
    pads:[
      {code:'KeyQ',label:'Q',name:'PAD 1', note:'C4',  color:'#ec4899', border:'rgba(236,72,153,0.5)'},
      {code:'KeyW',label:'W',name:'PAD 2', note:'D#4', color:'#a855f7', border:'rgba(168,85,247,0.5)'},
      {code:'KeyE',label:'E',name:'PAD 3', note:'F4',  color:'#00d4ff', border:'rgba(0,212,255,0.5)'},
      {code:'KeyR',label:'R',name:'PAD 4', note:'G#4', color:'#14b8a6', border:'rgba(20,184,166,0.5)'},
      {code:'KeyA',label:'A',name:'PAD 5', note:'A#4', color:'#f59e0b', border:'rgba(245,158,11,0.5)'},
      {code:'KeyS',label:'S',name:'PAD 6', note:'C5',  color:'#ef4444', border:'rgba(239,68,68,0.5)'},
      {code:'KeyD',label:'D',name:'PAD 7', note:'D5',  color:'#8b5cf6', border:'rgba(139,92,246,0.5)'},
      {code:'KeyF',label:'F',name:'PAD 8', note:'F5',  color:'#22d3ee', border:'rgba(34,211,238,0.5)'},
      {code:'KeyZ',label:'Z',name:'PAD 9', note:'G5',  color:'#e879f9', border:'rgba(232,121,249,0.5)'},
      {code:'KeyX',label:'X',name:'PAD 10',note:'A5',  color:'#00ff88', border:'rgba(0,255,136,0.5)'},
      {code:'KeyC',label:'C',name:'PAD 11',note:'C6',  color:'#ff6eb4', border:'rgba(255,110,180,0.5)'},
      {code:'KeyV',label:'V',name:'PAD 12',note:'D#6', color:'#fde68a', border:'rgba(253,230,138,0.5)'},
    ]
  }
};

// copy piano keys to epiano and synth
INST.epiano.keys = INST.piano.keys;
INST.synth.keys  = INST.piano.keys;

// ── State ─────────────────────────────────────────────────────────────────
let currentInst   = 'piano';
let pressedKeys   = new Set();
let activeNotes   = {};
let volume        = 0.75;
let baseOctave    = 4;
let sustainMode   = false;
let useReverb     = true;
let useEcho       = false;
let isRecording   = false;
let isLooping     = false;
let recordedNotes = [];
let recStart      = 0;
let playTimers    = [];
let themeIdx      = 0;

// ── Audio ──────────────────────────────────────────────────────────────────
let synths = {}, reverb, echo, limiter, noiseSynth;

function buildAudio() {
  limiter   = new Tone.Limiter(-3).toDestination();
  reverb    = new Tone.Reverb({ decay:2.5, wet:0.3 }).connect(limiter);
  echo      = new Tone.FeedbackDelay('8n', 0.35).connect(limiter);
  noiseSynth= new Tone.NoiseSynth({ noise:{type:'white'}, envelope:{attack:0.005,decay:0.08,sustain:0} }).connect(reverb);

  const mk = (osc, env, vol=-6) => new Tone.PolySynth(Tone.Synth, { oscillator:{type:osc}, envelope:env, volume:vol });
  const mkFM= (env, vol=-6) => new Tone.PolySynth(Tone.FMSynth, { envelope:env, harmonicity:3, modulationIndex:8, volume:vol });
  const mkMem=() => new Tone.PolySynth(Tone.MembraneSynth, { pitchDecay:0.05, octaves:3, envelope:{attack:0.001,decay:0.4,sustain:0,release:1.4}, volume:-4 });

  synths.piano  = mk('triangle', {attack:0.008,decay:0.3,sustain:0.6,release:1.5});
  synths.epiano = mkFM({attack:0.01,decay:0.2,sustain:0.4,release:1.5});
  synths.synth  = mk('square',   {attack:0.01,decay:0.25,sustain:0.5,release:1});
  synths.guitar = mk('pwm',      {attack:0.02,decay:0.4,sustain:0.2,release:1},-5);
  synths.bass   = mk('triangle', {attack:0.02,decay:0.5,sustain:0.4,release:0.8},-4);
  synths.violin = mk('sawtooth', {attack:0.3,decay:0.1,sustain:0.9,release:1.5},-5);
  synths.flute  = mkFM({attack:0.1,decay:0.1,sustain:0.8,release:0.8},-6);
  synths.drums  = mkMem();
  synths.pads   = mk('sine',     {attack:0.4,decay:0.5,sustain:1,release:3},-7);

  routeFX();
  setVol(volume);
}

function routeFX() {
  Object.values(synths).forEach(s => {
    s.disconnect();
    if (useReverb && useEcho) { s.connect(echo); echo.disconnect(); echo.connect(reverb); }
    else if (useEcho)  { s.connect(echo); echo.disconnect(); echo.connect(limiter); }
    else if (useReverb){ s.connect(reverb); }
    else { s.connect(limiter); }
  });
  noiseSynth.connect(useReverb ? reverb : limiter);
}

function setVol(v) {
  volume = v;
  const db = v === 0 ? -Infinity : 20*Math.log10(v) - 4;
  Object.values(synths).forEach(s => { s.volume.value = db; });
  if (noiseSynth) noiseSynth.volume.value = db;
}

function getNoteForKey(code) {
  const inst = INST[currentInst];
  if (inst.layout === 'piano') {
    const k = inst.keys.find(k => k.code === code);
    return k ? k.note : null;
  }
  if (inst.layout === 'guitar') {
    for (const str of inst.strings) {
      const k = str.keys.find(k => k.code === code);
      if (k) return k.note;
    }
    return null;
  }
  if (inst.layout === 'strings') {
    for (const sec of inst.sections) {
      const k = sec.keys.find(k => k.code === code);
      if (k) return k.note;
    }
    return null;
  }
  if (inst.layout === 'drums' || inst.layout === 'pads') {
    const p = inst.pads.find(p => p.code === code);
    return p ? (p.note || p.name) : null;
  }
  return null;
}

function getLabelForKey(code) {
  const inst = INST[currentInst];
  if (inst.layout === 'piano') return inst.keys.find(k=>k.code===code)?.note || null;
  if (inst.layout === 'guitar') { for (const s of inst.strings) { const k=s.keys.find(k=>k.code===code); if(k) return k.note; } }
  if (inst.layout === 'strings') { for (const s of inst.sections) { const k=s.keys.find(k=>k.code===code); if(k) return k.note; } }
  if (inst.layout === 'drums') return inst.pads.find(p=>p.code===code)?.name || null;
  if (inst.layout === 'pads')  return inst.pads.find(p=>p.code===code)?.name || null;
  return null;
}

function playNote(code) {
  if (pressedKeys.has(code)) return;
  const note = getNoteForKey(code);
  if (!note) return;
  pressedKeys.add(code);

  const s = synths[currentInst];
  // drums = percussive short hits
  if (currentInst === 'drums') {
    s.triggerAttackRelease(note.replace(/\D/g,'') ? note : 'C2', '8n', Tone.now());
  } else {
    s.triggerAttack(note, Tone.now());
  }
  activeNotes[code] = note;
  showNote(getLabelForKey(code) || note);
  activateKey(code);
  spawnRipple(code);
  bumpEQ();

  if (isRecording) {
    recordedNotes.push({ code, note, t: performance.now()-recStart, type:'on', inst:currentInst });
  }
}

function stopNote(code) {
  if (!pressedKeys.has(code)) return;
  pressedKeys.delete(code);
  const note = activeNotes[code];
  if (!note) return;
  if (!sustainMode && currentInst !== 'drums') {
    synths[currentInst].triggerRelease(note, Tone.now());
  }
  delete activeNotes[code];
  deactivateKey(code);
  if (pressedKeys.size === 0) resetNote();
  if (isRecording) recordedNotes.push({ code, t:performance.now()-recStart, type:'off' });
}
