import { useEffect, useState } from "react";
import api from "../../api"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

export default function TestsPage() {
  const [role, setRole] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const canCreateQuiz = ["teacher", "admin", "repititor"].includes(role);
  const canSeeResults = ["student", "teacher", "admin", "repititor", "parent"].includes(role);

  useEffect(() => {
    const loadUserAndData = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setRole(parsed.role);
      }
      await fetchQuizzes();
      setLoading(false);
    };
    loadUserAndData();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get("quizs/");
      setQuizzes(res.data.data);
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div className="w-full flex items-center justify-center pt-0">
      <div className="w-full h-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-[#1b7793] mb-8 text-center">
          Quiz Siyahısı
        </h2>

        {canCreateQuiz && (
          <button
            className="cursor-pointer bg-gradient-to-r from-[#1b7793] to-indigo-500 hover:from-[#1b7793] hover:to-indigo-600 text-white font-semibold py-2 px-5 rounded-lg mb-6 transition"
            onClick={() => navigate("/create-quiz")}
          >
            ➕ Yarat
          </button>
        )}

{loading ? (
  <div className="flex flex-col gap-4 mt-8">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-xl h-20 w-full"
      >
        <div className="h-4 bg-blue-200 rounded w-2/3 mt-4 mx-6"></div>
        <div className="h-3 bg-indigo-200 rounded w-1/2 mt-2 mx-6"></div>
      </div>
    ))}
    <div className="flex justify-center mt-4">
      <svg className="animate-spin h-8 w-8 text-[#1b7793]" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  </div>
) : (
  quizzes.length === 0 ? (
    <div className="text-center text-gray-500 mt-8 text-lg font-medium">Quiz tapılmadı.</div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map(item => (
        <div key={item.id} className="bg-white/90 rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-200 group flex flex-col justify-between">
          <div>
            <div className="text-xl font-semibold text-gray-800 mb-2">{item.title}</div>
            <div className="text-gray-600 mb-1">
              <span className="font-medium">Müəllim:</span> {item.teacher_fullname}
            </div>
            <div className="text-gray-600 mb-1">
              <span className="font-medium">Fənn:</span> {item.subject_name}
            </div>
            <div className="text-gray-600 mb-3">
              <span className="font-medium">Kurs:</span> {item.course_name}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              className="cursor-pointer bg-green-500 hover:bg-green-600 text-[#000] font-semibold py-2 px-4 rounded-lg transition"
              onClick={() => navigate(`/quiz/${item.id}`)}
            >
              👁️ Bax
            </button>
            {canSeeResults && (
              <button
                className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition"
                onClick={() => navigate(`/quiz/${item.id}/results`)}
              >
                📊 Nəticələrə bax
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
)}
      </div>
    </div>
  );
}