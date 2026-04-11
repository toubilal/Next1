"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from '@/app/supabaseClient';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // لتفادي تشغيل الصوت في أول تحميل
  const isFirstLoad = useRef(true);

  // 1. جلب الطلبات
  const refreshOrders = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_full_pending_orders');

    if (error) {
      console.error("RPC Error:", error);
      return;
    }

    console.log("RPC Data:", data);

    const rawData = data;


    if (Array.isArray(rawData)) {
      setOrders(rawData);

      const totalUnread = rawData.reduce((acc, order) =>
        acc + (order.items?.filter(item => !item.is_seen)?.length || 0)
      , 0);

      setUnreadCount(totalUnread);
    } else {
      setOrders([]);
      setUnreadCount(0);
    }
  }, []);

  // 2. Realtime + أول تحميل
  useEffect(() => {
    refreshOrders();

    const channel = supabase
      .channel("orders-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Realtime event:", payload);

          // 🔥 تشغيل الصوت فقط عند INSERT
          if (payload.eventType === "INSERT" && !isFirstLoad.current) {
            const audio = new Audio('public/sounds/dragon-studio-notification-sound-effect-372475.mp3');
            audio.play().catch(() => {});
          }

          refreshOrders();
        }
      )
      .subscribe(() => {
        isFirstLoad.current = false;
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshOrders]);

  // 3. تعليم كمقروء
  const markAsRead = async () => {
    const unseenIds = orders.flatMap(o =>
      o.items?.filter(i => !i.is_seen)?.map(i => i.id) || []
    );

    if (unseenIds.length === 0) return;

    const { error } = await supabase
      .from('orders')
      .update({ is_seen: true })
      .in('id', unseenIds);

    if (error) {
      console.error("Update Error:", error);
    } else {
      refreshOrders();
    }
  };

  return (
    <NotificationContext.Provider
      value={{ orders, unreadCount, markAsRead, refreshOrders }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);