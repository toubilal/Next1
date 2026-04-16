'use client'
import { useState } from "react";
import FloatingMenu from '@/components/layout/FloatingMenu';
export default function AddProduct() { const [type, setType] = useState("variant");

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
const addColor = () => { if (!colorInput || !selectedStorage) return;

const newVariant = {
  storage: selectedStorage,
  color: colorInput,
  stock: 0,
  price: 0
};

setVariants([...variants, newVariant]);
setColorInput("");

};

const updateVariant = (index, field, value) => { const updated = [...variants]; updated[index][field] = value; setVariants(updated); };

const handleSubmit = () => { console.log({ variants }); alert("Check console"); };

return ( <div className="p-6 max-w-4xl mx-auto">
  <div className="space-y-6">
   

    {/* الحاوية الأفقية لـ Storage و Colors */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex">
      
      {/* Storage group */}
      <div className="border border-slate-300 p-4 rounded-xl bg-white">
        <h2 className="font-semibold mb-3 text-slate-700">مقاس، وزن إلخ ...</h2>
        <div className="flex gap-2 mb-3 flex-wrap">
          {storages.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedStorage(s)}
              className={`px-3 py-1 rounded-lg border transition-all ${
                selectedStorage === s
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-600 border-slate-300 hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={storageInput}
            onChange={(e) => setStorageInput(e.target.value)}
            placeholder="مثال: 128GB"
            className="w-full p-3 border border-slate-300 rounded-xl bg-white text-black placeholder:text-slate-400 focus:border-primary outline-none transition-all shadow-sm"
          />
          <button onClick={addStorage} className="bg-primary text-white px-4 rounded-xl hover:opacity-90">
            +
          </button>
        </div>
      </div>

      {/* Colors group */}
      {selectedStorage && (
        <div className="border border-slate-300 p-4 rounded-xl bg-white">
          <h2 className="font-semibold mb-3 text-slate-700">
            Colors for: <span className="text-primary">{selectedStorage}</span>
          </h2>
          <div className="flex gap-2">
            <input
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="مثال: Black, Silver"
              className="w-full p-3 border border-slate-300 rounded-xl bg-white text-black placeholder:text-slate-400 focus:border-primary outline-none transition-all shadow-sm"
            />
            <button onClick={addColor} className="bg-primary text-white px-4 rounded-xl hover:opacity-90">
              +
            </button>
          </div>
        </div>
      )}
    

    {/* Variants table */}
    {variants.length > 0 && (
      <div className="border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden">
  
  <div className="overflow-x-auto">
    
    <table className="w-full text-sm min-w-max">
      
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="p-3 text-right whitespace-nowrap">Storage</th>
          <th className="p-3 text-right whitespace-nowrap">Color</th>
          <th className="p-3 text-right whitespace-nowrap">Stock</th>
          <th className="p-3 text-right whitespace-nowrap">Price</th>
        </tr>
      </thead>

      <tbody>
        {variants.map((v, i) => (
          <tr key={i} className="border-t border-slate-200">
            
            <td className="p-3 whitespace-nowrap">{v.storage}</td>
            <td className="p-3 whitespace-nowrap">{v.color}</td>

            <td className="p-3">
              <input
                type="number"
                value={v.stock}
                onChange={(e) => updateVariant(i, "stock", e.target.value)}
                className="border border-slate-300 p-2 rounded-lg w-20 text-center"
              />
            </td>

            <td className="p-3">
              <input
                type="number"
                value={v.price}
                onChange={(e) => updateVariant(i, "price", e.target.value)}
                className="border border-slate-300 p-2 rounded-lg w-20 text-center"
              />
            </td>

          </tr>
        ))}
      </tbody>

    </table>

  </div>

</div>
    )}
</div>
    <button
      onClick={handleSubmit}
      className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
    >
      Save Product
    </button>
  </div>
  <FloatingMenu actions={myActions} />
</div>


); 
  
}