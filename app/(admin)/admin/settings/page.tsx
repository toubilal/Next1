'use client'

import { X, Plus, Save, Upload, Trash2, Edit } from "lucide-react"
import React,{ useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { updateSiteSettings ,getSiteSettings} from '@/app/actions/adminActions'
import TiptapEditor from '@/components/admin/TiptapEditor'

// الستايل الموحد الذي طلبته
const inputStyle = "w-full p-3 border border-slate-300 rounded-xl bg-white text-black placeholder:text-slate-400 focus:border-primary outline-none transition-all shadow-sm"

type LinkType = {
  id: string
  title: string
  url: string
  content?: any
}


// مكون زر الحفظ ليدعم حالة التحميل
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-primary text-white p-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "جاري الحفظ..." : <><Save size={20} /> حفظ جميع الإعدادات</>}
    </button>
  )
}

export default function SettingsPage() {
  const [links, setLinks] = useState<LinkType[]>([
    { id: crypto.randomUUID(), title: "سياسة الخصوصية", url: "/privacy", content: null },
    { id: crypto.randomUUID(), title: "الشروط والأحكام", url: "/terms", content: null },
  ])
const [siteTitle, setSiteTitle] = useState("")

  const [editorOpen, setEditorOpen] = useState<LinkType | null>(null)
  const [tempContent, setTempContent] = useState<any>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
useEffect(() => {
async function loadSettings() {
    try {
      const data = await getSiteSettings()
      if (data) {
        // تحديث الـ states
        setLinks(data.footer_links || [])
        setSiteTitle(data.site_title
      )  // إذا كان لديك input للعنوان مثلاً:
        // setSiteTitle(data.site_title)
      }
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err)
    }
  }
  
  loadSettings()
}, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setLogoPreview(URL.createObjectURL(file))
  }

  const addLink = () => setLinks([...links, { id: crypto.randomUUID(), title: "", url: "", content: null }])
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index))
  const updateLink = (index: number, field: keyof Omit<LinkType, 'id'>, value: string) => {
    const newLinks = [...links]
    newLinks[index][field] = value
    setLinks(newLinks)
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">إعدادات المتجر</h1>

        <form
  action={async (formData) => {
    try {
      formData.set('footer_links', JSON.stringify(links))
      await updateSiteSettings(formData)
      alert("تم الحفظ بنجاح!")
    } catch (error: any) {
      alert(error?.message || "حدث خطأ")
    }
  }}
>


          {/* الإعدادات العامة */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
            <h2 className="font-bold text-lg mb-2">إعدادات عامة</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">اسم المتجر</label>
              <input 
  name="site_title" 
  type="text" 
  placeholder="أدخل اسم المتجر" 
  className={inputStyle}
  value={siteTitle} // هنا الربط
  onChange={(e) => setSiteTitle(e.target.value)} // هنا التحديث
/>

            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">شعار الموقع (Logo)</label>
              <div className="flex items-center gap-4">
                <input name="logo" type="file" accept="image/*" onChange={handleFileChange} className={inputStyle} />
                {logoPreview && <img src={logoPreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border" />}
              </div>
            </div>
          </div>

          {/* الروابط */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">روابط الفوتر</h2>
            {links.map((link, index) => (
              <div key={link.id} className="relative p-4 border border-slate-200 rounded-2xl bg-white shadow-sm transition-all hover:border-primary/50">
                <button type="button" onClick={() => removeLink(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>

                <div className="grid gap-3">
                  <input value={link.title} onChange={(e) => updateLink(index, 'title', e.target.value)} placeholder="العنوان" className={inputStyle} />
                  <input value={link.url} onChange={(e) => updateLink(index, 'url', e.target.value)} placeholder="/link" className={inputStyle} />
                </div>

                <button
                  type="button"
                  onClick={() => { setEditorOpen(link); setTempContent(link.content) }}
                  className="mt-3 text-sm text-primary flex items-center gap-1 font-medium hover:underline"
                >
                  <Edit size={14} /> تعديل المحتوى المتقدم
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addLink}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-medium hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> إضافة رابط جديد
            </button>
          </div>

          <div className="mt-8">
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* Editor Overlay */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">تحرير: {editorOpen.title}</h2>
              <button onClick={() => setEditorOpen(null)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TiptapEditor content={tempContent} onChange={setTempContent} className="min-h-[300px]" />
            </div>
            <div className="mt-6 pt-4 border-t flex gap-4">
              <button type="button" onClick={() => setEditorOpen(null)} className="flex-1 py-3 rounded-xl border hover:bg-gray-50">إلغاء</button>
              <button type="button" onClick={() => { setLinks(prev => prev.map(l => l.id === editorOpen.id ? { ...l, content: tempContent } : l)); setEditorOpen(null) }} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">حفظ التغييرات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
