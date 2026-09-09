"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ONBOARDING_STEPS } from "./steps";

type Answers = Record<string, string | string[]>;

export function OnboardingFlow() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = ONBOARDING_STEPS[index];
  const isLast = index === ONBOARDING_STEPS.length - 1;
  const current = answers[step.id];
  const canContinue = step.multi ? true : !!current;

  function select(key: string) {
    setAnswers((prev) => {
      if (step.multi) {
        const list = Array.isArray(prev[step.id]) ? (prev[step.id] as string[]) : [];
        const next = list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
        return { ...prev, [step.id]: next };
      }
      return { ...prev, [step.id]: key };
    });
  }

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (res.status === 401) {
        router.push("/login?callbackUrl=/onboarding");
        return;
      }
      if (!res.ok) {
        setError("Something went wrong saving your preferences. Please try again.");
        return;
      }
      router.push("/chat");
    } catch {
      setError("Couldn't reach Serein. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-16">
      <div className="mb-10 flex items-center gap-1.5" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={ONBOARDING_STEPS.length}>
        {ONBOARDING_STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= index ? "bg-[var(--accent)]" : "bg-[var(--border-solid)]"
            }`}
          />
        ))}
      </div>

      <h1 className="font-display text-3xl leading-snug text-[var(--text-primary)]">{step.question}</h1>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {step.choices.map((choice) => {
          const selected = step.multi
            ? Array.isArray(current) && current.includes(choice.key)
            : current === choice.key;
          return (
            <Chip key={choice.key} label={choice.label} selected={selected} onToggle={() => select(choice.key)} />
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-12 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="text-sm text-[var(--text-secondary)] transition-opacity hover:opacity-80 disabled:opacity-0"
        >
          Back
        </button>
        <Button onClick={handleNext} disabled={!canContinue || submitting}>
          {isLast ? (submitting ? "Setting things up…" : "Start talking") : "Continue"}
        </Button>
      </div>
    </div>
  );
}
