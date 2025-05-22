import Header from "@/components/Header"
import NavigationBar from "@/components/NavigationBar";

import { FC, PropsWithChildren } from "react"


const AdminLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden">
  {/* Header arriba */}
  <Header />

  {/* Contenido principal: Sidebar izquierda + contenido */}
  <div className="flex flex-1 overflow-hidden">
    {/* Sidebar izquierda */}
    <NavigationBar />

    {/* Contenido principal a la derecha */}
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  </div>
</div>

  );
};

export default AdminLayout;