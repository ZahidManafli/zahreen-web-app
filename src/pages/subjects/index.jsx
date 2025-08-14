import React, { useEffect, useState } from "react";
import api from "../../api";
import Swal from "sweetalert2";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create Subject Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");

  // Assign Teacher Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setRole(parsed.role?.toLowerCase());
      }
      const [subRes, teacherRes] = await Promise.all([
        api.get("subject-list/"),
        // check if the user is admin or repititor to fetch teachers
        role === "admin" || role === "repititor"
          ? api.get("users-by-role/teacher/")
          : Promise.resolve({ data: { data: [] } }),
      ]);
      setSubjects(subRes.data.data);
      setTeachers(teacherRes.data.data);
    } catch (err) {
      //pass
    }
    setLoading(false);
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await api.post("create-subject/", {
        name: newSubjectName.trim(),
        description: newSubjectDesc.trim(),
      });
      setCreateModalVisible(false);
      setNewSubjectName("");
      setNewSubjectDesc("");
      await loadData();
      Swal.fire({
        icon: "success",
        title: "Uğur",
        text: "Fənn yaradıldı.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Fənn yaratmaq mümkün olmadı.",
      });
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedSubjectId || !selectedTeacherId) return;
    try {
      await api.post("assign-subject/", {
        subject: selectedSubjectId,
        teacher: selectedTeacherId,
      });
      setAssignModalVisible(false);
      setSelectedSubjectId(null);
      setSelectedTeacherId(null);
      await loadData();
      Swal.fire({
        icon: "success",
        title: "Uğur",
        text: "Müəllim fənnə təyin edildi.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Müəllimi fənnə təyin etmək mümkün olmadı.",
      });
    }
  };

  return (
    <div className="w-full  flex flex-col items-center">
      <div className="w-full mx-auto bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#1b7793] mb-8 text-center">Fənnlər</h2>
        {(role === "admin" || role === "repititor") && (
          <button
            className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl shadow mb-8"
            onClick={() => setCreateModalVisible(true)}
          >
            Yeni Fənn Yarat
          </button>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-[#1b7793] text-lg font-medium animate-pulse">Yüklənir...</span>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-gray-500 text-center">Heç bir fənn tapılmadı.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col justify-between">
                <div>
                  <div className="text-lg font-semibold text-[#1b7793] mb-2">📚 {subject.name}</div>
                  <div className="text-gray-700 mb-1">📝 {subject.description}</div>
                  <div className="text-gray-700 mb-2">
                    👨‍🏫 Müəllim:{" "}
                    {subject.teacher !== "No teacher assigned"
                      ? subject.teacher
                      : "Təyin olunmayıb"}
                  </div>
                </div>
                {(role === "admin") && (
                  <button
                    className="bg-[#1b7793] hover:bg-[#1b7793] text-white font-semibold py-2 px-4 rounded-lg mt-2"
                    onClick={() => {
                      setSelectedSubjectId(subject.id);
                      setSelectedTeacherId(subject.teacher?.id || "");
                      setAssignModalVisible(true);
                    }}
                  >
                    Müəllim Təyin Et
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      {createModalVisible && (
          <div className="fixed inset-0 bg-black opacity-20 rounded-2xl z-40 flex items-center justify-center"></div>
        )}
      {createModalVisible && (
        <div className="fixed inset-0 w-[100%] h-[100%] z-41 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Yeni Fənn</h3>
            <input
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 mb-4"
              placeholder="Ad"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 mb-4"
              placeholder="Təsvir"
              value={newSubjectDesc}
              onChange={(e) => setNewSubjectDesc(e.target.value)}
              rows={3}
            />
            <div className="flex gap-4 mt-4">
              <button
                className="flex-1 bg-gray-600 text-white font-semibold py-2 rounded-lg"
                onClick={() => setCreateModalVisible(false)}
              >
                İmtina
              </button>
              <button
                className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg"
                onClick={handleCreateSubject}
              >
                Yarat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {assignModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Müəllim Seçin</h3>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 mb-4"
              value={selectedTeacherId || ""}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
            >
              <option value="">Müəllim seçin</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </option>
              ))}
            </select>
            <div className="flex gap-4 mt-4">
              <button
                className="flex-1 bg-gray-600 text-white font-semibold py-2 rounded-lg"
                onClick={() => setAssignModalVisible(false)}
              >
                İmtina
              </button>
              <button
                className="flex-1 bg-[#1b7793] text-white font-semibold py-2 rounded-lg"
                onClick={handleAssignTeacher}
              >
                Təyin Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}