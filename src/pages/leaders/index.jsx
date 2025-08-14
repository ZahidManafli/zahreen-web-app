import React, { useEffect, useState } from "react";
import api from "../../api";
import Swal from "sweetalert2";

const periodLabels = {
  today: "Bugün",
  weekly: "Həftəlik",
  total: "Ümumi",
};

export default function Leaderboard() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [period, setPeriod] = useState("today");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [courseRes, subjectRes] = await Promise.all([
          api.get("/course-list/"),
          api.get("/subject-list/"),
        ]);
        setCourses(courseRes.data.data || []);
        setSubjects(subjectRes.data.data || []);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Verilər yüklənərkən xəta baş verdi.",
        });
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedCourse || !selectedSubject || !period) return;
      setLoading(true);
      try {
        const res = await api.get(
          `/leaderboard/${selectedCourse}/${selectedSubject}/${period}/`
        );
        setLeaderboard(res.data || []);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Liderlər yüklənərkən xəta baş verdi.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedCourse, selectedSubject, period]);

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mx-auto bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#1b7793] mb-8 text-center">🏆 Liderlər Cədvəli</h2>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block font-semibold mb-2">Kurs seçin:</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
              value={selectedCourse}
              onChange={e => {
                setSelectedCourse(e.target.value);
                setSelectedSubject("");
              }}
            >
              <option value="">Seçin</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Fənn seçin:</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">Seçin</option>
              {subjects
                .filter(s => String(s.course) === String(selectedCourse))
                .map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Zaman:</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              {Object.entries(periodLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Podium */}
        <div className="flex justify-center items-end gap-4 mb-8">
          <div className="flex flex-col items-center justify-end bg-[#C0C0C0] rounded-xl w-28 h-36 shadow-lg">
            {topThree[1] && (
              <>
                <div className="text-2xl font-bold text-white">2</div>
                <div className="text-base text-center font-semibold text-gray-800 mt-2">{topThree[1].full_name}</div>
                <div className="text-sm text-gray-700 mt-1">{topThree[1].score_percentage}%</div>
              </>
            )}
          </div>
          <div className="flex flex-col items-center justify-end bg-[#FFD700] rounded-xl w-32 h-44 shadow-xl border-2 border-yellow-400">
            {topThree[0] && (
              <>
                <div className="text-3xl font-extrabold text-white">1</div>
                <div className="text-lg text-center font-bold text-gray-900 mt-2">{topThree[0].full_name}</div>
                <div className="text-base text-gray-800 mt-1">{topThree[0].score_percentage}%</div>
              </>
            )}
          </div>
          <div className="flex flex-col items-center justify-end bg-[#cd7f32] rounded-xl w-28 h-36 shadow-lg">
            {topThree[2] && (
              <>
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-base text-center font-semibold text-gray-800 mt-2">{topThree[2].full_name}</div>
                <div className="text-sm text-gray-700 mt-1">{topThree[2].score_percentage}%</div>
              </>
            )}
          </div>
        </div>
        {/* Others Table */}
        {others.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white rounded-xl shadow border border-gray-200">
              <thead>
                <tr className="bg-[#1b7793] text-white">
                  <th className="py-2 px-4 rounded-tl-xl">№</th>
                  <th className="py-2 px-4">Ad Soyad</th>
                  <th className="py-2 px-4 rounded-tr-xl">Bal</th>
                </tr>
              </thead>
              <tbody>
                {others.map((res, index) => (
                  <tr key={index + 4} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="py-2 px-4">{index + 4}</td>
                    <td className="py-2 px-4">{res.full_name}</td>
                    <td className="py-2 px-4">{res.score_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center mt-8">
            <span className="text-[#1b7793] text-lg font-medium animate-pulse">Yüklənir...</span>
          </div>
        )}
      </div>
    </div>
  );
}