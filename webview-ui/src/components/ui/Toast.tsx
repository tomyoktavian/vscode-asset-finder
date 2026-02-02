import { useAssetStore } from "../../store/useAssetStore";
import { CheckCircle2 } from "lucide-react";

export const Toast: React.FC = () => {
  const toast = useAssetStore((state) => state.toast);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg border border-primary/20 backdrop-blur-md">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-xs font-medium">{toast.message}</span>
      </div>
    </div>
  );
};
