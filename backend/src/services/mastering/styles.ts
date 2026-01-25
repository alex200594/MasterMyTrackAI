export type StyleName =
  | 'Basic Clean'
  | 'Pop Balanced'
  | 'Soft Compression'
  | 'EDM Loud'
  | 'Techno Club'
  | 'Hip-Hop Punch'
  | 'Rock Power'
  | 'Streaming Optimized';

export const styleConfigs: Record<StyleName, { filters: string; targetLufs: number }> = {
  'Basic Clean': {
    filters: 'highpass=f=30,lowpass=f=18000,acompressor=threshold=-20dB:ratio=2:attack=20:release=250',
    targetLufs: -11
  },
  'Pop Balanced': {
    filters: 'highpass=f=40,lowpass=f=19000,eq=f=1200:t=q:w=1.2:g=2,acompressor=threshold=-18dB:ratio=2.4:attack=15:release=200',
    targetLufs: -11
  },
  'Soft Compression': {
    filters: 'highpass=f=35,eq=f=100:t=q:w=1.1:g=1,acompressor=threshold=-22dB:ratio=1.8:attack=30:release=300',
    targetLufs: -12
  },
  'EDM Loud': {
    filters: 'highpass=f=30,eq=f=80:t=q:w=1:g=2,eq=f=4000:t=q:w=1.1:g=2,acompressor=threshold=-16dB:ratio=3.5:attack=10:release=120,alimiter=limit=-1.0',
    targetLufs: -8.5
  },
  'Techno Club': {
    filters: 'highpass=f=30,eq=f=90:t=q:w=1:g=2,eq=f=3000:t=q:w=1.2:g=1.5,acompressor=threshold=-17dB:ratio=3:attack=12:release=140,alimiter=limit=-1.0',
    targetLufs: -9
  },
  'Hip-Hop Punch': {
    filters: 'highpass=f=28,eq=f=60:t=q:w=1:g=2.5,eq=f=5000:t=q:w=1.1:g=1.5,acompressor=threshold=-18dB:ratio=3:attack=8:release=150,alimiter=limit=-1.0',
    targetLufs: -10
  },
  'Rock Power': {
    filters: 'highpass=f=35,eq=f=1000:t=q:w=1.2:g=2.5,eq=f=7000:t=q:w=1.1:g=1.8,acompressor=threshold=-18dB:ratio=2.8:attack=12:release=180,alimiter=limit=-1.0',
    targetLufs: -10.5
  },
  'Streaming Optimized': {
    filters: 'highpass=f=35,eq=f=2000:t=q:w=1.1:g=1.5,acompressor=threshold=-20dB:ratio=2.2:attack=20:release=220',
    targetLufs: -14
  }
};
