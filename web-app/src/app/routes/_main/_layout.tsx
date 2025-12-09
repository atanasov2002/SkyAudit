import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { Outlet } from "react-router";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
