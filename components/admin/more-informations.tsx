'use client'
import { motion,AnimatePresence } from 'framer-motion'
import { useState,useRef } from "react";
import { Trash2 } from 'lucide-react'; 
import { useEffect } from "react";
import FloatingMenu from '@/components/layout/FloatingMenu';
interface moreInfoPropos{
  setextra_payload:(payload:any)=>void;
  
  initialData?: {
    variants?: any[];
    storages?: string[];
    colors?: string[];
  };
}

export  function MoreInfo({setextra_payload,initialData} :moreInfoPropos) { 
  
const [type, setType] = useState("variant");

// attributes 
const [storageInput, setStorageInput] = useState(""); const [colorInput, setColorInput] = useState("");

const [storages, setStorages] = useState([]); const [colors, setColors] = useState([]);

// selected storage (🔥 new)
const [selectedStorage, setSelectedStorage] = useState(null);

// variants
const [variants, setVariants] = useState([]);

const addStorage = () => { if (!storageInput) return; if (storages.includes(storageInput)) return; setStorages([...storages, storageInput]); setSelectedStorage(storageInput); // auto select 
setStorageInput(""); };
const myActions = [
    { icon: '➕',label:'إضافة صنف',onClick: () => console.log('إضافة منتج') },
    { icon: '📊', label:'اضافة منتج',onClick: () => console.log('عرض الإحصائيات') },
  ];
const addColor = () => {
  if (!selectedStorage) return;

  const exists = variants.some((v) => {
    const sameStorage = v.storage === selectedStorage;

    const sameColor =
      (!v.color && !colorInput) || // الاثنين فارغين
      (v.color &&
        colorInput &&
        v.color.toLowerCase() === colorInput.toLowerCase());

    return sameStorage && sameColor;
  });

  if (exists) {
    alert("هذا المتغير موجود بالفعل");
    return;
  }

  const newVariant = {
    storage: selectedStorage,
    color: colorInput || null, // نخليها optional
    stock: 0,
    price: 0,
  };

  setVariants([...variants, newVariant]);
  setColorInput("");
};
const hasInitialized = useRef(false);
useEffect(() => {
  if (!initialData || hasInitialized.current) return;

  const rawVariants = initialData.variants || [];

  // تحويل البيانات من الشكل المتداخل إلى الشكل المسطح (Flattening)
  const flattenedVariants = rawVariants.map((v) => ({
    // نأخذ القيم من options ونخرجها للمستوى الأعلى
    storage: v.options?.storage || "",
    color: v.options?.color || "",
    price: v.price || 0,
    stock: v.stock || 0,
  }));

  setVariants(flattenedVariants);

  // استخراج الـ storages من البيانات المسطحة
  const extractedStorages = [...new Set(flattenedVariants.map(x => x.storage))];
  setStorages(extractedStorages);

  if (extractedStorages.length) {
    setSelectedStorage(extractedStorages[0]);
  }

  hasInitialized.current = true;
}, [initialData]);


const updateVariant = (index, field, value) => {
  setVariants(prev =>
    prev.map((v, i) =>
      i === index ? { ...v, [field]: Number(value) } : v
    )
  );
};
const removeVariant = (index) => {
  setVariants(variants.filter((_, i) => i !== index));
};

const handleSubmit = () => { console.log({ variants }); alert("Check console"); };

useEffect(() => {
  setextra_payload({
    variants,
    storages,
    colors,
  });
}, [variants, storages, colors]);
return ( <div className="max-w-4xl mx-auto">
  <AnimatePresence mode="popLayout">
    <motion.div layout className="space-y-6">

      {/* الحاوية الأفقية لـ Storage و Colors */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Storage group */}
        <motion.div layout className="border border-slate-300 p-4 rounded-xl bg-white shadow-sm">
          <div className="flex gap-2 mb-3 flex-wrap">
            {storages.map((s, i) => (
              <motion.button
                layout
                key={s} // يفضل استخدام القيمة الفريدة كمفتاح
                onClick={() => setSelectedStorage(s)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  selectedStorage === s ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-300"
                }`}
              >
                {s}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
            placeholder="مثلا الوزن القياس الحجم...."
              value={storageInput}
              onChange={(e) => setStorageInput(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl"
            />
            <button onClick={addStorage} className="bg-primary text-white px-4 rounded-xl">+</button>
          </div>
        </motion.div>

        {/* Colors group */}
        <AnimatePresence>
          {selectedStorage && (
            <motion.div
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="border border-slate-300 p-4 rounded-xl bg-white shadow-sm"
            >
              <h2 className="font-semibold mb-3 text-slate-700">
                 <span className="text-primary">{selectedStorage}</span>
              </h2>
              <div className="flex gap-2">
                <input
                placeholder="مثلا اللون....."
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl"
                />
                <button onClick={addColor} className="bg-primary text-white px-4 rounded-xl">+</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Variants table */}
      <AnimatePresence mode="popLayout">
        {variants.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3 text-right"></th>
                    <th className="p-3 text-right"></th>
                    <th className="p-3 text-right">Stock</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  
                    {variants.map((v, i) => (
   <motion.tr
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -10 }}
    key={`${v.storage}-${v.color}-${i}`}
    className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
  >
    <td className="p-3">{v.storage}</td>
    <td className="p-3">{v.color}</td>
    <td className="p-3">
      <input 
        type="number" 
        value={v.stock} 
        onChange={(e) => updateVariant(i, "stock", e.target.value)} 
        className="border p-2 rounded-lg w-20" 
      />
    </td>
    <td className="p-3">
      <input 
        type="number" 
        value={v.price} 
        onChange={(e) => updateVariant(i, "price", e.target.value)} 
        className="border p-2 rounded-lg w-20" 
      />
    </td>
    {/* إضافة زر الحذف */}<td className="p-3 text-center">
      <button 
        onClick={() => removeVariant(i)}
        className="p-2 text-red-400 transition-all duration-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:scale-105"
        title="حذف"
      >
        <Trash2 size={18} strokeWidth={2} />
      </button>
    </td>
  
    
  </motion.tr>
))}

                  </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </AnimatePresence>
</div>

); 
}