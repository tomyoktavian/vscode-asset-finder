# Asset Finder 🎨

[![Version](https://img.shields.io/visual-studio-marketplace/v/tomyoktavian.asset-finder?style=for-the-badge&logo=visual-studio-code&color=blue)](https://marketplace.visualstudio.com/items?itemName=tomyoktavian.asset-finder)
[![Open VSX](https://img.shields.io/open-vsx/v/tomyoktavian/asset-finder?style=for-the-badge&logo=openvsx&color=purple)](https://open-vsx.org/extension/tomyoktavian/asset-finder)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/tomyoktavian.asset-finder?style=for-the-badge&logo=visual-studio-code&color=success)](https://marketplace.visualstudio.com/items?itemName=tomyoktavian.asset-finder)
[![License](https://img.shields.io/github/license/tomyoktavian/vscode-asset-finder?style=for-the-badge)](https://github.com/tomyoktavian/vscode-asset-finder/blob/main/LICENSE)

Asset Finder is a powerful VS Code extension designed to visually manage and explore project assets—including images, audio, video, and documents—directly within your workspace. It intelligently scans both local files and SVG code snippets embedded within your source code.

![Asset Finder Preview](https://github.com/tomyoktavian/vscode-asset-finder/raw/master/webview-ui/src/assets/preview.gif)

## 🚀 Key Features

- **Inline SVG Detection**: Seamlessly identifies and extracts SVG code across various languages, including Kotlin, Python, Dart, React, HTML, and more.
- **Smart Hover Preview**: Hover over any file path or SVG snippet to see an instant preview, dimensions, and quick-action shortcuts.
- **Gutter Decorators**: Stay organized with visual icons in the editor gutter for every line containing an asset reference or SVG code.
- **Precise Navigation**: Click an SVG in the gallery to jump directly to its definition in your source code.
- **Native Viewer Integration**: Launches standard image formats (PNG, JPG, WebP) using VS Code's high-performance built-in viewer.
- **Optimized Workflow**: Quickly copy workspace-relative paths, customize grid layouts, and find assets using powerful real-time filters.
- **Unified Theme Experience**: Automatically adapts to your active VS Code color theme for a native look and feel.

## 🛠 How to Use

1. Click the **Asset Finder** icon in the **Activity Bar**.
2. The gallery will automatically open in the **Panel** area (bottom).
3. Use the toolbar to adjust grid density or search for specific assets.
4. Hover over any asset to reveal action buttons:
   - **Eye Icon**: Open the file in the editor or native viewer.
   - **Menu Icon**: Copy relative path or extract SVG code.

## 📦 Technical Specifications

- **Supported Image Formats**: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.gif`.
- **Multimedia Support**: Integrated audio player (`.mp3`, `.wav`), video preview (`.mp4`, `.webm`), and document viewing for PDF, Excel, and Word.
- **Language Support for SVGs**: `.kt`, `.py`, `.dart`, `.tsx`, `.jsx`, `.vue`, `.svelte`, `.php`, `.xml`, `.txt`, `.rb`, `.go`, `.rs`, `.java`, `.swift`, `.cpp`, `.h`, `.cs`, `.m`, `.mm`.
- **Requirements**: VS Code version 1.104.0 or later.
- **Secure by Design**: Utilizes strict Content Security Policy (CSP) to ensure assets are loaded safely from your local workspace.

## 📜 Changelog

Detailed release notes are available in [CHANGELOG.md](./CHANGELOG.md).

---

<div align="center">
  <a href="https://github.com/tomyoktavian">
    <img src="https://github.com/tomyoktavian.png" width="50" height="50" style="border-radius: 50%;" alt="tomyoktavian profile">
    <br>
    Developed by <b>tomyoktavian</b>
  </a>
</div>
