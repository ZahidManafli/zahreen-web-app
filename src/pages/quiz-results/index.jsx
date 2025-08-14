import { useEffect, useState } from "react";
import api from '../../api'; // Adjust path if needed
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function Results() {
  const { id: quizId } = useParams();
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAndResults = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setRole(user.role);
          setUserId(
            user.id?.toString() || user.username || user.firstName || ""
          );
        }
        if (!quizId) {
          Swal.fire({
            icon: "error",
            title: "Xəta",
            text: "Quiz ID tapılmadı",
          });
          setLoading(false);
          return;
        }
        const res = await api.get(`/results/quiz/${quizId}/`);
        setResults(res.data.data || []);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Nəticələr yüklənərkən xəta baş verdi.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadUserAndResults();
  }, [quizId]);

  // Sort results by score desc
  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  // Navigate to detailed result view
  const handleResultClick = (quizId, studentId) => {
    navigate(`/quiz/${quizId}/${studentId}/view`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-[#1b7793] text-lg font-medium animate-pulse">Yüklənir...</span>
      </div>
    );
  }

  if (sortedResults.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-gray-500 text-lg font-medium">Nəticə tapılmadı</span>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-12 p-8 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-[#1b7793] mb-8 text-center">🏆 Nəticələr</h2>
      {/* Podium */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex justify-center gap-8 items-end w-full">
          {/* 2nd place */}
          {sortedResults[1] && (
            <div
              className="flex flex-col items-center justify-end w-32 h-36 bg-gray-300 rounded-xl border-2 border-gray-500 shadow-lg cursor-pointer hover:scale-105 transition"
              onClick={() =>
                ["teacher", "student", "repititor"].includes(role) &&
                handleResultClick(sortedResults[1].quiz.id, sortedResults[1].student.id)
              }
            >
              <span className="text-3xl font-bold text-gray-700 mb-2">2</span>
              <span className="font-semibold text-gray-800 text-center">{sortedResults[1].student.first_name} {sortedResults[1].student.last_name}</span>
              <span className="mt-2 font-bold text-gray-700">Bal: {sortedResults[1].score}</span>
            </div>
          )}
          {/* 1st place */}
          {sortedResults[0] && (
            <div
              className="flex flex-col items-center justify-end w-36 h-48 bg-yellow-400 rounded-xl border-2 border-yellow-700 shadow-xl mx-2 cursor-pointer hover:scale-105 transition"
              onClick={() =>
                ["teacher", "student", "repititor"].includes(role) &&
                handleResultClick(sortedResults[0].quiz.id, sortedResults[0].student.id)
              }
            >
              <span className="text-4xl font-extrabold text-white mb-2 drop-shadow">1</span>
              <span className="font-bold text-gray-900 text-center">{sortedResults[0].student.first_name} {sortedResults[0].student.last_name}</span>
              <span className="mt-2 font-bold text-gray-900">Bal: {sortedResults[0].score}</span>
            </div>
          )}
          {/* 3rd place */}
          {sortedResults[2] && (
            <div
              className="flex flex-col items-center justify-end w-32 h-32 bg-orange-400 rounded-xl border-2 border-orange-700 shadow-lg cursor-pointer hover:scale-105 transition"
              onClick={() =>
                ["teacher", "student", "repititor"].includes(role) &&
                handleResultClick(sortedResults[2].quiz.id, sortedResults[2].student.id)
              }
            >
              <span className="text-2xl font-bold text-white mb-2">3</span>
              <span className="font-semibold text-gray-800 text-center">{sortedResults[2].student.first_name} {sortedResults[2].student.last_name}</span>
              <span className="mt-2 font-bold text-gray-800">Bal: {sortedResults[2].score}</span>
            </div>
          )}
        </div>
      </div>
      {/* Table for 4th and below */}
      {sortedResults.length > 3 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white rounded-lg shadow border">
            <thead>
              <tr className="bg-[#1b7793] text-white">
                <th className="py-3 px-4 text-left rounded-tl-lg w-12">№</th>
                <th className="py-3 px-4 text-left">Şagird</th>
                <th className="py-3 px-4 text-left rounded-tr-lg w-24">Bal</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.slice(3).map((res, idx) => (
                <tr
                  key={idx + 4}
                  className={`hover:bg-blue-50 cursor-pointer ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  onClick={() =>
                    ["teacher", "student", "repititor"].includes(role) &&
                    handleResultClick(res.quiz.id, res.student.id)
                  }
                >
                  <td className="py-2 px-4">{idx + 4}</td>
                  <td className="py-2 px-4">{res.student.first_name} {res.student.last_name}</td>
                  <td className="py-2 px-4 font-bold">{res.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}