import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Atkinson_Hyperlegible } from "next/font/google";

const hyperlegible = Atkinson_Hyperlegible({
  weight: "400",
  subsets: ["latin"],
});

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <SidebarProvider className={hyperlegible.className}>
      <AppSidebar />
      <main className="flex-1 flex flex-col bg-gray-50">
        <SidebarTrigger />
        <div className="flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
}
