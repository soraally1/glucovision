import Link from 'next/link';
import { ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-white relative font-sans text-slate-800">

      {/* Header / Nav */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            G
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-900">GlucoVision</span>
        </div>
        <Link
          href="/auth"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Masuk
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative w-24 h-24 mb-2">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-50"></div>
            <div className="absolute inset-2 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center">
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Monitor Gula Darah <span className="text-blue-600">Tanpa Jarum</span>
          </h1>

          <p className="text-slate-500 leading-relaxed text-lg">
            Teknologi optik biometrik bertenaga AI untuk analisis kadar glukosa darah non-invasif melalui kamera smartphone.
          </p>
        </div>

        {/* Features / Benefits */}
        <div className="grid gap-4 mb-12">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="mt-1 p-2 bg-white rounded-lg shadow-sm">
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Hasil Cepat</h3>
              <p className="text-sm text-slate-500 leading-snug mt-1">
                Analisis spektral real-time dalam hitungan detik.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="mt-1 p-2 bg-white rounded-lg shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">100% Non-Invasif</h3>
              <p className="text-sm text-slate-500 leading-snug mt-1">
                Tanpa tusukan, tanpa rasa sakit, hanya cahaya.
              </p>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-auto mb-8 p-4 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 leading-relaxed">
          <p className="font-semibold mb-1 flex items-center gap-1">
            ⚠️ Disclaimer Medis
          </p>
          GlucoVision adalah alat pemantauan kesehatan mandiri dan <strong>bukan pengganti alat medis diagnostik</strong>. Hasil estimasi tidak boleh digunakan sebagai dasar tunggal untuk keputusan pengobatan. Konsultasikan dengan dokter untuk diagnosis medis.
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/measure"
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
          >
            <span>Mulai Pengukuran</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="text-center">
            <p className="text-xs text-slate-400">
              v1.0.0 (Beta) • Powered by Web-AI
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
