"use client";
import { useState } from "react";
import Link from "next/link";
import { Home, Package, BarChart3, Settings, LogOut, Menu, X, Bell, ShoppingBag, ArrowLeft } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

export function AdminDrawer() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const { orders, unreadCount,markAsRead  } = useNotifications();

  // منطق العرض: نعرض 4 سلات على الأقل، أو كل السلات الجديدة إذا كانت أكثر من 4
  const displayLimit = Math.max(4, unreadCount);
  const displayedOrders = orders.slice(0, displayLimit);
const [openIndex, setOpenIndex] = useState(null);
  const adminItems = [
    {
      name: "إدارة المنتجات",
      path: "/products",
      icon: <Package size={20} />,
      children: [
        { name: "إضافة منتج", path: "/addproducts", icon: "📦" },
        { name: "إضافة صنف", path: "/products/category", icon: "🏷" },
      ],
    },
    { name: "الإحصائيات", path: "/stats", icon: <BarChart3 size={20} /> },
    { name: "الإعدادات", path: "/settings", icon: <Settings size={20} /> },
  ];
const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* --- Navbar العلوي --- */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-[80]" dir="rtl">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* زر الإشعارات مع العداد اللحظي */}
          <button 
            onClick={() => { setIsNotifOpen(true);  }} 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative transition-transform active:scale-90"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">Admin</div>
        </div>
      </header>

      {/* --- 1. القائمة الجانبية (يمين) --- */}
      <div className={`fixed inset-y-0 right-0 z-[100] w-72 bg-white shadow-2xl transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`} dir="rtl">
        <div className="p-6 h-full flex flex-col text-right">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-xl font-black text-primary italic">DASH<span className="text-slate-700">BOARD</span></h2>
            <button onClick={() => setIsMenuOpen(false)}><X size={24} className="text-slate-400" /></button>
          </div>
          <nav className="space-y-1 flex-1">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold">
              <Home size={20} className="text-primary" /> الرئيسية
            </Link>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-widest">الإدارة</p>
             {adminItems.map((item, index) => (
        <div key={index}>
          
          {/* العنصر الرئيسي */}
          <div className="flex items-center justify-between p-3 text-slate-700 hover:bg-primary/5 rounded-xl font-semibold">
             
            <Link href={item.path} className="flex items-center gap-3">
              {item.icon}
              {item.name}
            </Link>
{/* السهم */}
            {item.children && (
              <button onClick={() => toggle(index)} className="text-lg">
                {openIndex === index ? "⌄" : "›"}
              </button>
            )}
           
          </div>

          {/* العناصر الفرعية */}{/* العناصر الفرعية */}
{item.children && openIndex === index && (
  <div className="ml-6 mt-1 border-r-2 border-primary/20 pr-4"> {/* تعديل الحدود والمسافات */}
    <div className="flex flex-col gap-1">
      {item.children.map((child, i) => (
        <Link
          key={i}
          href={child.path}
          className="flex items-center gap-2 p-2 text-sm text-slate-600 hover:text-primary transition-all duration-200"
        >
          <span className="w-1 h-1 rounded-full bg-slate-400"></span> {/* نقطة صغيرة للتمييز */}
          {child.icon}
          {child.name}
        </Link>
      ))}
    </div>
  </div>
)}

         
        </div>
      ))}
            </div>
          </nav>
          <button className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold border-t mt-4">
            <LogOut size={20} /> خروج
          </button>
        </div>
      </div>

      {/* --- 2. درج الإشعارات (يسار) - نظام السلات الحية --- */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-80 bg-slate-50 shadow-2xl transform ${isNotifOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out border-r`} dir="rtl">
        <div className="p-4 h-full flex flex-col text-right">
          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <div className="flex items-center gap-2">
               <ShoppingBag size={20} className="text-blue-600" />
               <h2 className="text-lg font-bold text-slate-800">آخر السلات</h2>
            </div>
            <button onClick={() => {setIsNotifOpen(false);
            markAsRead();
            }
            } className="p-1 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 overscroll-contain custom-scrollbar">
            {displayedOrders.length === 0 ? (
              <div key={0} className="flex flex-col items-center justify-center h-40 text-slate-400 opacity-50">
                <ShoppingBag size={40} className="mb-2" />
                <p className="text-sm">لا توجد طلبات بعد</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
  {orders.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
      <p className="text-sm">لا توجد طلبات معلقة حالياً</p>
    </div>
  ) : (
    orders.map((order, index) => {
  const hasUnread = order?.items?.some((item: any) => !item.is_seen) || false;

  // تأكد أيضاً من الوصول الآمن للطلب السابق
  const previousOrderHasUnread = 
    index > 0 && 
    (orders[index - 1]?.items?.some((item: any) => !item.is_seen) || false);

      return (
        <div 
          key={order.order_id} 
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            hasUnread 
              ? "bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100" 
              : "bg-white border-slate-100"
          }`}
        >
           {!hasUnread && previousOrderHasUnread && (
        <div className="py-2 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
          الطلبات السابقة
        </div>
      )}
          {/* رأس البطاقة: اسم العميل والوقت */}
          <div className="flex justify-between items-start mb-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 text-sm">{order.customer_name}</h3>
                {/* علامة مميزة (نقطة زرقاء) للطلب الجديد */}
                {hasUnread && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
              </div>
              <p className="text-[10px] text-slate-500">{order.customer_phone}</p>
            </div>
            <span className={`text-[9px] px-2 py-1 rounded-lg font-bold ${
              hasUnread ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* قائمة المنتجات داخل هذه السلة */}
          <div className="space-y-2 border-t border-dashed border-slate-200 pt-3">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl border ${
                item.is_seen ? "bg-white/50 border-slate-50" : "bg-white border-blue-100"
              }`}>
                {/* صورة المنتج */}
                <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                  {item.product?.Image ? (
                    <img src={item.product.Image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300 uppercase">N/A</div>
                  )}
                </div>
                {/* تفاصيل المنتج */}
                <div className="flex-1 text-right">
                  <p className="text-[11px] font-bold text-slate-700 line-clamp-1">
                    {item.product?.Title || "منتج غير معروف"}
                  </p>
                  <p className="text-[10px] text-blue-600 font-medium">الكمية: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* عنوان التوصيل */}
          <div className={`mt-3 flex items-center gap-1 text-[10px] p-2 rounded-lg ${
            hasUnread ? "bg-blue-100/50 text-blue-700" : "bg-slate-50 text-slate-400"
          }`}>
             <span className="font-bold text-slate-600">العنوان:</span>
             <span className="truncate">{order.customer_address}</span>
          </div>
        </div>
      );
    })
  )}
</div>

            )}
          </div>

          {/* زر التوجه للإحصائيات */}
          <Link 
            href="/stats" 
            onClick={() => setIsNotifOpen(false)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-md group"
          >
            مزيد من التفاصيل <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* الخلفية المظلمة */}
      {(isMenuOpen || isNotifOpen) && (
        <div className="fixed inset-0 bg-slate-900/30 z-[90] backdrop-blur-[1px]" onClick={() => { setIsMenuOpen(false); setIsNotifOpen(false); }} />
      )}
    </>
  );
}
