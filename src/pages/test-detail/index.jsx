import { useEffect, useState } from "react";
import api from "../../api"; // Adjust path if needed
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function QuizDetails() {
  const { id: quizId } = useParams();
  const [role, setRole] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setRole(user.role);
      }
      try {
        const res = await api.get(`/quiz/${quizId}/questions/`);
        setQuestions(res.data.questions || []);
        setAnswers(new Array(res.data.questions?.length || 0).fill(-1));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Quiz yüklənərkən xəta baş verdi.",
        });
      }
    };
    if (quizId) {
      initialize();
    }
  }, [quizId]);

  const current = questions[currentIndex];
  const isStudent = role === "student";

  const handleSelect = (index) => {
    if (!isStudent) return;
    const updated = [...answers];
    updated[currentIndex] = index;
    setAnswers(updated);
  };

  const openImageModal = (uri) => {
    setSelectedImageUri(uri);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImageUri(null);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const submit = async () => {
    if (answers.includes(-1)) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Bütün suallara cavab verməlisiniz.",
      });
      return;
    }
    const payload = {
      quiz: parseInt(quizId || "0"),
      answers: answers.map((answerIndex, i) => ({
        question_id: questions[i].id,
        answer_id: questions[i].answers[answerIndex].id,
      })),
    };
    try {
      const resp = await api.post("/quiz-submissions/", payload);
      Swal.fire({
        icon: "success",
        title: "Uğurla!",
        text: `Cavablar göndərildi. Nəticəniz: ${resp.data.result.score}`,
      }).then(() => navigate(-1));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text:
          error.response?.data?.non_field_errors ||
          "Cavablar göndərilərkən xəta baş verdi.",
      });
    }
  };

  if (!current) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-[#1b7793] text-lg font-medium animate-pulse">Yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-[#1b7793] mb-6 text-center">Quiz #{quizId}</h2>
      <div className="mb-2 text-gray-500 font-semibold">Sual {currentIndex + 1}</div>
      <div className="mb-4 text-lg font-semibold">{current.text}</div>
      {current.image && (
        <div
          className="w-full h-56 flex items-center justify-center mb-4 bg-gray-100 rounded-lg cursor-pointer"
          onClick={() => openImageModal(current.image)}
        >
          <img
            src={current.image}
            alt="Sual şəkli"
            className="max-h-56 object-contain rounded-lg"
          />
        </div>
      )}
      <div className="flex flex-col gap-4">
        {current.answers.map((option, i) => {
          const isSelected = answers[currentIndex] === i;
          return (
            <div
              key={option.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? "bg-[#1b7793] border-[#1b7793] text-white"
                  : "bg-white border-gray-300 hover:bg-blue-50"
              } ${!isStudent ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={() => handleSelect(i)}
            >
              <div className="flex-1">
                <span className="font-medium">{option.text}</span>
              </div>
              {option.image && (
                <img
                  src={option.image}
                  alt="Cavab şəkli"
                  className="w-16 h-16 object-contain rounded-md cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    openImageModal(option.image);
                  }}
                />
              )}
              {isSelected && (
                <span className="ml-2 font-bold text-lg">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for fullscreen image */}
      {modalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeImageModal}
        >
          <img
            src={selectedImageUri}
            alt="Tam ekran şəkil"
            className="max-w-3xl max-h-[80vh] rounded-lg shadow-2xl"
          />
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={prev}
          disabled={currentIndex === 0}
          className={`cursor-pointer flex-1 py-3 rounded-xl font-bold text-white transition ${
            currentIndex === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#1b7793] hover:bg-[#1b7793]"
          }`}
        >
          ⬅️ Əvvəlki
        </button>
        <button
          type="button"
          onClick={next}
          disabled={currentIndex === questions.length - 1}
          className={`cursor-pointer flex-1 py-3 rounded-xl font-bold text-white transition ${
            currentIndex === questions.length - 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#1b7793] hover:bg-[#1b7793]"
          }`}
        >
          Növbəti ➡️
        </button>
      </div>

      {isStudent && currentIndex === questions.length - 1 && (
        <button
          type="button"
          className="cursor-pointer w-full mt-8 py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition shadow-lg"
          onClick={submit}
        >
          Bitir və Göndər
        </button>
      )}
    </div>
  );
}