import { spawn } from 'child_process';

export function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout || stderr);
      } else {
        reject(new Error(stderr || stdout || `Command failed: ${command}`));
      }
    });
  });
}

export async function probeFile(path: string) {
  const output = await runCommand('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration,bit_rate,format_name',
    '-show_entries',
    'stream=sample_rate,channels',
    '-of',
    'json',
    path
  ]);
  return JSON.parse(output);
}

export async function measureLoudness(path: string) {
  const output = await runCommand('ffmpeg', [
    '-i',
    path,
    '-af',
    'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json',
    '-f',
    'null',
    '-'
  ]);
  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }
  return JSON.parse(jsonMatch[0]);
}
