import React, { useEffect, useState } from "react";
import api from "../../api";
import { useParams } from "react-router-dom";

export default function QuizResultStudent() {
  const { quizId, studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openImage = (url) => {
    setSelectedImage(url);
    setImageModalVisible(true);
  };

  const closeImage = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    if (!quizId || !studentId) {
      setError("Quiz və ya tələbə ID tapılmadı.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const questionsRes = await api.get(`/quiz/${quizId}/questions/`);
        setQuestions(questionsRes.data.questions || []);
        const answersRes = await api.get(
          `/student-answers/${studentId}/quiz/${quizId}/`
        );
        setStudentAnswers(answersRes.data.data || []);
      } catch (err) {
        setError("Nəticələr yüklənərkən xəta baş verdi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, studentId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
        <div className="animate-spin h-10 w-10 text-[#1b7793] mb-4 border-4 border-blue-300 border-t-transparent rounded-full"></div>
        <div className="text-[#1b7793] text-lg font-medium">Yüklənir...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
        <div className="text-red-600 text-lg font-medium">{error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
        <div className="text-gray-600 text-lg font-medium">Nəticə mövcud deyil.</div>
      </div>
    );
  }

  const findStudentAnswer = (questionId) =>
    studentAnswers.find((a) => Number(a.question_id) === Number(questionId));

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50 flex flex-col items-center py-8">
      <div className="w-full max-w-3xl mx-auto bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#1b7793] mb-8 text-center">Quiz Nəticələri</h2>
        <div className="flex flex-col gap-8">
          {questions.map((q, i) => {
            const studentAnswer = findStudentAnswer(q.id);
            return (
              <div key={q.id} className="mb-4 bg-white rounded-xl shadow p-6 border border-blue-100">
                <div className="text-lg font-semibold text-gray-800 mb-3">
                  {i + 1}. {q.text}
                </div>
                {q.image && (
                  <button
                    type="button"
                    className="mb-4 block w-full"
                    onClick={() => openImage(q.image)}
                  >
                    <img
                      src={q.image}
                      alt="question"
                      className="w-full max-h-64 object-cover rounded-lg shadow"
                    />
                  </button>
                )}
                <div className="flex flex-col gap-3">
                  {q.answers.map((ans) => {
                    const isSelected =
                      Number(studentAnswer?.answer_id) === Number(ans.id);
                    const isCorrect =
                      studentAnswer?.answer_is_correct && isSelected;
                    let optionClass =
                      "flex items-center gap-2 px-4 py-3 rounded-lg border transition";
                    if (isCorrect)
                      optionClass +=
                        " bg-green-100 border-green-400 font-semibold";
                    else if (isSelected && !isCorrect)
                      optionClass +=
                        " bg-red-100 border-red-400 font-semibold";
                    else optionClass += " bg-gray-50 border-gray-200";
                    return (
                      <div key={ans.id} className={optionClass}>
                        <span className="text-lg">
                          {isSelected ? "✅" : "⬜"}
                        </span>
                        <span>
                          {ans.text}
                          {isCorrect && (
                            <span className="ml-2 text-green-700 font-bold">
                              (Düzgün)
                            </span>
                          )}
                        </span>
                        {ans.image && (
                          <button
                            type="button"
                            className="ml-4"
                            onClick={() => openImage(ans.image)}
                          >
                            <img
                              src={ans.image}
                              alt="answer"
                              className="w-24 h-16 object-cover rounded"
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Fullscreen Image Modal */}
      {imageModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            type="button"
            className="absolute top-6 right-8 text-white text-3xl font-bold"
            onClick={closeImage}
            aria-label="Close"
          >
            &times;
          </button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="fullscreen"
              className="max-w-full max-h-[80vh] rounded-xl shadow-2xl"
            />
          )}
        </div>
      )}
    </div>
  );
}