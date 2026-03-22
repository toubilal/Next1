"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabaseClient';
import { BarChart, TrendingUp, Eye, ShoppingCart } from 'lucide-react';

export default function StatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('Products')
        .select('id, Title, Price, Category, views, orders') // افترضنا وجود هذه الأعمدة
        .order('views', { ascending: false }) // ترتيب حسب الأكثر مشاهدة
        .limit(10);

      if (!error) setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      {/* كروت سريعة للإحصائيات العامة */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Eye size={16} />
            <span className="text-[10px] font-bold uppercase">إجمالي المشاهدات</span>
          </div>
          <p className="text-2xl font-black text-slate-800">1,250</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <ShoppingCart size={16} />
            <span className="text-[10px] font-bold uppercase">إجمالي الطلبات</span>
          </div>
          <p className="text-2xl font-black text-slate-800">84</p>
        </div>
      </div>

      {/* جدول البيانات */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart size={18} className="text-primary" />
            أداء المنتجات
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="p-4">المنتج</th>
                <th className="p-4">الفئة</th>
                <th className="p-4 text-center">👁️</th>
                <th className="p-4 text-center">📦</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-700">{item.Title}</td>
                  <td className="p-4 text-slate-500 text-xs">{item.Category}</td>
                  <td className="p-4 text-center font-mono">{item.views || 0}</td>
                  <td className="p-4 text-center font-mono text-green-600">{item.orders || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
