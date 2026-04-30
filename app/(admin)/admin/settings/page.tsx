'use client'

import { X, Plus, Save, Trash2, Edit, Store, LayoutPanelTop } from "lucide-react"
import React, { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { updateSiteSettings, getSiteSettings } from '@/app/actions/adminActions'
import TiptapEditor from '@/components/admin/TiptapEditor'

const inputStyle = "w-full p-3 border border-slate-300 rounded-xl bg-white text-black placeholder:text-slate-400 focus:border-primary outline-none transition-all shadow-sm"

type LinkType = {
  id: string
  title: string
  url: string
  content?: any
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-primary text-white p-4 rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
    >
      {pending ? "جاري الحفظ..." : <><Save size={20} /> حفظ جميع الإعدادات</>}
    </button>
  )
}

export default function SettingsPage() {
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [siteTitle, setSiteTitle] = useState("")
  const [tagline, setTagline] = useState<any>(null) // Tiptap للـ Tagline
  const [aboutStore, setAboutStore] = useState<any>(null) // Tiptap لنبذة عن المتجر
  const [paymentMethods, setPaymentMethods] = useState<any>(null) // Tiptap لطرق الدفع
  const [links, setLinks] = useState<LinkType[]>([])
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState<{ id: string, title: string, content: any, setter: (val: any) => void } | null>(null)
  const [tempContent, setTempContent] = useState<any>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSiteSettings()
        if (data) {
          setSiteTitle(data.site_title || "")
          setTagline(data.tagline || null)
          setAboutStore(data.about_store || null)
          setPaymentMethods(data.payment_methods || null)
          setLinks(data.footer_links || [])
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err)
      }
    }
    loadSettings()
  }, [])

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

  // دالة لفتح المحرر بشكل ديناميكي
  const openContentEditor = (title: string, content: any, setter: (val: any) => void, id: string = 'static') => {
    setEditorOpen({ id, title, content, setter })
    setTempContent(content)
  }

  return (
    <div className="bg-surface-2 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Store className="text-primary" /> إعدادات المتجر
        </h1>

        <form action={async (formData) => {
          try {
            formData.set('footer_links', JSON.stringify(links))
            formData.set('tagline', JSON.stringify(tagline))
            formData.set('social_links', JSON.stringify(socialLinks))
            formData.set('about_store', JSON.stringify(aboutStore))
            formData.set('payment_methods', JSON.stringify(paymentMethods))
            await updateSiteSettings(formData)
            alert("تم الحفظ بنجاح!")
          } catch (error: any) {
            alert(error?.message || "حدث خطأ")
          }
        }}>

          {/* القسم الأول: هوية الموقع */}
          <section className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2 text-primary">
              <LayoutPanelTop size={20} /> هوية الموقع
            </h2>
            
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium mb-2">اسم المتجر</label>
                  <input name="site_title" type="text" className={inputStyle} value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium mb-2">الشعار (Logo)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer bg-surface-2 border border-dashed border-border p-2 rounded-xl text-center hover:border-primary transition-all">
                      <span className="text-xs text-muted">اختر صورة</span>
                      <input name="logo" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {logoPreview && <img src={logoPreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-border" />}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-2 rounded-2xl border border-border">
                <label className="block text-sm font-bold mb-2">الوصف المختصر (Tagline)</label>
                <div className="flex items-center justify-between gap-4">
                   <p className="text-xs text-muted">يظهر بجانب اللوغو أو أسفل العنوان</p>
                   <button type="button" onClick={() => openContentEditor("الوصف المختصر", tagline, setTagline)} className="text-primary text-sm flex items-center gap-1 font-bold">
                     <Edit size={14} /> {tagline ? 'تعديل' : 'إضافة'}
                   </button>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-border opacity-50" />

          {/* القسم الثاني: الفوتر */}
          <section className="space-y-6">
            <h2 className="font-bold text-lg text-text">إعدادات تذييل الصفحة (Footer)</h2>

            {/* نبذة عن المتجر */}
            <div className="bg-surface p-5 rounded-2xl border border-border">
              <span className="block font-bold text-sm mb-3">عن المتجر (About)</span>
              <button 
                type="button" 
                onClick={() => openContentEditor("عن المتجر", aboutStore, setAboutStore)}
                className="w-full p-4 border border-dashed border-border rounded-xl text-muted hover:text-primary hover:border-primary transition-all text-right flex justify-between items-center"
              >
                {aboutStore ? "تم إضافة المحتوى (انقر للتعديل)" : "اضغط لكتابة نبذة عن المتجر تظهر في الفوتر..."}
                <Edit size={16} />
              </button>
            </div>

          
            {/* الروابط */}
<div className="space-y-4">
  <span className="block font-bold text-sm px-1 text-text">روابط الفوتر</span>
  {links.map((link, index) => (
    <div key={link.id} className="relative p-4 border border-border rounded-2xl bg-surface shadow-sm border-r-4 border-r-primary">
      {/* زر الحذف - تم تعديله ليظهر دائماً وبشكل واضح */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/50">
        <span className="text-xs font-bold text-muted">رابط #{index + 1}</span>
        <button 
          type="button" 
          onClick={() => removeLink(index)} 
          className="flex items-center gap-1 text-error bg-error/10 px-3 py-1 rounded-lg hover:bg-error hover:text-white transition-all text-xs font-bold"
        >
          <Trash2 size={14} /> حذف
        </button>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="text-[10px] text-muted mb-1 block mr-2">عنوان الرابط</label>
          <input 
            value={link.title} 
            onChange={(e) => updateLink(index, 'title', e.target.value)} 
            placeholder="مثال: سياسة الخصوصية" 
            className={inputStyle} 
          />
        </div>
        <div>
          <label className="text-[10px] text-muted mb-1 block mr-2">مسار الرابط (URL)</label>
          <input 
            value={link.url} 
            onChange={(e) => updateLink(index, 'url', e.target.value)} 
            placeholder="مثal: /privacy" 
            className={inputStyle} 
          />
        </div>
      </div>
    </div>
  ))}

  <button 
    type="button" 
    onClick={addLink} 
    className="w-full py-4 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
  >
    <Plus size={20} /> إضافة رابط جديد
  </button>
</div>
{/* سوشل ميديا  */}
<div className="bg-surface p-5 rounded-2xl border border-border">
  <span className="block font-bold text-sm mb-3 text-text">حسابات التواصل الاجتماعي (Social Media)</span>
  <button 
    type="button" 
    onClick={() => openContentEditor("حسابات التواصل", socialLinks, setSocialLinks)}
    className="w-full p-4 border border-dashed border-border rounded-xl text-muted hover:text-primary hover:border-primary transition-all text-right flex justify-between items-center"
  >
    {socialLinks ? "تم تنسيق حسابات التواصل (انقر للتعديل)" : "أضف روابط حساباتك وأيقوناتها هنا..."}
    <Edit size={16} />
  </button>
</div>
            {/* طرق الدفع */}
            <div className="bg-surface p-5 rounded-2xl border border-border">
              <span className="block font-bold text-sm mb-3 text-text">طرق الدفع (Payment Methods)</span>
              <button 
                type="button" 
                onClick={() => openContentEditor("طرق الدفع", paymentMethods, setPaymentMethods)}
                className="w-full p-4 border border-dashed border-border rounded-xl text-muted hover:text-primary hover:border-primary transition-all text-right flex justify-between items-center"
              >
                {paymentMethods ? "تم إضافة طرق الدفع (انقر للتعديل)" : "أضف صور أو نصوص طرق الدفع هنا..."}
                <Edit size={16} />
              </button>
            </div>
          </section>

          <div className="mt-10">
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* Tiptap Editor Overlay */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-[2rem] p-6 flex flex-col shadow-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text">تعديل: {editorOpen.title}</h2>
              <button onClick={() => setEditorOpen(null)} className="p-2 hover:bg-surface-2 rounded-full transition-colors"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[300px] border border-border rounded-2xl">
              <TiptapEditor content={tempContent} onChange={setTempContent} />
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setEditorOpen(null)} className="flex-1 py-3 rounded-xl border border-border font-medium">إلغاء</button>
              <button 
                type="button" 
                onClick={() => {
                  editorOpen.setter(tempContent);
                  setEditorOpen(null);
                }} 
                className="flex-[2] bg-primary text-white py-3 rounded-xl font-bold"
              >
                تحديث المحتوى
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

