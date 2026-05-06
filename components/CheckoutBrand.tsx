/** Header mark + title for checkout — generic branding, no test labels */
export function CheckoutBrand() {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#2563eb] shadow-md shadow-blue-600/25"
        aria-hidden
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
          aria-hidden
        >
          <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M2 11h20" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      </span>
      <span className="font-semibold tracking-tight text-slate-900 text-lg sm:text-xl">PayDesk</span>
    </div>
  );
}
