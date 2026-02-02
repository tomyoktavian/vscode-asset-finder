# Asset Finder 🎨

[![Version](https://img.shields.io/open-vsx/v/tomyoktavian/asset-finder)](https://open-vsx.org/extension/tomyoktavian/asset-finder)
[![Downloads](https://img.shields.io/open-vsx/dt/tomyoktavian/asset-finder?color=success)](https://open-vsx.org/extension/tomyoktavian/asset-finder)
[![GitHub stars](https://img.shields.io/github/stars/tomyoktavian/vscode-asset-finder?style=flat&color=gold)](https://github.com/tomyoktavian/vscode-asset-finder)
[![GitHub issues](https://img.shields.io/github/issues/tomyoktavian/vscode-asset-finder)](https://github.com/tomyoktavian/vscode-asset-finder/issues)
[![License](https://img.shields.io/github/license/tomyoktavian/vscode-asset-finder)](https://github.com/tomyoktavian/vscode-asset-finder)

Asset Finder is a powerful VS Code extension designed to visually manage and explore project assets—including images, audio, video, and documents—directly within your workspace. It intelligently scans both local files and SVG code snippets embedded within your source code.

![Asset Finder Preview](https://github.com/tomyoktavian/vscode-asset-finder/raw/master/webview-ui/src/assets/preview.gif)

## Features

- **Multi-Framework SVG Detection**: Seamlessly identifies SVG code in **React, Vue, Svelte, Blade, Kotlin, Python, Dart, HTML**, and more.
- **Enhanced Format Support**: Now supports **Android Vector Drawable (`.xml`)** and **WPF/XAML Path (`.xaml`)** conversion to renderable SVG.
- **Full SVG Transformation**: Convert and copy SVGs instantly to **Paste-ready JSX, React Component, Vue Component, Android Vector XML, or XAML Path**.
- **Theme-Aware Previews**: SVG previews and decorators automatically adapt to your VS Code theme (Light/Dark) for perfect visibility.
- **Smart Hover & Gutter**: Instant previews and visual icons in the editor gutter for every line containing an asset reference or SVG code.
- **High-Performance Scanning**: Built-in smart exclusions for build folders (`dist`, `node_modules`, `target`, etc.) ensure lightning-fast asset indexing.
- **Audio & Video Playback**: Integrated media players to preview sounds and videos directly within the gallery sidebar.

## How to Use

1. Click the **Asset Finder** icon in the **Activity Bar**.
2. The gallery will automatically open in the **Panel** area or **Primary Sidebar**.
3. Use the **Toolbar** to adjust grid scaling, filter by folder, or search for specific assets.
4. Use **Scan Configuration** to include or exclude specific workspace paths.
5. Hover over any asset for quick actions:
   - **Eye Icon**: Jump to source code or open native viewer.
   - **Copy Icon**: Quick copy path or SVG code.
   - **Dropdown**: Transformation options (JSX, React, Vue, Data URI).

## Technical Specifications

- **Image Formats**: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.gif`, **`.xml` (Android Vector)**, **`.xaml` (WPF Path)**.
- **Multimedia**: Audio (`.mp3`, `.wav`, `.ogg`), Video (`.mp4`, `.webm`), Documents (`.pdf`, `.xlsx`, `.docx`), and Archives (`.zip`).
- **Framework Support**: Smart normalization for **Tailwind classes**, **className**, and dynamic color variables (e.g. `fill={color}`, `:stroke="var"`, `{{$blue}}`).
- **SVG Injection**: Jump from Gallery directly to the specific line in any supported language: `.kt`, `.py`, `.dart`, `.tsx`, `.jsx`, `.vue`, `.svelte`, `.php`, `.xml`, `.xaml`, `.txt`, `.rb`, `.go`, `.rs`, `.java`, `.swift`, `.cpp`, `.cs`.
- **Requirements**: VS Code version 1.104.0 or later.

---

<div align="center">
  <a href="https://github.com/tomyoktavian">
    <img src="https://github.com/tomyoktavian.png" width="50" height="50" style="border-radius: 50%;" alt="tomyoktavian profile">
    <br>
    Developed by <b>tomyoktavian</b>
  </a>
</div>
