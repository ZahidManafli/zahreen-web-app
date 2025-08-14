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

  return (
    <div className="w-full flex flex-col items-center pt-0">
      <div className="w-full mx-auto bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#1b7793] mb-8 text-center">Mənim Qruplarım</h2>
        {canCreateGroup && (
          <button
            className="w-max bg-gradient-to-r from-[#1b7793] to-indigo-500 hover:from-[#1b7793] hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg mb-8 transition-all duration-200"
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
                <div key={item.group_id} className="bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col">
                  <div className="mb-2">
                    <div className="font-semibold text-[#1b7793] text-lg mb-1">📘 {item.group_name}</div>
                    <div className="text-gray-700 mb-1">📚 Fənn: {subjectName}</div>
                    <div className="text-gray-700 mb-1">👨‍🏫 Müəllim: {teacherName}</div>
                    <button
                      className="text-[#1b7793] font-semibold mt-2"
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
                              {WEEKDAYS[sch.day_of_week]} – {sch.start_time.slice(0,5)} - {sch.end_time.slice(0,5)}
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
    </div>
  );
}