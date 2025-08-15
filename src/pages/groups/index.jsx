import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const WEEKDAYS = [
  "Bazar ertəsi",      // 0
  "Çərşənbə axşamı",   // 1
  "Çərşənbə",          // 2
  "Cümə axşamı",       // 3
  "Cümə",              // 4
  "Şənbə",             // 5
  "Bazar",             // 6
];

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [expandedGroupIds, setExpandedGroupIds] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "add" or "delete"
  const [modalGroup, setModalGroup] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const getRole = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setRole(parsed.role?.toLowerCase());
      }
    };
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await api.get("groups/");
        setGroups(res.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Qrupları yükləmək mümkün olmadı.",
        });
      }
      setLoading(false);
    };
    getRole();
    fetchGroups();
  }, []);

  const toggleExpand = (groupId) => {
    setExpandedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const canCreateGroup = ["admin", "repititor"].includes(role || "");

  // Open modal logic
  const openModal = async (type, group) => {
    setModalType(type);
    setModalGroup(group);
    setSelectedStudents([]);
    setSearchTerm("");

    try {
      if (type === "add") {
        const res = await api.get("users-by-role/student/");
        // Filter out already in group
        const existingIds = (group.students || []).map((s) => s.id);
        const filtered = res.data.data.filter((s) => !existingIds.includes(s.id));
        setStudentsList(filtered);
      } else if (type === "delete") {
        setStudentsList(group.students || []);
      }
      setModalOpen(true);
    } catch (err) {
      Swal.fire("Xəta", "Məlumatları yükləmək mümkün olmadı", "error");
    }
  };

  const handleStudentSelect = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const submitModal = async () => {
    if (!modalGroup) return;

    try {
      if (modalType === "add") {
        await api.post(`add-students-to-group/${modalGroup.group_id}/`, {
          students: selectedStudents,
        });
        Swal.fire("Uğurlu", "Tələbələr qrupa əlavə olundu", "success");
      } else if (modalType === "delete") {
        await api.post(`remove-students-from-group/${modalGroup.group_id}/`, {
          students: selectedStudents,
        });
        Swal.fire("Uğurlu", "Tələbələr qrupdan silindi", "success");
      }
      setModalOpen(false);
      // refresh groups
      const res = await api.get("groups/");
      setGroups(res.data);
    } catch (err) {
      Swal.fire("Xəta", "Əməliyyat yerinə yetirilə bilmədi", "error");
    }
  };

  // Filter list based on searchTerm
  const filteredStudents = studentsList.filter((stu) => {
    const fullName = `${stu.first_name} ${stu.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full flex flex-col items-center pt-0">
      <div className="w-full mx-auto bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#1b7793] mb-8 text-center">Mənim Qruplarım</h2>
        {canCreateGroup && (
          <button
            className="cursor-pointer w-max bg-gradient-to-r from-[#1b7793] to-indigo-500 hover:from-[#1b7793] hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg mb-8 transition-all duration-200"
            onClick={() => navigate("/CreateGroup")}
          >
            ➕ Qrup Yarat
          </button>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-[#1b7793] text-lg font-medium animate-pulse">Yüklənir...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-gray-500 text-center">Heç bir qrup tapılmadı.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((item) => {
              const memberCount = item.students?.length ?? 0;
              const subjectName = item.subject?.name ?? "Fənn tapılmadı";
              const teacherName = item.teacher
                ? `${item.teacher.first_name} ${item.teacher.last_name}`
                : "Təyin olunmayıb";
              const isExpanded = expandedGroupIds.includes(item.group_id);

              return (
                <div key={item.group_id} className="bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col relative">
                  {/* Dropdown Menu */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() =>
                        setDropdownOpen(dropdownOpen === item.group_id ? null : item.group_id)
                      }
                      className="cursor-pointer p-1 rounded-full hover:bg-gray-200"
                    >
                      ⋮
                    </button>
                    {dropdownOpen === item.group_id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                        <button
                          className="w-[100%] text-left cursor-pointer block px-4 py-2 text-[16px] text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-cyan-800 transition-colors duration-150"
                          onClick={() => {
                            setDropdownOpen(null);
                            openModal("add", item);
                          }}
                        >
                          Tələbə əlavə et
                        </button>
                        <button
                          className="w-[100%] text-left cursor-pointer block px-4 py-2 text-[16px] text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-cyan-800 transition-colors duration-150"
                          onClick={() => {
                            setDropdownOpen(null);
                            openModal("delete", item);
                          }}
                        >
                          Tələbə sil
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="font-semibold text-[#1b7793] text-lg mb-1">📘 {item.group_name}</div>
                    <div className="text-gray-700 mb-1">📚 Fənn: {subjectName}</div>
                    <div className="text-gray-700 mb-1">👨‍🏫 Müəllim: {teacherName}</div>
                    <button
                      className="text-[#1b7793] font-semibold mt-2 cursor-pointer"
                      onClick={() => toggleExpand(item.group_id)}
                    >
                      👥 Üzvlər: {memberCount} {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-4">
                      <div className="mb-3">
                        <div className="font-semibold text-gray-800 mb-2">Üzvlər:</div>
                        <ul className="list-disc pl-5">
                          {item.students?.map((student) => (
                            <li key={student.id} className="text-gray-700 text-sm mb-1">
                              {student.first_name} {student.last_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 mb-2">🗓️ Dərs Cədvəli:</div>
                        <ul className="pl-2">
                          {item.schedules?.map((sch) => (
                            <li key={sch.id} className="text-gray-700 text-sm mb-1">
                              {WEEKDAYS[sch.day_of_week]} – {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {modalType === "add" ? "Tələbə əlavə et" : "Tələbə sil"}
            </h3>

            {/* Search box */}
            <input
              type="text"
              placeholder="Axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 w-full rounded mb-3"
            />

            <div className="max-h-60 overflow-y-auto border p-2 rounded">
              {filteredStudents.map((stu) => (
                <label key={stu.id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(stu.id)}
                    onChange={() => handleStudentSelect(stu.id)}
                  />
                  <span>{stu.first_name} {stu.last_name}</span>
                </label>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-gray-500 text-sm">Heç bir tələbə tapılmadı</div>
              )}
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="cursor-pointer px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setModalOpen(false)}
              >
                Ləğv et
              </button>
              <button
                className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={submitModal}
              >
                Təsdiqlə
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
