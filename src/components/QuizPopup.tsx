"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const quizSteps = [
  {
    question: "Which do you prefer more?",
    options: ["Snacks", "Bites"],
    key: "category"
  },
  {
    question: "What time do you usually snack?",
    options: ["Morning", "Afternoon", "Night", "Anytime"],
    key: "time"
  },
  {
    question: "How often do you snack in a day?",
    options: ["Once", "2-3 times", "Frequently", "Rarely"],
    key: "frequency"
  }
];

type QuizPrefs = {
  category?: string;
  time?: string;
  frequency?: string;
};

export default function QuizPopup({ onComplete }: { onComplete: (prefs: QuizPrefs) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizPrefs>({});
  const router = useRouter();

  const handleSelect = (option: string) => {
    const key = quizSteps[step].key;
    const newAnswers = { ...answers, [key]: option };
    setAnswers(newAnswers);

    if (step === quizSteps.length - 1) {
      onComplete(newAnswers); // save to DB
    } else {
      setStep(step + 1);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="bg-gray-900 text-white rounded-xl p-8 w-[90%] max-w-md shadow-2xl relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
          onClick={() => router.push("/")}
        >
          <X size={20} />
        </button>

        <p className="text-sm text-right text-gray-500 mb-2 underline cursor-pointer" onClick={() => router.push("/")}>Skip Quiz</p>

        <h2 className="text-2xl font-bold mb-4 text-amber-400">{quizSteps[step].question}</h2>
        <div className="grid gap-3">
          {quizSteps[step].options.map((opt) => (
            <button
              key={opt}
              className="bg-gray-800/60 hover:bg-amber-500 text-white py-2 rounded-lg border border-gray-700/50 hover:text-black"
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-center mt-6 space-x-2">
          {quizSteps.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-6 rounded-full ${i === step ? "bg-amber-500" : "bg-gray-700"}`}
            ></span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
