'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from "react";
import { Trash2, Plus, Info } from 'lucide-react'; 

interface moreInfoPropos {
  setextra_payload: (payload: any) => void;
  initialData?: {
    variants?: any[];
    storages?: string[];
    colors?: string[];
  };
}

export function MoreInfo({ setextra_payload, initialData }: moreInfoPropos) {
  const [storageInput, setStorageInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [storages, setStorages] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [variants, setVariants] = useState<any[]>([]);

  const hasInitialized = useRef(false);

  useEffect(() => {
  // 1. التحقق من وجود بيانات ومنع التكرار
  if (!initialData || hasInitialized.current) return;

  // 2. ضمان أننا نتعامل مع مصفوفة مهما كان شكل البيانات القادمة
  let rawVariants = initialData.variants;
  
  // إذا كانت البيانات كائن وليست مصفوفة، نحولها لمصفوفة
  if (rawVariants && !Array.isArray(rawVariants)) {
    rawVariants = Object.values(rawVariants);
  }
  
  // إذا كانت فارغة تماماً، نجعلها مصفوفة فارغة
  const safeVariants = Array.isArray(rawVariants) ? rawVariants : [];

  // 3. عملية الـ Flattening الآمنة
  const flattenedVariants = safeVariants.map((v: any) => ({
    storage: v.options?.storage || v.storage || "",
    color: v.options?.color || v.color || "",
    price: v.price || 0,
    stock: v.stock || 0,
  }));

  setVariants(flattenedVariants);

  // استخراج الأنواع الأساسية (Storages)
  const extractedStorages = [...new Set(flattenedVariants.map(x => x.storage))].filter(Boolean) as string[];
  setStorages(extractedStorages);

  if (extractedStorages.length) {
    setSelectedStorage(extractedStorages[0]);
  }

  hasInitialized.current = true;
}, [initialData]);


  useEffect(() => {
    setextra_payload({
      variants,
      storages,
    });
  }, [variants, storages]);

  const addStorage = () => {
    const trimmed = storageInput.trim();
    if (!trimmed || storages.includes(trimmed)) return;
    setStorages([...storages, trimmed]);
    setSelectedStorage(trimmed);
    setStorageInput("");
  };

  const addColor = () => {
    if (!selectedStorage) return;
    const trimmedColor = colorInput.trim();

    const exists = variants.some((v) => 
      v.storage === selectedStorage && v.color === (trimmedColor || null)
    );

    if (exists) {
      alert("هذا المتغير موجود بالفعل لهذا الاختيار");
      return;
    }

    const newVariant = {
      storage: selectedStorage,
      color: trimmedColor || null,
      stock: 0,
      price: 0,
    };

    setVariants([...variants, newVariant]);
    setColorInput("");
  };

  const updateVariant = (index: number, field: string, value: string) => {
    setVariants(prev =>
      prev.map((v, i) =>
        i === index ? { ...v, [field]: Number(value) } : v
      )
    );
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
  <div className="max-w-4xl mx-auto" dir="rtl">
    <AnimatePresence mode="popLayout">
      <motion.div layout className="space-y-4">

        {/* Main Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <motion.div layout className="p-4 rounded-2xl bg-surface-2 border border-border">

            <label className="text-xs font-bold text-muted mb-2 block">
              1. النوع الأساسي (سعة، وزن، مقاس):
            </label>

            <div className="flex gap-2 mb-3 flex-wrap">
              {storages.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStorage(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
                    ${selectedStorage === s
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-surface text-text border-border hover:border-muted"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                placeholder="مثلاً: 128GB، XL، 1كغ..."
                value={storageInput}
                onChange={(e) => setStorageInput(e.target.value)}
                className="flex-1 p-2.5 bg-surface border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={addStorage}
                className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-hover transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

          </motion.div>

          {/* Colors / Sub Variants */}
          <AnimatePresence mode="wait">
            {selectedStorage && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl bg-surface border border-border shadow-sm"
              >

                <label className="text-xs font-bold text-muted mb-2 block">
                  2. إضافة تفاصيل لـ <span className="text-primary">({selectedStorage})</span>:
                </label>

                <div className="flex gap-2">
                  <input
                    placeholder="اللون أو ميزة إضافية..."
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="flex-1 p-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={addColor}
                    className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-hover transition-colors shadow-md"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <p className="text-[10px] text-muted mt-2 flex items-center gap-1">
                  <Info size={10} /> اترك الحقل فارغاً إذا لم يكن هناك ألوان.
                </p>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Variants Table */}
        {variants.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 border border-border rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">

              <table className="w-full text-xs text-right border-collapse">

                <thead>
                  <tr className="bg-surface-2 text-muted font-bold">
                    <th className="p-3">النوع</th>
                    <th className="p-3">التفصيل</th>
                    <th className="p-3">المخزون</th>
                    <th className="p-3">السعر (دج)</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>

                <tbody>
                  {variants.map((v, i) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${v.storage}-${v.color}-${i}`}
                      className="border-t border-border hover:bg-surface-2 transition-colors"
                    >

                      <td className="p-3 font-bold text-text">{v.storage}</td>
                      <td className="p-3 text-muted">{v.color || "—"}</td>

                      <td className="p-3">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariant(i, "stock", e.target.value)}
                          className="w-16 p-1.5 border border-border rounded-lg text-center font-bold outline-none focus:border-primary"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(i, "price", e.target.value)}
                          className="w-20 p-1.5 border border-border rounded-lg text-center font-bold text-primary outline-none focus:border-primary"
                        />
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => removeVariant(i)}
                          className="p-1.5 text-muted hover:text-error transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>

                    </motion.tr>
                  ))}
                </tbody>

              </table>

            </div>
          </motion.div>
        )}

      </motion.div>
    </AnimatePresence>
  </div>
);
}
