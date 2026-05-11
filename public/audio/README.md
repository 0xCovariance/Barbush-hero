# Backing tracks

By default Barbush Hero generates backing tracks procedurally with the Web Audio API
(see `src/audio/backingTrack.js`). They sound synth-y but work fully offline and ship
zero MB.

## Drop in real CC-licensed MP3s

If you'd rather use real recorded backing tracks, drop MP3s here with these filenames:

- `Am-slow.mp3`   — A minor 12-bar blues, ~70 BPM
- `Am-medium.mp3` — A minor 12-bar blues, ~88 BPM
- `Em-slow.mp3`   — E minor 12-bar blues, ~70 BPM
- `Em-medium.mp3` — E minor 12-bar blues, ~88 BPM

The `BackingTrackJam` exercise will prefer a same-name MP3 over the procedural
generator if it loads successfully.

## Where to find Creative Commons backing tracks

- https://bluesblast.com/ — many CC-BY tracks, attribution required
- https://nickneblo.com/backing-tracks-in-a-minor/ — CC-BY backing loops
- https://freemusicarchive.org/ — search for "blues backing"

Add credits to the **Settings → Credits** screen when you swap in new tracks.
