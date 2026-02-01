import React from "react";
import { useAssetStore } from "@/store/useAssetStore";
import {
  Layers,
  FolderIcon,
  RotateCcw,
  Search,
  RefreshCw,
  FileCodeIcon,
  SortAsc,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  SlidersHorizontal,
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PathAutocomplete } from "@/components/ui/path-autocomplete";
import { cn } from "@/lib/utils";

export const CategorySelector: React.FC = () => {
  const {
    activeCategory,
    setCategory,
    activeFolder,
    setFolder,
    activeSourceFile,
    setSourceFile,
    folders,
    formats,
    sourceFiles,
    searchQuery,
    setSearchQuery,
    filteredImages,
    scanImages,
    isLoading,
    sortOrder,
    setSortOrder,
    isHeaderExpanded,
    toggleHeader,
    gridSize,
    setGridSize,
    // onlyInline,
    setOnlyInline,
    includePattern,
    excludePattern,
    setIncludePattern,
    setExcludePattern,
    isScanConfigExpanded,
    toggleScanConfig,
  } = useAssetStore();

  const formatOptions = formats.map((f) => ({
    label: f.toUpperCase(),
    value: f,
  }));
  const folderOptions = folders.map((f) => ({ label: f, value: f }));
  const sourceOptions = React.useMemo(() => {
    const seen = new Set<string>();
    const options: { label: string; value: string }[] = [];

    sourceFiles.forEach((f) => {
      const name = f.startsWith("*.") ? f : f.split(/[\\/]/).pop() || f;
      if (!seen.has(name)) {
        options.push({ label: name, value: name });
        seen.add(name);
      }
    });
    return options;
  }, [sourceFiles]);

  return (
    <div className="flex flex-col gap-2 py-2 px-3 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 transition-all duration-300 ease-in-out group/header">
      <div className="flex items-center justify-between gap-4 w-full">
        <div
          className={cn(
            "flex flex-col min-w-[100px]",
            !isHeaderExpanded && "flex-row items-center gap-2",
          )}
        >
          <h2 className="text-[11px] capitalize font-black text-foreground/90 leading-none">
            Asset Finder
          </h2>
          <div className="text-[9px] capitalize text-muted-foreground font-medium">
            <span className="text-primary font-bold">
              {filteredImages.length}
            </span>{" "}
            Items
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded-full bg-muted/20 border border-border/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGridSize(gridSize - 25)}
              disabled={gridSize <= 50}
              className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-95 disabled:opacity-30"
              title="Zoom Out"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="w-px h-3 bg-border/50 mx-0.5" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGridSize(gridSize + 25)}
              disabled={gridSize >= 300}
              className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-95 disabled:opacity-30"
              title="Zoom In"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 min-w-[140px]">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="flex-1 rounded-full h-8 text-[10px] bg-muted/10 border-border/30 hover:bg-muted/20 transition-all">
                <SortAsc className="h-3 w-3" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="text-[11px]">
                <SelectItem value="none">Default (None)</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="size-asc">Size (Smallest)</SelectItem>
                <SelectItem value="size-desc">Size (Largest)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search in assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[150px] w-full pl-8 pr-3 py-1.5 text-[11px] bg-muted/20 border-border/50 rounded-full border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scanImages()}
            disabled={isLoading}
            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
            title="Scan for new images"
          >
            <RefreshCw
              className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            variant={isScanConfigExpanded ? "secondary" : "ghost"}
            size="icon"
            onClick={toggleScanConfig}
            className={cn(
              "h-8 w-8 rounded-full transition-all active:scale-95",
              isScanConfigExpanded
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "hover:bg-primary/10 hover:text-primary",
            )}
            title="Scan Settings"
          >
            <SlidersHorizontal className="h-3 w-3" />
          </Button>

          {/* Top Bar Sort & Reset (Only when collapsed) */}
          {!isHeaderExpanded && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategory([]);
                  setFolder([]);
                  setSourceFile([]);
                  setSearchQuery("");
                  setSortOrder("none");
                  setOnlyInline(false);
                  setIncludePattern("");
                  setExcludePattern("");
                }}
                className="h-8 px-3 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all text-[10px]"
                title="Reset Filters"
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>

      {isHeaderExpanded && (
        <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 min-w-[140px]">
            <MultiSelect
              placeholder="All Formats"
              options={formatOptions}
              selected={activeCategory}
              onChange={setCategory}
              className="flex-1 rounded-full h-8 min-h-[32px] text-[10px]"
              icon={<Layers className="h-3 w-3" />}
            />
          </div>

          <div className="flex items-center gap-2 min-w-[140px]">
            <MultiSelect
              placeholder="All Folders"
              options={folderOptions}
              selected={activeFolder}
              onChange={setFolder}
              className="flex-1 rounded-full h-8 min-h-[32px] text-[10px]"
              icon={<FolderIcon className="h-3 w-3" />}
            />
          </div>

          {sourceFiles.length > 0 && (
            <div className="flex items-center gap-2 min-w-[140px]">
              <MultiSelect
                placeholder="All Sources"
                options={sourceOptions}
                selected={activeSourceFile}
                onChange={setSourceFile}
                className="flex-1 rounded-full h-8 min-h-[32px] text-[10px]"
                icon={<FileCodeIcon className="h-3 w-3" />}
              />
            </div>
          )}

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategory([]);
                setFolder([]);
                setSourceFile([]);
                setSearchQuery("");
                setSortOrder("none");
                setOnlyInline(false);
                setIncludePattern("");
                setExcludePattern("");
              }}
              className="h-8 px-3 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all gap-2 text-[10px]"
              title="Reset Filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>
      )}

      {isScanConfigExpanded && (
        <div className="flex items-center gap-3 w-full pt-1 pb-2 border-t border-border/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <PathAutocomplete
            value={includePattern}
            onChange={setIncludePattern}
            onEnter={scanImages}
            prefix="INC"
            placeholder="Include patterns (e.g. src/**/*.svg)"
            options={[...folders, ...sourceFiles]}
          />
          <PathAutocomplete
            value={excludePattern}
            onChange={setExcludePattern}
            onEnter={scanImages}
            prefix="EXC"
            placeholder="Exclude patterns (e.g. backend/)"
            options={[...folders, ...sourceFiles]}
          />
        </div>
      )}

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20"
        onClick={toggleHeader}
      >
        <div className="p-0.5 rounded-full bg-border/80 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer shadow-sm hover:scale-110 transition-all">
          {isHeaderExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  );
};
