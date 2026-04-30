export function CategoryBar({ categories, selected, onSelect }) {
  return (
  <div className="w-full px-4 py-6">
    <div className="flex flex-wrap gap-3 justify-start items-center">
      {categories?.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-5 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl
            ${selected === cat 
              ? 'bg-primary text-white shadow-md scale-105' 
              : 'bg-surface-2 text-muted hover:bg-surface-2'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);
}
