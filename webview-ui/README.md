# Asset Finder Webview UI 🎨

Bagian ini berisi antarmuka pengguna (UI) untuk ekstensi Asset Finder yang dibangun menggunakan **React**, **Vite**, **Tailwind CSS**, dan **Zustand**.

## Development

Untuk menjalankan UI dalam mode pengembangan:

1. **Setup**: Jalankan `npm run setup` dari root project (hanya perlu sekali).
2. **Development**: Jalankan `npm run dev` di folder ini untuk HMR.
3. **Build**: Jalankan `npm run build` untuk menghasilkan bundle produksi di folder `dist`.

> **Catatan**: Saat menjalankan `npm run dev`, antarmuka dapat diakses di browser, namun fungsi yang memerlukan komunikasi dengan VS Code (seperti membuka file atau scanning) hanya akan bekerja saat dijalankan di dalam Extension Development Host.

## Teknologi Utama

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Components**: Shadcn/UI (Radix UI)
- **Icons**: Lucide React
