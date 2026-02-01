# Changelog

Semua perubahan penting pada ekstensi **Asset Finder** akan didokumentasikan di file ini.

## [0.0.1] - 2026-02-01

### Added

- Inisialisasi proyek Asset Finder (sebelumnya Gallery Project).

* **Smart Hover Preview**: Preview gambar instan saat kursor diarahkan ke path file atau kode SVG dengan layout dua kolom.
* **Image Decorator**: Ikon indikator di gutter editor untuk baris yang berisi aset gambar.
* **Smart Redirect**: Klik ikon di Activity Bar langsung membuka panel galeri bawah.
* **Filter Multifaset**: Filter aset berdasarkan format, folder, dan file sumber.
* **Dukungan Multi-Aset**: Mendukung penampilan file Audio, Video, PDF, Excel (XLSX, XLS, CSV), Word (DOCX, DOC), dan Arsip (ZIP, RAR).
* **Audio Player Terintegrasi**: Memungkinkan pemutaran file audio langsung dari galeri dengan indikator visual.
* **Visual Grid**: Tampilan galeri dengan ukuran grid yang dapat disesuaikan.

- Deteksi inline SVG untuk berbagai bahasa pemrograman (Kotlin, Python, Dart, React, dll).
- Fitur pencarian aset secara real-time.
- Perintah `asset-finder.focus` dan `asset-finder.refresh`.

### Changed

- Pembaruan skema warna UI.
- Optimasi performa pemindaian aset di workspace.
