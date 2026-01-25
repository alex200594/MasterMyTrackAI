import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export default function Landing() {
  return (
    <div>
      <section className="px-6 py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">AI Mastering Suite</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">Master your music instantly with AI.</h1>
            <p className="text-slate-300 mt-4 text-lg">
              Upload your track, pick a mastering style inspired by BandLab, and download a loud, balanced master in minutes.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/register">
                <Button>Start for Free</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="secondary">View Pricing</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>MasterMyTrack AI</span>
              <span>Live preview</span>
            </div>
            <div className="mt-6 space-y-4">
              {["Upload", "Choose style", "Download"].map((step, idx) => (
                <div key={step} className="flex items-center gap-4 rounded-xl bg-slate-950/80 p-4">
                  <div className="h-10 w-10 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center font-semibold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{step}</p>
                    <p className="text-sm text-slate-400">
                      {step === 'Upload'
                        ? 'Drag & drop WAV/MP3/FLAC up to 100MB.'
                        : step === 'Choose style'
                        ? 'Pick free or premium mastering vibes.'
                        : 'Save a mastered file instantly.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold">Why creators love MasterMyTrack</h2>
        <div className="grid gap-6 mt-8 md:grid-cols-3">
          {[
            { title: 'BandLab-like UX', text: 'Modern workflow inspired by the fastest mastering platforms.' },
            { title: 'Loudness targets', text: 'LUFS and true peak targets tailored per style.' },
            { title: 'Premium-ready', text: 'Stripe subscription unlocks top-tier presets.' }
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400 mt-3">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
