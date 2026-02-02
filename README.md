# Asset Finder 🎨

[![Version](https://img.shields.io/visual-studio-marketplace/v/tomyoktavian.asset-finder?style=for-the-badge&logo=visual-studio-code&color=blue)](https://marketplace.visualstudio.com/items?itemName=tomyoktavian.asset-finder)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/tomyoktavian.asset-finder?style=for-the-badge&logo=visual-studio-code&color=success)](https://marketplace.visualstudio.com/items?itemName=tomyoktavian.asset-finder)
[![License](https://img.shields.io/github/license/tomyoktavian/asset-finder?style=for-the-badge)](https://github.com/tomyoktavian/asset-finder/blob/main/LICENSE)

Asset Finder is a VS Code extension that functions to visually display various project assets such as images, audio, video, and documents within the workspace. This extension can scan physical asset files as well as SVG code embedded directly in source files.

![Asset Finder Preview](https://github.com/tomyoktavian/vscode-asset-finder/raw/master/webview-ui/src/assets/preview.gif)

## Key Features

- **Inline SVG Detection**: Supports scanning SVG code in various programming languages such as Kotlin, Python, Dart, React, HTML, and more.
- **Smart Hover Preview**: Hover over image file paths or SVG code in the editor to see an instant preview along with size information and quick access buttons.
- **Image Decorator**: Provides a visual indicator (image icon) on the left side of code lines containing image references or SVG code.
- **Navigate to Code**: Clicking an SVG image in the gallery will automatically open the source file and move the cursor to the code's location.
- **Image Viewer Integration**: Physical image files (PNG, JPG) are opened using VS Code's built-in standard viewer.
- **Copy Relative Path**: Feature to copy the file path relative to the workspace folder.
- **Grid Customization**: The display size of images in the grid can be adjusted as needed.
- **Search and Filter**: Search for images by name and filter by folder and file format.
- **Theme Synchronization**: The interface follows the active color theme (dark/light) in VS Code.

## How to Use

1. Click the **Asset Finder** icon on the Activity Bar on the left.
2. The gallery panel will open automatically at the bottom (Panel Area).
3. Use the controls at the top to adjust grid size or search for assets.
4. Hover over an image to perform actions:
   - **Eye Icon**: Open the file in the editor or image viewer.
   - **Menu Icon**: Options to copy file path or copy SVG code.

## Technical Details

- **Supported Image Formats**: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.gif`.
- **Multimedia Asset Support**: Supports audio files (`.mp3`, `.wav`, etc.) with an integrated player, video (`.mp4`, `.webm`), PDF, Excel, and Word.
- **Inline SVG Scan Support**: `.kt`, `.py`, `.dart`, `.tsx`, `.jsx`, `.vue`, `.svelte`, `.php`, `.xml`, `.txt`, `.rb`, `.go`, `.rs`, `.java`, `.swift`, `.cpp`, `.h`, `.cs`, `.m`, `.mm`.
- **Requirements**: VS Code version 1.104.0 or newer.
- **Security**: The webview design uses a strict Content Security Policy (CSP) to ensure assets are loaded safely from your workspace.

## Changelog

See the full list of changes in [CHANGELOG.md](./CHANGELOG.md).

---

<div align="center">
  <a href="https://github.com/tomyoktavian">
    <img src="https://github.com/tomyoktavian.png" width="50" height="50" style="border-radius: 50%;" alt="tomyoktavian profile">
    <br>
    Created by <b>tomyoktavian</b>
  </a>
</div>
