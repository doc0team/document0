"use client";

let popBuffer: AudioBuffer | null = null;
let ctx: AudioContext | null = null;
let toneInitializing = false;
let tickSynth: any = null;

function getCtx(): AudioContext | null {
  if (!ctx && typeof window !== "undefined") ctx = new AudioContext();
  return ctx;
}

async function loadPopBuffer() {
  const ac = getCtx();
  if (!ac || popBuffer) return;
  try {
    const res = await fetch("/ui-pop.mp3");
    const buf = await res.arrayBuffer();
    popBuffer = await ac.decodeAudioData(buf);
  } catch {
    // fall through - pop will be silent if file unavailable
  }
}

async function initTone() {
  if (toneInitializing || tickSynth) return;
  toneInitializing = true;
  try {
    const Tone = await import("tone");
    await Tone.start();

    const reverb = new Tone.Reverb({ decay: 0.3, wet: 0.2 }).toDestination();
    await reverb.generate();

    tickSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 },
    }).connect(reverb);
    tickSynth.volume.value = -18;
  } catch {
    toneInitializing = false;
  }
}

if (typeof window !== "undefined") loadPopBuffer();

export function playPop() {
  initTone();
  try {
    const ac = getCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!popBuffer) {
      loadPopBuffer();
      return;
    }
    const src = ac.createBufferSource();
    src.buffer = popBuffer;
    const gain = ac.createGain();
    gain.gain.value = 0.7;
    src.connect(gain).connect(ac.destination);
    src.start();
  } catch {
    // Audio not available
  }
}

const TICK_STEP = 0.12;
const NOTE_MIN = 64;
const NOTE_MAX = 80;

function scaleToNote(s: number): string {
  const t = Math.max(0, Math.min(1, (s - 0.3) / (3 - 0.3)));
  const midi = Math.round(NOTE_MIN + t * (NOTE_MAX - NOTE_MIN));
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const name = noteNames[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

let lastTickStep = -1;

export function playResizeTick(currentScale: number) {
  const step = Math.round(currentScale / TICK_STEP);
  if (step === lastTickStep) return;
  lastTickStep = step;

  try {
    if (tickSynth) {
      tickSynth.triggerAttackRelease(scaleToNote(currentScale), "64n");
    }
  } catch {
    // ignore
  }
}

export function resetTickStep() {
  lastTickStep = -1;
}
