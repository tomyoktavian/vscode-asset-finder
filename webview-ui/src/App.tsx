import { ImageGrid } from "./components/ImageGrid";
import { CategorySelector } from "./components/CategorySelector";
import { Github } from "lucide-react";

function App() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden relative">
      <CategorySelector />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ImageGrid />
      </div>

      {/* Credit Section */}
      <div className="absolute bottom-0 right-6 z-50">
        <a
          href="https://github.com/tomyoktavian"
          target="_blank"
          rel="noopener noreferrer"
          title="tomyoktavian"
          className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-muted/60 backdrop-blur-md border border-border/40 hover:bg-muted/70 transition-all group shadow-lg"
        >
          <Github className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            tomyokta
          </span>
        </a>
      </div>
    </div>
  );
}

export default App;
