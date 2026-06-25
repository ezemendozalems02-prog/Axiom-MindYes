import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { QuickCaptureDialog } from "@/components/layout/quick-capture-dialog";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      <CommandPalette />
      <QuickCaptureDialog />
    </div>
  );
}
