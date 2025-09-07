import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  name: string;
  icon: LucideIcon;
  current?: boolean;
  onClick?: () => void;
}

interface NavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function Navigation({ items, className }: NavigationProps) {
  return (
    <nav className={cn("flex justify-center space-x-1 p-2", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.name}
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl px-4 py-3 text-xs font-medium transition-all duration-200",
              "min-w-[80px] gap-1",
              item.current
                ? "bg-primary text-primary-foreground shadow-lg button-glow"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}