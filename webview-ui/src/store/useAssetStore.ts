import { create } from "zustand";

interface ImageData {
  type: "file" | "inline";
  uri?: string;
  content?: string;
  path: string;
  relativePath?: string;
  name: string;
  size?: number;
  line?: number;
  character?: number;
  lineEnd?: number;
  characterEnd?: number;
}

interface AssetState {
  images: ImageData[];
  filteredImages: ImageData[];
  isLoading: boolean;
  searchQuery: string;
  activeCategory: string[]; // ['png', 'svg']
  activeFolder: string[]; // ['src', 'assets']
  activeSourceFile: string[]; // ['icons.tsx']
  folders: string[];
  formats: string[];
  sourceFiles: string[];
  sortOrder: string;
  isHeaderExpanded: boolean;
  isScanConfigExpanded: boolean;
  gridSize: number;
  onlyInline: boolean;
  includePattern: string;
  excludePattern: string;
  setSearchQuery: (query: string) => void;
  setIncludePattern: (pattern: string) => void;
  setExcludePattern: (pattern: string) => void;
  toggleCategory: (category: string) => void;
  setCategory: (category: string[]) => void;
  toggleFolder: (folder: string) => void;
  setFolder: (folder: string[]) => void;
  toggleSourceFile: (file: string) => void;
  setSourceFile: (file: string[]) => void;
  setSortOrder: (order: string) => void;
  toggleHeader: () => void;
  toggleScanConfig: () => void;
  setGridSize: (size: number) => void;
  setOnlyInline: (only: boolean) => void;
  copyPath: (path: string) => void;
  copyCode: (code: string) => void;
  copyToJsx: (code: string) => void;
  copyToReactComponent: (code: string, name: string) => void;
  copyToVueComponent: (code: string, name: string) => void;
  copyToAndroidVector: (code: string) => void;
  copyToXamlPath: (code: string) => void;
  copyToBase64: (code: string) => void;
  copyToDataUri: (code: string) => void;
  setImages: (images: ImageData[]) => void;
  setLoading: (loading: boolean) => void;
  scanImages: () => void;
  openInEditor: (image: ImageData) => void;
  brokenImages: Set<string>;
  markAsBroken: (path: string) => void;
  toast: { message: string; visible: boolean } | null;
  showToast: (message: string) => void;
}

// Global vscode API access
const vscode = (window as any).acquireVsCodeApi
  ? (window as any).acquireVsCodeApi()
  : null;

export const useAssetStore = create<AssetState>((set: any, get: any) => ({
  images: [],
  filteredImages: [],
  isLoading: false,
  searchQuery: "",
  activeCategory: [],
  activeFolder: [],
  activeSourceFile: [],
  folders: [],
  formats: [],
  sourceFiles: [],
  sortOrder: "none",
  isHeaderExpanded: true,
  isScanConfigExpanded: false,
  gridSize: 100,
  onlyInline: false,
  includePattern: "",
  excludePattern: "",
  brokenImages: new Set(),
  toast: null,

  markAsBroken: (path: string) => {
    const next = new Set(get().brokenImages);
    next.add(path);
    set({ brokenImages: next });
    get().applyFilters();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setIncludePattern: (pattern: string) => {
    set({ includePattern: pattern });
  },

  setExcludePattern: (pattern: string) => {
    set({ excludePattern: pattern });
  },

  toggleCategory: (category: string) => {
    // ... (rest of toggleCategory)
    const current = get().activeCategory;
    if (category === "all") {
      set({ activeCategory: [] });
    } else {
      const next = current.includes(category)
        ? current.filter((c: string) => c !== category)
        : [...current, category];
      set({ activeCategory: next });
    }
    get().applyFilters();
  },

  setCategory: (category: string[]) => {
    // ... (rest of setCategory)
    set({ activeCategory: category });
    get().applyFilters();
  },

  toggleFolder: (folder: string) => {
    // ... (rest of toggleFolder)
    const current = get().activeFolder;
    const next = current.includes(folder)
      ? current.filter((f: string) => f !== folder)
      : [...current, folder];
    set({ activeFolder: next });
    get().applyFilters();
  },

  setFolder: (folder: string[]) => {
    // ... (rest of setFolder)
    set({ activeFolder: folder });
    get().applyFilters();
  },

  toggleSourceFile: (file: string) => {
    // ... (rest of toggleSourceFile)
    const current = get().activeSourceFile;
    const next = current.includes(file)
      ? current.filter((f: string) => f !== file)
      : [...current, file];
    set({ activeSourceFile: next });
    get().applyFilters();
  },

  setSourceFile: (file: string[]) => {
    // ... (rest of setSourceFile)
    set({ activeSourceFile: file });
    get().applyFilters();
  },

  setImages: (images: ImageData[]) => {
    // ... (rest of setImages)
    // Extract unique folder paths (hierarchical)
    const foldersSet = new Set<string>();
    images.forEach((img) => {
      // Use relativePath if available, otherwise fallback to name-based logic
      const pathValue = img.relativePath || img.path;

      // If pathValue is absolute (starts with slash or has drive letter), skip it for relative folder extraction
      if (pathValue.startsWith("/") || pathValue.includes(":/")) return;

      const pathParts = pathValue.split(/[\\/]/);

      // Get logical folder paths starting from root
      for (let i = 1; i < pathParts.length; i++) {
        const folderPath = pathParts.slice(0, i).join("/");
        if (folderPath && folderPath.length > 0) {
          foldersSet.add(folderPath);
        }
      }
    });
    const folders = Array.from(foldersSet).sort();

    // Extract unique formats
    const formats = Array.from(
      new Set(
        images.map((img) => {
          if (img.type === "inline") return "svg inline-code";
          return img.name.split(".").pop()?.toLowerCase() || "unknown";
        }),
      ),
    ).sort();

    // Extract unique source files (detailed paths - only code files, not assets)
    const sourceFilesSet = new Set<string>();
    const extensionsSet = new Set<string>();

    // Define ignored asset extensions for autocomplete
    const assetExtensions = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "mp3",
      "wav",
      "ogg",
      "m4a",
      "mp4",
      "webm",
      "pdf",
      "xlsx",
      "xls",
      "csv",
      "docx",
      "doc",
      "zip",
    ];

    images.forEach((img) => {
      const relPath = img.relativePath || img.path;
      if (relPath && !relPath.startsWith("/") && !relPath.includes(":/")) {
        const ext = relPath.split(".").pop()?.toLowerCase();

        // Only add to source files if it's NOT an asset (it's code)
        if (ext && !assetExtensions.includes(ext)) {
          sourceFilesSet.add(relPath);
          if (ext.length < 10) {
            extensionsSet.add(`*.${ext}`);
          }
        }
      }
    });

    const sourceFiles = Array.from(sourceFilesSet).sort();
    const extensions = Array.from(extensionsSet).sort();

    set({
      images,
      folders,
      formats,
      sourceFiles: [...extensions, ...sourceFiles],
      isLoading: false,
    });
    get().applyFilters();
  },

  toggleHeader: () => {
    set((state: AssetState) => ({
      isHeaderExpanded: !state.isHeaderExpanded,
    }));
  },

  toggleScanConfig: () => {
    set((state: AssetState) => ({
      isScanConfigExpanded: !state.isScanConfigExpanded,
    }));
  },

  setGridSize: (size: number) => {
    // ... (rest of setGridSize)
    set({ gridSize: Math.max(50, size) });
  },

  setOnlyInline: (only: boolean) => {
    set({ onlyInline: only });
    get().applyFilters();
  },

  copyPath: (path: string) => {
    if (vscode) {
      vscode.postMessage({ type: "copyPath", value: path });
      get().showToast("Path copied to clipboard!");
    }
  },

  copyCode: (code: string) => {
    if (vscode) {
      vscode.postMessage({ type: "copyCode", value: code });
      get().showToast("SVG Code copied to clipboard!");
    }
  },

  copyToJsx: (code: string) => {
    if (vscode) {
      vscode.postMessage({ type: "copyToJsx", value: code });
      get().showToast("JSX code copied!");
    }
  },

  copyToReactComponent: (code: string, name: string) => {
    if (vscode) {
      vscode.postMessage({
        type: "copyToReactComponent",
        value: code,
        name: name,
      });
      get().showToast("React Component copied!");
    }
  },

  copyToVueComponent: (code: string, name: string) => {
    if (vscode) {
      vscode.postMessage({
        type: "copyToVueComponent",
        value: code,
        name: name,
      });
      get().showToast("Vue Component copied!");
    }
  },

  copyToAndroidVector: (code: string) => {
    if (vscode) {
      vscode.postMessage({ type: "copyToAndroidVector", value: code });
      get().showToast("Android Vector XML copied!");
    }
  },

  copyToXamlPath: (code: string) => {
    if (vscode) {
      vscode.postMessage({ type: "copyToXamlPath", value: code });
      get().showToast("XAML Path copied!");
    }
  },

  copyToBase64: (code: string) => {
    if (vscode) {
      vscode.postMessage({ type: "copyToBase64", value: code });
      get().showToast("Base64 string copied!");
    }
  },

  copyToDataUri: (code: string) => {
    if (vscode) {
      vscode.postMessage({ type: "copyToDataUri", value: code });
      get().showToast("Data URI copied!");
    }
  },

  showToast: (message: string) => {
    set({ toast: { message, visible: true } });
    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },

  setSortOrder: (order: string) => {
    set({ sortOrder: order });
    get().applyFilters();
  },

  applyFilters: () => {
    const {
      images,
      searchQuery,
      activeCategory,
      activeFolder,
      activeSourceFile,
      sortOrder,
      onlyInline,
      brokenImages,
    } = get();

    let filtered = [...images];

    // Filter out broken images
    if (brokenImages.size > 0) {
      filtered = filtered.filter(
        (img: ImageData) => !brokenImages.has(img.path),
      );
    }

    // Filter by type (Only Inline)
    if (onlyInline) {
      filtered = filtered.filter((img) => img.type === "inline");
    }

    // Filter by category (format) - Multi select support
    if (activeCategory.length > 0) {
      filtered = filtered.filter((img) => {
        const ext = img.name.split(".").pop()?.toLowerCase();
        if (activeCategory.includes("svg inline-code") && img.type === "inline")
          return true;
        return ext ? activeCategory.includes(ext) : false;
      });
    }

    // Filter by folder - Multi select support
    if (activeFolder.length > 0) {
      filtered = filtered.filter((img) => {
        const relPath = img.relativePath || img.path;
        const normalizedPath = relPath.replace(/\\/g, "/").replace(/^\/+/, "");

        return activeFolder.some((folder: string) => {
          const normalizedFolder = folder
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");
          return normalizedPath.startsWith(normalizedFolder + "/");
        });
      });
    }

    // Filter by source file - Multi select support
    if (activeSourceFile.length > 0) {
      filtered = filtered.filter((img) => {
        const relPath = img.relativePath || img.path;
        const sourceFileName = relPath.split(/[\\/]/).pop() || "";

        return activeSourceFile.some((pattern: string) => {
          if (pattern.startsWith("*.")) {
            return relPath
              .toLowerCase()
              .endsWith(pattern.slice(1).toLowerCase());
          }
          return pattern === relPath || pattern === sourceFileName;
        });
      });
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (img) =>
          img.name.toLowerCase().includes(q) ||
          img.path.toLowerCase().includes(q),
      );
    }

    // Sorting Logic
    if (sortOrder && sortOrder !== "none") {
      filtered.sort((a, b) => {
        switch (sortOrder) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "size-asc":
            return (a.size || 0) - (b.size || 0);
          case "size-desc":
            return (b.size || 0) - (a.size || 0);
          default:
            return 0;
        }
      });
    }

    set({ filteredImages: filtered });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  scanImages: () => {
    set({ isLoading: true });
    const { includePattern, excludePattern } = get();
    if (vscode) {
      vscode.postMessage({
        type: "scanImages",
        value: { includePattern, excludePattern },
      });
    } else {
      console.warn("VS Code API not available");
      set({ isLoading: false });
    }
  },
  openInEditor: (image) => {
    if (vscode && image.path) {
      vscode.postMessage({
        type: "openInEditor",
        value: {
          path: image.path,
          type: image.type,
          line: image.line,
          character: image.character,
          lineEnd: image.lineEnd,
          characterEnd: image.characterEnd,
        },
      });
    }
  },
}));

// Listen for messages from the extension
window.addEventListener("message", (event) => {
  const message = event.data;
  switch (message.type) {
    case "imageResults":
      useAssetStore.getState().setImages(message.value);
      break;
  }
});
