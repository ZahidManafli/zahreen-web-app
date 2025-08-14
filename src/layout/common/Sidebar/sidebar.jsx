import React, { useState, useEffect } from "react";
import "./sidebar.css";
import ZRlogo from "../../../assets/zahreenn.png";
import { useNavigate } from "react-router-dom";
export default function SidebarMenu({ sendToParent }) {

  const [role, setRole] = useState(null);

  const navigate = useNavigate();
  const sendData = (value) => {
    sendToParent(value);
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setRole(parsed.role?.toLowerCase());
    }
  }, []);

  const menus = [
    { name: "Əsas Səhifə", icon: "home", path: "/" },
    { name: "Kurslar", icon: "school", path: "/courses" },
    { name: "Testlər", icon: "quiz", path: "/tests" },
    { name: "Cədvəl", icon: "calendar_today", path: "/schedule" },
    { name: "Qruplar", icon: "group", path: "/groups" },
    { name: "Fənlər", icon: "subject", path: "/subjects" },
    role === "student"
      ? { name: "Valideynlərim", icon: "people", path: "/parents" }
      : role === "parent"
      ? { name: "Övladlarım", icon: "people", path: "/children" }
      : null,
  ].filter(Boolean);

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <div
      className="menu"
      onMouseEnter={() => sendData(true)}
      onMouseLeave={() => sendData(false)}
    >
      <ul className="menu-content">
        <img src={ZRlogo} alt="logo" className="w-20 h-20 mb-5" />
        {menus.map((menu, index) => (
          <li
            key={index}
            className="menu-item"
            style={{ cursor: "pointer" }}
            onClick={() => handleMenuClick(menu.path)}
          >
            <a href="#">
              <span className="material-symbols-outlined">{menu.icon}</span>
              <span className="menu-headers">{menu.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}