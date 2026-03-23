export default function ProductDetailsSkeleton() {
  return (
    <div className="max-w-md mx-auto bg-white animate-pulse rtl text-right">
      {/* Skeleton للصورة المربعة */}
      <div className="w-full aspect-square bg-slate-200"></div>

      {/* Skeleton للتفاصيل */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-1/2"></div> {/* العنوان */}
          <div className="h-6 bg-slate-200 rounded w-1/4"></div> {/* السعر */}
        </div>

        {/* Skeleton للوصف */}
        <div className="bg-slate-50 p-4 border-r-4 border-slate-200 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>

      {/* Skeleton لزر الطلب الثابت */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="w-full h-14 bg-slate-200 rounded-none"></div>
      </div>
    </div>
  );
}
