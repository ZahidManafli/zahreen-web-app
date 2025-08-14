import React, { useEffect, useState } from "react";
import api from "../../api";
import Swal from "sweetalert2";

const ROLE_LABELS = {
  teacher: "Müəllim",
  student: "Şagird",
  parent: "Valideyn",
  admin: "Direktor",
  superadmin: "Super Admin",
  repititor: "Repititor",
  guest: "Qonaq",
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire({ icon: "error", title: "Xəta", text: "Zəhmət olmasa bütün xanaları doldurun." });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: "error", title: "Xəta", text: "Yeni şifrə və təkrar uyğun gəlmir." });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password/", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      Swal.fire({ icon: "success", title: "Uğurlu", text: "Şifrə yeniləndi." });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowResetForm(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: error.response?.data?.detail || "Şifrə yenilənmədi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace("/Login");
  };

  if (!user) return null;

  return (
    <div className="w-full  flex flex-col items-center">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8 flex flex-col items-center">
        {/* for user icon design */}
        <i className="fa-solid fa-user text-6xl text-[#1b7793] mb-4"></i>
        
        {/* <i class="fa-solid fa-user text-white"></i> */}
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {user.first_name} {user.last_name}
        </div>
        <div className="text-base text-[#1b7793] font-semibold mb-6">
          {ROLE_LABELS[user.role] || "Qonaq"}
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl shadow px-4 py-3 mb-6 w-full">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12v1a4 4 0 01-8 0v-1m8 0V7a4 4 0 00-8 0v5m8 0H8"></path></svg>
          <span className="text-gray-700">{user.email || "Email not set"}</span>
        </div>
        {!showResetForm && (
          <button
            className="cursor-pointer w-full bg-[#1b7793] hover:bg-[#1b7793] text-white font-bold py-3 rounded-xl shadow mb-4 transition"
            onClick={() => setShowResetForm(true)}
          >
            Şifrəni yenilə
          </button>
        )}
        {showResetForm && (
          <form className="w-full bg-white rounded-xl shadow p-6 mb-4" onSubmit={handlePasswordReset}>
            <input
              type="password"
              placeholder="Köhnə şifrə"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Yeni şifrə"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Yeni şifrənin təkrarı"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="cursor-pointer bg-[#1b7793] hover:bg-[#1b7793] text-white font-bold py-2 px-6 rounded-xl shadow transition"
                disabled={loading}
              >
                {loading ? "Yüklənir..." : "Yenilə"}
              </button>
              <button
                type="button"
                className="cursor-pointer bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-xl transition"
                onClick={() => setShowResetForm(false)}
                disabled={loading}
              >
                Ləğv et
              </button>
            </div>
          </form>
        )}
        <button
          className="cursor-pointer w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow mt-6 transition"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}