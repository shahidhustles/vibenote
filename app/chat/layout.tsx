import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Atkinson_Hyperlegible } from "next/font/google";

const hyperlegible = Atkinson_Hyperlegible({
  weight: "400",
  subsets: ["latin"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className={hyperlegible.className}>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <SidebarTrigger />
        <div className="flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
}
