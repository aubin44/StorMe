/** Logo Aléa : montagne enneigée, bloc qui se détache, vague. La tuile prend la couleur du texte (currentColor). */
export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <clipPath id="mark-tile">
          <rect width="64" height="64" rx="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#mark-tile)">
        <rect width="64" height="64" fill="currentColor" />
        <path d="M6 50 26 16 34 30 40 21 58 50Z" fill="#4F8068" />
        <path d="M34 30 40 21 58 50H40Z" fill="#3D6B57" />
        <path d="M26 16 18.5 29.5 23 27 26.5 32 30.5 26.5 34 30Z" fill="currentColor" />
        <path d="M40 21 36.5 27.5 39.5 26 41.5 29 44 25.5Z" fill="currentColor" />
        <path d="M44 24Q49 26 50 30" stroke="#C65D12" strokeWidth="1.6" strokeDasharray="2 2.4" fill="none" />
        <path d="M50 29 55 27 59 31 57 36 51 35Z" fill="#C65D12" />
        <path d="M0 55Q8 50 16 55T32 55T48 55T64 55V64H0Z" fill="#3F6F86" />
      </g>
    </svg>
  );
}
