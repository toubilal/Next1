"use client";
import Image from 'next/image';
import { useContext, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {submitOrderAction} from '@/app/actions/ordersActions'
import { CartContext } from "@/context/CartContext";
import { supabase } from "@/lib/supabase"; // تأكد من مسار استيراد supabase لديك

export default function CheckoutPage() {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [toast, setToast] = useState(null);const showToast = (message, type = "info") => {
  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 2000);
};
  const { cart, setCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
  fullName: '',
  phone: '',
  address: ''
});
  

  const removeItem = (id: string | number) => {
    const updated = cart.filter((item) =>(item.cartItemId|| item.id )!== id);
    setCart(updated);
  };

  const updateQuantity = (id: string | number, delta: number) => {
    const updated = cart.map(item => {
  if ((item.cartItemId||item.id )!== id) return item;

  const currentQty = item.quantityCart || 1;

  // منع الزيادة فوق المخزون
  if (delta > 0 && currentQty >= item.quantity) {
    showToast("وصلت للحد الأقصى", "error");
    return item;
  }

  // منع النزول تحت 1
  if (delta < 0 && currentQty <= 1) {
    return item;
  }

  return {
    ...item,
    quantityCart: currentQty + delta
  };
});
    setCart(updated);
  };

  
  

  const handleConfirmOrder = async () => {
  setLoading(true);

  try {
    // تجهيز البيانات بشكل نظيف وسطر واحد لكل منتج
    /*const ordersToInsert = cart.map((item) => ({
      product_id: item.id,
      customer_name: customerInfo.fullName,
      customer_phone: customerInfo.phone,
      quantity: item.quantity || 1, // إرسال القيمة للعمود الجديد
     customer_address: customerInfo.address ,
      status: 'pending'
    }));*/

   const result = await submitOrderAction(
  cart,
  customerInfo,
  captchaToken
);
if (result.success) {
   alert("تم الطلب!");
}


    if (result.error) throw result.error;


    setCart([]); 
    setCustomerInfo({ fullName: '', phone: '' });

  } catch (error) {
    console.error('Error:', error);
    alert("حدث خطأ: " + error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {toast && (
  <div className={`toast ${toast.type}`}>
    {toast.message}
  </div>
)}
      <div className="bg-white border-b sticky top-0 z-10 p-4 text-right">
        <h1 className="text-xl font-black text-center text-gray-800">تأكيد الطلب 🛒</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 text-right" dir="rtl">
        
        {/* قسم منتجات السلة */}
        <section className="bg-white rounded-2xl shadow-sm border p-4">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>محتويات السلة</span>
            <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full">{cart.length}</span>
          </h2>
          
          <div className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-center text-gray-400 py-4 font-bold">السلة فارغة حالياً</p>
            ) : (
              cart.map((item) => (
                <div key={item.cartItemId || item.id} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                    <Image
                      src={item.Image || "/placeholder.jpg"}
                      alt={item.Title || "product"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 text-right">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{item.Title}</h3>
                    <div className="flex items-center justify-end gap-4 mt-2">
                      <p className="text-blue-600 font-black text-sm">{item.Price} د.ج</p>
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.cartItemId||item.id, 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-xs font-bold">+</button>
                        <span className="px-3 text-xs font-bold">{item.quantityCart || 1}</span>
                        <button onClick={() => updateQuantity(item.cartItemId||item.id, -1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-xs font-bold">-</button>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => removeItem(item.cartItemId||item.id)} className="text-gray-300 hover:text-red-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* قسم بيانات الزبون */}
        <section className="bg-white rounded-2xl shadow-sm border p-4 space-y-4">
          <h2 className="font-bold text-gray-700">معلومات التوصيل</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الاسم واللقب</label>
              <input 
                type="text" 
                placeholder="أدخل اسمك الكامل"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm text-right text-black"
                value={customerInfo.fullName}
                onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
              />
            </div>
<div>
  <label className="block text-xs font-bold text-gray-500 mb-1">
    العنوان الكامل
  </label>
  <input 
    type="text" 
    placeholder="ضع عنوانك الكامل"
    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm text-right text-black"
    value={customerInfo.address ||""}
    onChange={(e) => setCustomerInfo({
      ...customerInfo,
      address: e.target.value
    })}
  />
</div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">رقم الهاتف</label>
              <input 
                type="tel" 
                placeholder="0XXXXXXXXX"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm text-right text-black"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* ملخص السعر وزر التاكيد */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2 flex-row-reverse">
            <span className="text-gray-500 font-bold">المجموع الكلي:</span>
            <span className="text-2xl font-black text-green-700"> {cart.reduce((total, item) => total + (Number(item.Price) * (item.quantityCart || 1)), 0)} <span className="text-sm">د.ج</span></span>
          </div>
<ReCAPTCHA
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
  onChange={(token) => setCaptchaToken(token)}
/>
          <button 
            onClick={handleConfirmOrder}
            disabled={
  loading ||
  cart.length === 0 ||
  !customerInfo.fullName ||
  !customerInfo.phone ||
  !customerInfo.address ||
  !captchaToken
}
            className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:bg-gray-300 disabled:active:scale-100"
          >
            {loading ? "جاري الإرسال..." : "تأكيد الطلب الآن"}
          </button>
        </div>

      </div>
    </div>
  );
}
