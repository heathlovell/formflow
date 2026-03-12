"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Question = {
  id: string;
  text: string;
  type: string;
  order: number;
};

type Form = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
};

export default function FormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<Form | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [formId]);

  const currentQuestion = form?.questions[currentIndex];
  const isLastQuestion = form ? currentIndex === form.questions.length - 1 : false;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";

  const handleNext = useCallback(async () => {
    if (!currentAnswer.trim()) return;

    if (isLastQuestion) {
      setSubmitting(true);
      const answerPayload = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerPayload }),
      });

      setSubmitting(false);
      setSubmitted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentAnswer, isLastQuestion, answers, formId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    },
    [handleNext]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Form not found.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold">Thank you!</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your responses have been recorded.
          </p>
          <a href="/dashboard">
            <Button className="mt-8">Back to Dashboard</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {form.questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= currentIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Question number */}
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {currentIndex + 1} of {form.questions.length}
        </p>

        {/* Question text */}
        <h1 className="mb-8 text-3xl font-bold leading-tight">
          {currentQuestion?.text}
        </h1>

        {/* Answer input */}
        <Input
          autoFocus
          placeholder="Type your answer here..."
          value={currentAnswer}
          onChange={(e) =>
            setAnswers((prev) => ({
              ...prev,
              [currentQuestion!.id]: e.target.value,
            }))
          }
          onKeyDown={handleKeyDown}
          className="mb-6 border-0 border-b-2 rounded-none bg-transparent text-lg focus-visible:ring-0 focus-visible:border-primary px-0"
        />

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!currentAnswer.trim() || submitting}
          >
            {submitting
              ? "Submitting..."
              : isLastQuestion
              ? "Submit"
              : "Next"}
          </Button>
          <span className="text-xs text-muted-foreground">
            press <kbd className="rounded border px-1.5 py-0.5 text-xs">Enter</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
