import Link from 'next/link';
import { ArrowRight, Activity, ShieldCheck, Zap, Box, Smartphone, CheckCircle, Heart, Building2, GraduationCap, Frown, DollarSign, Droplet, Sparkles, Shield } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { LogoLoop } from '@/components/ui/LogoLoop';
import { CommunityBento } from '@/components/landing/CommunityBento';
import TopNav from '@/components/layout/TopNav';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-800 overflow-x-hidden">

      {/* Transparent Navbar */}
      <TopNav showAuth={true} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-16 lg:pt-24 lg:pb-12 bg-[#D73535]">

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

          {/* Text Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD41D]/20 border border-[#FFD41D]/30 backdrop-blur-sm text-white text-xs sm:text-sm font-medium shadow-lg shadow-[#FFD41D]/20 mx-auto lg:mx-0">
              <Activity size={16} className="text-[#FFD41D]" />
              <span>Teknologi Kesehatan Masa Depan</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              Monitor Gula <br className="hidden lg:block" />
              <span className="text-[#FFD41D]">
                Tanpa Jarum
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-100/90 leading-relaxed max-w-xl mx-auto lg:mx-0 px-2 sm:px-0 font-medium">
              Solusi cerdas untuk pemantauan glukosa darah non-invasif menggunakan teknologi kamera smartphone dan AI. Tanpa rasa sakit, hasil instan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start w-full sm:w-auto px-4 sm:px-0">
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-yellow-50 text-[#D73535] rounded-xl font-bold shadow-xl shadow-[#D73535]/20 flex items-center justify-center gap-2 transition transform hover:-translate-y-1 hover:shadow-2xl">
                Mulai Sekarang <ArrowRight size={20} />
              </Link>
              <Link href="/sugar-visualizer" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition hover:border-white/50">
                <Smartphone size={20} /> Coba Visualizer
              </Link>
            </div>

            <div className="pt-4 lg:pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-6 sm:gap-8 text-white/90 text-sm font-medium">
              <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <CheckCircle size={16} className="text-[#FFD41D]" /> AI Powered
              </div>
              <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <CheckCircle size={16} className="text-[#FFD41D]" /> Non-Invasif
              </div>
              <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <CheckCircle size={16} className="text-[#FFD41D]" /> Real-time
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
              <div className="absolute inset-12 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl flex items-center justify-center transform rotate-[-6deg] hover:rotate-0 transition duration-500 hover:scale-105">
                <div className="text-center p-8 w-full">
                  <div className="w-24 h-24 bg-[#D73535] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#FF4646]/40">
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

      {/* 1. Introduction Section */}
      <section className="py-20 px-6 bg-white">
        <ScrollReveal width="100%">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-[#D73535] tracking-tight">
              Mengapa <span className="text-[#FFA240]">GlucoVision?</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Kami percaya bahwa pemantauan kesehatan haruslah mudah, nyaman, dan dapat diakses oleh siapa saja.
              Dengan menggabungkan kecerdasan buatan dan teknologi kamera modern, kami menghadirkan revolusi
              dalam manajemen diabetes.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* 2. Problem Statement (Scroll Reveal) */}
      <section className="py-24 px-6 bg-[#FFD41D]/5">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal width="100%">
            <div className="text-center mb-16">
              <span className="text-[#FFA240] font-semibold tracking-wide uppercase text-sm">Masalah Umum</span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#D73535] mt-2 mb-4">
                Lelah dengan <span className="text-[#FF4646]">Jarum Suntik?</span>
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Metode konvensional seringkali menyakitkan, mahal, dan tidak praktis untuk penggunaan sehari-hari.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg group hover:-translate-y-2 transition-transform duration-500 cursor-default">
              <img
                src="/sakit.webp"
                alt="Rasa Sakit"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 text-left">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-white border border-white/30">
                  <Frown size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Rasa Sakit</h3>
                <p className="text-white/80 leading-relaxed font-medium text-sm">Tusukan jari berkali-kali setiap hari menyebabkan trauma dan ketidaknyamanan fisik.</p>
              </div>
            </div>

            <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg group hover:-translate-y-2 transition-transform duration-500 cursor-default">
              <img
                src="/Biaya.webp"
                alt="Biaya Mahal"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 text-left">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-white border border-white/30">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Biaya Mahal</h3>
                <p className="text-white/80 leading-relaxed font-medium text-sm">Pembelian strip tes dan lancet secara rutin menguras biaya bulanan yang signifikan.</p>
              </div>
            </div>

            <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg group hover:-translate-y-2 transition-transform duration-500 cursor-default">
              <img
                src="/Infeksi.webp"
                alt="Resiko Infeksi"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 text-left">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-white border border-white/30">
                  <Droplet size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Resiko Infeksi</h3>
                <p className="text-white/80 leading-relaxed font-medium text-sm">Luka terbuka sekecil apapun memiliki resiko infeksi jika tidak ditangani dengan higienis.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features & Circular Gallery */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-bold text-[#D73535] mb-6">
                Teknologi Canggih untuk <br />
                <span className="text-[#FFA240]">
                  Kesehatan Anda
                </span>
              </h2>

              <div className="space-y-8 mt-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#FFD41D]/20 rounded-xl flex items-center justify-center flex-shrink-0 text-[#D73535]">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#D73535]">Akurasi Tinggi</h3>
                    <p className="text-slate-600 mt-1">Algoritma AI kami dilatih dengan jutaan data klinis untuk memastikan hasil yang presisi.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#FFA240]/20 rounded-xl flex items-center justify-center flex-shrink-0 text-[#D73535]">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#D73535]">Hasil Instan</h3>
                    <p className="text-slate-600 mt-1">Dapatkan hasil analisa dalam hitungan detik, langsung di layar smartphone Anda.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#FF4646]/20 rounded-xl flex items-center justify-center flex-shrink-0 text-[#D73535]">
                    <Box size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#D73535]">Arsip Digital</h3>
                    <p className="text-slate-600 mt-1">Simpan semua riwayat kesehatan Anda dengan aman dan akses kapan saja.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/dashboard" className="px-8 py-3 bg-[#D73535] text-white rounded-full font-semibold hover:bg-[#FF4646] transition shadow-lg shadow-[#D73535]/30 inline-flex items-center gap-2">
                  <Sparkles size={18} /> Coba Gratis Sekarang
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <div className="order-1 lg:order-2 flex justify-center py-10 lg:py-0">
            <ScrollReveal delay={200}>
              <div className="relative flex items-center justify-center py-10">
                <CommunityBento />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3.1 Meet Luco Section */}
      {/* 3.1 Meet Luco Section - Simplified Layout */}
      <section className="py-24 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
            {/* Video / Character */}
            <div className="flex justify-center items-center order-2 md:order-1">
              <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center shadow-2xl shadow-red-100/30">
                <video
                  src="/Lucoldle.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-[85%] h-[85%] object-contain"
                />
              </div>
            </div>

            {/* Text Features */}
            <div className="space-y-8 order-1 md:order-2">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full border border-red-100 text-xs font-bold uppercase tracking-wider text-[#D73535]">
                  <Sparkles size={14} /> Meet Luco
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
                  Asisten Kesehatan <br />
                  <span className="text-[#D73535]">Pribadi Anda</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Luco adalah AI canggih yang siap menemani perjalanan kesehatan Anda. Bukan sekedar bot, Luco mengerti kondisi Anda secara personal.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-red-100 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-[#D73535] shadow-sm">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-slate-800">Konsultasi Pintar</h3>
                    <p className="text-sm text-slate-500 leading-snug">
                      Tanya jawab seputar diabetes, nutrisi, dan gaya hidup sehat kapan saja.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-orange-100 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-[#FFA240] shadow-sm">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-slate-800">Sugar Visualizer</h3>
                    <p className="text-sm text-slate-500 leading-snug">
                      Visualisasi AR dampak konsumsi gula pada tubuh secara nyata.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/consult" className="inline-flex items-center gap-2 px-8 py-4 bg-[#D73535] text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:shadow-xl hover:bg-[#B02B2B] transition transform hover:-translate-y-0.5">
                  Ayo Ngobrol dengan Luco <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-[#FFD41D]/5 border-y border-[#FFD41D]/10">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
          <p className="text-sm font-semibold text-[#D73535] uppercase tracking-widest">Dipercaya Oleh Institusi Kesehatan</p>
        </div>

        <LogoLoop
          speed="slow"
          direction="right"
          items={[
            // Batch 1
            <div key="kemenkes-1" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/kemenkes.svg" alt="Kemenkes" className="h-12 w-auto object-contain" />
            </div>,
            <div key="bpjs-1" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/bpjs.svg" alt="BPJS Kesehatan" className="h-12 w-auto object-contain" />
            </div>,
            <div key="cisdi-1" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/cisdi.svg" alt="CISDI" className="h-12 w-auto object-contain" />
            </div>,
            <div key="idi-1" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/IDI.svg" alt="IkatanDokterIndonesia" className="h-12 w-auto object-contain" />
            </div>,

            // Batch 2
            <div key="kemenkes-2" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/kemenkes.svg" alt="Kemenkes" className="h-12 w-auto object-contain" />
            </div>,
            <div key="bpjs-2" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/bpjs.svg" alt="BPJS Kesehatan" className="h-12 w-auto object-contain" />
            </div>,
            <div key="cisdi-2" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/cisdi.svg" alt="CISDI" className="h-12 w-auto object-contain" />
            </div>,
            <div key="idi-2" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/IDI.svg" alt="IkatanDokterIndonesia" className="h-12 w-auto object-contain" />
            </div>,

            // Batch 3
            <div key="kemenkes-3" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/kemenkes.svg" alt="Kemenkes" className="h-12 w-auto object-contain" />
            </div>,
            <div key="bpjs-3" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/bpjs.svg" alt="BPJS Kesehatan" className="h-12 w-auto object-contain" />
            </div>,
            <div key="cisdi-3" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/cisdi.svg" alt="CISDI" className="h-12 w-auto object-contain" />
            </div>,
            <div key="idi-3" className="flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300">
              <img src="/IDI.svg" alt="IkatanDokterIndonesia" className="h-12 w-auto object-contain" />
            </div>,
          ]}
        />
      </section>

      {/* Footer Info */}
      <footer className="bg-[#D73535] py-16 border-t border-white/10 text-white/90">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <span className="font-bold text-2xl tracking-tight">GlucoVision</span>
            </div>
            <p className="text-sm leading-relaxed text-white/80">
              Pionir teknologi pemantauan kesehatan non-invasif berbasis AI. Kami berkomitmen untuk meningkatkan kualitas hidup penderita diabetes.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-bold mb-4">Produk</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-[#FFD41D] transition-colors">Dashboard</Link></li>
              <li><Link href="/sugar-visualizer" className="hover:text-[#FFD41D] transition-colors">Visualizer</Link></li>
              <li><Link href="/consult" className="hover:text-[#FFD41D] transition-colors">Konsultasi AI</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Building2 size={16} className="mt-0.5 text-white/70" />
                <span>Jl. Teknologi Raya No. 12<br />Jakarta Selatan, 12190</span>
              </li>
              <li className="flex items-center gap-3">
                <Activity size={16} className="text-white/70" />
                <span>help@glucovision.ai</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>&copy; 2025 GlucoVision AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
