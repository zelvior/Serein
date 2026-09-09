interface DoodleProps {
  className?: string;
}

// All paths use slightly irregular, "wobbly" control points and a rounded stroke
// to read as hand-drawn rather than geometric — no external illustration deps.

export function DoodleSwirl({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 55 C 15 35, 30 18, 50 22 C 72 26, 78 48, 62 58 C 48 66, 34 56, 40 44 C 44 36, 55 37, 56 46"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleSparkle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M50 12 C 52 32, 54 40, 76 46 C 55 50, 51 58, 49 82 C 46 59, 43 51, 22 47 C 43 43, 47 34, 50 12 Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function DoodleUnderline({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 12 C 40 6, 80 16, 120 9 C 150 4, 175 13, 196 8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleArrow({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 60" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 14 C 40 8, 70 34, 96 28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M80 18 C 87 22, 92 26, 96 28 C 92 32, 88 37, 84 42"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleCloud({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 70" fill="none" className={className} aria-hidden="true">
      <path
        d="M25 50 C 10 50, 8 32, 24 30 C 22 16, 42 10, 50 22 C 58 8, 78 12, 78 26 C 92 24, 96 44, 82 48 C 84 56, 74 60, 66 56 C 60 62, 44 62, 40 55 C 32 60, 22 56, 25 50 Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleHeart({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 90" fill="none" className={className} aria-hidden="true">
      <path
        d="M50 82 C 12 58, 4 34, 20 20 C 32 10, 46 16, 50 30 C 54 15, 70 10, 81 21 C 96 36, 87 58, 50 82 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleStar({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M50 10 L60 38 L90 42 L64 60 L72 90 L50 72 L28 90 L36 60 L10 42 L40 38 Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleSquiggle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 30" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 15 C 16 2, 28 28, 40 15 C 52 2, 64 28, 76 15 C 88 2, 100 28, 112 15 C 124 2, 136 28, 148 15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleCircleScribble({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M50 15 C 75 13, 90 32, 86 52 C 83 70, 65 86, 44 84 C 22 82, 8 63, 12 44 C 15 30, 27 18, 42 16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
