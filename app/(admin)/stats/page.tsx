"use client";
import { useEffect, useState } from 'react';
import { Stats, getRecentOrders, getWeeklyStats, updateOrderStatus } from '@/app/actions/adminActions'; // تأكد من استيراد دالة التحديث
import { Eye, ShoppingCart, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function StatsPage() {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [orders, setorders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ views: 0, orders: 0 });

  async function fetchStats() {
    try {
      setLoading(true);
      const { data, error } = await Stats();
      const weeklyRes = await getWeeklyStats();
      const Allorders = await getRecentOrders();
      
      if (!Allorders.error) setorders(Allorders.data || []);
      if (Allorders.error) console.error(Allorders.error.message);
      if (!weeklyRes.error) setWeeklyData(weeklyRes.data || []);
      
      if (error) throw error;
      if (data) {
        setStats(data);
        const totalViews = data.reduce((acc: any, curr: any) => acc + (curr.views || 0), 0);
        const totalOrders = data.reduce((acc: any, curr: any) => acc + (curr.orders || 0), 0);
        setTotals({ views: totalViews, orders: totalOrders });
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // دالة تحديث الحالة لكل المنتجات في الطلب الواحد
  async function handleUpdateStatus(orderId: string, newStatus: string) {
    try {
      // نفترض أن الدالة في adminActions تقبل order_id وتحدث كل الأسطر المرتبطة به
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.error) {
        fetchStats(); // إعادة جلب البيانات لتحديث الواجهة
      }
    } catch (err) {
      console.error("فشل تحديث الحالة");
    }
  }

  useEffect(() => { fetchStats(); }, []);

  // --- منطق تجميع الطلبات حسب order_id ---
  const groupedOrders = orders.reduce((groups: any, order: any) => {
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
    groups[groupKey].items.push(order);
    return groups;
  }, {});

  const ordersList = Object.values(groupedOrders);

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
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mt-6">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">الطلبات الأخيرة (بنظام السلة)</h3>
          <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold">تحتاج معالجة</span>
        </div>
        
        <div className="p-2 space-y-3">
          {ordersList.map((group: any) => (
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
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50/50 p-1.5 rounded-xl">
                    <img src={item.product?.Image || "https://via.placeholder.com/40"} className="w-7 h-7 rounded-lg object-cover bg-white flex-shrink-0" alt="" />
                    <span className="truncate flex-1 font-medium text-right">{item.product?.Title || "منتج"}</span>
                    <span className="font-black text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-lg">x{item.quantity || 1}</span>
                  </div>
                ))}
              </div>

              {/* التحكم */}
              <div className="flex justify-end gap-2">
                {group.status === 'pending' ? (
                  <>
                    <button onClick={() => handleUpdateStatus(group.order_id, 'confirmed')} className="bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold active:scale-90 transition-transform">تأكيد ✓</button>
                    <button onClick={() => handleUpdateStatus(group.order_id, 'cancelled')} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-bold active:scale-90">إلغاء ✕</button>
                  </>
                ) : (
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${group.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {group.status === 'confirmed' ? 'تم التأكيد' : 'تم الإلغاء'}
                  </span>
                )}
              </div>
            </div>
          ))}
          {ordersList.length === 0 && <div className="p-8 text-center text-slate-400 text-xs">لا توجد طلبات حالياً</div>}
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
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0">
                        {item.Image ? <img src={item.Image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <div className="w-full h-full flex items-center justify-center">🖼️</div>}
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
