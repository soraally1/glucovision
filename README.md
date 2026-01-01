# GlucoVision 🩸👁️

> **Revolutionizing Diabetes Management with AI & Non-Invasive Technology**

GlucoVision is a cutting-edge health monitoring platform designed to transform the lives of people with diabetes. By leveraging Artificial Intelligence (AI) and Computer Vision, we provide a **non-invasive**, **pain-free**, and **cost-effective** alternative to traditional blood glucose monitoring methods.

---

## 🌟 Key Features

### 1. **Non-Invasive Measurement**
Say goodbye to painful finger pricks. GlucoVision utilizes advanced camera-based photoplethysmography (PPG) and machine learning algorithms to estimate heart rate and glucose trends directly from your smartphone camera or webcam.

### 2. **Luco: AI Health Consultant** 🤖
Meet **Luco**, your personal 24/7 health assistant.
- **Smart Consultation**: Ask detailed questions about diet, symptoms, and lifestyle.
- **Personalized Advice**: Tailored recommendations based on your activity and health data.
- **Interactive Persona**: An engaging, animated visual assistant that makes health management less daunting.

### 3. **Sugar Visualizer (AR Mode)** 🍬
An innovative educational tool utilizing Augmented Reality (AR) concepts.
- **Visual Impact**: See the physiological effects of sugar intake on the body in real-time.
- **Interactive 3D Elements**: Explore how glucose spikes affect internal organs and energy levels.

### 4. **Comprehensive Dashboard** 📊
- **Real-time Tracking**: Monitor vital signs and glucose trends.
- **Lab Analysis**: Upload and store medical lab reports securely.
- **Data Visualization**: Clear graphs and insights to track your progress over time.
- **Community**: Connect with a supportive community of users (Bento Grid integration).

---

## 🛠️ Technology Stack

Built with a modern, high-performance tech stack:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **State Management**: React Hooks & Context
- **AI & ML**: 
  - [Google MediaPipe](https://developers.google.com/mediapipe) / TensorFlow.js (for computer vision tasks)
  - Custom ML models (`src/lib/ml`)
- **Animation**: 
  - [Framer Motion](https://www.framer.com/motion/)
  - Custom Scroll Reveal components
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project with Firestore and Authentication enabled.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/glucovision.git
   cd glucovision
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Firebase configuration and other API keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```bash
src/
├── app/                  # Next.js App Router pages
│   ├── consult/          # AI Consultant page (Luco)
│   ├── dashboard/        # User Dashboard
│   ├── sugar-visualizer/ # AR/3D Visualizer feature
│   ├── page.tsx          # Landing / Home page
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── landing/          # Landing page specific components
│   ├── sugar-visualizer/ # Visualizer specific components
│   ├── ui/               # Generic UI elements (Buttons, Cards, ScrollReveal)
│   └── layout/           # Layout components (Nav, Footer)
├── lib/                  # Utilities and Logic
│   ├── firebase/         # Firebase configuration
│   ├── ml/               # Machine Learning & measurements logic
│   └── utils.ts          # Helper functions
└── public/               # Static assets (images, videos, icons)
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Made with ❤️ by the GlucoVision Team</p>
</div>
