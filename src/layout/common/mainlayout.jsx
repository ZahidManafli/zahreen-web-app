import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/navbar";
import SidebarMenu from "./Sidebar/sidebar";
import clsx from 'clsx';


const MainLayout = () => {
  const [flag, setFlag] = useState(false);

  const handleChildData = (data) => {
    setFlag(data);
  };

  return (
    <div className="h-screen flex w-[100%] justify-between">
      {/* Navbar - Yuxarı hissə */}
      <aside className="w-[1%] border-r p-4 overflow-y-auto sticky">
        <SidebarMenu sendToParent={handleChildData} />
      </aside>

      {/* Main bölmə: Sidebar və Content */}
      <div
        className={clsx(
          "flex flex-col justify-end h-[100%] relative transition-all overflow-hidden",
          flag ? "w-[83%]" : "w-[95%]"
        )}
      >
        {/* Sidebar */}
        <div className="w-[100%] shadow z-10 absolute top-0">
          <Navbar />
        </div>

        {/* Content */}
        <main className="w-[100%] h-[90%] overflow-y-auto p-4 bg-gray-50">

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
