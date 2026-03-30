"use client";
import { useEffect, useState } from 'react';
import { Stats,getRecentOrders ,getWeeklyStats} from '@/app/actions/adminActions';
import { BarChart, Eye, ShoppingCart, Loader2, RefreshCw } from 'lucide-react';
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
if(!Allorders.error)setorders(Allorders.data)
if(Allorders.error){
  console.error(Allorders.error.message)}
   if (!weeklyRes.error) setWeeklyData(weeklyRes.data || []);
      if (error) throw error;
      if (data) {
        setStats(data);
        const totalViews = data.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const totalOrders = data.reduce((acc, curr) => acc + (curr.orders || 0), 0);
        setTotals({ views: totalViews, orders: totalOrders });
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  return (
  <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6" dir="rtl">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-black text-slate-800 text-right">إحصائيات المنصة</h1>
        <p className="text-slate-500 text-sm text-right">تحليل أداء المنتجات والمشاهدات</p>
      </div>
      <button onClick={fetchStats} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
      </button>
    </div>

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
<div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm h-64 w-full">
  <h3 className="text-xs font-bold text-slate-400 mb-4 mr-2">نشاط المشاهدات الأسبوعي</h3>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={weeklyData}> {/* weeklyData هي البيانات التي جلبناها من الدالة أعلاه */}
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis 
  dataKey="day"  // قمنا بتغيير date إلى day لتطابق الدالة
  axisLine={false} 
  tickLine={false} 
  tick={{fontSize: 10, fill: '#94a3b8'}} 
/>

      
      <YAxis hide />
      <Tooltip 
        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
        labelStyle={{display: 'none'}}
      />
      <Line 
        type="monotone" 
        dataKey="views" 
        stroke="#2563eb" 
        strokeWidth={3} 
        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
        activeDot={{ r: 6 }} 
      />
    </LineChart>
  </ResponsiveContainer>
</div>
<div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mt-10">
  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
    <h3 className="font-bold text-slate-800 text-sm">الطلبات الأخيرة</h3>
    <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold">
      تحتاج معالجة
    </span>
  </div>
  
  <div className="overflow-x-auto">
    <table className="w-full text-right text-sm">
      <tbody className="divide-y divide-slate-50">
        {orders.map((order: any) => (
          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="p-4">
              <div className="text-xs font-bold text-slate-700">{order.sys_data_node_77?.Title}</div>
              <div className="text-[10px] text-slate-400 mt-1">
                {new Date(order.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
              </div>
            </td>
            <td className="p-4 text-left flex gap-2 justify-end">
              {order.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => updateStatus(order.id, 'confirmed')}
                    className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-xl active:scale-90 transition-transform"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={() => updateStatus(order.id, 'cancelled')}
                    className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-xl active:scale-90 transition-transform"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <span className={`text-[10px] font-bold ${order.status === 'confirmed' ? 'text-green-500' : 'text-red-400'}`}>
                  {order.status === 'confirmed' ? 'تم التأكيد' : 'ملغي'}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {orders.length === 0 && (
      <div className="p-8 text-center text-slate-400 text-xs">لا توجد طلبات جديدة حالياً</div>
    )}
  </div>
</div>
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th className="p-4 text-right">المنتج</th>
              <th className="p-4 text-center text-base">👁️</th>
              <th className="p-4 text-center text-base">❤️</th>
              <th className="p-4 text-center text-base">📦</th>
              <th className="p-4 text-center">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {stats.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-xs">
             
                <td className="p-4 font-bold text-slate-700">
  <Link 
    href={`/products/${item.id}`} 
    className="flex items-center gap-3 hover:text-blue-600 transition-colors group"
  >
    {/* 🖼️ حاوية الصورة */}
    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
      {item.Image ? (
        <img 
          src={item.Image} 
          alt={item.Title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">🖼️</div>
      )}
    </div>

    {/* 📝 اسم المنتج بجانب الصورة */}
    <div className="line-clamp-1 text-xs md:text-sm">
      {item.Title}
    </div>
  </Link>
</td>

                <td className="p-4 text-center font-mono text-slate-600">{item.views || 0}</td>
                <td className="p-4 text-center font-mono text-pink-500 font-bold">{item.likes_count || 0}</td>
                <td className="p-4 text-center font-mono text-green-600 font-bold">{item.orders || 0}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-lg font-bold ${Number(item.conversion) > 5 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    %{item.conversion || 0}
                  </span>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
        {stats.length === 0 && !loading && (
          <div className="p-10 text-center text-slate-400 font-bold">لا توجد بيانات متاحة</div>
        )}
      </div>
    </div>
  </div>
);


}
