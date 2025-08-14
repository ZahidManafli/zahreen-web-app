import React, { useEffect, useState } from "react";
// import Navbar from "@/components/Navbar";
import api from "../../api";
import Swal from "sweetalert2";

const ROLE_OPTIONS = {
  all: "Hamısı",
  student: "Şagird",
  teacher: "Müəllim",
  parent: "Valideyn",
  admin: "Admin",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setRole(parsed.role?.toLowerCase());
      }
      fetchUsers();
    };
    loadUser();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("get-all-user/");
      setUsers(response.data.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "İstifadəçiləri yükləmək mümkün olmadı.",
      });
    }
  };

  const parents = users.filter((u) => u.role === "parent");

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  const openAssignModal = (studentId, currentParentId) => {
    setSelectedStudentId(studentId);
    setSelectedParentId(currentParentId || "");
    setModalVisible(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedStudentId || !selectedParentId) return;
    setAssigning(true);
    try {
      await api.post("assign-parent-to-student/", {
        student: Number(selectedStudentId),
        parent: Number(selectedParentId),
      });
      await fetchUsers();
      setModalVisible(false);
      Swal.fire({
        icon: "success",
        title: "Uğur",
        text: "Valideyn uğurla təyin edildi.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Valideyni təyin etmək mümkün olmadı.",
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50 flex flex-col items-center">
      <div className="w-full mx-auto bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#1b7793] mb-8 text-center">İstifadəçilər</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <label className="font-semibold text-gray-700">Rol üzrə süzgəc:</label>
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {Object.entries(ROLE_OPTIONS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="text-lg font-semibold text-[#1b7793] mb-2">
                  👤 {user.first_name} {user.last_name}
                </div>
                <div className="text-gray-700 mb-1">
                  🎭 Rol: {ROLE_OPTIONS[user.role]}
                </div>
                {user.role === "student" && (
                  <>
                    <div className="text-gray-700 mb-1">
                      🧑‍🤝‍🧑 Valideyn:{" "}
                      {user.parents && user.parents.length > 0
                        ? user.parents.map((p) => p.first_name + " " + p.last_name).join(", ")
                        : "Təyin edilməyib"}
                    </div>
                    <button
                      className="bg-[#1b7793] hover:bg-[#1b7793] text-white font-semibold py-2 px-4 rounded-lg mt-2"
                      onClick={() => openAssignModal(user.id, user.parents?.[0]?.id || "")}
                    >
                      Valideyn Təyin Et
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Assign Parent Modal */}
      {modalVisible && (
          <div className="fixed inset-0 bg-black opacity-20 rounded-2xl z-40 flex items-center justify-center"></div>
        )}
      {modalVisible && (
        <div className="fixed inset-0 w-[100%] h-[100%] z-41 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Valideyn seçin</h3>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 mb-4"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
            >
              <option value="">Valideyn seçin</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
            <div className="flex gap-4 mt-4">
              <button
                className="flex-1 bg-gray-600 text-white font-semibold py-2 rounded-lg"
                onClick={() => setModalVisible(false)}
              >
                İmtina
              </button>
              <button
                className={`flex-1 bg-[#1b7793] text-white font-semibold py-2 rounded-lg ${!selectedParentId || assigning ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={handleConfirmAssign}
                disabled={!selectedParentId || assigning}
              >
                {assigning ? "Təyin edilir..." : "Təyin Et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}