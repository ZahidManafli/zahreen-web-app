import React from "react";
import "./sidebar.css"; // CSS faylını ayrıca saxlayırsan
import ZRlogo from "../../../assets/zahreenn.png";
export default function SidebarMenu({ sendToParent }) {

  const sendData = (value) => {
    sendToParent(value);
  };

  return (
    <div className="menu" onMouseEnter={()=>sendData(true)} onMouseLeave={()=>sendData(false)}>
      <ul className="menu-content">
        <img src={ZRlogo} alt="logo" className="logo" />
        <li>
          <a href="#">
            <span className="material-symbols-outlined">home</span>
            <span className="menu-headers">Home</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="menu-headers">DashBoard</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span className="material-symbols-outlined">explore</span>
            <span className="menu-headers">Explore</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="menu-headers">Analytics</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="menu-headers">Settings</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span className="material-symbols-outlined">person</span>
            <span className="menu-headers">Account</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span className="material-symbols-outlined">report</span>
            <span className="menu-headers">Report</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span className="material-symbols-outlined">email</span>
            <span className="menu-headers">Contact</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span className="material-symbols-outlined">logout</span>
            <span className="menu-headers">Logout</span>
          </a>
        </li>
      </ul>
    </div>
  );
}
