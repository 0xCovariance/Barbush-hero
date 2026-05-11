// Bend coach. Shows the bend on the fretboard with a curved arrow + target
// pitch label. Pitch detection is opt-in: if the user grants mic access we
// load Pitchy lazily and show a tuner-style meter; otherwise it's self-report.

import { useEffect, useRef, useState } from 'react';
import { Fretboard } from '../fretboard/Fretboard.jsx';
import { Button } from '../ui/Button.jsx';
import { midiToFreq } from '../../audio/engine.js';

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function midiToName(m) {
  return `${NOTE_NAMES[m % 12]}${Math.floor(m / 12) - 1}`;
}

export function BendCoach({ config, instruction }) {
  const {
    string = 3,            // G string
    fromFret = 7,
    toFret = 9,
    bendType = 'full',     // 'half' | 'full'
    fretWindow = [4, 11],
  } = config;

  // Standard tuning open string MIDI: 1=E4(64), 2=B3(59), 3=G3(55), 4=D3(50), 5=A2(45), 6=E2(40)
  const openMidi = [64, 59, 55, 50, 45, 40][string - 1];
  const startMidi = openMidi + fromFret;
  const targetMidi = openMidi + (bendType === 'full' ? fromFret + 2 : fromFret + 1);
  const targetFreq = midiToFreq(targetMidi);

  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [centsOff, setCentsOff] = useState(null);
  const [clarity, setClarity] = useState(0);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const bufferRef = useRef(null);

  useEffect(() => () => stop(), []);

  async function enable() {
    setError(null);
    try {
      const { PitchDetector } = await import('pitchy');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      detector.minVolumeDecibels = -40;
      const buffer = new Float32Array(analyser.fftSize);

      ctxRef.current = ctx;
      analyserRef.current = analyser;
      detectorRef.current = detector;
      bufferRef.current = buffer;
      setEnabled(true);
      loop();
    } catch (e) {
      setError(e?.message || 'Could not access microphone');
    }
  }

  function stop() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      try { ctxRef.current.close(); } catch { /* noop */ }
    }
    setEnabled(false);
    setCentsOff(null);
    setClarity(0);
  }

  function loop() {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const buf = bufferRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !detector || !ctx) return;
    analyser.getFloatTimeDomainData(buf);
    const [pitch, c] = detector.findPitch(buf, ctx.sampleRate);
    setClarity(c);
    if (pitch && c > 0.85) {
      const cents = 1200 * Math.log2(pitch / targetFreq);
      setCentsOff(cents);
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  // Visual: clamp to ±100 cents for the meter.
  const cents = centsOff == null ? null : Math.max(-100, Math.min(100, centsOff));
  const inTune = cents != null && Math.abs(cents) < 10 && clarity > 0.9;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="bg-ink-800 rounded-2xl p-3 relative">
        <Fretboard
          fretWindow={fretWindow}
          notes={[
            { string, fret: fromFret, isRoot: false },
            { string, fret: toFret,   isRoot: false },
          ]}
          highlightIds={[`${string}-${fromFret}`]}
          ghostIds={[`${string}-${toFret}`]}
          ariaLabel={`Bend on string ${string} from fret ${fromFret} to ${toFret}`}
        />
        <div className="text-center text-xs text-ink-300 mt-2">
          Pluck string {string}, fret {fromFret} → bend up to pitch of fret {toFret} ({midiToName(targetMidi)})
        </div>
        <div className="text-center text-[11px] text-ink-400 mt-1">
          {bendType === 'full' ? 'Full step (2 frets)' : 'Half step (1 fret)'}
        </div>
      </div>

      <div className="card-tight">
        <p className="label mb-2">Pitch coach {enabled ? '· listening' : ''}</p>
        {!enabled && (
          <>
            <p className="text-xs text-ink-300 mb-2">
              Optional: turn on the mic to see a tuner that shows when your bend hits the target.
              Works best with an acoustic guitar or amplified electric.
            </p>
            <Button onClick={enable} variant="secondary" className="w-full">
              Enable mic
            </Button>
            {error && <p className="text-xs text-red-300 mt-2">Mic error: {error}</p>}
          </>
        )}
        {enabled && (
          <>
            <PitchMeter cents={cents} inTune={inTune} clarity={clarity} />
            <Button onClick={stop} variant="ghost" className="w-full mt-2">Turn off mic</Button>
          </>
        )}
      </div>
    </div>
  );
}

function PitchMeter({ cents, inTune, clarity }) {
  const pos = cents == null ? 50 : 50 + (cents / 100) * 50;
  return (
    <div>
      <div className="relative h-12 bg-ink-800 rounded-lg overflow-hidden">
        {/* In-tune zone */}
        <div className="absolute inset-y-0 left-[45%] right-[45%] bg-emerald-900/40" />
        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-ink-300/40 -translate-x-1/2" />
        {cents != null && (
          <div
            className={`absolute top-1 bottom-1 w-1 rounded ${inTune ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ left: `${pos}%`, transform: 'translateX(-50%)', transition: 'left 80ms linear' }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-ink-400 mt-1">
        <span>flat</span>
        <span>{cents == null ? '— listening —' : `${cents > 0 ? '+' : ''}${cents.toFixed(0)} cents`}</span>
        <span>sharp</span>
      </div>
      <div className="text-[10px] text-ink-400 mt-1">
        Signal clarity: {(clarity * 100).toFixed(0)}%
      </div>
    </div>
  );
}
