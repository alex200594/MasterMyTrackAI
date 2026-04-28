import { useMemo, useState } from 'react';

type Project = {
  id: number;
  title: string;
  category: 'Illustration' | 'Animation 2D' | 'Animation 3D' | 'Modélisation 3D' | 'Affiches' | 'Logos';
  month: string;
  year: number;
  description: string;
  tools: string[];
};

const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Robin Limbus',
    category: 'Illustration',
    month: 'Avril',
    year: 2023,
    description: 'Character design décliné en émotions et en poses pour impression 3D et animation.',
    tools: ['Procreate', 'Photoshop', 'Design de personnage']
  },
  {
    id: 2,
    title: 'Autoportraits stylisés',
    category: 'Illustration',
    month: 'Septembre',
    year: 2023,
    description: 'Recherche de style graphique personnel à travers plusieurs expressions.',
    tools: ['Croquis', 'Encrage', 'Colorisation']
  },
  {
    id: 3,
    title: 'Série d’affiches illustrées',
    category: 'Affiches',
    month: 'Avril',
    year: 2025,
    description: 'Trois affiches narratives avec direction artistique colorée et contrastée.',
    tools: ['Illustration', 'Composition', 'Typographie']
  },
  {
    id: 4,
    title: 'Apple Pie',
    category: 'Animation 2D',
    month: 'Avril',
    year: 2026,
    description: 'Mini animation cartoon avec personnage original et rythme dynamique.',
    tools: ['Storyboard', 'Frame by frame', 'After Effects']
  },
  {
    id: 5,
    title: 'Vinyle Youv Dee',
    category: 'Animation 3D',
    month: 'Décembre',
    year: 2024,
    description: 'Motion design 3D noir et blanc avec ambiance urbaine et textures organiques.',
    tools: ['Blender', 'Compositing', 'Direction photo']
  },
  {
    id: 6,
    title: 'Clip Rap - Fleur',
    category: 'Animation 3D',
    month: 'Juillet',
    year: 2024,
    description: 'Plan 3D poétique avec éclairage cinématographique et animation subtile.',
    tools: ['Blender', 'Lighting', 'Rendering']
  },
  {
    id: 7,
    title: 'Objets publicitaires',
    category: 'Modélisation 3D',
    month: 'Mars',
    year: 2024,
    description: 'Modélisation d’objets réalistes (boisson, verre, accessoires) pour affichage print.',
    tools: ['Modeling', 'Texturing', 'Lookdev']
  },
  {
    id: 8,
    title: 'Publicités fictives',
    category: 'Affiches',
    month: 'Décembre',
    year: 2025,
    description: 'Campagne visuelle fictive pour magazine d’art.',
    tools: ['Mise en page', 'DA', 'Retouche photo']
  },
  {
    id: 9,
    title: 'Systèmes de logos',
    category: 'Logos',
    month: 'Juin',
    year: 2025,
    description: 'Identités visuelles minimalistes et modulables pour différents univers de marque.',
    tools: ['Vectoriel', 'Branding', 'Identité visuelle']
  }
];

const CATEGORIES = ['Tous', 'Illustration', 'Animation 2D', 'Animation 3D', 'Modélisation 3D', 'Affiches', 'Logos'] as const;

const gradients: Record<Project['category'], string> = {
  Illustration: 'from-sky-100 via-blue-100 to-indigo-200',
  'Animation 2D': 'from-amber-100 via-yellow-100 to-orange-200',
  'Animation 3D': 'from-zinc-900 via-slate-800 to-zinc-700',
  'Modélisation 3D': 'from-rose-100 via-orange-100 to-amber-100',
  Affiches: 'from-fuchsia-100 via-violet-100 to-indigo-100',
  Logos: 'from-zinc-100 via-slate-100 to-stone-200'
};

export default function Landing() {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('Tous');
  const [selected, setSelected] = useState<Project | null>(null);

  const filteredProjects = useMemo(
    () =>
      activeCategory === 'Tous' ? PROJECTS : PROJECTS.filter((project) => project.category === activeCategory),
    [activeCategory]
  );

  return (
    <div className="bg-[#ececec] text-black">
      <section id="top" className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="text-sm tracking-[0.24em] uppercase">Portfolio 2026</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] mt-4">Martin Delbecq</h1>
            <p className="text-xl sm:text-2xl font-semibold mt-5">Graphic Designer — Illustration, animation et 3D</p>
            <p className="max-w-2xl text-lg mt-6 text-zinc-700">
              Portfolio interactif, minimal et propre inspiré de ta mise en page : navigation rapide, filtres par discipline
              et fiches projet détaillées.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projets" className="rounded-full bg-black text-white px-5 py-2.5 text-sm font-semibold hover:opacity-85 transition">
                Voir les projets
              </a>
              <a
                href="mailto:martindelbecq41@gmail.com"
                className="rounded-full border border-black px-5 py-2.5 text-sm font-semibold hover:bg-black hover:text-white transition"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <div className="w-64 h-80 rounded-2xl bg-gradient-to-b from-zinc-700 via-zinc-500 to-zinc-300 p-[2px] shadow-xl">
              <div className="h-full w-full rounded-2xl bg-zinc-200 flex items-center justify-center">
                <span className="text-sm uppercase tracking-[0.2em] text-zinc-600">Photo portrait</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="apropos" className="max-w-7xl mx-auto px-6 py-12 border-y border-black/10">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 className="lg:col-span-4 text-3xl font-black">À propos</h2>
          <p className="lg:col-span-8 text-2xl leading-tight font-bold max-w-4xl">
            Designer passionné par toutes les formes d’art créatif, du croquis à la modélisation 3D. Je développe des
            univers visuels clairs, expressifs et cohérents, avec une attention forte au détail.
          </p>
        </div>
      </section>

      <section id="projets" className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="uppercase text-sm tracking-[0.2em] text-zinc-600">Sélection</p>
            <h2 className="text-4xl font-black mt-2">Projets</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-black text-white' : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelected(project)}
              className="text-left rounded-2xl overflow-hidden bg-white/70 border border-black/10 hover:-translate-y-1 hover:shadow-lg transition"
            >
              <div className={`h-48 bg-gradient-to-br ${gradients[project.category]} p-5 flex items-end`}>
                <span className="text-xs uppercase tracking-[0.2em] bg-black text-white px-3 py-1 rounded-full">{project.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-black text-2xl leading-tight">{project.title}</h3>
                <p className="text-zinc-600 mt-1">
                  {project.month} {project.year}
                </p>
                <p className="mt-3 text-zinc-700">{project.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="contact" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-black text-white p-8 md:p-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="uppercase text-xs tracking-[0.2em] text-zinc-400">Disponible pour projets</p>
            <h3 className="text-3xl sm:text-4xl font-black mt-2">Travaillons ensemble</h3>
            <p className="text-zinc-300 mt-3">Branding, illustration, animation 2D/3D, visuels de campagne.</p>
          </div>
          <a href="mailto:martindelbecq41@gmail.com" className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-bold w-fit">
            martindelbecq41@gmail.com
          </a>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/55 p-4 sm:p-8 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl bg-[#f4f4f4] rounded-2xl border border-black/20 p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-600">{selected.category}</p>
                <h4 className="text-3xl font-black mt-2">{selected.title}</h4>
              </div>
              <button className="text-sm font-semibold px-3 py-1 rounded-full bg-black text-white" onClick={() => setSelected(null)}>
                Fermer
              </button>
            </div>
            <p className="mt-5 text-zinc-700">{selected.description}</p>
            <p className="mt-3 text-zinc-600">
              {selected.month} {selected.year}
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {selected.tools.map((tool) => (
                <span key={tool} className="px-3 py-1 rounded-full bg-black/5 text-sm">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
