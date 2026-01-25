import { runCommand, probeFile, measureLoudness } from '../../utils/ffmpeg.js';
import { styleConfigs, StyleName } from './styles.js';

interface MasterResult {
  outputPath: string;
  mp3Path?: string;
  metadata: {
    duration: number;
    sampleRate: number;
    channels: number;
    bitrate: number;
    format: string;
  };
  loudness: number | null;
}

export async function masterTrack(
  style: StyleName,
  inputPath: string,
  outputPath: string,
  mp3Path?: string
): Promise<MasterResult> {
  const styleConfig = styleConfigs[style];
  if (!styleConfig) {
    throw new Error('Unknown style');
  }

  const probe = await probeFile(inputPath);
  const format = probe.format ?? {};
  const stream = probe.streams?.[0] ?? {};

  const duration = Number(format.duration ?? 0);
  const sampleRate = Number(stream.sample_rate ?? 0);
  const channels = Number(stream.channels ?? 2);
  const bitrate = Number(format.bit_rate ?? 0);
  const formatName = String(format.format_name ?? 'unknown');

  const loudness = await measureLoudness(inputPath);

  const loudnorm = `loudnorm=I=${styleConfig.targetLufs}:TP=-1.0:LRA=11`; 
  const filterChain = `${styleConfig.filters},${loudnorm}`;

  await runCommand('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-af',
    filterChain,
    '-c:a',
    'pcm_s16le',
    outputPath
  ]);

  if (mp3Path) {
    await runCommand('ffmpeg', [
      '-y',
      '-i',
      outputPath,
      '-codec:a',
      'libmp3lame',
      '-b:a',
      '320k',
      mp3Path
    ]);
  }

  return {
    outputPath,
    mp3Path,
    metadata: {
      duration,
      sampleRate,
      channels,
      bitrate,
      format: formatName
    },
    loudness: loudness ? Number(loudness.input_i ?? 0) : null
  };
}
