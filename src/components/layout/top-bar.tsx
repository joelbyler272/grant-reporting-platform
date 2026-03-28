import { Bell } from "lucide-react";

interface TopBarProps {
  title: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        {actions}
        <button className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted">
          <Bell className="size-5" />
        </button>
      </div>
    </header>
  );
}
