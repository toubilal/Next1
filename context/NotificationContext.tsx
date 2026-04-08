"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from '@/app/supabaseClient';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. وظيفة التجميع (نفس المنطق لكن جعلناه دالة مستقلة لإعادة استخدامه)
  const groupOrders = (rawData) => {
    return rawData.reduce((groups, order) => {
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
      // التأكد من عدم تكرار المنتج
      if (!groups[groupKey].items.find(i => i.id === order.id)) {
        groups[groupKey].items.push({
          id: order.id,
          product_id: order.product_id,
          quantity: order.quantity,
          product: order.product
        });
      }
      return groups;
    }, {});
  };

  // 2. الجلب الأولي عند تشغيل التطبيق (بدون Callback متكرر)
  useEffect(() => {
    const initialFetch = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`id, status, order_id, created_at, product_id, quantity, customer_name, customer_phone, customer_address, product:sys_data_node_77 ( Title, Image )`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(Object.values(groupOrders(data)));
      }
    };

    initialFetch();

    // 3. الاستماع للتغييرات وإضافة العنصر الجديد للمصفوفة مباشرة
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, 
      async (payload) => {
        // بما أن الـ payload لا يحتوي على بيانات الـ Join (اسم المنتج)، 
        // سنضطر لجلب هذا السطر فقط لتحسين الأداء بدلاً من جلب الجدول كاملاً
        const { data: newRow } = await supabase
          .from('orders')
          .select(`id, status, order_id, created_at, product_id, quantity, customer_name, customer_phone, customer_address, product:sys_data_node_77 ( Title, Image )`)
          .eq('id', payload.new.id)
          .single();

        if (newRow && newRow.status === 'pending') {
          setOrders(prevOrders => {
            // نأخذ المصفوفة القديمة، نحولها لكائن تجميع، نضيف السطر الجديد، ثم نعيدها مصفوفة
            const allData = [newRow, ...prevOrders.flatMap(o => o.items.map(item => ({
              ...o,
              ...item,
              items: undefined // تنظيف البيانات لدمجها
            })))];
            return Object.values(groupOrders(allData));
          });
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAsRead = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider value={{ orders, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
