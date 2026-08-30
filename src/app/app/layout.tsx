import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/session";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { BottomNav } from "@/components/shell/BottomNav";
import { CommandPalette } from "@/components/palette/CommandPalette";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh bg-[var(--bg)]">
      <ThemeProvider />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4 md:pb-6">{children}</main>
      </div>
      <BottomNav />
      <CommandPalette />
    </div>
  );
}
