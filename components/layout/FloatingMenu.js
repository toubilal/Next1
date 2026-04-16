// components/layout/FloatingMenu.js
'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingMenu({ actions }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* طبقة التضبيب - تم تقليل التضبيب ليتوافق مع الصورة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/15 backdrop-blur-[1px] z-40"
          />
        )}
      </AnimatePresence>

      {/* الحاوية الرئيسية للأزرار - تم تغيير المحاذاة */}
      {/* تم تغيير items-center إلى items-end لتثبيت العناصر لليمين */}{/* الحاوية الرئيسية: نستخدم items-center لتركز الأزرار في المنتصف */}
<div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
  <AnimatePresence>
    {isOpen && actions.map((action, index) => (
      <motion.div
        key={index}
        // التغيير السحري هنا: y بدلاً من x
        // نبدأ من تحت (20px) ونصعد لمكاننا (0px)
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        // إضافة تأخير بسيط بناءً على الـ index ليعطي فخامة أكبر للحركة (تباعاً)
        transition={{ delay: index * 0.05 }}
        // المحاذاة المركزية:
        className="relative flex items-center justify-center w-full h-14 mb-2"
      >
        {/* النص (Label): يبقى absolute على اليسار */}
        <span className="absolute right-[120%] bg-white px-3 py-1.5 rounded text-sm font-medium shadow whitespace-nowrap text-gray-800">
          {action.label}
        </span>

        {/* الزر الفرعي: يبقى في المنتصف تماماً ويصعد مع الحاوية الأب */}
        <motion.button
          onClick={() => { action.onClick(); setIsOpen(false); }}
          className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-100"
        >
          {action.icon}
        </motion.button>
      </motion.div>
    ))}
  </AnimatePresence>

  {/* الزر الرئيسي الداكن (مثل الصورة وتطبيق X) */}
  <button 
    onClick={() => setIsOpen(!isOpen)}
    className={`w-16 h-16 flex items-center justify-center rounded-full shadow-xl text-3xl transition-all duration-300 ${
      isOpen ? 'bg-[#1a253a] text-white rotate-180' : 'bg-[#1a253a] text-white'
    }`}
  >
    {isOpen ? '✕' : '+'}
  </button>
</div>


      
    </>
  );
}
