export function CategoryBar({ categories, selected, onSelect }) {
  return (
    <div className="w-full px-4 py-6">
      {/* استخدمنا flex-wrap لجعل الأزرار تنزل للسطر التالي تلقائياً */}
      <div className="flex flex-wrap gap-3 justify-start">
        {categories?.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-5 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl
              ${selected === cat 
                ? 'bg-slate-900 text-white shadow-md scale-105' // اللون النشط (أسود المشروع)
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200' // اللون العادي (رمادي فاتح مثل الصورة)
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
