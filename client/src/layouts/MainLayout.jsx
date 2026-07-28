import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <>
      <Navbar />

      <main className="w-full overflow-x-clip">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}