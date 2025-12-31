import Link from 'next/link';
import { ArrowRight, Activity, ShieldCheck, Zap, Box, Smartphone, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-800 overflow-x-hidden">

      {/* Transparent Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">
            G
          </div>
          <span className="font-bold text-2xl tracking-tight text-white drop-shadow-md">GlucoVision</span>
        </div>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium transition-all hover:scale-105 active:scale-95"
        >
          Masuk
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-16 lg:pt-24 lg:pb-12 overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/90 via-orange-600/90 to-red-700/90" />
          <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-yellow-300/40 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-red-500/40 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

          {/* Text Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 border border-yellow-300/30 backdrop-blur-sm text-white text-xs sm:text-sm font-medium shadow-lg shadow-yellow-500/20 mx-auto lg:mx-0">
              <Activity size={16} className="text-yellow-200" />
              <span>Teknologi Kesehatan Masa Depan</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              Monitor Gula <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-100 to-white">
                Tanpa Jarum
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-100/90 leading-relaxed max-w-xl mx-auto lg:mx-0 px-2 sm:px-0 font-medium">
              Solusi cerdas untuk pemantauan glukosa darah non-invasif menggunakan teknologi kamera smartphone dan AI. Tanpa rasa sakit, hasil instan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start w-full sm:w-auto px-4 sm:px-0">
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-yellow-50 text-orange-600 rounded-xl font-bold shadow-xl shadow-orange-900/30 flex items-center justify-center gap-2 transition transform hover:-translate-y-1 hover:shadow-2xl">
                Mulai Sekarang <ArrowRight size={20} />
              </Link>
              <Link href="/sugar-visualizer" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition hover:border-white/50">
                <Smartphone size={20} /> Coba Visualizer
              </Link>
            </div>

            <div className="pt-4 lg:pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-6 sm:gap-8 text-white/90 text-sm font-medium">
              <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <CheckCircle size={16} className="text-yellow-300" /> AI Powered
              </div>
              <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <CheckCircle size={16} className="text-yellow-300" /> Non-Invasif
              </div>
              <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <CheckCircle size={16} className="text-yellow-300" /> Real-time
              </div>
            </div>
          </div>

          {/* Hero Visual/Image Placeholder */}
          <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              {/* Decorative orbital rings */}
              <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-16 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

              {/* Glass Card Mockup */}
              <div className="absolute inset-12 bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl flex items-center justify-center transform rotate-[-6deg] hover:rotate-0 transition duration-500 hover:scale-105">
                <div className="text-center p-8 w-full">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/40">
                    <Activity size={48} className="text-white" />
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">105 mg/dL</h3>
                  <div className="inline-block px-4 py-1.5 bg-green-500/20 border border-green-400/30 rounded-full">
                    <p className="text-green-300 font-semibold text-sm">Normal Level</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="bg-slate-900 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            &copy; 2025 GlucoVision AI. All rights reserved. <br />
            <span className="opacity-50">Not a medical device. Consult your doctor.</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
