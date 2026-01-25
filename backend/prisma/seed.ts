import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const styles = [
  {
    name: 'Basic Clean',
    description: 'Neutral clean-up with gentle EQ and limiting.',
    isPremium: false,
    targetLufs: -11
  },
  {
    name: 'Pop Balanced',
    description: 'Polished pop balance with bright presence.',
    isPremium: false,
    targetLufs: -11
  },
  {
    name: 'Soft Compression',
    description: 'Warm dynamics control with soft glue.',
    isPremium: false,
    targetLufs: -12
  },
  {
    name: 'EDM Loud',
    description: 'Aggressive loudness for EDM energy.',
    isPremium: true,
    targetLufs: -8.5
  },
  {
    name: 'Techno Club',
    description: 'Club-ready punch with tight low-end.',
    isPremium: true,
    targetLufs: -9
  },
  {
    name: 'Hip-Hop Punch',
    description: 'Hard-hitting low-end with crisp highs.',
    isPremium: true,
    targetLufs: -10
  },
  {
    name: 'Rock Power',
    description: 'Gritty power with midrange focus.',
    isPremium: true,
    targetLufs: -10.5
  },
  {
    name: 'Streaming Optimized',
    description: 'Streaming loudness target and clarity.',
    isPremium: true,
    targetLufs: -14
  }
];

async function main() {
  for (const style of styles) {
    await prisma.style.upsert({
      where: { name: style.name },
      create: style,
      update: style
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
