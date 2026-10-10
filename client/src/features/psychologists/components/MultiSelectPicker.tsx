import { useMemo, useState } from "react";
import { X } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectPickerProps {
  options: readonly MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  /** Show a search box above the options (useful for long lists like countries). */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
}

/**
 * Chip-based multi-select for a fixed option list. Selected values render as
 * removable chips; remaining options render as toggleable pills below.
 */
export function MultiSelectPicker({
  options,
  selected,
  onChange,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search…",
  emptyText = "No matches",
}: MultiSelectPickerProps) {
  const [query, setQuery] = useState("");

  const labelOf = useMemo(() => {
    const map = new Map(options.map((option) => [option.value, option.label]));
    return (value: string) => map.get(value) ?? value;
  }, [options]);

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter(
      (option) =>
        !selected.includes(option.value) &&
        (!q || option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q)),
    );
  }, [options, selected, query]);

  const remove = (value: string) => onChange(selected.filter((item) => item !== value));
  const add = (value: string) => {
    onChange([...selected, value]);
    setQuery("");
  };

  return (
    <div className="grid gap-2 font-normal">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800"
            >
              {labelOf(value)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(value)}
                  aria-label={`Remove ${labelOf(value)}`}
                  className="rounded-full p-0.5 hover:bg-violet-200"
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {!disabled && (
        <>
          {searchable && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 rounded-xl border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-violet-100"
            />
          )}
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-dashed border-violet-200 bg-violet-50/30 p-3">
            {available.length === 0 ? (
              <span className="text-xs text-slate-500">{emptyText}</span>
            ) : (
              available.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => add(option.value)}
                  className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-violet-400 hover:bg-violet-50"
                >
                  + {option.label}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
