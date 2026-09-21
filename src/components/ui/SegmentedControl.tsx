interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /**
   * Whether the options split the container's width equally. True (the default)
   * keeps the original sidebar behaviour; pass false in a crowded row like the
   * calculator's section bar, where the control should only be as wide as its
   * labels.
   */
  fill?: boolean;
  'aria-label'?: string;
}

/* Selection state lives in the white thumb, not in a brand color —
   red is reserved for the brand and primary actions. */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  fill = true,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex bg-carbon-100 rounded-lg p-1 ${className}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={selected}
            className={`${fill ? 'flex-1' : ''} px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive ${
              selected
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-secondary hover:text-ink'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
