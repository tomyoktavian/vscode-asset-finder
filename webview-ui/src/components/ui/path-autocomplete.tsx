import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PathAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  prefix?: string;
  onEnter?: () => void;
  className?: string;
}

export function PathAutocomplete({
  value,
  onChange,
  options,
  placeholder = "Search path...",
  prefix = "INC",
  onEnter,
  className,
}: PathAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Split value by comma and clean up
  const selectedItems = React.useMemo(() => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }, [value]);

  const groupedOptions = React.useMemo(() => {
    if (!inputValue || inputValue.trim() === "")
      return { extensions: [], folders: [], files: [] };
    const search = inputValue.toLowerCase();
    const filtered = options.filter(
      (opt) =>
        opt.toLowerCase().includes(search) && !selectedItems.includes(opt),
    );

    const extensions: string[] = [];
    const folders: string[] = [];
    const files: string[] = [];

    filtered.forEach((opt) => {
      if (opt.startsWith("*.")) {
        extensions.push(opt);
      } else if (opt.includes(".") && !opt.startsWith(".")) {
        files.push(opt);
      } else {
        folders.push(opt);
      }
    });

    return { extensions, folders, files };
  }, [options, inputValue, selectedItems]);

  const hasMatches =
    groupedOptions.extensions.length > 0 ||
    groupedOptions.folders.length > 0 ||
    groupedOptions.files.length > 0;

  const handleSelect = (item: string) => {
    const newItems = [...selectedItems, item];
    onChange(newItems.join(", ") + ", ");
    setInputValue("");
    setOpen(false);
    // Use timeout to ensure store state is updated before scan
    setTimeout(() => onEnter?.(), 0);
  };

  const handleRemove = (itemToRemove: string) => {
    const newItems = selectedItems.filter((item) => item !== itemToRemove);
    onChange(
      newItems.length > 1 ? newItems.join(", ") + ", " : newItems.join(", "),
    );
    inputRef.current?.focus();
    // Automatically trigger scan after removing an item
    setTimeout(() => onEnter?.(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (inputValue.trim()) {
        handleSelect(inputValue.trim());
      } else {
        setOpen(false);
        onEnter?.();
      }
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      selectedItems.length > 0
    ) {
      handleRemove(selectedItems[selectedItems.length - 1]);
    }
  };

  return (
    <div className={cn("relative flex-1 min-h-[32px] group", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex flex-wrap items-center gap-1.5 w-full pl-9 pr-3 py-1.5 text-[10px] bg-muted/10 border-border/20 rounded-md border focus-within:border-primary/40 focus-within:bg-muted/20 transition-all cursor-text",
              prefix === "EXC" && "focus-within:border-destructive/40",
            )}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="absolute left-2.5 top-3 -translate-y-1/2 text-[8px] font-black tracking-tighter pointer-events-none z-10 transition-colors">
              <span
                className={cn(
                  prefix === "INC" ? "text-primary/60" : "text-destructive/60",
                )}
              >
                {prefix}
              </span>
            </div>

            {selectedItems.map((item) => (
              <Badge
                key={item}
                variant={prefix === "INC" ? "default" : "secondary"}
                className="h-5 px-1.5 text-[9px] hover:bg-destructive/10 hover:text-destructive tracking-wider animate-in fade-in zoom-in-95 shrink-0"
              >
                {item}
                <button
                  type="button"
                  className="ml-1 hover:bg-black/20 rounded-full transition-colors p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}

            <input
              ref={inputRef}
              type="text"
              placeholder={selectedItems.length === 0 ? placeholder : ""}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (e.target.value && !open) setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none min-w-[60px] placeholder:text-muted-foreground/30 px-1"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 border-border/30 shadow-2xl w-(--radix-popover-trigger-width)"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command className="bg-popover" shouldFilter={false}>
            <CommandList className="scrollbar-hide max-h-[300px] p-1">
              {!hasMatches && inputValue && (
                <CommandEmpty className="py-2 text-[10px] text-center text-muted-foreground italic">
                  No matches found.
                </CommandEmpty>
              )}

              {groupedOptions.extensions.length > 0 && (
                <CommandGroup heading="Formats / Extensions">
                  {groupedOptions.extensions.map((opt) => (
                    <CommandItem
                      key={opt}
                      value={opt}
                      onSelect={() => handleSelect(opt)}
                      className="text-[10px] py-1.5 px-2 cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      <span className="font-mono text-primary mr-2 uppercase">
                        {opt}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {groupedOptions.folders.length > 0 && (
                <CommandGroup heading="Folders">
                  {groupedOptions.folders.map((opt) => (
                    <CommandItem
                      key={opt}
                      value={opt}
                      onSelect={() => handleSelect(opt)}
                      className="text-[10px] py-1.5 px-2 cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      <span className="truncate">{opt}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {groupedOptions.files.length > 0 && (
                <CommandGroup heading="Files">
                  {groupedOptions.files.map((opt) => {
                    const parts = opt.split("/");
                    const name = parts.pop();
                    const dir = parts.join("/");

                    return (
                      <CommandItem
                        key={opt}
                        value={opt}
                        onSelect={() => handleSelect(opt)}
                        className="text-[10px] py-2 px-2 cursor-pointer hover:bg-primary/10 transition-all flex flex-col items-start gap-0.5"
                      >
                        <span className="font-bold text-foreground text-[10px]">
                          {name}
                        </span>
                        {dir && (
                          <span className="text-muted-foreground/60 text-[8px] truncate max-w-full italic">
                            {dir}/
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
