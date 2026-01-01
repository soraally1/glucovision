# GlucoVision 🩸👁️

> **Revolusi Manajemen Diabetes dengan Kecerdasan Buatan (AI) & Teknologi Non-Invasif**

**GlucoVision** adalah platform pemantauan kesehatan futuristik yang dirancang untuk memberikan kemudahan bagi penderita diabetes dalam mengelola kondisi mereka. Dengan pendekatan "Health without Pain", kami menggabungkan algoritma Deep Learning, Computer Vision, dan Generative AI untuk menciptakan ekosistem kesehatan yang empatik dan akurat.

---

## 🚀 Fitur Utama

### 1. CORE FEATURE: AI-Powered PPG Scanner
*   **Nama**: AI-Powered PPG Scanner
*   **Fungsi**: Mendeteksi estimasi kadar gula darah dan detak jantung (BPM) secara non-invasif.
*   **Cara Kerja**: Pengguna cukup menyalakan lampu flash smartphone dan menempelkan ujung jari ke lensa kamera. AI akan menganalisis perubahan gelombang cahaya (Photoplethysmography) yang dipengaruhi oleh denyut jantung dan karakteristik kekentalan darah yang berkorelasi dengan kadar glukosa.
*   **Teknologi**: WebRTC (Camera Stream) + TensorFlow.js (Inference Model di sisi Client).

---

## 🌟 Killer Features

### 1. 3D Sugar Shock Visualizer (Revisi)
*   **Fungsi**: Menerjemahkan angka gram gula yang abstrak menjadi tumpukan kubus 3D yang nyata untuk meningkatkan kesadaran konsumsi gula.
*   **Cara Kerja**:
    1.  Pengguna melakukan scan barcode produk atau menginput jumlah gula secara manual (misal: "28 gram").
    2.  Layar akan menampilkan animasi 3D berupa balok-balok gula putih yang jatuh menumpuk sesuai jumlah gram tersebut.
*   **Efek Visual**: Pengguna dapat memutar (rotate) tumpukan gula secara 360 derajat di dalam kanvas untuk melihat volume gula secara mendalam.
*   **Teknologi**: Three.js / React Three Fiber (Web-based 3D Rendering).

### 2. Smart Ingredient Substitution (Generative Dietitian)
*   **Fungsi**: Memberikan saran pengganti bahan makanan yang tinggi indeks glikemik menjadi alternatif yang lebih sehat bagi penderita diabetes.
*   **Cara Kerja**: Pengguna menginput menu makanan (misal: "Nasi Goreng"). **Chef Luco (Beruang Madu)** akan memberikan resep modifikasi yang lebih aman (seperti mengganti nasi putih dengan nasi merah atau shirataki) tanpa mengurangi cita rasa.
*   **Teknologi**: Generative AI (Groq/Gemini/GPT) dengan Prompt Engineering persona koki yang ahli nutrisi.

### 3. Medical Report Simplifier (OCR + LLM)
*   **Fungsi**: Menerjemahkan laporan laboratorium medis yang rumit menjadi bahasa yang mudah dipahami dan menenangkan.
*   **Cara Kerja**: Pengguna cukup memfoto surat hasil lab. AI akan mengekstraksi data angka medis dan **Luco** akan menjelaskannya lewat gelembung chat dengan nada bicara yang empatik (misal: "Kadar kreatininmu normal, tapi jangan lupa minum air putih lebih banyak ya!").
*   **Teknologi**: Tesseract/Cloud Vision OCR + Multimodal LLM.

---

## 📂 Struktur Proyek

Proyek ini dibangun dengan arsitektur **Next.js 14 (App Router)** yang terstruktur:

```bash
glucovision/
├── public/                 # Aset statis (Webm Maskot, Model 3D, Gambar)
├── src/
│   ├── app/                # Root Layout & Page Routes
│   │   ├── actions/        # Server Actions (Analisis AI via Groq)
│   │   ├── consult/        # Fitur Smart Dietitian (Chef Luco)
│   │   ├── measure/        # Fitur Core PPG Scanner
│   │   └── sugar-visualizer/ # Fitur 3D Sugar Visualizer
│   ├── components/         # Reusable UI Components
│   │   ├── camera/         # Logika Kontrol Kamera (WebRTC)
│   │   ├── sugar-visualizer/ # Logika Render 3D (Three.js)
│   │   └── ui/             # Shadcn/Radix UI & LogoLoop
│   ├── lib/                # Core Logic
│   │   ├── ml/             # TensorFlow.js Models & Training
│   │   ├── signal-processing/ # Filter Sinyal PPG (Bandpass, Z-Score)
│   │   └── firebase/       # Konfigurasi Database & Auth
│   └── types/              # Deklarasi Type TypeScript
├── .env.local              # API Keys (Groq, Firebase)
└── tailwind.config.ts      # Konfigurasi Desain (Aesthetics)
```

---

## 🛠️ Stack Teknologi Modern

| Kategori | Teknologi |
| :--- | :--- |
| **Frontend** | React 18 / Next.js 14 (App Router) |
| **Styling** | Tailwind CSS / Framer Motion / Lucide Icons |
| **3D Engine** | Three.js / @react-three/fiber |
| **Machine Learning** | TensorFlow.js / MediaPipe |
| **Backend/DB** | Firebase Firestore & Authentication |
| **AI (LLM)** | Groq API / Llama 3.2 Vision / Llama 4 Scout |

---

## 🛠️ Panduan Instalasi (Development)

1.  **Clone Repository:** `git clone https://github.com/your-username/glucovision.git`
2.  **Instal Dependensi:** `npm install`
3.  **Setup Environment:**
    Buat file `.env.local` dan tambahkan key berikut:
    ```env
    GROQ_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    ... (Firebase Credentials)
    ```
4.  **Jalankan Aplikasi:** `npm run dev`

---

<div align="center">
  <p>Dibuat dengan oleh Daffa Kumara SR</p>
  <p><i>Masa Depan Kesehatan Ada di Tangan Anda.</i></p>
</div>
