# Asset Finder 🎨

Asset Finder adalah ekstensi VS Code yang berfungsi untuk menampilkan berbagai aset proyek seperti gambar, audio, video, dan dokumen secara visual di dalam workspace. Ekstensi ini dapat memindai file aset fisik maupun kode SVG yang tertanam langsung di dalam file sumber.

![Asset Finder Preview](https://github.com/tomyoktavian/vscode-asset-finder/raw/master/webview-ui/src/assets/preview.gif)

## Fitur Utama

- **Deteksi SVG Didalam Kode**: Mendukung pemindaian kode SVG di berbagai bahasa pemrograman seperti Kotlin, Python, Dart, React, HTML, dan lainnya.
- **Smart Hover Preview**: Arahkan kursor pada jalur file gambar atau kode SVG di editor untuk melihat preview instan beserta informasi ukuran dan tombol akses cepat.
- **Image Decorator**: Memberikan indikator visual (ikon gambar) di sisi kiri baris kode yang berisi referensi gambar atau kode SVG.
- **Navigasi ke Kode**: Mengklik gambar SVG di galeri akan membuka file sumber dan mengarahkan kursor ke lokasi kode tersebut secara otomatis.
- **Integrasi Viewer Gambar**: File gambar fisik (PNG, JPG) dibuka menggunakan viewer standar bawaan VS Code.
- **Salin Jalur Relatif**: Fitur untuk menyalin jalur file yang relatif terhadap folder workspace.
- **Penyesuaian Grid**: Ukuran tampilan gambar dalam grid dapat diatur sesuai kebutuhan.
- **Pencarian dan Filter**: Fitur pencarian gambar berdasarkan nama serta filter berdasarkan folder dan format file.
- **Sinkronisasi Tema**: Tampilan antarmuka mengikuti tema warna (dark/light) yang aktif di VS Code.

## Cara Penggunaan

1. Klik ikon **Asset Finder** pada Activity Bar di sisi kiri.
2. Panel galeri akan terbuka secara otomatis di bagian bawah (Panel Area).
3. Gunakan kontrol di bagian atas untuk mengatur ukuran grid atau mencari aset.
4. Arahkan kursor pada gambar untuk melakukan aksi:
   - **Ikon Mata**: Membuka file di editor atau viewer gambar.
   - **Ikon Menu**: Opsi untuk menyalin jalur file atau menyalin kode SVG.

## Detail Teknis

- **Format Gambar Didukung**: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.gif`.
- **Dukungan Aset Multimedia**: Mendukung file audio (`.mp3`, `.wav`, dll) dengan player terintegrasi, video (`.mp4`, `.webm`), PDF, Excel, dan Word.
- **Dukungan Scan Inline SVG**: `.kt`, `.py`, `.dart`, `.tsx`, `.jsx`, `.vue`, `.svelte`, `.php`, `.xml`, `.txt`, `.rb`, `.go`, `.rs`, `.java`, `.swift`, `.cpp`, `.h`, `.cs`, `.m`, `.mm`.
- **Persyaratan**: VS Code versi 1.104.0 atau yang lebih baru.
- **Keamanan**: Desain webview menggunakan Content Security Policy (CSP) yang ketat untuk memastikan aset dimuat dengan aman dari workspace Anda.

## Changelog

Lihat daftar lengkap perubahan di [CHANGELOG.md](./CHANGELOG.md).

---

<div align="center">
  <a href="https://github.com/tomyoktavian">
    <img src="https://github.com/tomyoktavian.png" width="50" height="50" style="border-radius: 50%;" alt="tomyoktavian profile">
    <br>
    Dibuat oleh <b>tomyoktavian</b>
  </a>
</div>
