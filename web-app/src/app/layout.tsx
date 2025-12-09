import { AppSidebar } from "../components/app-sidebar";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <SidebarProvider>
        <main className="flex flex-1">
          <AppSidebar />

          {/* Main page content */}
          <div className="flex-1 p-4">
            <SidebarTrigger />
            {children}
          </div>
        </main>
      </SidebarProvider>

      <Footer />
    </div>
  );
}
