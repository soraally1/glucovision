# GlucoVision 🩸👁️

> **Revolusi Manajemen Diabetes dengan Kecerdasan Buatan (AI) & Teknologi Non-Invasif**

**GlucoVision** adalah platform pemantauan kesehatan masa depan yang dirancang khusus untuk meningkatkan kualitas hidup penderita diabetes. Dengan menggabungkan kekuatan **Artificial Intelligence (AI)** dan **Computer Vision**, kami menghadirkan solusi pemantauan gula darah yang **tanpa rasa sakit (bebas jarum)**, **hemat biaya**, dan **mudah diakses** oleh siapa saja, hanya dengan menggunakan smartphone.

---

## 📖 Latar Belakang

Metode pemantauan gula darah konvensional seringkali menjadi beban bagi penderita diabetes:
- ❌ **Menyakitkan**: Mengharuskan tusukan jari (finger-prick) berkali-kali setiap hari.
- ❌ **Mahal**: Biaya rutin untuk membeli strip tes dan lancet sangat membebani.
- ❌ **Tidak Praktis**: Membutuhkan alat khusus yang harus dibawa kemana-mana.
- ❌ **Resiko Infeksi**: Luka terbuka sekecil apapun berisiko bagi penderita diabetes.

**GlucoVision hadir sebagai solusi.** Kami percaya bahwa kesehatan tidak seharusnya menyakitkan.

---

## 🌟 Fitur Unggulan

### 1. **Pengukuran Non-Invasif (Tanpa Jarum)** 🚫💉
Teknologi inti dari GlucoVision. Menggunakan kamera smartphone atau webcam untuk menganalisis aliran darah di wajah atau jari.
- **Cara Kerja**: Menggunakan teknik Photoplethysmography (PPG) berbasis visi komputer (Computer Vision) untuk mendeteksi perubahan mikroskopis pada warna kulit yang berkorelasi dengan detak jantung dan estimasi tren gula darah.
- **Keunggulan**: Sepenuhnya tanpa rasa sakit, non-kontak, dan dapat dilakukan kapan saja.

### 2. **Luco: Asisten Kesehatan AI Pribadi** 🤖
Luco bukan sekadar chatbot biasa. Luco adalah teman perjalanan kesehatan Anda yang cerdas dan empatik.
- **Konsultasi Pintar**: Anda bisa bertanya tentang apa saja—mulai dari gejala yang dirasakan, rekomendasi makanan, hingga tips olahraga.
- **Analisis Personal**: Luco memberikan saran yang disesuaikan dengan data kesehatan dan riwayat aktivitas Anda.
- ** Persona Interaktif**: Tampil dalam bentuk karakter visual yang hidup dan ramah, membuat interaksi terasa lebih manusiawi dan tidak kaku.

### 3. **Sugar Visualizer (Mode AR)** 🍬👓
Fitur edukasi imersif berbasis **Augmented Reality (AR)** untuk meningkatkan kesadaran akan dampak gula.
- **Visualisasi Nyata**: Melihat secara langsung bagaimana konsumsi gula berlebih mempengaruhi organ tubuh (seperti pankreas dan ginjal) dalam bentuk model 3D interaktif.
- **Edukasi Dampak**: Memberikan pemahaman visual yang kuat mengenai "Gula Darah Tinggi" (Hiperglikemia) vs normal, membantu pengguna membuat keputusan gaya hidup yang lebih bijak.

### 4. **Dashboard Kesehatan Komprehensif** 📊
Pusat kendali untuk semua data kesehatan Anda.
- **Pemantauan Real-time**: Grafik detak jantung dan estimasi tren kesehatan yang diperbarui secara langsung.
- **Manajemen Lab**: Fitur untuk mengunggah dan menyimpan hasil tes lab medis (PDF/Gambar) agar tidak tercecer.
- **Riwayat Lengkap**: Arsip digital yang aman untuk melihat perkembangan kesehatan Anda dari waktu ke waktu.

### 5. **Komunitas Pendukung** 🤝
Terhubung dengan pengguna lain.
- **Berbagi Cerita**: Mendapatkan motivasi dari sesama pejuang diabetes.
- **Bento Grid Layout**: Tampilan antarmuka galeri komunitas yang modern dan menarik.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun dengan _stack_ teknologi modern untuk menjamin performa tinggi, keamanan, dan pengalaman pengguna yang mulus:

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework Frontend** | [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/) | Menggunakan App Router terbaru untuk performa dan routing yang optimal. |
| **Bahasa Pemrograman** | [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/) | Menjamin keamanan tipe data (Type Safety) dan mengurangi bug. |
| **Styling & UI** | [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC)](https://tailwindcss.com/) | Styling berbasis utilitas untuk desain yang responsif dan cepat. |
| **Backend & Database** | [![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28)](https://firebase.google.com/) | Firestore (Database NoSQL), Authentication (Login), dan Storage. |
| **AI & Computer Vision** | [![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-Models-orange)](https://www.tensorflow.org/js) | Menjalankan model ML langsung di browser pengguna. |
| **Deteksi Wajah** | [MediaPipe Face Mesh](https://developers.google.com/mediapipe/solutions/vision/face_mesh) | Deteksi titik wajah presisi tinggi untuk ekstraksi sinyal PPG. |
| **Animasi** | Framer Motion & ScrollReveal | Memberikan interaksi UI yang halus dan menarik. |
| **Ikon** | Lucide React | Koleksi ikon standar industri yang bersih. |

---

## 🚀 Panduan Instalasi & Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal Anda:

### Prasyarat
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru).
- `npm` atau `yarn`.
- Akun Google untuk membuat proyek Firebase.

### Langkah-Langkah

1.  **Clone / Unduh Repository:**
    ```bash
    git clone https://github.com/username-anda/glucovision.git
    cd glucovision
    ```

2.  **Instal Dependensi:**
    ```bash
    npm install
    # atau jika menggunakan yarn
    yarn install
    ```

3.  **Konfigurasi Environment (PENTING!):**
    Buat file bernama `.env.local` di folder paling luar (root directory). Salin konfigurasi dari proyek Firebase Anda ke dalamnya:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=api_key_anda
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project_id_anda.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=project_id_anda
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project_id_anda.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender_id_anda
    NEXT_PUBLIC_FIREBASE_APP_ID=app_id_anda
    ```

    > *Catatan: Anda perlu membuat proyek baru di [Firebase Console](https://console.firebase.google.com/), aktifkan Firestore, Authentication, dan Storage untuk mendapatkan kredensial ini.*

4.  **Jalankan Server Development:**
    ```bash
    npm run dev
    ```

5.  **Buka Aplikasi:**
    Buka browser (Chrome/Edge/Firefox) dan kunjungi [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktur Folder Proyek

Berikut adalah gambaran singkat struktur file penting dalam proyek ini:

```bash
src/
├── app/                  # Halaman-halaman utama (Next.js App Router)
│   ├── consult/          # Halaman Konsultasi AI (Luco)
│   ├── dashboard/        # Halaman Dashboard Pengguna
│   ├── sugar-visualizer/ # Halaman Fitur AR Visualizer
│   ├── page.tsx          # Halaman Utama (Landing Page)
│   └── globals.css       # Style global & konfigurasi Tailwind
├── components/           # Komponen UI yang dapat digunakan kembali
│   ├── landing/          # Komponen khusus Landing Page (Hero, Features, dll)
│   ├── ui/               # Komponen dasar (Button, Card, Input, LogoLoop)
│   └── layout/           # Komponen tata letak (Navbar, Footer)
├── lib/                  # Logika Bisnis & Utilitas
│   ├── firebase/         # Konfigurasi koneksi Firebase
│   └── ml/               # Logika Machine Learning & Model Training
└── public/               # Aset statis (Gambar, Video, Icon, Logo)
```

---

## 🤝 Kontribusi

Kami sangat terbuka untuk kontribusi! Jika Anda ingin membantu mengembangkan GlucoVision:

1.  **Fork** repository ini.
2.  Buat **Branch** fitur baru (`git checkout -b fitur/FiturKeren`).
3.  **Commit** perubahan Anda (`git commit -m 'Menambahkan FiturKeren'`).
4.  **Push** ke branch tersebut (`git push origin fitur/FiturKeren`).
5.  Buat **Pull Request** di GitHub.

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi **MIT**. Silakan lihat file `LICENSE` untuk informasi lebih lengkap.

---

<div align="center">
  <p>Dibuat dengan ❤️ oleh Tim GlucoVision</p>
  <p><i>Masa Depan Kesehatan Ada di Tangan Anda.</i></p>
</div>
