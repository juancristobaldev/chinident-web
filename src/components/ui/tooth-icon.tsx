export function ToothIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2C7.5 2 3.5 6.5 3.5 11c0 3 1.2 6.5 2.3 9.3.5 1.2 1 2.7 1 3.2 0 .8 1.2 1.5 5.2 1.5s5.2-.7 5.2-1.5c0-.5.5-2 1-3.2 1.1-2.8 2.3-6.3 2.3-9.3C20.5 6.5 16.5 2 12 2z" />
      <line x1="8" y1="9" x2="8" y2="16" />
      <line x1="16" y1="9" x2="16" y2="16" />
      <path d="M12 19v2" />
    </svg>
  );
}
