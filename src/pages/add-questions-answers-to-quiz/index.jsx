import { useEffect, useState, useRef } from "react";
import api from "../../api"; // Adjust path if needed
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function AddQuestionsAnswersToQuiz() {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quizId");
  const [questions, setQuestions] = useState([
    {
      question: "",
      questionImage: null,
      answers: [{ text: "", image: null }],
      correctIndex: 0,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = questions[currentIndex];
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Quiz ID tapılmadı",
      });
    }
  }, [quizId]);

  // Image picker for questions and answers
  const handleImageChange = (e, onSelect) => {
    const file = e.target.files[0];
    if (file) {
      onSelect({
        file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const updateQuestion = (value) => {
    const updated = [...questions];
    updated[currentIndex].question = value;
    setQuestions(updated);
  };

  const updateAnswer = (i, value) => {
    const updated = [...questions];
    updated[currentIndex].answers[i].text = value;
    setQuestions(updated);
  };

  const addAnswer = () => {
    const updated = [...questions];
    updated[currentIndex].answers.push({ text: "", image: null });
    setQuestions(updated);
  };

  const removeAnswer = (i) => {
    if (current.answers.length === 1) return;
    const updated = [...questions];
    updated[currentIndex].answers.splice(i, 1);
    if (updated[currentIndex].correctIndex === i) {
      updated[currentIndex].correctIndex = 0;
    }
    setQuestions(updated);
  };

  const selectCorrect = (i) => {
    const updated = [...questions];
    updated[currentIndex].correctIndex = i;
    setQuestions(updated);
  };

  const next = () => {
    if (
      !current.question.trim() ||
      current.answers.some((a) => !a.text.trim())
    ) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Sual və bütün cavablar boş olmamalıdır",
      });
      return;
    }
    if (currentIndex === questions.length - 1) {
      setQuestions([
        ...questions,
        {
          question: "",
          questionImage: null,
          answers: [{ text: "", image: null }],
          correctIndex: 0,
        },
      ]);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Prepare FormData
    const formData = new FormData();
    formData.append("quiz", String(quizId));

    // Filter questions with valid data
    const filteredQuestions = questions.filter(
      (q) => q.question.trim() && q.answers.every((a) => a.text.trim())
    );

    // Prepare JSON without images, include has_image flags
    const jsonQuestions = filteredQuestions.map((q, index) => ({
      text: q.question,
      question_order: index + 1,
      has_image: !!q.questionImage,
      answers: q.answers.map((a, aIdx) => ({
        text: a.text,
        is_correct: aIdx === q.correctIndex,
        has_image: !!a.image,
      })),
    }));

    formData.append("questions", JSON.stringify(jsonQuestions));

    // Append question images
    filteredQuestions.forEach((q, index) => {
      if (q.questionImage && q.questionImage.file) {
        formData.append("question_images", q.questionImage.file, `quiz_${quizId}_question_${index}.jpg`);
      }
    });

    // Append answer images
    filteredQuestions.forEach((q, index) => {
      q.answers.forEach((a, aIdx) => {
        if (a.image && a.image.file) {
          formData.append("answer_images", a.image.file, `quiz_${quizId}_q${index}_a${aIdx}.jpg`);
        }
      });
    });

    if (!filteredQuestions.length) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Ən azı bir düzgün doldurulmuş sual olmalıdır",
      });
      return;
    }

    try {
      await api.post("/quiz/bulk-add-questions/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "Uğurla",
        text: "Bütün suallar əlavə olundu",
      });
      navigate("/tests");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Yadda saxlarkən xəta baş verdi",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-[#1b7793] mb-8 text-center">
        Quiz Yarat ({currentIndex + 1})
      </h2>
      <div className="mb-6">
        <label className="block font-semibold mb-2">Sual</label>
        <textarea
          type="text"
          value={current.question}
          onChange={e => updateQuestion(e.target.value)}
          placeholder="Məsələn: 2 + 2 = ?"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>
        {current.questionImage && (
          <img
            src={current.questionImage.url}
            alt="Sual şəkli"
            className="w-full h-40 object-cover rounded-lg mt-3"
          />
        )}
        <label className="block mt-2 text-[#1b7793] cursor-pointer font-medium">
          📷 Sual üçün şəkil əlavə et
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e =>
              handleImageChange(e, img => {
                const updated = [...questions];
                updated[currentIndex].questionImage = img;
                setQuestions(updated);
              })
            }
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block font-semibold mb-2">Cavablar</label>
        {current.answers.map((ans, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 flex-wrap">
            <button
              type="button"
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold transition ${
                current.correctIndex === i
                  ? "bg-[#1b7793] border-[#1b7793] text-green-500"
                  : "border-blue-400 text-[#1b7793] bg-white"
              }`}
              onClick={() => selectCorrect(i)}
              title="Düzgün cavab"
            >
              {current.correctIndex === i ? "✓" : ""}
            </button>
            <input
              type="text"
              value={ans.text}
              onChange={e => updateAnswer(i, e.target.value)}
              placeholder={`Cavab ${i + 1}`}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {ans.image && (
              <img
                src={ans.image.url}
                alt="Cavab şəkli"
                className="w-10 h-10 object-cover rounded-md"
              />
            )}
            <label className="text-[#1b7793] cursor-pointer font-medium">
              📷
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e =>
                  handleImageChange(e, img => {
                    const updated = [...questions];
                    updated[currentIndex].answers[i].image = img;
                    setQuestions(updated);
                  })
                }
              />
            </label>
            {current.answers.length > 1 && (
              <button
                type="button"
                className="text-red-500 text-xl ml-2"
                onClick={() => removeAnswer(i)}
                title="Cavabı sil"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addAnswer}
          className="mt-2 text-[#1b7793] font-semibold hover:underline"
        >
          + Cavab əlavə et
        </button>
      </div>
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={prev}
          disabled={currentIndex === 0}
          className={`flex-1 py-3 rounded-xl font-bold text-[#000] transition ${
            currentIndex === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#1b7793] hover:bg-[#1b7793] cursor-pointer"
          }`}
        >
          ⬅️ Əvvəlki
        </button>
        <button
          type="button"
          onClick={next}
          className="cursor-pointer flex-1 py-3 rounded-xl font-bold text-[#000] bg-[#1b7793] hover:bg-[#1b7793] transition"
        >
          Növbəti ➡️
        </button>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="cursor-pointer w-full mt-8 py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition shadow-lg"
      >
        Bitir və Yarat
      </button>
    </div>
  );
}