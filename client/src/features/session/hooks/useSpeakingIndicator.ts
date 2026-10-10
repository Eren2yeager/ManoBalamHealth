import { useState, useEffect } from "react";

const SPEAKING_THRESHOLD = 18; // average byte-frequency energy
const POLL_MS = 200;

/**
 * Lightweight voice-activity detection for the Meet-style "talking" ring.
 * Samples an AnalyserNode a few times a second — negligible CPU cost.
 */
export function useSpeakingIndicator(stream: MediaStream | null): boolean {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // No stream/track: stay false — the previous effect's cleanup already
    // reset the state.
    const audioTrack = stream?.getAudioTracks()[0];
    if (!stream || !audioTrack) return;

    let ctx: AudioContext;
    try {
      ctx = new AudioContext();
    } catch {
      return;
    }
    const source = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    // May start suspended until a user gesture; the Join click covers this,
    // but resume defensively.
    void ctx.resume().catch(() => {});

    const interval = setInterval(() => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;
      setIsSpeaking(audioTrack.enabled && avg > SPEAKING_THRESHOLD);
    }, POLL_MS);

    return () => {
      clearInterval(interval);
      source.disconnect();
      void ctx.close().catch(() => {});
      setIsSpeaking(false);
    };
  }, [stream]);

  return isSpeaking;
}
