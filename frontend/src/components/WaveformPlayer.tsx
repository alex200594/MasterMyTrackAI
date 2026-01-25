import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from './Button';

interface WaveformPlayerProps {
  url: string | null;
  label: string;
}

export function WaveformPlayer({ url, label }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!url || !containerRef.current) {
      return;
    }
    if (waveRef.current) {
      waveRef.current.destroy();
    }
    const wave = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#334155',
      progressColor: '#1B6EFF',
      height: 64,
      barWidth: 2,
      barRadius: 2,
      responsive: true
    });
    wave.load(url);
    wave.on('ready', () => {
      setDuration(wave.getDuration());
    });
    wave.on('audioprocess', () => {
      setCurrentTime(wave.getCurrentTime());
    });
    wave.on('finish', () => {
      setIsPlaying(false);
    });
    waveRef.current = wave;
    return () => {
      wave.destroy();
    };
  }, [url]);

  const toggle = () => {
    if (!waveRef.current) return;
    waveRef.current.playPause();
    setIsPlaying(waveRef.current.isPlaying());
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-xs text-slate-500">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>
        <Button variant="secondary" onClick={toggle} disabled={!url}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
