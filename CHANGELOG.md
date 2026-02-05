# Changelog

All notable updates to the **Asset Finder** extension will be documented in this file.

## [0.1.3] - 2026-02-05

### Added

- **Folder Context Menu Integration**: Added "Open as Asset Finder" to the explorer context menu (right-click on any folder).
- **Auto-Filtering by Directory**: Selecting "Open as Asset Finder" on a folder now automatically focuses the gallery and pre-selects that directory in the "All folders" filter panel.
- **Smart View Activation**: Automatically switches focus to the Asset Finder panel when triggered from the context menu.

## [0.1.2] - 2026-02-03

### Major Update

- **Smart Error Handling**: Automatically hides broken or unreadable image files from the gallery to ensure a clean visual experience.
- **Smart Default Exclusions**: Automatically excludes common build/output folders from scanning (dist, build, .next, .nuxt, android, ios, macos, linux, windows, .dart_tool, .gradle, target, bin, obj) for faster performance and cleaner results.
- **Theme-Aware SVG Colors**: SVG previews and decorators now automatically adapt to VS Code theme - white for dark themes, black for light themes.
- **Full SVG Copy Options**: Added comprehensive copy options for SVG (inline & file): Copy Path, SVG Code, Paste-ready JSX, React Component, Vue Component, Android Vector XML, XAML Path, and Data URI.

### Fixed

- **Folder Filtering**: Fixed an issue where images were missing after selecting a folder in the filter dropdown.
- **Hierarchical Path Support**: Improved relative path matching to support nested directory structures accurately.
- **SVG Detection in TSX/JSX**: Fixed critical regex bug that incorrectly matched TypeScript type annotations (e.g., `<SVGSVGElement>`) as SVG tags, causing inline SVG rendering to fail in decorator and hover preview.
- **SVG Element Preservation**: Fixed bug where `width` and `height` attributes were removed from all SVG child elements (rect, circle, path, etc.), not just the opening `<svg>` tag.
- **Critical: Infinite Loading on Manual Exclude**: Fixed nested braces bug that caused manual exclude patterns to create invalid glob queries, resulting in `findFiles` hanging indefinitely.

### Refactored

- **Code Quality**: Extracted ~170 lines of duplicate code into reusable utilities:
  - `SvgProcessor` - SVG processing logic with configurable dimensions
  - `FileUtils` - File size formatting
  - `GlobPatterns` - Glob pattern formatting and default excludes
  - `RegexPatterns` - Shared regex constants
- Improved maintainability and consistency across `SvgDecorator`, `SvgHoverProvider`, and `SidebarProvider`

## [0.0.1] - 2026-02-01

### Added

- Initial project release (formerly known as Gallery Project).
- **Smart Hover Preview**: Seamless image previews for file paths and SVG snippets with a refined two-column layout.
- **Gutter Decorators**: Visual indicators in the editor margin for lines containing assets.
- **Smart Panel Activation**: Single-click access from the Activity Bar directly to the Asset Gallery panel.
- **Advanced Filtering**: Multifaceted filtering by asset format, directory, or source file.
- **Unified Asset Support**: Native support for Audio, Video, PDF, Excel (XLSX, XLS, CSV), Word (DOCX, DOC), and Archive (ZIP, RAR) formats.
- **Integrated Audio Player**: Play audio assets directly within the gallery with visual playback indicators.
- **Customizable Grid**: Flexible gallery layout with adjustable grid scaling.
- Deep inline SVG scanning for various languages (Kotlin, Python, Dart, React, etc.).
- Robust real-time asset search functionality.
- Core commands: `asset-finder.focus` and `asset-finder.refresh`.

### Changed

- Reimagined UI color scheme for better clarity.
- Optimized workspace asset scanning for enhanced performance.
