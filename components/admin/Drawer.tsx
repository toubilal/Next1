"use client";
import { useState } from "react";
import Link from "next/link";
import { Home, Package, BarChart3, Settings, LogOut, Menu, X, Bell, ShoppingBag, ArrowLeft, ChevronDown, ChevronLeft } from "lucide-react";
import Image from 'next/image'
import { useNotifications } from "@/context/NotificationContext";

export function AdminDrawer() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const { orders, unreadCount, markAsRead } = useNotifications();

  const displayLimit = Math.max(4, unreadCount);
  const displayedOrders = orders.slice(0, displayLimit);
  const [openIndex, setOpenIndex] = useState(null);

  const adminItems = [
    {
      name: "إدارة المنتجات",
      path: "/admin/products",
      icon: <Package size={20} />,
      children: [
        { name: "إضافة منتج", path: "/addproducts", icon: "📦" },
        { name: "إضافة صنف", path: "/products/category", icon: "🏷" },
      ],
    },
    { name: "الإحصائيات", path: "/admin/stats", icon: <BarChart3 size={20} /> },
    { name: "الإعدادات", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
  <>
    {/* Navbar */}
    <header className="flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-[80]" dir="rtl">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-surface-2 rounded-xl transition-colors">
          <Menu className="w-6 h-6 text-text" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsNotifOpen(true)} 
          className="p-2 text-muted hover:bg-surface-2 rounded-full relative transition-transform active:scale-90"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
          Admin
        </div>
      </div>
    </header>

    {/* Menu */}
    <div className={`fixed inset-y-0 right-0 z-[100] w-72 bg-surface shadow-2xl transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`} dir="rtl">
      <div className="p-6 h-full flex flex-col text-start">

        <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
          <h2 className="text-xl font-black text-primary italic">
            DASH<span className="text-text">BOARD</span>
          </h2>
          <button onClick={() => setIsMenuOpen(false)}>
            <X size={24} className="text-muted" />
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 text-text hover:bg-surface-2 rounded-xl font-semibold">
            <Home size={20} className="text-primary" /> الرئيسية
          </Link>

          <div className="pt-4 mt-4 border-t border-border text-start">
            <p className="text-[10px] font-bold text-muted mb-2 px-3 uppercase tracking-widest">الإدارة</p>

            {adminItems.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between p-3 text-text hover:bg-primary/5 rounded-xl font-semibold">
                  <Link href={item.path} className="flex items-center gap-3 flex-1 text-start">
                    {item.icon}
                    {item.name}
                  </Link>

                  {item.children && (
                    <button onClick={() => toggle(index)} className="p-1">
                      {openIndex === index ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
                    </button>
                  )}
                </div>

                {item.children && openIndex === index && (
                  <div className="me-6 mt-1 border-r-2 border-primary/20 pe-4">
                    <div className="flex flex-col gap-1">
                      {item.children.map((child, i) => (
                        <Link
                          key={i}
                          href={child.path}
                          className="flex items-center gap-2 p-2 text-sm text-muted hover:text-primary"
                        >
                          <span className="w-1 h-1 rounded-full bg-muted"></span>
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

        <button className="w-full flex items-center gap-4 p-3 text-error hover:bg-error/10 rounded-xl font-bold border-t border-border mt-4 text-start">
          <LogOut size={20} /> خروج
        </button>
      </div>
    </div>

    {/* Notifications */}
    <div className={`fixed inset-y-0 left-0 z-[100] w-80 bg-surface shadow-2xl transform ${isNotifOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out border-r border-border`} dir="rtl">
      <div className="p-4 h-full flex flex-col text-start">

        <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-text">آخر السلات</h2>
          </div>

          <button onClick={() => { setIsNotifOpen(false); markAsRead(); }} className="p-1 hover:bg-surface-2 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">

          {displayedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted opacity-50">
              <ShoppingBag size={40} className="mb-2" />
              <p className="text-sm">لا توجد طلبات بعد</p>
            </div>
          ) : (
            <div className="space-y-4 px-2">

              {orders.map((order, index) => {
                const hasUnread = order?.items?.some((item: any) => !item.is_seen) || false;
                const previousOrderHasUnread = index > 0 && (orders[index - 1]?.items?.some((item: any) => !item.is_seen) || false);

                return (
                  <div key={order.order_id} className={`p-4 rounded-2xl border transition-all ${hasUnread ? "bg-primary/5 border-primary/20" : "bg-surface border-border"}`}>

                    {!hasUnread && previousOrderHasUnread && (
                      <div className="py-2 text-[10px] text-muted font-bold text-center uppercase tracking-widest">
                        الطلبات السابقة
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <div className="text-start">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-text text-sm">{order.customer_name}</h3>
                          {hasUnread && <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>}
                        </div>
                        <p className="text-[10px] text-muted">{order.customer_phone}</p>
                      </div>

                      <span className={`text-[9px] px-2 py-1 rounded-lg font-bold ${hasUnread ? "bg-primary text-white" : "bg-surface-2 text-muted"}`}>
                        {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-border pt-3">

                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl border ${item.is_seen ? "bg-surface-2/50 border-border" : "bg-surface border-primary/20"}`}>

                          <div className="relative w-10 h-10 bg-surface-2 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                            {item.product?.Image ? (
                              <Image src={item.product.Image} alt="" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-muted">N/A</div>
                            )}
                          </div>

                          <div className="flex-1 text-start">
                            <p className="text-[11px] font-bold text-text line-clamp-1">
                              {item.product?.Title || "منتج غير معروف"}
                            </p>
                            <p className="text-[10px] text-primary font-medium">
                              الكمية: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}

                    </div>

                    <div className="mt-3 flex items-center gap-1 text-[10px] p-2 rounded-lg bg-surface-2 text-muted">
                      <span className="font-bold text-text ms-1">العنوان:</span>
                      <span className="truncate">{order.customer_address}</span>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        <Link href="/stats" onClick={() => setIsNotifOpen(false)} className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white p-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-md group">
          مزيد من التفاصيل <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        </Link>

      </div>
    </div>

    {(isMenuOpen || isNotifOpen) && (
      <div className="fixed inset-0 bg-black/30 z-[90] backdrop-blur-[1px]" onClick={() => { setIsMenuOpen(false); setIsNotifOpen(false); }} />
    )}
  </>
);
}
