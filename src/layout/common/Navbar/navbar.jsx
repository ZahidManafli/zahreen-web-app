import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role?.toLowerCase());
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownClick = (action) => {
    setDropdownOpen(false);
    switch (action) {
      case "profile":
        navigate("/profile");
        break;
      case "requests":
        navigate("/my-requests");
        break;
      case "users":
        navigate("/users");
        break;
      case "leaders":
        navigate("/leaders-table");
        break;
      case "logout":
        localStorage.clear();
        navigate("/login");
        break;
      default:
        break;
    }
  };

  return (
    <nav className="w-full shadow bg-white h-[80px]">
      <div className="flex items-center justify-between p-4">
        {/* Left Side: Logo & Hamburger */}
        <div className="flex items-center space-x-3">
          {/* Hamburger (only on mobile) */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-gray-600 rounded hover:bg-gray-100"
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>

          <a href="#" className="flex items-center space-x-3">
            <span className="text-3xl font-semibold text-cyan-600">Zahreenn</span>
          </a>
        </div>

        {/* Right Side: Profile */}
        <div className="flex items-center space-x-3">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex text-xl cursor-pointer bg-cyan-800 rounded-full p-3"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <i className="fa-solid fa-user text-white"></i>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                <ul className="py-2">
                  <li>
                    <a
                      href="#"
                      onClick={() => handleDropdownClick("profile")}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profil
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => handleDropdownClick("requests")}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sorğularım
                    </a>
                  </li>
                  {role !== "parent" && role !== "student" && (
                    <li>
                      <a
                        href="#"
                        onClick={() => handleDropdownClick("users")}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        İstifadəçilər
                      </a>
                    </li>
                  )}
                  <li>
                    <a
                      href="#"
                      onClick={() => handleDropdownClick("leaders")}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Liderlər cədvəli
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => handleDropdownClick("logout")}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Çıxış
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
