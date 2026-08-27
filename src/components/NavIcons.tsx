interface IconProps {
  size?: number
}

// A sketch pad with a little bar chart drawn on it — the Overview page.
export function OverviewIcon({ size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <rect x="7.2" y="13" width="2.2" height="4.2" fill="currentColor" stroke="none" />
      <rect x="11.1" y="9" width="2.2" height="8.2" fill="currentColor" stroke="none" />
      <rect x="15" y="11.5" width="2.2" height="5.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

// A running stick figure — the Activities page.
export function ActivitiesIcon({ size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="14.2" cy="4.3" r="1.9" fill="currentColor" stroke="none" />
      <path d="M11 9.2l2.6 2 3.4-1.3" />
      <path d="M13.6 11.2l-1.4 3 2.6 2.4-1 4.4" />
      <path d="M12.2 14.2l-3.6 1.4" />
      <path d="M14.8 15.6l3.4 1.2 1.6 3" />
    </svg>
  )
}

// A downward arrow into a tray — install / download the app.
export function DownloadIcon({ size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v10" />
      <path d="M8 11l4 4 4-4" />
      <path d="M5 19h14" />
    </svg>
  )
}

// A dartboard — the Goals page.
export function GoalsIcon({ size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
