"use client";
import { useEffect, useState } from 'react';
import Image from "next/image";
import { useNotifications } from "@/context/NotificationContext";
import { deleteId_order,Stats, getRecentOrders, getWeeklyStats,update_quantity_rpc ,handleConfirmOrder,deleteOrder} from '@/app/actions/adminActions'; // تأكد من استيراد دالة التحديث
import {Check, X, DollarSign,Loader2,Eye,Trash2, ShoppingCart, RefreshCw,RefreshCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function StatsPage() {
    const [activeTab, setActiveTab] = useState('pending');
  const [weeklyData, setWeeklyData] = useState([]);
  const [stats, setStats] = useState([]);

  const { notifications } = useNotifications();

  
  
  // هذا هو المتغير الأهم الذي سيحتوي على كل الطلبات مجمعة
  const [allGroupedOrders, setAllGroupedOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ views: 0, orders: 0 });

  async function fetchStats() {
    try {
      setLoading(true);
      const resStats = await Stats();
      const weeklyRes = await getWeeklyStats();
      const Allorders = await getRecentOrders();
      
      // 1. تحديث الإحصائيات العلوية والشارت
      if (!weeklyRes.error) setWeeklyData(weeklyRes.data || []);
      if (resStats.data) {
        setStats(resStats.data);
        const v = resStats.data.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const o = resStats.data.reduce((acc, curr) => acc + (curr.orders || 0), 0);
        setTotals({ views: v, orders: o });
      }

      // 2. تجميع الطلبات وتخزينها في الـ State
      if (!Allorders.error && Allorders.data) {
        const grouped = Allorders.data.reduce((groups, order) => {
          const groupKey = order.order_id || `temp-${order.id}`; 
          if (!groups[groupKey]) {
            groups[groupKey] = {
              order_id: groupKey,
              customer_name: order.customer_name,
              customer_phone: order.customer_phone,
              customer_address: order.customer_address,
              status: order.status,
              created_at: order.created_at,
              items: [] 
            };
          }
          groups[groupKey].items.push({
            selectedOptions:order.selectedOptions,
            id: order.id,
            product_id: order.product_id,
           
            quantity: order.quantity,
            product: order.product 
          });
          return groups;
        }, {});
        
        setAllGroupedOrders(Object.values(grouped));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  // الحالة الآن ستخزن كائن يحتوي على الـ ID ونوع العملية
const [loadingProcess, setLoadingProcess] = useState({ id: null, type: null });
const [disabledOrders, setDisabledOrders] = useState([]);
const handleClick = async (orderId, newStat, items = null) => {
  if (loadingProcess.id === orderId) return;

  // تخزين المعرف ونوع العملية (مثلاً: 'confirm' أو 'cancel')
  setLoadingProcess({ id: orderId, type: newStat });

  try {
    await handleUpdateStatus(orderId, newStat, items);
  } finally {
    // إعادة الحالة للوضع الافتراضي
    setLoadingProcess({ id: null, type: null });
  }
};



  

  // دالة تحديث الكمية (تعمل الآن على allGroupedOrders)
  const updateItemQuantity = async (ID,orderId, productId, delta) => {
  // فحص فوري: إذا كان الـ Id مفقوداً، توقف واطبع تنبيهاً
 // console.error(orderId+'   '+productId+'   '+delta)

  let newQty = 0;

  // تحديث محلي
  setAllGroupedOrders(prev => prev.map(group => {
  if (group.order_id === orderId) {
    return {
      ...group,
      items: group.items.map(item => {
        if ((item.product_id === productId)&&item.id===ID) {
          const newQty = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQty };
        }
        return item; // ❗ لا تغيّر هذا
      })
    };
  }
  return group;
}));


};

const handleDelete = async (orderId, productId,id) => {
  const ok = window.confirm("هل أنت متأكد من الحذف؟");
  if (!ok) return;

  const res = await deleteId_order(id);

  if (res.success) {
    removeItemFromOrder(orderId, id);
  } else {
    alert(res.error || "حدث خطأ");
  }
};

  // دالة حذف منتج محدد
  const removeItemFromOrder = (orderId, ID) => {
    setAllGroupedOrders(prev => prev.map(group => {
      if (group.order_id === orderId) {
        return { ...group, items: group.items.filter(i => i.id !== ID) };
      }
      return group;
    }).filter(group => group.items.length > 0));
  };

  // دالة الحذف النهائي للطلب
  const  handledeleteOrder =async (orderId) => {
    const res =await deleteOrder(orderId);
    if(res.error){throw new Error(res.error); }
    
    setAllGroupedOrders(prev => prev.filter(g => g.order_id !== orderId));
  };

  async function handleUpdateStatus(orderId, newStat, items) {
  

  

  const result = await handleConfirmOrder(orderId, newStat, items);

  if (result.error) {
    throw new Error(result.error);
  }

  await fetchStats();}

  useEffect(() => { fetchStats(); }, []);

  // الفلترة التي يعتمد عليها الـ Return الخاص بك
  const filteredOrders = allGroupedOrders.filter(group => group.status === activeTab);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 mb-20" dir="rtl">
      {/* الهيدر */}
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-800">إحصائيات المنصة</h1>
          <p className="text-slate-500 text-sm">تحليل أداء المنتجات والمشاهدات</p>
        </div>
        <button onClick={fetchStats} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* الكروت العلوية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
          <div className="flex items-center gap-2 opacity-80 mb-2">
            <Eye size={20} /><span className="text-sm font-bold">إجمالي المشاهدات</span>
          </div>
          <p className="text-4xl font-black">{totals.views.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center gap-2 opacity-80 mb-2">
            <ShoppingCart size={16} /><span className="text-sm font-bold">إجمالي الطلبات</span>
          </div>
          <p className="text-4xl font-black">{totals.orders.toLocaleString()}</p>
        </div>
      </div>

      {/* الشارت */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm h-64 w-full">
        <h3 className="text-xs font-bold text-slate-400 mb-4 mr-2">نشاط المشاهدات الأسبوعي</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
            <YAxis hide />
            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} labelStyle={{display: 'none'}} />
            <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* قسم الطلبات الجديدة */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mt-6"><div className="flex bg-slate-100 rounded-2xl p-1 mb-4 text-[11px] font-bold overflow-x-auto">

  <button
    onClick={() => setActiveTab('pending')}
    className={`flex-1 py-2 rounded-xl whitespace-nowrap ${
      activeTab === 'pending'
        ? 'bg-white shadow text-yellow-600'
        : 'text-slate-500'
    }`}
  >
    🟡 جديدة
  </button>

  <button
    onClick={() => setActiveTab('confirmed')}
    className={`flex-1 py-2 rounded-xl whitespace-nowrap ${
      activeTab === 'confirmed'
        ? 'bg-white shadow text-blue-600'
        : 'text-slate-500'
    }`}
  >
    🔵 مؤكدة
  </button>

  <button
    onClick={() => setActiveTab('completed')}
    className={`flex-1 py-2 rounded-xl whitespace-nowrap ${
      activeTab === 'completed'
        ? 'bg-white shadow text-emerald-700'
        : 'text-slate-500'
    }`}
  >
    💰 مقبوضة
  </button>

  <button
    onClick={() => setActiveTab('canceled')}
    className={`flex-1 py-2 rounded-xl whitespace-nowrap ${
      activeTab === 'canceled'
        ? 'bg-white shadow text-red-500'
        : 'text-slate-500'
    }`}
  >
    🔴 ملغاة
  </button>

</div>
        
        
        
        <div className="p-2 space-y-3">
          {filteredOrders.map((group: any) => (
            <div key={group.order_id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
                <div className="text-right">
                  <div className="font-black text-slate-800 text-sm">{group.customer_name}</div>
                  <div className="text-[11px] text-blue-600 font-bold">{group.customer_phone}</div>
                  <div className="text-[10px] text-slate-500 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">📍 {group.customer_address}</div>
                </div>
                <div className="text-left flex flex-col items-end">
                  <span className="text-[9px] font-mono text-slate-400">#{group.order_id}</span>
                  <span className="text-[9px] text-slate-400 mt-1">
                    {new Date(group.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>

              {/* قائمة المنتجات في السلة */}
              <div className="space-y-1.5 mb-4">
                {group.items.map((item: any, idx: number) => (
  <div
    key={idx}
    className={`relative flex items-center gap-2 text-[11px] p-1.5 rounded-xl transition-all duration-300 ${
      (item.quantity > item.product?.quantity_all && group.status === 'pending') 
        ? "bg-red-100 mt-8" 
        : "mt-2"
    }`}
  >
    {/* السحابة (باقي الكود الخاص بك هنا) */}
    {item.quantity > item.product?.quantity_all && group.status === 'pending' && (
      <div className="absolute -top-7 right-1 z-50 bg-yellow-100 border border-yellow-300 text-yellow-800 text-[9px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
        ⚠️ الكمية غير متاحة
        <div className="absolute -bottom-1 right-2.5 w-2 h-2 bg-yellow-100 border-b border-r border-yellow-300 rotate-45"></div>
      </div>
    )}

    {/* صورة المنتج */}
    <Image
  src={item.product?.Image || "https://via.placeholder.com/40"}
  width={28}
  height={28}
  className="rounded-lg object-cover bg-white flex-shrink-0"
  alt=""
/>


    {/* اسم المنتج */}
    <span className="truncate flex-1 font-medium text-right">
      {item.product?.Title || "منتج"}
    </span>

    {/* الخيارات (التعديل الجديد هنا) */}
    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
      <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] text-slate-600 whitespace-nowrap">
        <span>{item.selectedOptions.color}</span>
        <span className="opacity-40">|</span>
        <span>{item.selectedOptions.storage}</span>
      </div>
    )}

    {/* حاوية التحكم في الكمية */}
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1">
      {group.status === 'pending' && (
        <button onClick={() => updateItemQuantity(item.id, group.order_id, item.product_id, -1)} className="w-5 h-5 flex items-center justify-center text-red-500 font-bold hover:bg-red-50 rounded"> - </button>
      )}
      <span className={`font-black min-w-[20px] text-center px-1 ${
        (item.quantity > item.product?.quantity_all && group.status === 'pending') ? "text-red-600" : "text-blue-600"
      }`}>
        x{item.quantity}
      </span>
      {group.status === 'pending' && (
        <button onClick={() => updateItemQuantity(item.id, group.order_id, item.product_id, 1)} className="w-5 h-5 flex items-center justify-center text-emerald-600 font-bold hover:bg-emerald-50 rounded"> + </button>
      )}
    </div>

    {/* زر الحذف */}
    {group.status === 'pending' && (
      <button onClick={() => handleDelete(group.order_id, item.product_id, item.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
        <Trash2 size={14} />
      </button>
    )}
  </div>
))}



              </div>

              {/* التحكم */}
              <div className="flex justify-end gap-2"> {group.status === 'pending' && (
  <button
    onClick={() => handleClick(group.order_id, 'confirmed', group.items)}
    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
    disabled={loadingProcess.id||group.items.some(
  item => item.quantity > item.product?.quantity_all
)} // يتجمد إذا كان هناك أي عملية لهذا الطلب
  >
    {/* يظهر التحميل فقط إذا كان الـ type هو 'confirmed' */}
    {loadingProcess.id === group.order_id && loadingProcess.type === 'confirmed' ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : <Check className="w-3 h-3" />}
    تأكيد
  </button>
)}

{/* زر تم القبض */}
{group.status === 'confirmed' && (
  <button
    onClick={() => handleClick(group.order_id, 'completed', group.items)}
    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
    disabled={loadingProcess.id }// يتجمد إذا كان هناك أي عملية لهذا الطلب
  >
    {/* يظهر التحميل فقط إذا كان الـ type هو 'confirmed' */}
    {loadingProcess.id === group.order_id && loadingProcess.type === 'completed' ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : <Check className="w-3 h-3" />}
    تأكيد
  </button>
)}

{group.status !== 'canceled' && (
  <button
    onClick={() => handleClick(group.order_id, 'canceled',group.items)}
    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
    disabled={loadingProcess.id }// يتجمد عند الضغط على تأكيد أيضاً
  >
    {/* يظهر التحميل فقط إذا كان الـ type هو 'canceled' */}
    {loadingProcess.id === group.order_id && loadingProcess.type === 'canceled' ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : <X className="w-3 h-3" />}
    إلغاء
  </button>
)}

{/* في حالة ملغاة */}
{group.status === 'canceled' && (
  <div className="flex gap-2">
    {/* زر حذف نهائي - يتجمد فقط عند التحميل */}
    <button
      onClick={() => handledeleteOrder(group.order_id)}
      className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      disabled={loadingProcess.id }
    >
      <Trash2 className="w-3 h-3" />
      حذف نهائي
    </button>

    {/* زر إعادة المعالجة - يظهر التحميل ويتجمد */}
    <button
      onClick={() => handleClick(group.order_id, 'pending', group.items)}
      className="flex items-center gap-1 bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50"
      disabled={loadingProcess.id}
    >
      {loadingProcess.id === group.order_id && loadingProcess.type === 'pending' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <RefreshCcw className="w-3 h-3" />
      )}
      إعادة المعالجة
    </button>
  </div>
)}

              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && <div className="p-8 text-center text-slate-400 text-xs">لا توجد طلبات حالياً</div>}
        </div>
      </div>

      {/* جدول إحصائيات المنتجات */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4 text-right">المنتج</th>
                <th className="p-4 text-center">👁️</th>
                <th className="p-4 text-center">❤️</th>
                <th className="p-4 text-center">📦</th>
                <th className="p-4 text-center">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.map((item) => (
  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-xs">
    <td className="p-4 font-bold text-slate-700">
      <Link href={`/products/${item.id}`} className="flex items-center gap-3 group">
        {/* أضفنا relative للحاوية حتى تعمل الخاصية fill بشكل صحيح */}
        <div className="relative w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0">
          {item.Image ? (
            <Image 
              src={item.Image} 
              alt={item.Title || "Product Image"}
              fill
              className="object-cover group-hover:scale-110 transition-transform" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">🖼️</div>
          )}
        </div>
        <div className="line-clamp-1">{item.Title}</div>
      </Link>
    </td>
    <td className="p-4 text-center font-mono">{item.views || 0}</td>
    <td className="p-4 text-center font-mono text-pink-500">{item.likes_count || 0}</td>
    <td className="p-4 text-center font-mono text-green-600">{item.orders || 0}</td>
    <td className="p-4 text-center">
      <span className={`px-2 py-1 rounded-lg font-bold ${Number(item.conversion) > 5 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
        %{item.conversion || 0}
      </span>
    </td>
  </tr>
))}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
