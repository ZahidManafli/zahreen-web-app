import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/navbar";
import SidebarMenu from "./Sidebar/sidebar";
import clsx from 'clsx';


const MainLayout = () => {
  const [flag, setFlag] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // For mobile toggle

  const handleChildData = (data) => {
    setFlag(data);
  };

  return (
    <div className="h-screen flex w-[100%] justify-between">
      {/* Navbar - Yuxarı hissə */}
      <aside className="hidden md:block w-[85px] border-r p-4 overflow-y-auto sticky">
        <SidebarMenu sendToParent={handleChildData} />
      </aside>

      {/* Mobile Sidebar (slide-in) */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="fixed top-0 left-0 w-[100%] h-full bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarMenu
              sendToParent={handleChildData}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={clsx(
          "flex flex-col h-full relative transition-all overflow-hidden w-full",
          flag && "md:w-[calc(100%-260px)]"
        )}
      >
        {/* Navbar */}
        <div className="z-10 w-[100%] bg-gray-50">
          <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
