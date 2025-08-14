import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./style.css";
import PasswordRules from "../../components/PasswordRules";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

export default function AuthCard() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [isloading, setIsLoading] = useState(false);
  const handleLoading = async (e) => {
    e.preventDefault();
    if (loading) return; // 2 dəfə klikləməyə qarşı qoruma

    // ... validasiya hissəsi
    setLoading(true);

    try {
      const response = await axios.post(
        `http://167.86.97.169/zahren/api/${url}/`,
        dataObj
      );

      // ... uğurlu cavab prosesi
    } catch (err) {
      // ... xəta mesajı
    } finally {
      setLoading(false);
    }
  };

  const blurTimeoutRef = useRef();
  const handleFocus = () => {
    clearTimeout(blurTimeoutRef.current);
    setShowPasswordRules(true);
  };
  const handleBlurForPass = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowPasswordRules(false);
    }, 100); // 100 ms gecikmə ilə gizlət
  };

  const [regData, setRegData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  /* --- REGEX-lər --- */
  const REGEX = {
    username:
      /^[AaBbCcÇçDdEeƏəFfGgĞğHhXxIıİiJjKkQqLlMmNnOoÖöPpRrSsŞşTtUuÜüVvYyZz]{3,20}$/,
    first_name:
      /^[AaBbCcÇçDdEeƏəFfGgĞğHhXxIıİiJjKkQqLlMmNnOoÖöPpRrSsŞşTtUuÜüVvYyZz]{3,20}$/,
    last_name:
      /^[AaBbCcÇçDdEeƏəFfGgĞğHhXxIıİiJjKkQqLlMmNnOoÖöPpRrSsŞşTtUuÜüVvYyZz]{3,20}$/,
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i,
    password: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\-_\+])[A-Za-z\d!@#\-_\+]{8,15}$/,
  };

  /* --- Validasiya --- */
  const validateField = (name, value, login) => {
    if (!value.trim()) return "Zəhmət olmasa, məlumatları daxil edin.";
    if (!login) {
      if (name === "first_name" && !REGEX.first_name.test(value))
        return "Ad yalnız hərflərdən ibarət olmalıdır.";
      if (name === "last_name" && !REGEX.last_name.test(value))
        return "Soyad yalnız hərflərdən ibarət olmalıdır.";
      if (name === "email" && !REGEX.email.test(value))
        return "Email düzgün formatda deyil.";
    }
    if (name === "password" && !REGEX.password.test(value))
      return "Şifrə ən azı 6 simvol olmalıdır.";
    return "";
  };

  const notify = (value) => toast.success(value);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((d) => ({ ...d, [name]: value }));
  };
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegData((d) => ({ ...d, [name]: value }));
  };

  const navigate = useNavigate();

 // ...existing code...
const handleSubmit = async (e) => {
  e.preventDefault();

  const login = e.target.closest(".login") !== null;
  const dataObj = login ? loginData : regData;
  const url = login ? "login" : "register";

  // Validation for login fields
  if (login && (!loginData.username || !loginData.password)) {
    Swal.fire({
      icon: "error",
      title: "Xəta",
      text: "Zəhmət olmasa bütün xanaları doldurun.",
      confirmButtonText: "Bağla",
    });
    return;
  }

  setIsLoading(true);

  try {
    const response = await axios.post(
      `http://167.86.97.169/zahren/api/${url}/`,
      dataObj
    );

    if (login && response.data) {
      let { access, refresh, user } = response.data;

      // Ensure role exists — otherwise default to 'guest'
      if (!user.role || user.role === "") {
        user.role = "guest";
      }

      // Save tokens and user info separately
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      navigate(`${user.role == 'guest' ? '/send-request' : '/'}`, { state: { name: user.first_name } });
    } else {
      Swal.fire({
        icon: "success",
        title: "Qeydiyyat uğurla tamamlandı!",
        text: "İstifadəçi məlumatlarınızı daxil edərək giriş edin.",
        confirmButtonText: "Əla",
      });
      setIsRegister(false);
      setRegData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
      });
    }
  } catch (error) {
    const errData = error?.response?.data;
    let errorMessage =
      errData?.detail ||
      (errData?.email && Array.isArray(errData.email)
        ? "Bu e-mail ilə qeydiyyat artıq mövcuddur."
        : "Giriş uğursuz oldu. Yenidən cəhd edin.");

    Swal.fire({
      icon: "error",
      title: "Xəta baş verdi",
      text: errorMessage,
      confirmButtonText: "Bağla",
    });
  } finally {
    setIsLoading(false);
  }
};
// ...existing code...


  const Field = ({ name, children }) => (
    <div className="field">
      {children}
      {errors[name] && <small className="error-message">{errors[name]}</small>}
    </div>
  );

  return (
    <div className={`container ${isRegister ? "active" : ""}`}>
      <ToastContainer />
      <div className="form-box login">
        <form className="login" onSubmit={handleSubmit} noValidate>
          <h1>Daxil ol</h1>

          <div className="input-box">
            <input
              type="email"
              name="username"
              placeholder="İstifadəçi adı"
              value={loginData.username}
              onChange={handleLoginChange}
            />
            <i className="bx bxs-user" />
            {errors.username && (
              <small className="text-red-500 text-sm mt-1 block">
                {errors.username}
              </small>
            )}
          </div>

          <div className="input-box">
            <input
              type={showPasswordLogin ? "text" : "password"}
              name="password"
              placeholder="Şifrə"
              value={loginData.password}
              onChange={handleLoginChange}
            />
            <i
              className={`bx ${
                showPasswordLogin ? "bx-show" : "bx-hide"
              } password-toggle`}
              onClick={() => setShowPasswordLogin((p) => !p)}
            />
          </div>

          <div className="forgot-link">
            <a href="#">Şifrənizi unutmusunuz?</a>
          </div>

          <button type="submit" className="btn flex justify-center items-center" disabled={isloading}>
            {isloading ? (
              <span className="flex items-center gap-2">
                <i className="bx bx-loader bx-spin text-lg" />
                Gözlənilir...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>

      <div className="form-box register">
        <form className="register" onSubmit={handleSubmit} noValidate>
          <h1>Qeydiyyat</h1>

          <div className="input-box">
            <input
              type="text"
              name="first_name"
              placeholder="Adınız"
              value={regData.first_name}
              onChange={handleRegisterChange}
            />
            <i className="bx bxs-user" />
            {errors.first_name && (
              <small className="text-red-500 text-sm mt-1 block">
                {errors.first_name}
              </small>
            )}
          </div>

          <div className="input-box">
            <input
              type="text"
              name="last_name"
              placeholder="Soyadınız"
              value={regData.last_name}
              onChange={handleRegisterChange}
            />
            <i className="bx bxs-user" />
            {errors.last_name && (
              <small className="text-red-500 text-sm mt-1 block">
                {errors.last_name}
              </small>
            )}
          </div>

          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={regData.email}
              onChange={handleRegisterChange}
            />
            <i className="bx bxs-envelope" />
            {errors.email && (
              <small className="text-red-500 text-sm mt-1 block">
                {errors.email}
              </small>
            )}
          </div>

          <div className="input-box">
            <input
              type={showPasswordRegister ? "text" : "password"}
              name="password"
              placeholder="Şifrə"
              value={regData.password}
              onChange={handleRegisterChange}
              onFocus={handleFocus}
              onBlur={handleBlurForPass}
            />
          </div>
          <div
            className={`password-rules-wrapper ${
              showPasswordRules ? "show" : "hide"
            }`}
            // blur zamanı itməsin deyə
          >
            <PasswordRules password={regData.password} />
          </div>

          <button type="submit" className="btn flex justify-center items-center" disabled={isloading}>
            {isloading ? (
              <span className="flex items-center gap-2">
                <i className="bx bx-loader bx-spin text-lg" />
                Gözlənilir...
              </span>
            ) : (
              "Qeydiyyat"
            )}
          </button>
        </form>
      </div>
      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Xoş gördük!</h1>
          <p>Hesabınız yoxdur?</p>
          <button
            className="btn register-btn"
            onClick={() => setIsRegister(true)}
          >
            Qeydiyyat
          </button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>Xoş gördük!</h1>
          <p>Hesabınız mövcuddur?</p>
          <button
            className="btn login-btn"
            onClick={() => setIsRegister(false)}
          >
            Daxil ol
          </button>
        </div>
      </div>
    </div>
  );
}
