import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  // Çöldən klik olunduqda dropdown bağlansın
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
        // Clear user and redirect to login
        localStorage.clear();
        navigate("/login");
        break;
      default:
        break;
    }
  };

  return (
    <nav className="w-[100%] shadow  bg-white border-gray-200 dark:bg-white h-[80px]  ">
      <div className=" flex flex-wrap items-center justify-between p-4">
        {/* Logo */}
        <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-3xl font-semibold whitespace-nowrap text-cyan-600 dark:text-cyan-900">
            Zahreenn
          </span>
        </a>

        {/* Sağ künc - Profil və mobil menyu düyməsi */}
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {/* Profil şəkli */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex text-xl cursor-pointer bg-cyan-800 rounded-full md:me-0 focus:ring-3 focus:ring-cyan-900 dark:focus:ring-cyan-900 p-3"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <i className="fa-solid fa-user text-white"></i>
            </button>

            {/* Dropdown menyu */}
           {dropdownOpen && (
  <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-cyan-900">
    <ul className="py-2">
      <li>
        <a
          href="#"
          onClick={() => handleDropdownClick("profile")}
          className="block px-4 py-2 text-[16px] text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-cyan-800 transition-colors duration-150"
        >
          Profil
        </a>
      </li>
      <li>
        <a
          href="#"
          onClick={() => handleDropdownClick("requests")}
          className="block px-4 py-2 text-[16px] text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-cyan-800 transition-colors duration-150"
        >
          Sorğularım
        </a>
      </li>
      { (role !== "parent" && role !== 'student') && (
        <li>
          <a
            href="#"
            onClick={() => handleDropdownClick("users")}
            className="block px-4 py-2 text-[16px] text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-cyan-800 transition-colors duration-150"
          >
            İstifadəçilər
          </a>
        </li>
      )}
      <li>
        <a
          href="#"
          onClick={() => handleDropdownClick("leaders")}
          className="block px-4 py-2 text-[16px] text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-cyan-800 transition-colors duration-150"
        >
          Liderlər cədvəli
        </a>
      </li>
      <li>
        <a
          href="#"
          onClick={() => handleDropdownClick("logout")}
          className="block px-4 py-2 text-[16px] text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-cyan-800 transition-colors duration-150"
        >
          Çıxış
        </a>
      </li>
    </ul>
  </div>
)}

          </div>

          {/* Mobil menyu düyməsi */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

       
      </div>
    </nav>
  );
};

export default Navbar;
