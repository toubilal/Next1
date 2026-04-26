// app/admin/settings/page.tsx
export default function SettingsPage() {
  return (
    <form action={updateSiteSettings} className="p-4 space-y-4">
      <input name="logo" placeholder="رابط اللوجو" className="border p-2" />
      <input name="footer" placeholder="نص التذييل" className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2">حفظ الإعدادات</button>
    </form>
  );
}
