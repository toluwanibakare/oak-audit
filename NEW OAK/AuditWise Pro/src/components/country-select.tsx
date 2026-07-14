import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { POPULAR_COUNTRIES, AFRICAN_COUNTRIES, ALL_COUNTRIES } from "@/lib/countries";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const popularSet = new Set(POPULAR_COUNTRIES);
  const africanSet = new Set(AFRICAN_COUNTRIES);

  const filtered = query
    ? ALL_COUNTRIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : [];

  const showSections = !query;

  const popularList = showSections
    ? POPULAR_COUNTRIES
    : [];

  const africanList = showSections
    ? AFRICAN_COUNTRIES.filter((c) => !popularSet.has(c))
    : [];

  const restList = showSections
    ? ALL_COUNTRIES.filter((c) => !popularSet.has(c) && !africanSet.has(c))
    : [];

  function select(c: string) {
    onChange(c);
    setQuery(c);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="h-9 px-2 rounded-md border border-input bg-muted text-xs flex items-center justify-between gap-2 cursor-pointer"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || "— Select —"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-card shadow-xl max-h-64 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-2 h-9 border-b border-border shrink-0">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries..."
              className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {query && filtered.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">No matches found</p>
                <button
                  onClick={() => select(query)}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Use "{query}"
                </button>
              </div>
            ) : query ? (
              filtered.map((c) => (
                <button
                  key={c}
                  onClick={() => select(c)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted cursor-pointer ${
                    c === value ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))
            ) : (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted">Popular</div>
                {popularList.map((c) => (
                  <button
                    key={c}
                    onClick={() => select(c)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted cursor-pointer ${
                      c === value ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted mt-1">Africa</div>
                {africanList.map((c) => (
                  <button
                    key={c}
                    onClick={() => select(c)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted cursor-pointer ${
                      c === value ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20 mt-1">All Countries</div>
                {restList.map((c) => (
                  <button
                    key={c}
                    onClick={() => select(c)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted cursor-pointer ${
                      c === value ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
