import type { ProcessusId } from "@/lib/releve/types";

/** Bandeau de montagnes du haut de page : crêtes, neige, blocs en chute. */
export function HeroScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 120"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b3a2f" />
          <stop offset="1" stopColor="#2c5645" />
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill="url(#hero-sky)" />
      <circle cx="338" cy="26" r="11" fill="#f4f0e6" opacity="0.14" />
      {/* chaîne lointaine */}
      <path d="M0 120V74L38 52 66 66 118 30 158 62 204 42 252 72 302 38 352 64 400 46V120Z" fill="#34624f" />
      <path d="M118 30 105 48 114 44 120 52 127 43 133 47Z" fill="#f4f0e6" opacity="0.92" />
      <path d="M302 38 291 54 299 50 304 57 310 49 316 53Z" fill="#f4f0e6" opacity="0.92" />
      <path d="M204 42 196 54 202 51 206 56 211 50 214 54Z" fill="#f4f0e6" opacity="0.8" />
      {/* chaîne proche */}
      <path d="M0 120V88L48 70 92 84 150 62 214 90 272 72 334 92 400 74V120Z" fill="#1d4132" />
      <path d="M150 62 141 74 148 72 152 78 158 71 163 74Z" fill="#f4f0e6" opacity="0.7" />
      {/* bloc qui dévale */}
      <path d="M170 72Q186 78 200 90" stroke="#c65d12" strokeWidth="1.4" strokeDasharray="3 4" fill="none" />
      <path d="M206 88l6-3 5 3 1 6-5 3-6-2Z" fill="#c65d12" />
      <path d="M186 80l4-2 3 2 1 4-3 2-4-1Z" fill="#e0894a" />
      <path d="M232 94l3-2 3 1 1 3-3 2-3-1Z" fill="#c65d12" opacity="0.8" />
      {/* flocons */}
      {[
        [30, 24],
        [74, 38],
        [196, 16],
        [248, 28],
        [372, 12],
        [140, 12],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#f4f0e6" opacity="0.55" />
      ))}
      {/* vague */}
      <path
        d="M0 106Q14 100 28 106T56 106T84 106T112 106T140 106T168 106T196 106T224 106T252 106T280 106T308 106T336 106T364 106T392 106T420 106V120H0Z"
        fill="#3f6f86"
        opacity="0.55"
      />
      {/* arête crème qui rejoint la page */}
      <path d="M0 120V108L56 100 120 110 196 99 270 110 340 101 400 108V120Z" fill="#f4f0e6" />
    </svg>
  );
}

/** Silhouette discrète pour l'en-tête de l'assistant. */
export function RidgeStrip({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="xMaxYMax meet" className={className} aria-hidden="true">
      <path d="M0 40V28L30 14 52 24 90 4 124 26 150 14 200 30V40Z" fill="#f4f0e6" opacity="0.1" />
      <path d="M90 4 82 16 88 14 91 19 96 13 100 15Z" fill="#f4f0e6" opacity="0.28" />
    </svg>
  );
}

/** Petite scène illustrée par type d'aléa. */
export function HazardScene({ id, className = "" }: { id: ProcessusId; className?: string }) {
  return (
    <svg viewBox="0 0 120 72" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {id === "chute" ? (
        <>
          <rect width="120" height="72" fill="#e7dfcd" />
          <path d="M0 72V26L46 40 120 62V72Z" fill="#8a8174" />
          <path d="M0 72V48L52 56 120 66V72Z" fill="#6f7d58" />
          <path d="M22 22Q40 28 54 44" stroke="#c65d12" strokeWidth="1.3" strokeDasharray="3 3" fill="none" />
          <path d="M16 18l7-3 6 3 1 7-6 4-7-3Z" fill="#4f493f" />
          <path d="M52 40l5-2 4 2 1 5-4 3-5-2Z" fill="#c65d12" />
          <path d="M88 58l4-2 3 2 1 3-3 2-4-1Z" fill="#4f493f" />
          <path d="M70 52l3-1 2 1 0 3-3 1-2-1Z" fill="#6b645b" />
        </>
      ) : null}
      {id === "effondrement" ? (
        <>
          <rect width="120" height="72" fill="#e7dfcd" />
          <path d="M0 72V10H46L52 18 50 30 56 72Z" fill="#8a8174" />
          <path d="M10 10V40M24 14 30 50M38 10 40 34" stroke="#6b645b" strokeWidth="1" opacity="0.6" />
          <path d="M56 72V58H120V72Z" fill="#6f7d58" />
          <path d="M54 26l12-3 3 11-12 3Z" fill="#8a8174" transform="rotate(14 60 30)" />
          <path d="M72 38l10-2 3 9-10 3Z" fill="#6f695f" transform="rotate(-10 78 42)" />
          <path d="M88 50l8-1 2 7-8 2Z" fill="#c65d12" transform="rotate(8 92 54)" />
          <circle cx="76" cy="62" r="6" fill="#d9d1c3" opacity="0.8" />
          <circle cx="90" cy="64" r="8" fill="#d9d1c3" opacity="0.65" />
          <circle cx="104" cy="62" r="5" fill="#d9d1c3" opacity="0.7" />
        </>
      ) : null}
      {id === "glissement" ? (
        <>
          <rect width="120" height="72" fill="#e7dfcd" />
          <path d="M0 72V32Q56 14 120 50V72Z" fill="#6f7d58" />
          <path d="M0 72V52Q60 36 120 62V72Z" fill="#5b6b49" />
          <path d="M34 24Q60 28 82 44" stroke="#c65d12" strokeWidth="1.6" strokeDasharray="4 3" fill="none" />
          <path d="M40 32Q62 36 86 52L72 56Q56 46 38 40Z" fill="#8c6a45" />
          <path d="M60 46l22 8M70 40l18 8" stroke="#f4f0e6" strokeWidth="1.2" opacity="0.7" />
          <path d="M80 50l9 4-7 3Z" fill="#c65d12" />
        </>
      ) : null}
      {id === "avalanche" ? (
        <>
          <rect width="120" height="72" fill="#dfe6e8" />
          <path d="M0 72 38 22 60 42 82 14 120 72Z" fill="#9aa7ab" />
          <path d="M82 14 70 34 78 30 82 38 90 28 96 36Z" fill="#fbf8f2" />
          <path d="M38 22 28 38 36 34 40 42 48 32Z" fill="#fbf8f2" />
          <path d="M0 72V62L40 56 78 60 120 54V72Z" fill="#f4f0e6" />
          <circle cx="78" cy="46" r="9" fill="#fbf8f2" />
          <circle cx="90" cy="52" r="10" fill="#fbf8f2" />
          <circle cx="68" cy="54" r="8" fill="#fbf8f2" />
          <circle cx="100" cy="58" r="8" fill="#fbf8f2" />
          <path d="M62 38 58 46M70 34 64 44" stroke="#fbf8f2" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : null}
      {id === "crue" ? (
        <>
          <rect width="120" height="72" fill="#e7dfcd" />
          <path d="M0 40Q30 30 60 36T120 30V72H0Z" fill="#6f7d58" />
          <path d="M0 48Q15 41 30 48T60 48T90 48T120 48V72H0Z" fill="#3f6f86" />
          <path d="M0 58Q15 52 30 58T60 58T90 58T120 58V72H0Z" fill="#335d72" />
          <path d="M0 66Q15 61 30 66T60 66T90 66T120 66V72H0Z" fill="#2b4f61" />
          <path d="M8 46Q22 40 36 46" stroke="#f4f0e6" strokeWidth="1.2" fill="none" opacity="0.7" />
          <path d="M70 52Q84 46 98 52" stroke="#f4f0e6" strokeWidth="1.2" fill="none" opacity="0.7" />
          <rect x="52" y="42" width="22" height="5" rx="2.5" fill="#8c6a45" transform="rotate(-8 63 44)" />
          <circle cx="96" cy="44" r="4" fill="#6b645b" />
          <circle cx="104" cy="47" r="3" fill="#8a8174" />
        </>
      ) : null}
    </svg>
  );
}
