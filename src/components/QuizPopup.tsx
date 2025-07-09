// src/components/QuizPopup.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { QuizPrefs } from '@/lib/types';

const quizSteps = [
  {
    question: "Which do you prefer more?",
    options: ["Snacks", "Bites", "Cookies", "Sweets"] as const, // Use 'as const' for stronger typing
    key: "category" as const,
  },
  {
    question: "What time do you usually snack?",
    options: ["Morning", "Afternoon", "Night", "Anytime"] as const,
    key: "time" as const,
  },
  {
    question: "How often do you snack in a day?",
    options: ["Once", "2-3 times", "Frequently", "Rarely"] as const,
    key: "frequency" as const,
  },
];

interface QuizPopupProps {
  // onComplete now returns the collected preferences
  onComplete: (prefs: QuizPrefs) => void;
  // onSkip is for when the user explicitly skips
  onSkip: () => void;
}

export default function QuizPopup({ onComplete, onSkip }: QuizPopupProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizPrefs>({});

  const handleSelect = (option: string) => {
    const key = quizSteps[step].key;
    const newAnswers = { ...answers, [key]: option };
    setAnswers(newAnswers);

    if (step === quizSteps.length - 1) {
      // Last step: call the onComplete callback with the final answers
      onComplete(newAnswers);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-900 text-white rounded-xl p-8 w-[90%] max-w-md shadow-2xl relative border border-amber-500/20"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          {/* The X button now functions as a skip button */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
            onClick={onSkip}
            aria-label="Skip quiz"
          >
            <X size={20} />
          </button>

          <p
            className="text-sm text-right text-gray-500 mb-2 underline cursor-pointer hover:text-amber-400"
            onClick={onSkip}
          >
            Skip for now
          </p>

          <h2 className="text-2xl font-bold mb-4 text-amber-400 text-center">
            {quizSteps[step].question}
          </h2>

          <div className="grid gap-3 my-6">
            {quizSteps[step].options.map((opt) => (
              <button
                key={opt}
                className="bg-gray-800/60 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg border border-gray-700/50 hover:text-black transition-all duration-200"
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
                className={`h-2 w-6 rounded-full transition-colors ${
                  i === step ? 'bg-amber-500' : 'bg-gray-700'
                }`}
              ></span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}