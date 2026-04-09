export function AuthField({ label, htmlFor, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-[var(--auth-label)]">
          {label}
        </label>
        {hint ? <span className="text-[11px] text-[var(--auth-muted)]">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function AuthInput({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  icon,
}) {
  return (
    <div className="relative">
      {icon ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--auth-icon)]">
          {icon}
        </div>
      ) : null}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={`auth-input ${icon ? 'pl-10' : ''}`}
      />
    </div>
  );
}

export function AuthAlert({ tone = 'error', children }) {
  const className =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200'
        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200';

  return <div className={`rounded-[0.9rem] border px-3 py-2.5 text-sm ${className}`}>{children}</div>;
}

export function AuthDivider({ children }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[var(--auth-divider-line)]" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-[var(--auth-divider-bg)] px-2 text-[var(--auth-muted)]">{children}</span>
      </div>
    </div>
  );
}
