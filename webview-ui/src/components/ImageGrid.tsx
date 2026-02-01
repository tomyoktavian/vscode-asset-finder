import React, { useEffect } from "react";
import { useAssetStore } from "@/store/useAssetStore";
import {
  Eye,
  MoreHorizontal,
  Copy,
  Code2,
  Play,
  Pause,
  FileAudio,
  FileVideo,
  FileText,
  FileSpreadsheet,
  Archive,
  File as FileIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const ImageGrid: React.FC = () => {
  const {
    filteredImages: images,
    isLoading,
    scanImages,
    openInEditor,
    gridSize,
    copyPath,
    copyCode,
  } = useAssetStore();

  const [playingAudio, setPlayingAudio] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const getFileCategory = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
    if (["mp4", "webm"].includes(ext)) return "video";
    if (["pdf"].includes(ext)) return "pdf";
    if (["xlsx", "xls", "csv"].includes(ext)) return "excel";
    if (["docx", "doc"].includes(ext)) return "word";
    if (["zip", "rar", "7z"].includes(ext)) return "archive";
    if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext))
      return "image";
    return "other";
  };

  const toggleAudio = (uri: string) => {
    if (playingAudio === uri) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = uri;
        audioRef.current.play();
        setPlayingAudio(uri);
      }
    }
  };

  const onAudioEnded = () => {
    setPlayingAudio(null);
  };

  useEffect(() => {
    scanImages();
  }, [scanImages]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">
            Scanning Project...
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-2 text-xs font-medium text-foreground opacity-50 uppercase tracking-tight">
          No matches found
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
      <div
        className="grid gap-4 transition-all duration-300 ease-in-out"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`,
        }}
      >
        {images.map((image, index) => (
          <div
            key={`${image.path}-${index}`}
            className="group relative flex flex-col gap-1.5"
          >
            {/* Image Container with Hover Overlay */}
            <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted/30 flex items-center justify-center transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5 relative">
              {image.type === "inline" ? (
                <div
                  className="h-full w-full p-2 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full transition-transform duration-500 group-hover:scale-105"
                  dangerouslySetInnerHTML={{ __html: image.content || "" }}
                />
              ) : (
                (() => {
                  const category = getFileCategory(image.name);
                  switch (category) {
                    case "image":
                      return (
                        <img
                          src={image.uri}
                          alt={image.name}
                          className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      );
                    case "audio":
                      return (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-500 group-hover:scale-105">
                          <FileAudio className="h-12 w-12" />
                          {playingAudio === image.uri && (
                            <div className="flex gap-1">
                              <span className="w-1 h-3 bg-primary animate-pulse" />
                              <span className="w-1 h-3 bg-primary animate-pulse delay-75" />
                              <span className="w-1 h-3 bg-primary animate-pulse delay-150" />
                            </div>
                          )}
                        </div>
                      );
                    case "video":
                      return (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-500 group-hover:scale-105">
                          <FileVideo className="h-12 w-12" />
                        </div>
                      );
                    case "pdf":
                      return (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-500 group-hover:scale-105">
                          <FileText className="h-12 w-12 text-red-500/70" />
                        </div>
                      );
                    case "excel":
                      return (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-500 group-hover:scale-105">
                          <FileSpreadsheet className="h-12 w-12 text-green-500/70" />
                        </div>
                      );
                    case "word":
                      return (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-500 group-hover:scale-105">
                          <FileText className="h-12 w-12 text-blue-500/70" />
                        </div>
                      );
                    case "archive":
                      return (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-500 group-hover:scale-105">
                          <Archive className="h-12 w-12" />
                        </div>
                      );
                    default:
                      return (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground transition-transform duration-500 group-hover:scale-105">
                          <FileIcon className="h-12 w-12" />
                        </div>
                      );
                  }
                })()
              )}

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => openInEditor(image)}
                  className="h-8 w-8 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
                  title="View in Editor"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {getFileCategory(image.name) === "audio" && (
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => toggleAudio(image.uri || "")}
                    className="h-8 w-8 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all bg-primary text-primary-foreground"
                    title={playingAudio === image.uri ? "Pause" : "Play"}
                  >
                    {playingAudio === image.uri ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 pl-0.5" />
                    )}
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
                      title="More Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="min-w-[140px] bg-background/95 backdrop-blur-md border-border/50 text-[11px]"
                  >
                    {image.type === "file" && (
                      <DropdownMenuItem
                        onClick={() => copyPath(image.path)}
                        className="gap-2 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy Path
                      </DropdownMenuItem>
                    )}

                    {image.type === "inline" && image.content && (
                      <DropdownMenuItem
                        onClick={() => copyCode(image.content || "")}
                        className="gap-2 cursor-pointer"
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        Copy SVG Code
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col px-0.5">
              <span className="text-[10px] font-bold truncate text-foreground/80 group-hover:text-primary transition-colors">
                {image.name}
              </span>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground/60 truncate uppercase tracking-tighter font-bold">
                  {image.type === "inline"
                    ? "Inline Source"
                    : image.name.split(".").pop()}
                </span>
                {image.type === "file" && image.size !== undefined && (
                  <span className="text-[9px] text-muted-foreground/40 font-medium tabular-nums">
                    {formatFileSize(image.size)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <audio ref={audioRef} onEnded={onAudioEnded} className="hidden" />
    </div>
  );
};
