import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Button } from '../components/Button';
import { WaveformPlayer } from '../components/WaveformPlayer';
import { apiFetch, apiFetchBlob } from '../lib/api';

interface Style {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  targetLufs: number;
}

interface UploadResponse {
  uploadId: string;
  metadata: {
    filename: string;
    duration: number;
    format: string;
    bitrate: number;
  };
}

interface MasterResponse {
  id: string;
  status: string;
  progress: number;
  style: string;
  urls: { original: string; master: string | null; download: string | null };
  metadata: { filename: string; duration: number; format: string; bitrate: number };
}

export default function Mastering() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadInfo, setUploadInfo] = useState<UploadResponse | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [masterId, setMasterId] = useState<string | null>(null);
  const [masterAudioUrl, setMasterAudioUrl] = useState<string | null>(null);
  const [abMode, setAbMode] = useState<'A' | 'B'>('A');
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const masterAudioRef = useRef<HTMLAudioElement | null>(null);

  const { data: styles = [] } = useQuery<Style[]>({
    queryKey: ['styles'],
    queryFn: () => apiFetch('/api/styles')
  });

  const { data: billing } = useQuery<{ isPremium: boolean }>({
    queryKey: ['billing'],
    queryFn: () => apiFetch('/api/billing/status')
  });

  const uploadMutation = useMutation({
    mutationFn: async (selectedFile: File) => {
      const form = new FormData();
      form.append('file', selectedFile);
      return apiFetch<UploadResponse>('/api/uploads', { method: 'POST', body: form });
    },
    onSuccess: (data) => {
      setUploadInfo(data);
    }
  });

  const masterMutation = useMutation({
    mutationFn: async () => {
      if (!uploadInfo || !selectedStyle) {
        throw new Error('Missing data');
      }
      return apiFetch<{ id: string; status: string }>('/api/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: uploadInfo.uploadId, style: selectedStyle.name })
      });
    },
    onSuccess: (data) => {
      setMasterId(data.id);
    }
  });

  const { data: masterStatus } = useQuery<MasterResponse>({
    queryKey: ['master', masterId],
    queryFn: () => apiFetch(`/api/masters/${masterId}`),
    enabled: Boolean(masterId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'done' || status === 'failed' ? false : 2000;
    }
  });

  useEffect(() => {
    if (masterStatus?.status === 'done' && masterStatus.urls.master) {
      apiFetchBlob(masterStatus.urls.master).then((blob) => {
        const url = URL.createObjectURL(blob);
        setMasterAudioUrl(url);
      });
    }
  }, [masterStatus?.status, masterStatus?.urls.master]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;
    setFile(selected);
    uploadMutation.mutate(selected);
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.ogg', '.aac']
    }
  });

  const originalAudioUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (originalAudioUrl) {
        URL.revokeObjectURL(originalAudioUrl);
      }
    };
  }, [originalAudioUrl]);

  const canMaster = Boolean(uploadInfo && selectedStyle && (!selectedStyle.isPremium || billing?.isPremium));

  const handleToggleAB = () => {
    const nextMode = abMode === 'A' ? 'B' : 'A';
    setAbMode(nextMode);
    const active = nextMode === 'A' ? originalAudioRef.current : masterAudioRef.current;
    const inactive = nextMode === 'A' ? masterAudioRef.current : originalAudioRef.current;
    if (active && inactive) {
      active.currentTime = inactive.currentTime;
      inactive.pause();
      active.play();
    }
  };

  const handleDownload = async () => {
    if (!masterStatus?.urls.download) return;
    const blob = await apiFetchBlob(masterStatus.urls.download);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filenameBase = uploadInfo?.metadata.filename.replace(/\.[^/.]+$/, '') ?? 'track';
    const styleName = selectedStyle?.name.replace(/\s+/g, '-') ?? 'MASTER';
    a.download = `${filenameBase}-MASTER-${styleName}.wav`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mastering</h1>
        <p className="text-slate-400 mt-2">Upload, pick a style, and generate a master with AI presets.</p>
      </div>

      <section className="rounded-2xl border border-dashed border-slate-700 p-6 bg-slate-900/50" {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="text-center">
          <p className="text-lg font-semibold">
            {isDragActive ? 'Drop your audio file here' : 'Drag & drop your audio file'}
          </p>
          <p className="text-sm text-slate-400 mt-2">MP3/WAV/FLAC/OGG/AAC • Max 100MB</p>
          <Button className="mt-4" variant="secondary" type="button">
            Choose file
          </Button>
          {file && (
            <div className="mt-4 text-sm text-slate-300">
              {file.name} • {(file.size / (1024 * 1024)).toFixed(1)}MB
            </div>
          )}
        </div>
      </section>

      {uploadInfo && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Original track</h2>
            <WaveformPlayer url={originalAudioUrl} label="Original" />
            <div className="text-sm text-slate-400">
              Duration: {uploadInfo.metadata.duration.toFixed(1)}s • Format: {uploadInfo.metadata.format}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Choose a mastering style</h2>
            <div className="grid gap-3 mt-4">
              {styles.map((style) => {
                const locked = style.isPremium && !billing?.isPremium;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => !locked && setSelectedStyle(style)}
                    className={`text-left rounded-xl border p-4 transition ${
                      selectedStyle?.id === style.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-slate-800 bg-slate-900/60'
                    } ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:border-slate-600'}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{style.name}</h3>
                      {style.isPremium && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">Premium</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{style.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Mastering status</h2>
            <p className="text-sm text-slate-400">
              {masterStatus ? `${masterStatus.status} • ${masterStatus.progress}%` : 'Ready to master'}
            </p>
          </div>
          <Button onClick={() => masterMutation.mutate()} disabled={!canMaster || masterMutation.isPending}>
            {masterMutation.isPending ? 'Mastering...' : 'Masteriser'}
          </Button>
        </div>
        {masterStatus && (
          <div className="mt-4 h-2 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500 transition"
              style={{ width: `${masterStatus.progress}%` }}
            />
          </div>
        )}
        {masterStatus?.status === 'failed' && (
          <p className="text-sm text-red-400 mt-4">{masterStatus.errorMessage}</p>
        )}
      </section>

      {masterStatus?.status === 'done' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mastered track</h2>
            <WaveformPlayer url={masterAudioUrl} label="Mastered" />
            <Button onClick={handleDownload}>Télécharger</Button>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-xl font-semibold">A/B Compare</h2>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={handleToggleAB}>
                Toggle A/B (Currently {abMode})
              </Button>
              <span className="text-sm text-slate-400">Instant sync between original and master.</span>
            </div>
            <div className="grid gap-4">
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-sm text-slate-400 mb-2">Original</p>
                <audio ref={originalAudioRef} src={originalAudioUrl ?? ''} controls className="w-full" />
              </div>
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-sm text-slate-400 mb-2">Master</p>
                <audio ref={masterAudioRef} src={masterAudioUrl ?? ''} controls className="w-full" />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
