import React, { useEffect, useState } from "react";
import api from "../../api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const WEEKDAYS = ["B.e", "Ç.a", "Ç.", "C.a", "C.", "Ş.", "B."];

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [schedules, setSchedules] = useState([
    { day_of_week: 0, start_time: "", end_time: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [studentModalVisible, setStudentModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectRes, teacherRes, studentRes] = await Promise.all([
          api.get("subject-list/"),
          api.get("users-by-role/teacher/"),
          api.get("users-by-role/student/"),
        ]);
        setSubjects(subjectRes.data.data);
        setTeachers(teacherRes.data.data);
        setStudents(studentRes.data.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Məlumatları yükləmək mümkün olmadı.",
        });
      }
    };
    fetchData();
  }, []);

  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleAddSchedule = () => {
    setSchedules((prev) => [
      ...prev,
      { day_of_week: 0, start_time: "", end_time: "" },
    ]);
  };

  const handleScheduleChange = (idx, field, value) => {
    setSchedules((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !name ||
      !selectedSubject ||
      !selectedTeacher ||
      selectedStudents.length === 0
    ) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Zəhmət olmasa bütün sahələri doldurun.",
      });
      return;
    }
    setLoading(true);
    try {
      await api.post("groups/create/", {
        name,
        subject: selectedSubject,
        teacher: selectedTeacher,
        students: selectedStudents,
        schedules,
      });
      Swal.fire({
        icon: "success",
        title: "Uğur",
        text: "Qrup yaradıldı.",
      });
      setName("");
      setSelectedSubject("");
      setSelectedTeacher("");
      setSelectedStudents([]);
      setSchedules([{ day_of_week: 0, start_time: "", end_time: "" }]);
      navigate("/groups");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Qrup yaratmaq mümkün olmadı.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-8">
      <div className="w-full mx-auto bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#1b7793] mb-8 text-center">Yeni Qrup Yarat</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Qrup Adı</label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Məsələn: Riyaziyyat A"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Fənn</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Fənn seçin</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Müəllim</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">Müəllim seçin</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Şagirdlər</label>
            <button
              type="button"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-left"
              onClick={() => setStudentModalVisible(true)}
            >
              {selectedStudents.length > 0
                ? students
                    .filter((s) => selectedStudents.includes(s.id))
                    .map((s) => s.first_name + " " + s.last_name)
                    .join(", ")
                : "Şagird seçin"}
            </button>
          </div>
          {/* Modal for student selection */}
          {studentModalVisible && (
          <div className="fixed inset-0 bg-black opacity-20 rounded-2xl z-40 flex items-center justify-center"></div>
        )}
          {studentModalVisible && (
            <div className="fixed inset-0 w-[100%] h-[100%] z-41 flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto shadow-2xl">
                <h3 className="text-lg font-bold mb-4">Şagirdləri seçin</h3>
                <ul className="flex flex-col gap-2">
                  {students.map((student) => {
                    const selected = selectedStudents.includes(student.id);
                    return (
                      <li
                        key={student.id}
                        className={`px-4 py-2 rounded-lg cursor-pointer ${
                          selected
                            ? "bg-blue-100 font-semibold"
                            : "bg-gray-100"
                        }`}
                        onClick={() => toggleStudentSelection(student.id)}
                      >
                        {student.first_name} {student.last_name}
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  className="w-full mt-6 bg-[#1b7793] text-white font-bold py-2 rounded-lg"
                  onClick={() => setStudentModalVisible(false)}
                >
                  Bağla
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="block font-semibold mb-2">Dərs Cədvəli</label>
            <div className="space-y-4">
              {schedules.map((sched, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-2 items-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <select
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
                    value={sched.day_of_week}
                    onChange={(e) =>
                      handleScheduleChange(idx, "day_of_week", Number(e.target.value))
                    }
                  >
                    {WEEKDAYS.map((day, i) => (
                      <option key={i} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
                    value={sched.start_time}
                    onChange={(e) =>
                      handleScheduleChange(idx, "start_time", e.target.value)
                    }
                    placeholder="Başlama saatı"
                  />
                  <input
                    type="time"
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
                    value={sched.end_time}
                    onChange={(e) =>
                      handleScheduleChange(idx, "end_time", e.target.value)
                    }
                    placeholder="Bitmə saatı"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full mt-3 bg-gray-600 text-white font-bold py-2 rounded-lg"
              onClick={handleAddSchedule}
            >
              ➕ Cədvəl Əlavə Et
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-[#1b7793] hover:bg-[#1b7793] text-white font-bold py-3 rounded-xl shadow-lg mt-6 transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Yaradılır..." : "Qrup Yarat"}
          </button>
        </form>
      </div>
    </div>
  );
}