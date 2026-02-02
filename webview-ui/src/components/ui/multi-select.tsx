import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  icon,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const toggleOption = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-[36px] p-1.5 text-[11px] bg-muted/10 border-border/30 hover:bg-muted/20 hover:border-border/60 transition-all rounded-lg group",
            className,
          )}
        >
          {icon && (
            <div className="p-1 px-1.5 rounded-full bg-muted/50 text-muted-foreground">
              {icon}
            </div>
          )}
          <div className="flex gap-1.5 flex-wrap items-center overflow-hidden">
            {selected.length > 0 ? (
              <>
                {selected.slice(0, 2).map((val) => (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="h-5 px-1.5 text-[9px] tracking-wider border-transparent bg-primary text-primary-foreground shadow-sm animate-in fade-in zoom-in-95"
                  >
                    {options.find((o) => o.value === val)?.label || val}
                    <button
                      className="ml-1.5 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring transition-opacity hover:opacity-100 opacity-70"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(val);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(val)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
                {selected.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 font-black text-[9px] bg-muted/60 text-muted-foreground border-border/20"
                  >
                    +{selected.length - 2}
                  </Badge>
                )}
              </>
            ) : (
              <span className="ml-1 text-muted-foreground/50 font-medium">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-30 ml-2 group-hover:opacity-100 transition-opacity" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0 shadow-2xl border-border/40"
        align="start"
      >
        <Command className="bg-popover text-popover-foreground">
          <div className="flex items-center border-b border-border/30 px-2 h-9">
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              className="border-none h-full text-[11px] focus:ring-0"
            />
          </div>
          <CommandList className="scrollbar-hide max-h-[240px] p-1">
            <CommandEmpty className="py-4 text-[10px] text-center text-muted-foreground italic">
              No results found.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange([]);
                }}
                className="text-[11px] tracking-tight py-1.5 cursor-pointer"
              >
                <div
                  className={cn(
                    "mr-3 flex h-3.5 w-3.5 items-center justify-center rounded-md border border-primary/50 transition-colors",
                    selected.length === 0
                      ? "bg-primary text-primary-foreground border-primary"
                      : "opacity-40",
                  )}
                >
                  <Check
                    className={cn(
                      "h-3 w-3",
                      selected.length === 0 ? "opacity-100" : "opacity-0",
                    )}
                  />
                </div>
                <span>All Options</span>
              </CommandItem>
              <Separator className="my-1 opacity-20" />
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="text-[11px] py-2 cursor-pointer transition-colors overflow-hidden"
                    title={option.label}
                  >
                    <div
                      className={cn(
                        "mr-3 flex h-3.5 w-3.5 items-center justify-center rounded-md border border-primary/50 transition-colors shrink-0",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "opacity-40",
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "transition-colors truncate",
                        isSelected
                          ? "font-bold text-primary"
                          : "text-foreground font-medium",
                      )}
                    >
                      {option.label}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
